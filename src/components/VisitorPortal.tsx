import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, Order } from '../types';
import {
  Briefcase,
  Users,
  Target,
  DollarSign,
  Phone,
  Plus,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  QrCode,
  Calendar
} from 'lucide-react';

interface VisitorPortalProps {
  onStartOrderForCustomer: (customer: Customer) => void;
  onOpenInvoice: (order: Order) => void;
}

export const VisitorPortal: React.FC<VisitorPortalProps> = ({
  onStartOrderForCustomer,
  onOpenInvoice
}) => {
  const {
    visitors,
    currentVisitor,
    setCurrentVisitor,
    customers,
    orders,
    addCustomer,
    deliveryZones
  } = useApp();

  const visitor = currentVisitor || visitors[0];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'orders' | 'new-customer'>('dashboard');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Customer Form State
  const [newCustStore, setNewCustStore] = useState('');
  const [newCustOwner, setNewCustOwner] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustRegion, setNewCustRegion] = useState('shahriar');
  const [newCustCredit, setNewCustCredit] = useState(15000000);

  // Filter only this visitor's customers and orders (Section 12 of brief)
  const myCustomers = customers.filter(c => c.assignedVisitorId === visitor.id);
  const myOrders = orders.filter(o => o.visitorId === visitor.id);

  // Today's orders
  const todayOrders = myOrders.filter(o => o.createdAt.includes('۱۴۰۳/۰۷/۱۷') || o.createdAt.includes('۱۴۰۳'));

  // Calculate target progress percentage
  const targetPercent = Math.min(100, Math.round((visitor.currentMonthSales / visitor.monthlyTarget) * 100));

  // Customers needing follow-up (overdue balance or no order in last 7 days)
  const followUpCustomers = myCustomers.filter(c => c.currentBalance > 0 || !c.lastOrderDate);

  const handleCopyLink = (custCode: string) => {
    const url = `${window.location.origin}/order/${custCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(custCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRegisterNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustStore || !newCustOwner || !newCustPhone || !newCustAddress) {
      alert('لطفاً کلیه فیلدهای الزامی مشتری جدید را تکمیل فرمایید.');
      return;
    }

    const created = addCustomer({
      storeName: newCustStore,
      ownerName: newCustOwner,
      phone: newCustPhone,
      address: newCustAddress,
      regionId: newCustRegion,
      coordinates: { lat: 35.68, lng: 51.1 },
      assignedVisitorId: visitor.id,
      creditCeiling: Number(newCustCredit) || 10000000,
      status: 'active'
    });

    alert(`مشتری جدید با کد اختصاصی ${created.id} به نام شما ثبت شد.`);
    setNewCustStore('');
    setNewCustOwner('');
    setNewCustPhone('');
    setNewCustAddress('');
    setActiveTab('customers');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Visitor Profile Bar (Mobile-friendly, Section 25) */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-xl border border-amber-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl border border-amber-500/30">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">داشبورد ویزیتور: {visitor.name}</h1>
                <span className="bg-amber-500/20 text-amber-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded border border-amber-500/30">
                  {visitor.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تلفن همراه: <span className="font-mono">{visitor.phone}</span> • مناطق فعالیت:{' '}
                <strong className="text-amber-300">{visitor.assignedRegions.join('، ')}</strong>
              </p>
            </div>
          </div>

          {/* Switch visitor demo */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">تغییر ویزیتور:</span>
            <select
              value={visitor.id}
              onChange={e => {
                const target = visitors.find(v => v.id === e.target.value);
                if (target) setCurrentVisitor(target);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold"
            >
              {visitors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>هدف فروش ماهانه: <strong>{visitor.monthlyTarget.toLocaleString('fa-IR')} تومان</strong></span>
            </span>
            <span className="text-amber-400 font-bold font-mono">
              {targetPercent}٪ تحقق یافته ({visitor.currentMonthSales.toLocaleString('fa-IR')} ت)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${targetPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPI Cards (Section 12: فروش امروز، فروش ماه، پورسانت، مشتریان) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
            <span>فروش امروز:</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {visitor.todaySales.toLocaleString('fa-IR')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">تومان</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
            <span>فروش کل ماه:</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {visitor.currentMonthSales.toLocaleString('fa-IR')}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">
            {myOrders.length} سفارش ثبت شده
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="text-amber-800 text-xs flex items-center justify-between mb-1 font-bold">
            <span>پورسانت شما (خودکار):</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-700 font-mono">
            {visitor.totalCommissionEarned.toLocaleString('fa-IR')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            (محاسبه خودکار حتی در خرید آنلاین خود مشتری)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-400 text-xs flex items-center justify-between mb-1">
            <span>تعداد مشتریان شما:</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-mono">
            {myCustomers.length} <span className="text-xs font-normal">فروشگاه</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {visitor.newCustomersCount} مشتری جدید این ماه
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'dashboard'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>پیگیری‌ها و سفارش‌های امروز</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'customers'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مشتریان تحت پوشش من ({myCustomers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>سفارشات ثبت شده ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('new-customer')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'new-customer'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>ثبت مشتری جدید در منطقه</span>
        </button>
      </div>

      {/* Tab 1: Dashboard with Follow-ups and Direct Order Buttons */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Urgent Follow-up Alert (Section 12: مشتریان نیازمند پیگیری) */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="text-sm font-black text-amber-900 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>مشتریان نیازمند پیگیری و تماس (مانده حساب یا عدم سفارش بیش از ۷ روز)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {followUpCustomers.map(cust => (
                <div
                  key={cust.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{cust.storeName}</div>
                    <div className="text-[11px] text-slate-500">
                      مسئول: {cust.ownerName} • مانده: <strong className="text-amber-700">{cust.currentBalance.toLocaleString('fa-IR')} ت</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cust.phone}`}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      title="تماس مستقیم با مشتری"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onStartOrderForCustomer(cust)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>ثبت سفارش</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Customers List with links and order trigger */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">لیست مشتریان اختصاصی ({visitor.name})</h2>
              <p className="text-xs text-slate-500">
                هر سفارش اینترنتی که مشتریان زیر ثبت کنند، مستقیماً به نام شما منظور خواهد شد.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('new-customer')}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن مشتری</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCustomers.map(cust => (
              <div key={cust.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {cust.id}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{cust.storeName}</h3>
                    <div className="text-xs text-slate-600">{cust.ownerName}</div>
                  </div>
                  <a
                    href={`tel:${cust.phone}`}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                  <div>نشانی: {cust.address}</div>
                  <div className="flex justify-between">
                    <span>مانده بدهی:</span>
                    <strong className={cust.currentBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {cust.currentBalance.toLocaleString('fa-IR')} تومان
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>مجموع خریدها:</span>
                    <span className="font-mono">{cust.totalPurchases.toLocaleString('fa-IR')} تومان</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyLink(cust.id)}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                    title="کپی لینک اختصاصی سفارش مشتری"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode === cust.id ? 'کپی شد!' : 'لینک اختصاصی'}</span>
                  </button>

                  <button
                    onClick={() => onStartOrderForCustomer(cust)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>ثبت سفارش</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: My Orders List */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">سفارش‌های ثبت شده و محاسبه پورسانت</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">شماره سفارش</th>
                  <th className="p-3">مشتری</th>
                  <th className="p-3">تعداد باکس</th>
                  <th className="p-3 text-left">مبلغ کل فاکتور</th>
                  <th className="p-3 text-left">پورسانت شما</th>
                  <th className="p-3 text-center">وضعیت سفارش</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {myOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{order.customerCode}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{order.totalBoxes} باکس</td>
                    <td className="p-3 text-left font-mono font-bold text-slate-900">
                      {order.totalAmount.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3 text-left font-mono font-black text-amber-700 bg-amber-50/40">
                      {order.totalVisitorCommission.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenInvoice(order)}
                        className="text-cyan-700 hover:underline font-bold text-[11px]"
                      >
                        فاکتور
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Register New Customer Form (Section 12 of brief) */}
      {activeTab === 'new-customer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-600" />
            <span>ثبت مشتری و فروشگاه جدید در منطقه شما</span>
          </h2>
          <p className="text-xs text-slate-500">
            پس از ثبت، مشتری دارای کد یکتای CUS و لینک اختصاصی سفارش خواهد شد و به نام ویزیتور شما متصل می‌شود.
          </p>

          <form onSubmit={handleRegisterNewCustomer} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام فروشگاه / هایپرمارکت *:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً هایپرمارکت ارکیده"
                  value={newCustStore}
                  onChange={e => setNewCustStore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نام صاحب فروشگاه / مدیر خرید *:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً آقای احمدی"
                  value={newCustOwner}
                  onChange={e => setNewCustOwner(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">شماره همراه تماس *:</label>
                <input
                  type="tel"
                  required
                  placeholder="0912xxxxxxx"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">محدوده توزیع:</label>
                <select
                  value={newCustRegion}
                  onChange={e => setNewCustRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs"
                >
                  {deliveryZones.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">سقف اعتبار پیشنهادی (تومان):</label>
              <input
                type="number"
                value={newCustCredit}
                onChange={e => setNewCustCredit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نشانی دقیق محل تحویل بار *:</label>
              <textarea
                required
                rows={2}
                placeholder="آدرس دقیق شامل خیابان، پلاک و کروکی تقریبی..."
                value={newCustAddress}
                onChange={e => setNewCustAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-3 rounded-xl shadow-md transition"
            >
              ثبت نهایی مشتری و صدور کد یکتا
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
