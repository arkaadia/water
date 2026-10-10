import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  Search,
  Truck,
  ShieldCheck,
  Smartphone,
  FileText,
  Key,
  Copy,
  Check,
  Trash2,
  Activity,
  AlertTriangle,
  Info,
  Server
} from 'lucide-react';
import {
  formatSmsTemplate,
  normalizeIranianPhoneClient,
  runSmsDiagnostics,
  sendTestSmsApi,
  DiagnosticsApiResponse
} from '../services/smsService';

export const SmsManagementPortal: React.FC = () => {
  const {
    orders,
    smsLogs,
    smsConfig,
    updateSmsConfig,
    sendOrderSms,
    sendManualSms,
    clearSmsLogs
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'logs' | 'settings' | 'manual'>('orders');

  // Manual SMS Form state
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [isSendingManual, setIsSendingManual] = useState(false);

  // Settings form state
  const [configForm, setConfigForm] = useState(smsConfig);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Search in logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'sent' | 'delivered' | 'failed'>('all');

  // Diagnostics and Safe Test Send state
  const [diagnostics, setDiagnostics] = useState<DiagnosticsApiResponse | null>(null);
  const [isCheckingDiagnostics, setIsCheckingDiagnostics] = useState(false);
  const [testRecipient, setTestRecipient] = useState('09121112233');
  const [testMessage, setTestMessage] = useState('تست ارتباط و ارسال پیامک از سامانه پخش گوارانو');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{
    success: boolean;
    providerStatus?: number;
    packId?: string;
    messageId?: number;
    error?: string;
    raw?: any;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 5000);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(smsConfig.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard?.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmsConfig(configForm);
    showToast('تنظیمات وب‌سرویس و الگوهای پیامک با موفقیت ذخیره شد.', 'success');
  };

  // Run diagnostics check against SMS.ir
  const handleCheckDiagnostics = async () => {
    setIsCheckingDiagnostics(true);
    try {
      const res = await runSmsDiagnostics({
        apiKey: configForm.apiKey,
        lineNumber: configForm.senderLine
      });
      setDiagnostics(res);
      if (res.reachable && res.providerStatus === 1) {
        showToast('ارتباط با سرور SMS.ir با موفقیت برقرار است.', 'success');
      } else if (res.providerStatus === 12) {
        showToast(`محدودیت IP از سمت SMS.ir: آی‌پی سرور (${res.serverIpHint || 'مشاهده شده'}) در لیست سفید نیست.`, 'error');
      } else {
        showToast(`پاسخ وب‌سرویس: ${res.providerMessage || res.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`خطا در اجرای تست عیب‌یابی: ${err.message}`, 'error');
    } finally {
      setIsCheckingDiagnostics(false);
    }
  };

  // Run initial diagnostics on mount or tab change
  useEffect(() => {
    if (activeSubTab === 'settings' && !diagnostics) {
      handleCheckDiagnostics();
    }
  }, [activeSubTab]);

  // Safe Test Send function
  const handleRunTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneCheck = normalizeIranianPhoneClient(testRecipient);
    if (!phoneCheck.valid) {
      showToast(phoneCheck.error || 'شماره تلفن نامعتبر است.', 'error');
      return;
    }

    setIsSendingTest(true);
    setTestSendResult(null);

    try {
      const res = await sendTestSmsApi({
        testRecipient: phoneCheck.normalized,
        testMessage: testMessage.trim(),
        lineNumber: configForm.senderLine,
        apiKey: configForm.apiKey
      });

      setTestSendResult({
        success: res.success,
        providerStatus: res.providerStatus,
        packId: res.packId,
        messageId: res.messageId,
        error: res.error,
        raw: res
      });

      if (res.success) {
        showToast(`پیامک تستی با موفقیت به درگاه SMS.ir تحویل گردید (شناسه بسته: ${res.packId || res.messageId})`, 'success');
      } else {
        showToast(`ارسال تستی ناموفق: ${res.error || 'عدم پذیرش توسط SMS.ir'}`, 'error');
      }
    } catch (err: any) {
      showToast(`خطای پیش‌بینی نشده: ${err.message}`, 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone || !manualMessage) return;

    const phoneCheck = normalizeIranianPhoneClient(manualPhone);
    if (!phoneCheck.valid) {
      showToast(phoneCheck.error || 'فرمت شماره موبایل صحیح نمی‌باشد.', 'error');
      return;
    }

    setIsSendingManual(true);
    const result = await sendManualSms(phoneCheck.normalized, manualName || 'مشتری گرامی', manualMessage.trim());
    setIsSendingManual(false);

    if (result.success) {
      showToast(`پیامک به شماره ${phoneCheck.normalized} با موفقیت به درگاه SMS.ir ارسال شد.`, 'success');
      setManualMessage('');
      setManualPhone('');
      setManualName('');
    } else {
      showToast(`خطا در ارسال پیامک: ${result.error || 'درگاه SMS.ir پیام را نپذیرفت'}`, 'error');
    }
  };

  const handleSendOrderShipmentSms = async (orderId: string) => {
    const res = await sendOrderSms(orderId, 'order_shipped');
    if (res.success) {
      showToast('پیامک وضعیت بارگیری و لینک فاکتور با موفقیت به درگاه پیامک ارسال شد.', 'success');
    } else {
      showToast(`خطا در ارسال پیامک بارگیری: ${res.error || 'پاسخ ناموفق از سامانه پیامک'}`, 'error');
    }
  };

  const handleSendOrderDeliveredSms = async (orderId: string) => {
    const res = await sendOrderSms(orderId, 'order_delivered');
    if (res.success) {
      showToast('پیامک تحویل نهایی سفارش با موفقیت به درگاه پیامک ارسال شد.', 'success');
    } else {
      showToast(`خطا در ارسال پیامک تحویل: ${res.error || 'پاسخ ناموفق از سامانه پیامک'}`, 'error');
    }
  };

  const filteredLogs = smsLogs.filter(log => {
    const matchesSearch =
      log.recipientPhone.includes(logSearch) ||
      log.customerName.includes(logSearch) ||
      (log.orderNumber && log.orderNumber.includes(logSearch)) ||
      log.message.includes(logSearch);

    if (logFilter === 'all') return matchesSearch;
    return matchesSearch && log.status === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotification && (
        <div
          className={`${
            toastNotification.type === 'error'
              ? 'bg-rose-600'
              : toastNotification.type === 'warning'
              ? 'bg-amber-600'
              : 'bg-emerald-600'
          } text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold transition`}
        >
          <div className="flex items-center gap-2">
            {toastNotification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white/90" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white/90" />
            )}
            <span>{toastNotification.message}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-white hover:text-white/70 mr-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner with API Key status & Diagnostics Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">سامانه پیامکی و وب‌سرویس SMS.ir گوارانو</h2>
                {diagnostics?.providerStatus === 1 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>اتصال موفق SMS.ir</span>
                  </span>
                ) : diagnostics?.providerStatus === 12 ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>محدودیت IP درگاه</span>
                  </span>
                ) : (
                  <span className="bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>درگاه REST v1</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ارسال واقعی از طریق وب‌سرویس رسمی SMS.ir، اعتبارسنجی شماره‌ها، مدیریت خطاها و رهگیری بسته‌ها
              </p>
            </div>
          </div>

          {/* Active API Key Display (Masked for safety) */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                <span>کلید فعال در سرور (Masked):</span>
              </span>
              <button
                onClick={handleCopyKey}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                title="کپی کلید کامل"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'کپی شد' : 'کپی کلید'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-amber-300 tracking-wider break-all select-all font-bold">
              {smsConfig.apiKey ? `${smsConfig.apiKey.slice(0, 6)}••••••••••••${smsConfig.apiKey.slice(-4)}` : 'تعریف نشده'}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل پیامک‌های ثبتی:</span>
            <span className="text-base font-black text-white font-mono">{smsLogs.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">پیام</span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ارسال موفق به درگاه:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {smsLogs.filter(l => l.status === 'sent' || l.status === 'delivered').length}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">موفق</span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">خط ارسال‌کننده:</span>
            <span className="text-base font-black text-cyan-300 font-mono">
              {smsConfig.senderLine || '3000505'}
            </span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ارسال‌های ناموفق:</span>
            <span className={`text-base font-black font-mono ${smsLogs.filter(l => l.status === 'failed').length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {smsLogs.filter(l => l.status === 'failed').length}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">خطا</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeSubTab === 'orders'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>ارسال پیامک سفارشات ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>تاریخچه و لاگ درگاه ({smsLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>عیب‌یابی، تست ارسال و تنظیمات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('manual')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeSubTab === 'manual'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>ارسال پیامک دستی / تکی</span>
        </button>
      </div>

      {/* SUBTAB 1: ORDERS SHIPMENT SMS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4.5 h-4.5 text-indigo-600" />
                  <span>مدیریت ارسال پیامک بارگیری و تحویل سفارشات</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ارسال پیامک حاوی وضعیت بارگیری، مشخصات راننده و لینک مشاهده فاکتور دیجیتال به شماره همراه مشتری
                </p>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                ارسال خودکار بارگیری: {smsConfig.autoSendOnShipped ? 'روشن' : 'خاموش'}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-3">شماره سفارش</th>
                    <th className="p-3">مشتری و فروشگاه</th>
                    <th className="p-3">شماره همراه</th>
                    <th className="p-3">تناژ و مبلغ</th>
                    <th className="p-3">راننده / توزیع</th>
                    <th className="p-3">وضعیت بار</th>
                    <th className="p-3 text-center">عملیات پیامک</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {orders.map(o => {
                    const isShipped = ['handed_to_driver', 'shipped', 'ready_to_ship'].includes(o.status);
                    const isDelivered = ['delivered', 'settled'].includes(o.status);
                    const lastSms = smsLogs.find(l => l.orderNumber === o.orderNumber);

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{o.customerCode} · {o.deliveryZone}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-700" dir="ltr">
                          {o.customerPhone}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-800">{o.totalBoxes} باکس</span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {o.totalAmount.toLocaleString('fa-IR')} ت
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{o.driverName || 'تخصیص‌نیافته'}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isShipped
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {o.status === 'handed_to_driver'
                              ? 'تحویل به راننده'
                              : o.status === 'shipped'
                              ? 'در مسیر ارسال'
                              : o.status === 'delivered'
                              ? 'تحویل مشتری شد'
                              : o.status === 'registered'
                              ? 'ثبت اولیه'
                              : o.status}
                          </span>
                          {lastSms && (
                            <span className={`block text-[9px] mt-0.5 ${lastSms.status === 'failed' ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                              {lastSms.status === 'failed' ? '✕ خطای ارسال پیامک' : '✓ ارسال به درگاه انجام شد'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleSendOrderShipmentSms(o.id)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                              title="ارسال پیامک بارگیری و لینک فاکتور"
                            >
                              <Send className="w-3 h-3" />
                              <span>پیامک ارسال بار</span>
                            </button>

                            <button
                              onClick={() => handleSendOrderDeliveredSms(o.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                              title="ارسال پیامک تحویل نهایی"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>پیامک تحویل</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SMS AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                <span>گزارشات و تاریخچه پیامک‌های ارسالی به درگاه SMS.ir</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                لیست تمام پیامک‌های ارسال شده به همراه وضعیت واقعی پذیرش درگاه، شناسه بسته (Pack ID)، کد پیامک و خطاها
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearSmsLogs}
                className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی لاگ‌ها</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو در پیامک‌ها (شماره تماس، نام مشتری، شماره سفارش، شناسه بسته)..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value as any)}
              className="border border-slate-200 rounded-xl px-3 py-2 bg-white"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="sent">ارسال شده به درگاه (پذیرفته شده)</option>
              <option value="delivered">تحویل شده نهایی</option>
              <option value="failed">ناموفق / خطا</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">زمان ارسال</th>
                  <th className="p-3">گیرنده و مشتری</th>
                  <th className="p-3">شماره سفارش</th>
                  <th className="p-3">شناسه رهگیری / بسته</th>
                  <th className="p-3">متن ارسالی / پیام خطا</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      هیچ رکوردی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.customerName}</div>
                        <div className="text-[10px] text-indigo-700 font-mono" dir="ltr">{log.recipientPhone}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{log.orderNumber || '-'}</td>
                      <td className="p-3 font-mono text-[11px]">
                        {log.packId ? (
                          <div className="text-slate-800" title={`PackId: ${log.packId}`}>
                            بسته: {log.packId.slice(0, 12)}...
                          </div>
                        ) : null}
                        {log.providerResponseId ? (
                          <div className="text-slate-500 text-[10px]">
                            شناسه: {log.providerResponseId}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="line-clamp-2 text-slate-700 text-[11px]" title={log.message}>
                          {log.message}
                        </p>
                        {log.errorMessage && (
                          <p className="text-[10px] text-rose-600 mt-0.5 font-bold" title={log.errorMessage}>
                            علت خطا: {log.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        {log.status === 'delivered' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            تحویل شده ✓
                          </span>
                        ) : log.status === 'sent' ? (
                          <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            پذیرفته درگاه (در صف)
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            ناموفق ✕
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SETTINGS, DIAGNOSTICS & TEST SEND */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Diagnostic & Connection Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-indigo-600" />
                  <span>عیب‌یابی و تست زنده اتصال به وب‌سرویس SMS.ir</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  بررسی صحت کلید، اعتبارسنجی اتصال، اعتبار باقیمانده و آی‌پی سرور
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckDiagnostics}
                disabled={isCheckingDiagnostics}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDiagnostics ? 'animate-spin' : ''}`} />
                <span>{isCheckingDiagnostics ? 'در حال بررسی...' : 'بررسی مجدد اتصال'}</span>
              </button>
            </div>

            {/* Diagnostic Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Box 1: Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span className="text-slate-500 font-bold block text-[11px]">وضعیت پاسخ وب‌سرویس:</span>
                {diagnostics?.providerStatus === 1 ? (
                  <div className="text-emerald-700 font-black flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>متصل و معتبر (کد ۱ - موفق)</span>
                  </div>
                ) : diagnostics?.providerStatus === 12 ? (
                  <div className="text-amber-700 font-black flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>محدودیت IP کلید (کد ۱۲)</span>
                  </div>
                ) : (
                  <div className="text-rose-700 font-black flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{diagnostics?.providerMessage || 'عدم دسترسی / بررسی نشده'}</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block font-mono">
                  HTTP: {diagnostics?.httpStatus || '-'} | Provider Status: {diagnostics?.providerStatus ?? '-'}
                </span>
              </div>

              {/* Box 2: Balance & Lines */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span className="text-slate-500 font-bold block text-[11px]">اعتبار ریالی و خطوط:</span>
                <div className="font-mono font-black text-slate-800 text-sm">
                  {diagnostics?.credit !== null && diagnostics?.credit !== undefined
                    ? `${Number(diagnostics.credit).toLocaleString('fa-IR')} ریال`
                    : 'نیازمند دسترسی به پنل'}
                </div>
                <div className="text-[10px] text-slate-500">
                  خط فعال: <span className="font-mono font-bold text-indigo-700">{configForm.senderLine}</span>
                  {diagnostics?.lines && diagnostics.lines.length > 0 && (
                    <span className="mr-1 font-mono">({diagnostics.lines.join(', ')})</span>
                  )}
                </div>
              </div>

              {/* Box 3: Server IP Hint for Whitelist */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <span className="text-slate-500 font-bold block text-[11px] flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-indigo-500" />
                  <span>آی‌پی سرور (جهت لیست سفید در SMS.ir):</span>
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {diagnostics?.serverIpHint || 'در پیام درگاه ثبت خواهد شد'}
                  </span>
                  {diagnostics?.serverIpHint && (
                    <button
                      type="button"
                      onClick={() => handleCopyIp(diagnostics.serverIpHint!)}
                      className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedIp ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIp ? 'کپی شد' : 'کپی IP'}</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  این IP را در پنل SMS.ir بخش تنظیمات وب‌سرویس وارد کنید.
                </span>
              </div>
            </div>

            {/* Error banner if IP restricted or key invalid */}
            {diagnostics?.providerStatus === 12 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>راهنمای رفع خطای عدم ارسال در پنل کاربری SMS.ir:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  پیامک‌های ارسالی با پیام «<strong>{diagnostics.providerMessage}</strong>» توسط SMS.ir متوقف می‌شوند. برای برقراری ارسال پیامک‌ها کافیست وارد پنل <strong>sms.ir</strong> شده، به بخش <strong>تنظیمات وب‌سرویس (API Key)</strong> بروید و محدودیت IP را غیرفعال کنید یا آی‌پی سرور بالا (<span className="font-mono font-bold">{diagnostics.serverIpHint}</span>) را به لیست IPهای مجاز اضافه نمایید.
                </p>
              </div>
            )}
          </div>

          {/* Safe Test-Send Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Send className="w-4.5 h-4.5 text-indigo-600" />
                <span>تست ارسال امن پیامک (بدنه واقعی بدون ارسال مکرر کور)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ارسال یک پیامک تستی به شماره موبایل دلخواه شما با استفاده از خط و کلید پیکربندی‌شده، همراه با دریافت بازخورد دقیق سرور
              </p>
            </div>

            <form onSubmit={handleRunTestSend} className="space-y-3 text-xs max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">شماره موبایل تست‌کننده (گیرنده):</label>
                  <input
                    type="tel"
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    dir="ltr"
                    placeholder="09121234567"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">خط فرستنده:</label>
                  <input
                    type="text"
                    value={configForm.senderLine}
                    disabled
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">متن پیامک آزمایشی:</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'در حال ارسال به SMS.ir...' : 'ارسال پیامک تستی به شماره فوق'}</span>
              </button>
            </form>

            {/* Test Send Feedback Result */}
            {testSendResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  testSendResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  {testSendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {testSendResult.success
                      ? 'درخواست ارسال با موفقیت توسط SMS.ir تأیید و در صف قرار گرفت'
                      : 'درخواست ارسال توسط سرور یا درگاه پیامک رد شد'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <div>
                    کد پاسخ درگاه: <strong>{testSendResult.providerStatus ?? '-'}</strong>
                  </div>
                  {testSendResult.packId && (
                    <div>
                      شناسه بسته (PackId): <strong>{testSendResult.packId}</strong>
                    </div>
                  )}
                  {testSendResult.messageId && (
                    <div>
                      شناسه پیامک: <strong>{testSendResult.messageId}</strong>
                    </div>
                  )}
                </div>

                {testSendResult.error && (
                  <p className="text-[11px] font-bold text-rose-700 mt-1">
                    شرح خطا: {testSendResult.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Config & Templates Form */}
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-600" />
                <span>پیکربندی خط، سناریوهای خودکار و قالب‌های پیامک</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تنظیم خط اختصاصی، سناریوهای ارسال خودکار و الگوهای متن پیامک
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>کلید وب‌سرویس پیامک (API Key):</span>
                </label>
                <input
                  type="text"
                  value={configForm.apiKey}
                  onChange={e => setConfigForm({ ...configForm, apiKey: e.target.value })}
                  className="w-full font-mono border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="کلید SMS_API_KEY"
                  required
                />
                <span className="text-[10px] text-slate-400 block">
                  این کلید در متغیر محیطی سرور (.env) نیز ذخیره می‌گردد.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">آدرس اندپوینت وب‌سرویس پروکسی:</label>
                <input
                  type="text"
                  value={configForm.endpointUrl}
                  onChange={e => setConfigForm({ ...configForm, endpointUrl: e.target.value })}
                  className="w-full font-mono border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="/api/sms/send"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">شماره خط ارسال‌کننده (Sender Line):</label>
                <input
                  type="text"
                  value={configForm.senderLine}
                  onChange={e => setConfigForm({ ...configForm, senderLine: e.target.value })}
                  className="w-full font-mono border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="3000505"
                />
              </div>
            </div>

            {/* Automation Checkboxes */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">فرمان‌های ارسال خودکار (Event Automation):</h4>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.autoSendOnShipped}
                  onChange={e => setConfigForm({ ...configForm, autoSendOnShipped: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-800 font-medium">
                  ارسال خودکار پیامک هنگام تغییر وضعیت سفارش به «تحویل به راننده» یا «در مسیر ارسال»
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.autoSendOnDelivered}
                  onChange={e => setConfigForm({ ...configForm, autoSendOnDelivered: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-800 font-medium">
                  ارسال خودکار پیامک هنگام تحویل نهایی سفارش به مشتری
                </span>
              </label>
            </div>

            {/* Template Editors */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    الگوی متن پیامک بارگیری و ارسال بار (شامل لینک فاکتور):
                  </label>
                  <span className="text-[10px] text-slate-400">
                    متغیرها: {'{customerName}'}, {'{orderNumber}'}, {'{totalBoxes}'}, {'{driverName}'}, {'{invoiceLink}'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={configForm.shippedTemplate}
                  onChange={e => setConfigForm({ ...configForm, shippedTemplate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    الگوی متن پیامک تحویل موفق سفارش به مشتری:
                  </label>
                  <span className="text-[10px] text-slate-400">
                    متغیرها: {'{customerName}'}, {'{orderNumber}'}, {'{invoiceLink}'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={configForm.deliveredTemplate}
                  onChange={e => setConfigForm({ ...configForm, deliveredTemplate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ذخیره تغییرات و پیکربندی</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 4: MANUAL DIRECT SMS SENDER */}
      {activeSubTab === 'manual' && (
        <form onSubmit={handleSendManual} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 max-w-xl text-xs">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4.5 h-4.5 text-indigo-600" />
              <span>ارسال پیامک تکی و اختصاصی</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ارسال پیامک مستقیم به شماره دلخواه همراه با تبدیل ارقام فارسی و اعتبارسنجی
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">شماره موبایل گیرنده (مثال: 09121234567):</label>
            <input
              type="tel"
              value={manualPhone}
              onChange={e => setManualPhone(e.target.value)}
              placeholder="0912..."
              dir="ltr"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">نام مخاطب / فروشگاه (اختیاری):</label>
            <input
              type="text"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="مثلا هایپرمارکت بهار"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">متن پیامک:</label>
            <textarea
              rows={4}
              value={manualMessage}
              onChange={e => setManualMessage(e.target.value)}
              placeholder="متن پیامک خود را اینجا بنویسید..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSendingManual}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSendingManual ? 'در حال ارسال...' : 'ارسال آنی پیامک به سرور'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
