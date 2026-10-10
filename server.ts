import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import {
  sendSmsViaProvider,
  checkSmsDiagnostics,
  maskApiKey,
  normalizeIranianMobile,
  parseSenderLine
} from './src/server/smsProvider.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.HOST || '0.0.0.0';

  app.use(express.json());

  // Log non-sensitive startup SMS config status
  const configuredKey = (process.env.SMS_API_KEY || '').trim();
  const configuredLine = parseSenderLine(process.env.SMS_SENDER_LINE);
  console.log(`[BOOT] SMS Gateway Config: Line=${configuredLine}, Key=${maskApiKey(configuredKey)}`);

  // ==========================================
  // SMS API Routes
  // ==========================================

  /**
   * Diagnostic Endpoint: GET /api/sms/diagnostics
   * Safely checks connectivity, credit balance, registered lines, and server IP hint
   */
  app.get('/api/sms/diagnostics', async (req, res) => {
    try {
      const apiKeyOverride = req.query.apiKey as string | undefined;
      const lineNumberOverride = req.query.lineNumber as string | undefined;
      const diagnostics = await checkSmsDiagnostics({
        apiKey: apiKeyOverride,
        lineNumber: lineNumberOverride
      });
      return res.json(diagnostics);
    } catch (err: any) {
      console.error('[SMS DIAGNOSTICS ERROR]', err.message);
      return res.status(500).json({
        isConfigured: false,
        maskedApiKey: maskApiKey(),
        senderLine: '3000505',
        reachable: false,
        error: `خطای داخلی سرور در بررسی وضعیت پیامک: ${err.message}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Safe Test Send Endpoint: POST /api/sms/test
   * Requires explicit authorized recipient, never retries blindly
   */
  app.post('/api/sms/test', async (req, res) => {
    try {
      const { testRecipient, testMessage, lineNumber, apiKey } = req.body;

      if (!testRecipient) {
        return res.status(400).json({
          success: false,
          error: 'شماره تلفن همراه گیرنده برای تست الزامی است.'
        });
      }

      const msg = testMessage || 'تست ارتباط با وب‌سرویس پیامک سامانه پخش آب و نوشیدنی گوارانو';
      console.log(`[SMS TEST] Executing test send to ${testRecipient.slice(0, 4)}***`);

      const result = await sendSmsViaProvider({
        recipient: testRecipient,
        message: msg,
        lineNumber,
        apiKey,
        eventType: 'test'
      });

      console.log(`[SMS TEST RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);

      if (!result.success) {
        return res.status(result.providerStatus === 401 ? 401 : 400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[SMS TEST EXCEPTION]', err.message);
      return res.status(500).json({
        success: false,
        status: 'failed',
        error: `خطای سرور هنگام ارسال تست: ${err.message}`,
        providerStatus: 500,
        providerMessage: 'Server Exception',
        recipient: req.body?.testRecipient || '',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Primary Dispatch Endpoint: POST /api/sms/send
   * Awaits SMS.ir API and returns true status only when accepted
   */
  app.post('/api/sms/send', async (req, res) => {
    try {
      const { to, message, orderNumber, eventType, lineNumber, apiKey } = req.body;

      if (!to) {
        return res.status(400).json({
          success: false,
          status: 'failed',
          error: 'شماره تلفن همراه گیرنده الزامی است.'
        });
      }

      console.log(`[SMS SEND] Dispatching SMS for order="${orderNumber || '-'}" event="${eventType || '-'}" to ${to.slice(0, 4)}***`);

      const result = await sendSmsViaProvider({
        recipient: to,
        message,
        orderNumber,
        eventType,
        lineNumber,
        apiKey
      });

      console.log(`[SMS SEND RESULT] Recipient: ${result.recipient}, Success: ${result.success}, Status: ${result.providerStatus} (${result.providerMessage})`);

      if (!result.success) {
        const httpCode = result.providerStatus === 401 ? 401 : 400;
        return res.status(httpCode).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error('[SMS SEND EXCEPTION]', err.message);
      return res.status(500).json({
        success: false,
        status: 'failed',
        error: `خطای پردازش پیامک در سرور: ${err.message}`,
        providerStatus: 500,
        providerMessage: 'Internal Error',
        recipient: req.body?.to || '',
        timestamp: new Date().toISOString()
      });
    }
  });

  // ==========================================
  // Vite Dev Middlewares / Production Static
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    console.log(`[SERVER] Serving static production build from ${distPath}`);
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
      index: 'index.html'
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log(`[SERVER] Mounting Vite in middleware mode (development)`);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // ==========================================
  // Start Express Server
  // ==========================================
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(` 💧 گوارانو B2B - سامانه جامع پخش مویرگی آب و نوشیدنی`);
    console.log(` Gowarano B2B Platform with SMS.ir Integration Ready!`);
    console.log(`======================================================`);
    console.log(` ➜ Server running on: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(` ➜ Mode: ${isProduction ? 'Production' : 'Development (Vite Middlewares)'}`);
    console.log(`======================================================\n`);
  });

  process.on('SIGTERM', () => {
    console.log('[INFO] SIGTERM signal received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('\n[INFO] SIGINT signal received. Shutting down gracefully...');
    server.close(() => process.exit(0));
  });
}

bootstrap().catch(err => {
  console.error('[FATAL SERVER BOOTSTRAP ERROR]', err);
  process.exit(1);
});
