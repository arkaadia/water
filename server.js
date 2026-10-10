import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

const SMS_IR_BASE_URL = 'https://api.sms.ir';

function normalizeIranianMobile(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, normalized: '', error: 'شماره تلفن خالی است.' };
  }
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let cleaned = input.trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(persianDigits[i], String(i));
    cleaned = cleaned.replaceAll(arabicDigits[i], String(i));
  }
  cleaned = cleaned.replace(/[\s\-\(\)\._]/g, '');

  if (cleaned.startsWith('+98')) cleaned = '0' + cleaned.slice(3);
  else if (cleaned.startsWith('0098')) cleaned = '0' + cleaned.slice(4);
  else if (cleaned.startsWith('98') && cleaned.length === 12) cleaned = '0' + cleaned.slice(2);
  else if (cleaned.startsWith('9') && cleaned.length === 10) cleaned = '0' + cleaned;

  const iranMobileRegex = /^09[0-9]{9}$/;
  if (!iranMobileRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: `شماره تلفن نامعتبر است (${input}). فرمت صحیح: 09xxxxxxxxx`
    };
  }
  return { valid: true, normalized: cleaned };
}

function maskApiKey(key) {
  if (!key || typeof key !== 'string') return 'تنظیم نشده (Not Configured)';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

function parseSenderLine(line) {
  if (typeof line === 'number') return line;
  const raw = String(line || process.env.SMS_SENDER_LINE || '3000505').trim();
  const digitsOnly = raw.replace(/\D/g, '');
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 3000505 : parsed;
}

async function sendSmsViaProvider(params) {
  const timestamp = new Date().toISOString();
  const effectiveApiKey = (params.apiKey || process.env.SMS_API_KEY || '').trim();
  const effectiveLineNumber = parseSenderLine(params.lineNumber);

  if (!effectiveApiKey) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'کلید وب‌سرویس SMS_API_KEY یافت نشد',
      error: 'کلید وب‌سرویس SMS.ir در متغیرهای سرور یافت نشد.',
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }

  const phoneCheck = normalizeIranianMobile(params.recipient);
  if (!phoneCheck.valid) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'شماره تلفن همراه گیرنده نامعتبر است',
      error: phoneCheck.error,
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
  const normalizedPhone = phoneCheck.normalized;
  const trimmedMessage = (params.message || '').trim();

  if (!trimmedMessage) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'متن پیامک خالی است',
      error: 'متن پیامک نمی‌تواند خالی باشد.',
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }

  const endpoint = `${SMS_IR_BASE_URL}/v1/send/bulk`;
  const payload = {
    lineNumber: effectiveLineNumber,
    messageText: trimmedMessage,
    mobiles: [normalizedPhone],
    sendDateTime: null
  };

  const timeoutMs = params.timeoutMs || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-API-KEY': effectiveApiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const rawBody = await response.text();
    let parsedData = null;
    try {
      parsedData = JSON.parse(rawBody);
    } catch {
      return {
        success: false,
        status: 'failed',
        providerStatus: response.status,
        providerMessage: `پاسخ نامعتبر از سرور پیامک (HTTP ${response.status})`,
        error: `پاسخ غیرمعتبر JSON از SMS.ir`,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }

    const providerStatus = typeof parsedData.status === 'number' ? parsedData.status : response.status;
    const providerMessage = parsedData.message || (response.ok ? 'عملیات موفق' : `خطای HTTP ${response.status}`);

    if (response.ok && parsedData.status === 1) {
      const dataObj = parsedData.data || {};
      return {
        success: true,
        status: 'sent',
        packId: dataObj.packId ? String(dataObj.packId) : undefined,
        messageId: Array.isArray(dataObj.messageIds) && dataObj.messageIds.length > 0 ? Number(dataObj.messageIds[0]) : undefined,
        cost: dataObj.cost,
        providerStatus,
        providerMessage,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }

    let errorExplanation = providerMessage;
    if (providerStatus === 12) {
      errorExplanation = `محدودیت IP درگاه SMS.ir: ${providerMessage}. آی‌پی سرور را در پنل کاربری SMS.ir در لیست سفید قرار دهید.`;
    } else if (response.status === 401) {
      errorExplanation = `عدم احراز هویت درگاه SMS.ir (HTTP 401): ${providerMessage}.`;
    }

    return {
      success: false,
      status: 'failed',
      providerStatus,
      providerMessage,
      error: errorExplanation,
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    return {
      success: false,
      status: 'failed',
      providerStatus: isTimeout ? 408 : 503,
      providerMessage: isTimeout ? 'Request Timeout' : 'Network Failure',
      error: isTimeout ? 'زمان اتصال به SMS.ir به پایان رسید.' : `خطای اتصال: ${err.message}`,
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
}

// Diagnostics endpoint
app.get('/api/sms/diagnostics', async (req, res) => {
  try {
    const effectiveApiKey = (req.query.apiKey || process.env.SMS_API_KEY || '').trim();
    const senderLine = String(req.query.lineNumber || process.env.SMS_SENDER_LINE || '3000505');

    if (!effectiveApiKey) {
      return res.json({
        isConfigured: false,
        maskedApiKey: maskApiKey(),
        senderLine,
        reachable: false,
        error: 'کلید وب‌سرویس SMS_API_KEY یافت نشد.',
        timestamp: new Date().toISOString()
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const creditRes = await fetch(`${SMS_IR_BASE_URL}/v1/credit`, {
      method: 'GET',
      headers: { 'X-API-KEY': effectiveApiKey, 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const creditData = await creditRes.json().catch(() => null);
    const providerStatus = creditData?.status ?? creditRes.status;
    const providerMessage = creditData?.message || creditRes.statusText;

    let serverIpHint = null;
    if (providerMessage && typeof providerMessage === 'string') {
      const ipMatch = providerMessage.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) serverIpHint = ipMatch[1];
    }

    if (creditRes.ok && creditData?.status === 1) {
      return res.json({
        isConfigured: true,
        maskedApiKey: maskApiKey(effectiveApiKey),
        senderLine,
        reachable: true,
        httpStatus: creditRes.status,
        providerStatus: 1,
        providerMessage: 'اتصال موفق به درگاه SMS.ir',
        credit: creditData?.data ?? null,
        serverIpHint,
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      isConfigured: true,
      maskedApiKey: maskApiKey(effectiveApiKey),
      senderLine,
      reachable: false,
      httpStatus: creditRes.status,
      providerStatus,
      providerMessage,
      serverIpHint,
      error: providerStatus === 12
        ? `کلید محدود به IP است (آی‌پی سرور: ${serverIpHint || 'مشاهده شده'}).`
        : providerMessage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.json({
      isConfigured: true,
      maskedApiKey: maskApiKey(process.env.SMS_API_KEY),
      senderLine: '3000505',
      reachable: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.post('/api/sms/test', async (req, res) => {
  try {
    const { testRecipient, testMessage, lineNumber, apiKey } = req.body;
    if (!testRecipient) {
      return res.status(400).json({ success: false, error: 'شماره گیرنده الزامی است.' });
    }
    const result = await sendSmsViaProvider({
      recipient: testRecipient,
      message: testMessage || 'پیامک تست گوارانو',
      lineNumber,
      apiKey,
      eventType: 'test'
    });
    if (!result.success) {
      return res.status(result.providerStatus === 401 ? 401 : 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Primary send endpoint
app.post('/api/sms/send', async (req, res) => {
  try {
    const { to, message, orderNumber, eventType, lineNumber, apiKey } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'شماره تلفن همراه گیرنده الزامی است.' });
    }
    const result = await sendSmsViaProvider({
      recipient: to,
      message,
      orderNumber,
      eventType,
      lineNumber,
      apiKey
    });
    if (!result.success) {
      return res.status(result.providerStatus === 401 ? 401 : 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1y', etag: true, index: 'index.html' }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(` 💧 گوارانو B2B - سامانه جامع پخش مویرگی آب و نوشیدنی`);
  console.log(` Gowarano B2B Platform is running successfully!`);
  console.log(`======================================================`);
  console.log(` ➜ Local:   http://localhost:${PORT}`);
  console.log(` ➜ Network: http://${HOST === '0.0.0.0' ? 'YOUR-SERVER-IP' : HOST}:${PORT}`);
  console.log(`======================================================\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
