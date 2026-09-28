import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, Order } from '../types';
import {
  Calculator,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  Printer,
  Calendar,
  Layers
} from 'lucide-react';

interface AccountingPortalProps {
  onOpenInvoice: (order: Order) => void;
}

export const AccountingPortal: React.FC<AccountingPortalProps> = ({ onOpenInvoice }) => {
  const {
    customers,
    orders,
    ledgerEntries,
    visitors,
    recordLedgerPayment,
    exportToCsv
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ledgers' | 'payments' | 'commissions' | 'debtors'>('ledgers');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'online' | 'cheque'>('card');
  const [payAmount, setPayAmount] = useState<number>(2000000);
  const [payRef, setPayRef] = useState<string>('POS-');
  const [chequeNum, setChequeNum] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>('۱۴۰۳/۰۸/۱۵');
  const [payNotes, setPayNotes] = useState<string>('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const customerLedger = ledgerEntries.filter(l => l.customerId === selectedCustomer?.id);

  // Financial summary statistics
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalCommissions = visitors.reduce((sum, v) => sum + v.totalCommissionEarned, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || payAmount <= 0) {
      alert('لطفاً مبلغ و مشتری معتبر انتخاب فرمایید.');
      return;
    }

    recordLedgerPayment({
      customerId: selectedCustomer.id,
      type: paymentType,
      amount: Number(payAmount),
      referenceId: payRef || `PAY-${Date.now().toString().slice(-4)}`,
      chequeNumber: paymentType === 'cheque' ? chequeNum : undefined,
      chequeDueDate: paymentType === 'cheque' ? chequeDate : undefined,
      notes: payNotes
    });

    alert(`دریافت مبلغ ${Number(payAmount).toLocaleString('fa-IR')} تومان از مشتری ${selectedCustomer.storeName} با موفقیت ثبت شد.`);
    setPayNotes('');
    setChequeNum('');
  };

  const handleExportLedgerExcel = () => {
    const rows = customerLedger.map(l => ({
      'کد مشتری': l.customerCode,
      'تاریخ': l.date,
      'نوع سند': l.type,
      'شرح عملیات': l.title,
      'بدهکار (تومان)': l.debit,
      'بستانکار (تومان)': l.credit,
      'مانده حساب (تومان)': l.balance,
      'شماره ارجاع': l.referenceId,
      'شماره چک': l.chequeNumber || '',
      'تاریخ سررسید چک': l.chequeDueDate || ''
    }));
    exportToCsv(rows, `معین_حساب_${selectedCustomer.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-2xl p-6 shadow-xl border border-purple-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl border border-purple-500/30">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">سیستم مالی، حسابداری فروش و پورسانت</h1>
                <span className="bg-purple-500/20 text-purple-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30">
                  دفتر معین هوشمند
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ثبت دریافت‌های نقدی، کارتخوان، چک‌های صیادی، محاسبه خودکار پورسانت و کنترل سقف اعتبارات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLedgerExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>خروجی اکسل معین</span>
            </button>
          </div>
        </div>

        {/* Global Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">مجموع فروش سیستم:</span>
            <span className="text-base font-black text-white font-mono">
              {totalSales.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل مطالبات جاری از مشتریان:</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {totalReceivables.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل پورسانت‌های تعلق‌گرفته:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {totalCommissions.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">تعداد مشتریان دارای مانده:</span>
            <span className="text-base font-black text-purple-300 font-mono">
              {customers.filter(c => c.currentBalance > 0).length} مشتری
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'ledgers'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>دفتر معین تفصیلی مشتریان</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'payments'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>ثبت دریافت وجه / چک صیادی</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'commissions'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>محاسبه و تسویه پورسانت ویزیتورها</span>
        </button>

        <button
          onClick={() => setActiveTab('debtors')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'debtors'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>لیست بدهکاران و هشدار سررسید</span>
        </button>
      </div>

      {/* Tab 1: Customer Account Ledger (Section 12 & 15 of brief) */}
      {activeTab === 'ledgers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">انتخاب مشتری:</span>
              <select
                value={selectedCustomer.id}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:border-purple-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.storeName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected customer summary snapshot (matches Page 12 example) */}
            <div className="flex items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">مجموع خرید:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedCustomer.totalPurchases.toLocaleString('fa-IR')} ت
                </span>
              </div>
              <div className="border-r border-slate-200 pr-3">
                <span className="text-slate-500 block text-[11px]">سقف اعتبار:</span>
                <span className="font-bold text-slate-700 font-mono">
                  {selectedCustomer.creditCeiling.toLocaleString('fa-IR')} ت
                </span>
              </div>
              <div className="border-r border-slate-200 pr-3">
                <span className="text-slate-500 block text-[11px]">مانده بدهی فعلی:</span>
                <span className="font-black text-amber-600 font-mono">
                  {selectedCustomer.currentBalance.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">تاریخ سند</th>
                  <th className="p-3">نوع عملیات</th>
                  <th className="p-3">شرح کامل سند</th>
                  <th className="p-3 text-left">بدهکار (افزایش حساب)</th>
                  <th className="p-3 text-left">بستانکار (واریزی/چک)</th>
                  <th className="p-3 text-left">مانده حساب (تومان)</th>
                  <th className="p-3">شماره پیگیری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {customerLedger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      هیچ ثبتی در دفتر معین این مشتری وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  customerLedger.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-600">{row.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.type === 'invoice' ? 'bg-blue-100 text-blue-800' :
                          row.type === 'cheque' ? 'bg-purple-100 text-purple-800' :
                          row.type === 'card' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {row.type === 'invoice' ? 'فاکتور' :
                           row.type === 'cheque' ? 'چک صیادی' :
                           row.type === 'card' ? 'کارتخوان' : row.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-900">{row.title}</td>
                      <td className="p-3 text-left font-mono font-bold text-rose-600">
                        {row.debit > 0 ? row.debit.toLocaleString('fa-IR') : '-'}
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-emerald-600">
                        {row.credit > 0 ? row.credit.toLocaleString('fa-IR') : '-'}
                      </td>
                      <td className="p-3 text-left font-mono font-black text-slate-900">
                        {row.balance.toLocaleString('fa-IR')}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{row.referenceId}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Record Payment (Cash, POS, Online, Cheque) */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            <span>ثبت دریافت وجه و تسویه حساب مشتری B2B</span>
          </h2>
          <p className="text-xs text-slate-500">
            مبلغ دریافتی مستقیماً از مانده بدهی مشتری کسر شده و سند حسابداری در دفتر معین درج می‌گردد.
          </p>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">مشتری طرف حساب *:</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.storeName} ({c.id}) - مانده: {c.currentBalance.toLocaleString('fa-IR')} ت
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">روش دریافت وجه:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    paymentType === 'card' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-slate-200'
                  }`}
                >
                  کارتخوان (POS)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('cheque')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    paymentType === 'cheque' ? 'bg-purple-50 border-purple-500 text-purple-800' : 'border-slate-200'
                  }`}
                >
                  چک صیادی
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('cash')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    paymentType === 'cash' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'border-slate-200'
                  }`}
                >
                  نقدی
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('online')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                    paymentType === 'online' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'border-slate-200'
                  }`}
                >
                  واریز آنلاین / شبا
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">مبلغ پرداختی (تومان) *:</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-sm font-bold"
              />
            </div>

            {paymentType === 'cheque' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">شماره صیاد / سریال ۱۶ رقمی:</label>
                  <input
                    type="text"
                    placeholder="مثلاً 7845-9812-4410-0012"
                    value={chequeNum}
                    onChange={e => setChequeNum(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاریخ سررسید چک:</label>
                  <input
                    type="text"
                    placeholder="۱۴۰۳/۰۸/۱۵"
                    value={chequeDate}
                    onChange={e => setChequeDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">شماره ارجاع / فیش بانکی:</label>
              <input
                type="text"
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                placeholder="POS-78210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">شرح عملیات و توضیحات:</label>
              <textarea
                rows={2}
                value={payNotes}
                onChange={e => setPayNotes(e.target.value)}
                placeholder="مثلاً تسویه بخشی از فاکتور آب گودیز..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs"
            >
              ثبت سند حسابداری در دفتر معین
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Visitor Commission Engine (Section 17 in brief) */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">محاسبه خودکار پورسانت ویزیتورها</h2>
              <p className="text-xs text-slate-500">
                فرمول: هر باکس آب و نوشیدنی = پورسانت مصوب (حتی برای سفارش‌هایی که مشتری شخصاً اینترنتی ثبت نموده است)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visitors.map(v => (
              <div key={v.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {v.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{v.name}</h3>
                    <div className="text-xs text-slate-500 font-mono">{v.phone}</div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    فعال
                  </span>
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">فروش ماه جاری:</span>
                    <span className="font-mono font-bold text-slate-800">{v.currentMonthSales.toLocaleString('fa-IR')} ت</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">تعداد سفارشات:</span>
                    <span className="font-mono font-bold text-slate-800">{v.totalOrdersCount} سفارش</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">مشتریان فعال:</span>
                    <span className="font-mono font-bold text-slate-800">{v.activeCustomersCount} مشتری</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="font-bold text-amber-900">پورسانت محاسبه‌شده:</span>
                    <span className="font-mono font-black text-amber-700">
                      {v.totalCommissionEarned.toLocaleString('fa-IR')} ت
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`دستور پرداخت پورسانت ${v.name} به مبلغ ${v.totalCommissionEarned.toLocaleString('fa-IR')} تومان به واحد خزانه صادر گردید.`)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-xl transition"
                >
                  صدور فیش و تسویه پورسانت
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Debtors & Overdue alerts */}
      {activeTab === 'debtors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">گزارش مشتریان بدهکار و مانده‌های حساب</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">کد مشتری</th>
                  <th className="p-3">نام فروشگاه</th>
                  <th className="p-3">صاحب فروشگاه / تلفن</th>
                  <th className="p-3">ویزیتور مسئول</th>
                  <th className="p-3 text-left">سقف اعتبار</th>
                  <th className="p-3 text-left">مانده بدهی (تومان)</th>
                  <th className="p-3 text-center">وضعیت ریسک</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {customers.map(c => {
                  const creditRatio = c.creditCeiling > 0 ? (c.currentBalance / c.creditCeiling) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-600">{c.id}</td>
                      <td className="p-3 font-bold text-slate-900">{c.storeName}</td>
                      <td className="p-3 text-slate-600">
                        {c.ownerName} • <span className="font-mono">{c.phone}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{c.assignedVisitorId}</td>
                      <td className="p-3 text-left font-mono font-bold text-slate-700">
                        {c.creditCeiling.toLocaleString('fa-IR')}
                      </td>
                      <td className="p-3 text-left font-mono font-black text-rose-600">
                        {c.currentBalance.toLocaleString('fa-IR')}
                      </td>
                      <td className="p-3 text-center">
                        {creditRatio > 0.8 ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            بیش از ۸۰٪ سقف (خطر)
                          </span>
                        ) : c.currentBalance > 0 ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            در محدوده اعتبار
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            تسویه کامل
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
