import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  User,
  ShoppingBag,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Printer,
  ChevronDown,
  Building,
  ArrowRight,
  TrendingDown,
  Plus
} from 'lucide-react';

interface CustomerPortalProps {
  onNavigateOrder: () => void;
  onOpenInvoice: (order: Order) => void;
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'registered', label: '۱. ثبت سفارش', desc: 'ثبت در سیستم' },
  { key: 'confirmed', label: '۲. تأیید سفارش', desc: 'تأیید واحد فروش' },
  { key: 'pending_inventory', label: '۳. بررسی موجودی', desc: 'بررسی انبار مرکزی' },
  { key: 'warehouse_prep', label: '۴. آماده‌سازی انبار', desc: 'بسته‌بندی و پالت‌چینی' },
  { key: 'ready_to_ship', label: '۵. آماده ارسال', desc: 'تخصیص به سکوی بارگیری' },
  { key: 'handed_to_driver', label: '۶. تحویل راننده', desc: 'بارگیری در ماشین توزیع' },
  { key: 'shipped', label: '۷. ارسال شد / در مسیر', desc: 'حرکت به سمت مقصد' },
  { key: 'delivered', label: '۸. تحویل مشتری', desc: 'امضا و رسید تحویل کالا' },
  { key: 'settled', label: '۹. تسویه حساب', desc: 'وصول وجه یا پاس شدن چک' }
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onNavigateOrder,
  onOpenInvoice
}) => {
  const {
    currentCustomer,
    customers,
    setCurrentCustomer,
    visitors,
    orders,
    ledgerEntries
  } = useApp();

  const customer = currentCustomer || customers[0];
  const assignedVisitor = visitors.find(v => v.id === customer.assignedVisitorId) || visitors[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'ledger' | 'profile'>('orders');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const customerOrders = orders.filter(o => o.customerId === customer.id);
  const customerLedger = ledgerEntries.filter(l => l.customerId === customer.id);

  // Status index helper
  const getStatusStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled' || status === 'returned') return -1;
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Customer Header & Profile Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl border border-blue-200">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{customer.storeName}</h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2 py-0.5 rounded">
                  {customer.id}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                  مشتری معتبر B2B
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                صاحب فروشگاه: <strong className="text-slate-800">{customer.ownerName}</strong> • همراه: {customer.phone}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                محدوده پخش: <strong>{customer.address}</strong>
              </p>
            </div>
          </div>

          {/* Quick switcher to test other customers */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="text-xs text-slate-500">
              تغییر اکانت مشتری (دمو):
              <select
                value={customer.id}
                onChange={e => {
                  const target = customers.find(c => c.id === e.target.value);
                  if (target) setCurrentCustomer(target);
                }}
                className="mr-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs font-bold text-slate-800"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.storeName} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onNavigateOrder}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سفارش جدید</span>
            </button>
          </div>
        </div>

        {/* Financial KPIs Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">سقف اعتبار تجاری:</span>
            <span className="text-lg font-black text-slate-800 font-mono">
              {customer.creditCeiling.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">مانده بدهی جاری:</span>
            <span className={`text-lg font-black font-mono ${customer.currentBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {customer.currentBalance.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">مجموع خریدهای ثبت شده:</span>
            <span className="text-lg font-black text-slate-800 font-mono">
              {customer.totalPurchases.toLocaleString('fa-IR')}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block mb-1">ویزیتور پشتیبان:</span>
            <span className="text-sm font-bold text-slate-800 block">
              {assignedVisitor.name}
            </span>
            <span className="text-[11px] text-amber-600 font-mono">
              کد: {assignedVisitor.id} • {assignedVisitor.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>سفارش‌ها و رهگیری زنده ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'ledger'
              ? 'border-cyan-600 text-cyan-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>دفتر حساب و معین مالی ({customerLedger.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders and 11-step visual tracker */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">هیچ سفارشی برای این مشتری ثبت نشده است.</h3>
              <button
                onClick={onNavigateOrder}
                className="bg-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                ثبت اولین سفارش B2B
              </button>
            </div>
          ) : (
            customerOrders.map(order => {
              const currentStepIdx = getStatusStepIndex(order.status);
              const isSpecialStatus = order.status === 'cancelled' || order.status === 'returned';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-500">تاریخ: {order.createdAt}</span>
                      <span className="text-slate-500 font-mono">
                        مجموع: <strong className="text-slate-800">{order.totalBoxes} باکس</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                        {order.totalAmount.toLocaleString('fa-IR')} تومان
                      </span>

                      <button
                        onClick={() => onOpenInvoice(order)}
                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-600" />
                        <span>مشاهده فاکتور</span>
                      </button>
                    </div>
                  </div>

                  {/* 11-Step Progress Stepper (Section 11 in brief) */}
                  <div className="p-4 sm:p-6 bg-white overflow-x-auto">
                    {isSpecialStatus ? (
                      <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <span>
                          این سفارش به دلیل {order.status === 'cancelled' ? 'لغو توسط خریدار یا انبار' : 'برگشت کالا به انبار'} در این وضعیت قرار گرفته است.
                        </span>
                      </div>
                    ) : (
                      <div className="min-w-[650px]">
                        <div className="flex items-center justify-between relative mb-2">
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                          <div
                            className="absolute top-1/2 right-0 h-1 bg-cyan-500 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{
                              width: `${(Math.min(currentStepIdx, STATUS_STEPS.length - 1) / (STATUS_STEPS.length - 1)) * 100}%`
                            }}
                          ></div>

                          {STATUS_STEPS.map((step, idx) => {
                            const isDone = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;

                            return (
                              <div key={step.key} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                                    isDone
                                      ? 'bg-cyan-600 border-cyan-600 text-white'
                                      : isCurrent
                                      ? 'bg-white border-cyan-600 text-cyan-600 ring-4 ring-cyan-100'
                                      : 'bg-white border-slate-300 text-slate-400'
                                  }`}
                                >
                                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <div className="text-[10px] font-bold mt-1 text-center whitespace-nowrap text-slate-700">
                                  {step.label.split('.')[1]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order items snapshot */}
                  <div className="px-6 pb-4 pt-2 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">اقلام سفارش:</span>
                      {order.items.map((item, i) => (
                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.productName} ({item.quantityBoxes} باکس)
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span>راننده توزیع: <strong className="text-slate-800">{order.driverName || 'در انتظار تخصیص'}</strong></span>
                      <span>روش تسویه: <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Customer Account Ledger (Section 12 & 15) */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">دفتر حساب معین مشتری ({customer.id})</h2>
              <p className="text-xs text-slate-500">
                صورت گردش بدهکاری و بستانکاری شامل فاکتورها، پرداخت‌های نقدی، کارتخوان، چک و تخفیفات
              </p>
            </div>

            <div className="text-left bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">مانده نهایی بدهی:</span>
              <span className="text-base font-black text-amber-600 font-mono">
                {customer.currentBalance.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">نوع سند</th>
                  <th className="p-3">شرح عملیات</th>
                  <th className="p-3 text-left">بدهکار (خرید)</th>
                  <th className="p-3 text-left">بستانکار (پرداخت)</th>
                  <th className="p-3 text-left">مانده حساب (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {customerLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      هیچ رکوردی در دفتر معین ثبت نشده است.
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
                           row.type === 'cheque' ? 'چک' :
                           row.type === 'card' ? 'کارتخوان' : row.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{row.title}</td>
                      <td className="p-3 text-left font-mono font-bold text-rose-600">
                        {row.debit > 0 ? row.debit.toLocaleString('fa-IR') : '-'}
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-emerald-600">
                        {row.credit > 0 ? row.credit.toLocaleString('fa-IR') : '-'}
                      </td>
                      <td className="p-3 text-left font-mono font-black text-slate-900">
                        {row.balance.toLocaleString('fa-IR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
