/**
 * SMS.ir Provider Service (Server-side)
 * Official API: https://api.sms.ir
 * API Version: v1
 * Bulk endpoint: POST https://api.sms.ir/v1/send/bulk
 * Credit endpoint: GET https://api.sms.ir/v1/credit
 * Lines endpoint: GET https://api.sms.ir/v1/line
 */

export const SMS_IR_BASE_URL = 'https://api.sms.ir';

export interface SmsSendParams {
  apiKey?: string;
  lineNumber?: string | number;
  recipient: string;
  message: string;
  orderNumber?: string;
  eventType?: string;
  timeoutMs?: number;
}

export interface SmsSendResult {
  success: boolean;
  status: 'sent' | 'failed';
  packId?: string;
  messageId?: number;
  cost?: number;
  providerStatus: number;
  providerMessage: string;
  error?: string;
  recipient: string;
  orderNumber?: string;
  eventType?: string;
  timestamp: string;
}

export interface SmsDiagnosticsResult {
  isConfigured: boolean;
  maskedApiKey: string;
  senderLine: string;
  reachable: boolean;
  httpStatus?: number;
  providerStatus?: number;
  providerMessage?: string;
  credit?: number | null;
  lines?: string[];
  serverIpHint?: string | null;
  error?: string;
  timestamp: string;
}

/**
 * Normalizes any Persian/Arabic digits and formats Iranian mobile numbers to 09xxxxxxxxx.
 */
export function normalizeIranianMobile(input: string): { valid: boolean; normalized: string; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, normalized: '', error: 'شماره تلفن خالی است.' };
  }

  // 1. Convert Persian and Arabic digits to English
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let cleaned = input.trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(persianDigits[i], String(i));
    cleaned = cleaned.replaceAll(arabicDigits[i], String(i));
  }

  // 2. Remove all non-digit characters except leading '+'
  cleaned = cleaned.replace(/[\s\-\(\)\._]/g, '');

  // 3. Handle prefixes (+98, 0098, 98, 0, or just 9)
  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  // 4. Validate final format: 11 digits, starts with 09
  const iranMobileRegex = /^09[0-9]{9}$/;
  if (!iranMobileRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: `شماره تلفن نامعتبر است (${input}). فرمت صحیح شماره موبایل ایران: 09xxxxxxxxx می‌باشد.`
    };
  }

  return { valid: true, normalized: cleaned };
}

/**
 * Masks an API key for safe diagnostics display without exposing secrets.
 */
export function maskApiKey(key?: string): string {
  if (!key || typeof key !== 'string') return 'تنظیم نشده (Not Configured)';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

/**
 * Parses numeric sender line for SMS.ir API.
 */
export function parseSenderLine(line?: string | number): number {
  if (typeof line === 'number') return line;
  const raw = String(line || process.env.SMS_SENDER_LINE || '3000505').trim();
  const digitsOnly = raw.replace(/\D/g, '');
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 3000505 : parsed;
}

/**
 * Sends an SMS message to SMS.ir using the official v1 REST API.
 * Never retries blindly to prevent duplicate billed messages.
 */
export async function sendSmsViaProvider(params: SmsSendParams): Promise<SmsSendResult> {
  const timestamp = new Date().toISOString();
  const effectiveApiKey = (params.apiKey || process.env.SMS_API_KEY || '').trim();
  const effectiveLineNumber = parseSenderLine(params.lineNumber);

  // 1. Validate API Key
  if (!effectiveApiKey) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'کلید وب‌سرویس SMS.ir پیکربندی نشده است (Missing SMS_API_KEY)',
      error: 'کلید وب‌سرویس SMS_API_KEY در متغیرهای سرور یافت نشد. لطفاً در فایل .env یا تنظیمات پنل مقدار آن را وارد کنید.',
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }

  // 2. Validate & Normalize Recipient Phone Number
  const phoneValidation = normalizeIranianMobile(params.recipient);
  if (!phoneValidation.valid) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'شماره تلفن همراه گیرنده نامعتبر است',
      error: phoneValidation.error,
      recipient: params.recipient,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
  const normalizedPhone = phoneValidation.normalized;

  // 3. Validate Message
  const trimmedMessage = (params.message || '').trim();
  if (!trimmedMessage) {
    return {
      success: false,
      status: 'failed',
      providerStatus: 0,
      providerMessage: 'متن پیامک خالی است',
      error: 'ارسال پیامک با متن خالی امکان‌پذیر نمی‌باشد.',
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }

  // 4. Construct SMS.ir official v1 bulk payload
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

    let rawBody = '';
    let parsedData: any = null;

    try {
      rawBody = await response.text();
      parsedData = JSON.parse(rawBody);
    } catch {
      // JSON parsing failure
      return {
        success: false,
        status: 'failed',
        providerStatus: response.status,
        providerMessage: `پاسخ نامعتبر از سرور پیامک (HTTP ${response.status})`,
        error: `پاسخ دریافت شده از SMS.ir در قالب معتبر JSON نمی‌باشد: ${rawBody.slice(0, 100)}`,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }

    // Provider check: SMS.ir returns status: 1 on success
    const providerStatus = typeof parsedData.status === 'number' ? parsedData.status : response.status;
    const providerMessage = parsedData.message || (response.ok ? 'عملیات موفق' : `خطای HTTP ${response.status}`);

    if (response.ok && parsedData.status === 1) {
      // Successfully accepted by provider queue
      const dataObj = parsedData.data || {};
      const packId = dataObj.packId ? String(dataObj.packId) : undefined;
      const messageId = Array.isArray(dataObj.messageIds) && dataObj.messageIds.length > 0
        ? Number(dataObj.messageIds[0])
        : undefined;
      const cost = typeof dataObj.cost === 'number' ? dataObj.cost : undefined;

      return {
        success: true,
        status: 'sent', // Accepted by provider queue for dispatch
        packId,
        messageId,
        cost,
        providerStatus,
        providerMessage,
        recipient: normalizedPhone,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        timestamp
      };
    }

    // Provider rejected the request (e.g. status: 12 IP restricted, 401 unauthorized, 400 bad payload, etc.)
    let errorExplanation = providerMessage;
    if (providerStatus === 12) {
      errorExplanation = `محدودیت IP درگاه SMS.ir: ${providerMessage}. باید آی‌پی سرور را در پنل کاربری SMS.ir در لیست سفید قرار دهید یا محدودیت آی‌پی کلید را بردارید.`;
    } else if (response.status === 401) {
      errorExplanation = `عدم احراز هویت درگاه SMS.ir (HTTP 401): ${providerMessage}. کلید وب‌سرویس نامعتبر یا منقضی شده است.`;
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
  } catch (err: any) {
    clearTimeout(timeoutId);

    const isTimeout = err.name === 'AbortError';
    const errorMessage = isTimeout
      ? `زمان اتصال به درگاه SMS.ir به پایان رسید (${timeoutMs / 1000} ثانیه). اتصال شبکه یا سرور پیامک با کندی مواجه است.`
      : `خطای شبکه در برقراری ارتباط با SMS.ir: ${err.message || 'Network unreachable'}`;

    return {
      success: false,
      status: 'failed',
      providerStatus: isTimeout ? 408 : 503,
      providerMessage: isTimeout ? 'Request Timeout' : 'Network Failure',
      error: errorMessage,
      recipient: normalizedPhone,
      orderNumber: params.orderNumber,
      eventType: params.eventType,
      timestamp
    };
  }
}

/**
 * Runs a non-destructive diagnostic check against SMS.ir endpoints (credit & line numbers).
 */
export async function checkSmsDiagnostics(options?: {
  apiKey?: string;
  lineNumber?: string | number;
  timeoutMs?: number;
}): Promise<SmsDiagnosticsResult> {
  const effectiveApiKey = (options?.apiKey || process.env.SMS_API_KEY || '').trim();
  const senderLine = String(options?.lineNumber || process.env.SMS_SENDER_LINE || '3000505');
  const timeoutMs = options?.timeoutMs || 8000;
  const timestamp = new Date().toISOString();

  if (!effectiveApiKey) {
    return {
      isConfigured: false,
      maskedApiKey: maskApiKey(),
      senderLine,
      reachable: false,
      error: 'کلید وب‌سرویس SMS_API_KEY در متغیرهای سرور یافت نشد.',
      timestamp
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Check credit endpoint GET /v1/credit
    const creditRes = await fetch(`${SMS_IR_BASE_URL}/v1/credit`, {
      method: 'GET',
      headers: {
        'X-API-KEY': effectiveApiKey,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let creditData: any = null;
    try {
      creditData = await creditRes.json();
    } catch {
      // Non-json
    }

    const providerStatus = creditData?.status ?? creditRes.status;
    const providerMessage = creditData?.message || creditRes.statusText;

    // Extract IP if present in SMS.ir error message (e.g. "کلید وب سرویس محدود به آی‌پی‌های تعریف شده می‌باشد. - آی پی شما: 34.34.229.23")
    let serverIpHint: string | null = null;
    if (providerMessage && typeof providerMessage === 'string') {
      const ipMatch = providerMessage.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      if (ipMatch) {
        serverIpHint = ipMatch[1];
      }
    }

    if (creditRes.ok && creditData?.status === 1) {
      // Also try to fetch line numbers
      let availableLines: string[] = [];
      try {
        const lineRes = await fetch(`${SMS_IR_BASE_URL}/v1/line`, {
          method: 'GET',
          headers: { 'X-API-KEY': effectiveApiKey, 'Accept': 'application/json' }
        });
        if (lineRes.ok) {
          const lineData = await lineRes.json();
          if (lineData?.status === 1 && Array.isArray(lineData?.data)) {
            availableLines = lineData.data.map(String);
          }
        }
      } catch {
        // Line numbers fetch is optional
      }

      return {
        isConfigured: true,
        maskedApiKey: maskApiKey(effectiveApiKey),
        senderLine,
        reachable: true,
        httpStatus: creditRes.status,
        providerStatus: 1,
        providerMessage: 'اتصال به درگاه SMS.ir با موفقیت برقرار است',
        credit: creditData?.data ?? null,
        lines: availableLines,
        serverIpHint,
        timestamp
      };
    }

    return {
      isConfigured: true,
      maskedApiKey: maskApiKey(effectiveApiKey),
      senderLine,
      reachable: false,
      httpStatus: creditRes.status,
      providerStatus,
      providerMessage,
      serverIpHint,
      error: providerStatus === 12
        ? `کلید وب‌سرویس محدود به IP می‌باشد (آی‌پی سرور: ${serverIpHint || 'مشخص نشده'}). لطفاً در پنل SMS.ir این آی‌پی را ثبت یا محدودیت IP را حذف کنید.`
        : `پاسخ ناموفق از SMS.ir: ${providerMessage}`,
      timestamp
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      isConfigured: true,
      maskedApiKey: maskApiKey(effectiveApiKey),
      senderLine,
      reachable: false,
      error: err.name === 'AbortError'
        ? 'زمان اتصال به سرور SMS.ir به پایان رسید (Timeout).'
        : `خطای شبکه در اتصال به SMS.ir: ${err.message}`,
      timestamp
    };
  }
}
