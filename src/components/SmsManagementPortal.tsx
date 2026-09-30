import React, { useState } from 'react';
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
  ExternalLink,
  ShieldCheck,
  Smartphone,
  FileText,
  Key,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { formatSmsTemplate, buildInvoiceLink } from '../services/smsService';

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
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Search in logs
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'delivered' | 'failed'>('all');

  // Preview Order SMS
  const [selectedOrderForSms, setSelectedOrderForSms] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(smsConfig.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmsConfig(configForm);
    showToast('تنظیمات وب‌سرویس و قالب‌های پیامک با موفقیت ذخیره شد.');
  };

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone || !manualMessage) return;
    setIsSendingManual(true);
    const success = await sendManualSms(manualPhone, manualName || 'مشتری گرامی', manualMessage);
    setIsSendingManual(false);
    if (success) {
      showToast(`پیامک به شماره ${manualPhone} با موفقیت ارسال گردید.`);
      setManualMessage('');
      setManualPhone('');
      setManualName('');
    }
  };

  const handleSendOrderShipmentSms = async (orderId: string) => {
    const success = await sendOrderSms(orderId, 'order_shipped');
    if (success) {
      showToast('پیامک وضعیت بارگیری و لینک فاکتور با موفقیت برای مشتری ارسال شد.');
    }
  };

  const handleSendOrderDeliveredSms = async (orderId: string) => {
    const success = await sendOrderSms(orderId, 'order_delivered');
    if (success) {
      showToast('پیامک تحویل نهایی سفارش با موفقیت برای مشتری ارسال شد.');
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
      {actionSuccessToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-white hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner with API Key status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">سامانه پیامکی و اطلاع‌رسانی خودکار بار گوارانو</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>API فعال</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ارسال خودکار پیامک وضعیت بار، تحویل به راننده، لینک فاکتور دیجیتال و پیگیری لحظه‌ای به شماره همراه مشتریان
              </p>
            </div>
          </div>

          {/* Active API Key Display */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs space-y-1">
            <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-amber-400" />
                <span>کلید وب‌سرویس فعال (API Key):</span>
              </span>
              <button
                onClick={handleCopyKey}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'کپی شد' : 'کپی'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-amber-300 tracking-wider break-all select-all font-bold">
              {smsConfig.apiKey}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل پیامک‌های ارسالی:</span>
            <span className="text-base font-black text-white font-mono">{smsLogs.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">پیام</span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ارسال موفق به مخابرات:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {smsLogs.filter(l => l.status === 'delivered').length}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">موفق</span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ارسال خودکار بارگیری:</span>
            <span className={`text-base font-black font-mono ${smsConfig.autoSendOnShipped ? 'text-cyan-300' : 'text-slate-400'}`}>
              {smsConfig.autoSendOnShipped ? 'فعال ✓' : 'غیرفعال'}
            </span>
          </div>

          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ارسال خودکار تحویل:</span>
            <span className={`text-base font-black font-mono ${smsConfig.autoSendOnDelivered ? 'text-purple-300' : 'text-slate-400'}`}>
              {smsConfig.autoSendOnDelivered ? 'فعال ✓' : 'غیرفعال'}
            </span>
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
          <span>تاریخچه پیامک‌های ارسالی ({smsLogs.length})</span>
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
          <span>تنظیمات وب‌سرویس و قالب پیامک</span>
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
                ارسال خودکار: {smsConfig.autoSendOnShipped ? 'روشن (هنگام تغییر وضعیت)' : 'خاموش'}
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
                            <span className="block text-[9px] text-emerald-600 mt-0.5">
                              ✓ پیامک ارسال شده
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
                <span>گزارشات و تاریخچه پیامک‌های ارسالی به مخابرات</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                لیست تمام پیامک‌های ارسال شده به همراه متن دقیق، شماره گیرنده و شناسه رهگیری
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
                placeholder="جستجو در پیامک‌ها (شماره تماس، نام مشتری، شماره سفارش، متن)..."
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
              <option value="delivered">تحویل شده به مخابرات</option>
              <option value="failed">ناموفق</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">زمان ارسال</th>
                  <th className="p-3">گیرنده و مشتری</th>
                  <th className="p-3">شماره سفارش</th>
                  <th className="p-3">نوع پیامک</th>
                  <th className="p-3">متن ارسالی</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      هیچ پیامکی در این بازه یافت نشد.
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
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                          {log.eventType === 'order_shipped'
                            ? 'ارسال بار'
                            : log.eventType === 'order_delivered'
                            ? 'تحویل بار'
                            : 'دستی'}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="line-clamp-2 text-slate-700 text-[11px]" title={log.message}>
                          {log.message}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          {log.status === 'delivered' ? 'ارسال موفق ✓' : 'ارسال شد'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SETTINGS & TEMPLATES */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-indigo-600" />
              <span>پیکربندی وب‌سرویس و قالب‌های پیامکی</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تنظیم کلید وب‌سرویس (API Key)، خط فرستنده، سناریوهای خودکار و الگوی متن پیامک‌ها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                placeholder="API Key خود را وارد کنید"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                کلید پیش‌فرض ارائه شده: cqusH7jQYJDfj6VLPJk6hcJTdYbmNMsx70X6iTTEezjAe8Ea
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">آدرس وب‌سرویس (Endpoint URL):</label>
              <input
                type="text"
                value={configForm.endpointUrl}
                onChange={e => setConfigForm({ ...configForm, endpointUrl: e.target.value })}
                className="w-full font-mono border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                placeholder="/api/sms/send یا آدرس وب‌سرویس اختصاصی شما"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">شماره خط ارسال‌کننده (Sender Line):</label>
              <input
                type="text"
                value={configForm.senderLine}
                onChange={e => setConfigForm({ ...configForm, senderLine: e.target.value })}
                className="w-full font-mono border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                placeholder="مثلاً 3000505 یا 5000..."
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
              ارسال پیامک سریع به هر شماره دلخواه همراه با اعتبارسنجی
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
            <span>{isSendingManual ? 'در حال ارسال...' : 'ارسال آنی پیامک'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
