import { Order, SmsConfig, SmsLogEntry } from '../types';

export const DEFAULT_SMS_API_KEY = 'cqusH7jQYJDfj6VLPJk6hcJTdYbmNMsx70X6iTTEezjAe8Ea';

export const DEFAULT_SMS_CONFIG: SmsConfig = {
  apiKey: DEFAULT_SMS_API_KEY,
  endpointUrl: '/api/sms/send',
  senderLine: '3000505',
  autoSendOnShipped: true,
  autoSendOnDelivered: true,
  shippedTemplate: `مشتری گرامی {customerName}،
بار سفارش شما به شماره {orderNumber} ({totalBoxes} باکس) با موفقیت بارگیری و تحویل راننده گردید و هم‌اکنون در مسیر ارسال است.
مشاهده و پیگیری لحظه‌ای فاکتور:
{invoiceLink}
سامانه پخش مویرگی گوارانو`,
  deliveredTemplate: `مشتری گرامی {customerName}،
سفارش شما به شماره {orderNumber} با موفقیت به انبار/فروشگاه تحویل داده شد.
فاکتور تسویه دیجیتال:
{invoiceLink}
با تشکر - سامانه پخش مویرگی گوارانو`
};

export const INITIAL_SMS_LOGS: SmsLogEntry[] = [
  {
    id: 'sms-log-1',
    timestamp: '۱۴۰۳/۰۸/۲۴ ۱۱:۴۵',
    recipientPhone: '09121112233',
    customerName: 'هایپرمارکت خلیج فارس',
    orderNumber: 'ORD-1403-0840',
    message: 'مشتری گرامی هایپرمارکت خلیج فارس، بار سفارش شما به شماره ORD-1403-0840 (۴۵ باکس) بارگیری و در مسیر ارسال است.',
    status: 'delivered',
    providerResponseId: '87624001',
    packId: 'f784d142-a1b2-4c3d-e4f5',
    providerStatus: 1,
    cost: 1,
    eventType: 'order_shipped'
  },
  {
    id: 'sms-log-2',
    timestamp: '۱۴۰۳/۰۸/۲۴ ۱۰:۱۵',
    recipientPhone: '09123334455',
    customerName: 'فروشگاه کوروش اندیشه فاز ۳',
    orderNumber: 'ORD-1403-0839',
    message: 'مشتری گرامی فروشگاه کوروش اندیشه فاز ۳، سفارش شما به شماره ORD-1403-0839 با موفقیت تحویل داده شد.',
    status: 'delivered',
    providerResponseId: '87623984',
    packId: 'c123d456-e7f8-9a0b-c1d2',
    providerStatus: 1,
    cost: 1,
    eventType: 'order_delivered'
  }
];

export function buildInvoiceLink(order: Order): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gowarano.ir';
  return `${origin}/#invoice?order=${order.orderNumber}&code=${order.customerCode}`;
}

export function formatSmsTemplate(template: string, order: Order): string {
  const invoiceLink = buildInvoiceLink(order);
  return template
    .replace(/{customerName}/g, order.customerName)
    .replace(/{orderNumber}/g, order.orderNumber)
    .replace(/{totalBoxes}/g, String(order.totalBoxes || 0))
    .replace(/{driverName}/g, order.driverName || 'پیک مویرگی')
    .replace(/{deliveryZone}/g, order.deliveryZone || 'محدوده')
    .replace(/{totalAmount}/g, (order.totalAmount || 0).toLocaleString('fa-IR'))
    .replace(/{invoiceLink}/g, invoiceLink);
}

/**
 * Normalizes Persian/Arabic digits to English and ensures valid 09xxxxxxxxx Iranian format
 */
export function normalizeIranianPhoneClient(input: string): { valid: boolean; normalized: string; error?: string } {
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

  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  const regex = /^09[0-9]{9}$/;
  if (!regex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: `شماره تلفن "${input}" نامعتبر است. فرمت صحیح: 09xxxxxxxxx`
    };
  }

  return { valid: true, normalized: cleaned };
}

export interface DispatchResult {
  success: boolean;
  status: 'sent' | 'failed';
  responseId?: string;
  packId?: string;
  messageId?: number;
  providerStatus?: number;
  cost?: number;
  error?: string;
}

/**
 * Dispatches an SMS via the Express backend proxy endpoint.
 * Accurately awaits and inspects the response without swallowing errors.
 */
export async function dispatchSmsApi(params: {
  apiKey?: string;
  endpointUrl?: string;
  recipientPhone: string;
  message: string;
  orderNumber?: string;
  eventType: SmsLogEntry['eventType'];
  lineNumber?: string | number;
}): Promise<DispatchResult> {
  const url = params.endpointUrl || '/api/sms/send';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: params.recipientPhone,
        message: params.message,
        orderNumber: params.orderNumber,
        eventType: params.eventType,
        lineNumber: params.lineNumber,
        apiKey: params.apiKey
      })
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data && data.success) {
      return {
        success: true,
        status: 'sent', // Queued/Accepted by SMS.ir provider
        responseId: data.messageId ? String(data.messageId) : data.packId,
        packId: data.packId,
        messageId: data.messageId,
        providerStatus: data.providerStatus,
        cost: data.cost
      };
    }

    // Provider or server reported failure - report accurately without swallowing
    const errorMessage = data?.error || data?.providerMessage || `خطا در ارسال پیامک (HTTP ${response.status})`;
    return {
      success: false,
      status: 'failed',
      responseId: undefined,
      providerStatus: data?.providerStatus || response.status,
      error: errorMessage
    };
  } catch (err: any) {
    // Network or client connection failure
    return {
      success: false,
      status: 'failed',
      error: `خطا در اتصال به سرور: ${err.message || 'Network error'}`
    };
  }
}

export interface DiagnosticsApiResponse {
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
 * Fetches SMS.ir connectivity and account diagnostics from the server.
 */
export async function runSmsDiagnostics(options?: {
  apiKey?: string;
  lineNumber?: string;
}): Promise<DiagnosticsApiResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.apiKey) params.append('apiKey', options.apiKey);
    if (options?.lineNumber) params.append('lineNumber', options.lineNumber);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/sms/diagnostics${qs}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      isConfigured: false,
      maskedApiKey: 'خطا',
      senderLine: options?.lineNumber || '3000505',
      reachable: false,
      error: `عدم امکان برقراری ارتباط با سرویس تست: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Executes an explicit test send to an authorized recipient.
 */
export async function sendTestSmsApi(params: {
  testRecipient: string;
  testMessage?: string;
  lineNumber?: string;
  apiKey?: string;
}): Promise<DispatchResult> {
  try {
    const res = await fetch('/api/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {
      return {
        success: true,
        status: 'sent',
        packId: data.packId,
        messageId: data.messageId,
        responseId: data.messageId ? String(data.messageId) : data.packId,
        providerStatus: data.providerStatus,
        cost: data.cost
      };
    }

    return {
      success: false,
      status: 'failed',
      providerStatus: data?.providerStatus || res.status,
      error: data?.error || data?.providerMessage || `خطا در ارسال پیامک تستی (HTTP ${res.status})`
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'failed',
      error: `خطای ارتباط با سرور: ${err.message}`
    };
  }
}
