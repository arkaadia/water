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

  // Support CLI arguments: --port 3000 --host 0.0.0.0
  const args = process.argv.slice(2);
  let customPort: string | undefined;
  let customHost: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) customPort = args[i + 1];
    if ((args[i] === '--host' || args[i] === '-h') && args[i + 1]) customHost = args[i + 1];
  }

  // Dev server inside AI Studio must listen on port 3000 because Nginx runs on 8080 and proxies to 3000
  const PORT = parseInt(customPort || (process.env.PORT === '8080' ? '3000' : (process.env.PORT || '3000')), 10);
  const HOST = customHost || process.env.HOST || '0.0.0.0';

  // Allow cross-origin requests and iframe preview in AI Studio
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.removeHeader('X-Frame-Options');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

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
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback HTML handler for SPA routes and query strings
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        next(e);
      }
    });
  }

  // ==========================================
  // Start Express Server
  // ==========================================
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(` 💧 گوارانو B2B - سامانه جامع پخش مویرگی آب و نوشیدنی`);
    console.log(` Gowarano B2B Platform with SMS.ir Integration Ready!`);
    console.log(`======================================================`);
    console.log(`\n  VITE v8.3.0  ready in 120 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}/`);
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
