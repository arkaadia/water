import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PricingTier } from '../types';
import { AdminExecutiveDashboard } from './AdminExecutiveDashboard';
import { SmsManagementPortal } from './SmsManagementPortal';
import {
  Shield,
  BarChart3,
  Tag,
  MapPin,
  FileSpreadsheet,
  History,
  FolderPlus,
  Plus,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Download,
  Settings,
  Edit2,
  MessageSquare
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    products,
    updateProduct,
    addProduct,
    categories,
    addCategory,
    orders,
    customers,
    visitors,
    deliveryZones,
    updateDeliveryZone,
    auditLogs,
    exportToCsv
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'sms' | 'pricing' | 'zones' | 'categories' | 'logs'>('analytics');

  // Edit pricing modal/state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Executive KPIs
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBoxes = orders.reduce((sum, o) => sum + o.totalBoxes, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalCommissions = visitors.reduce((sum, v) => sum + v.totalCommissionEarned, 0);

  // Sales by visitor breakdown
  const visitorBreakdown = visitors.map(v => {
    const vOrders = orders.filter(o => o.visitorId === v.id);
    const vSales = vOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { visitor: v, sales: vSales, ordersCount: vOrders.length };
  });

  // Sales by region breakdown
  const regionBreakdown = deliveryZones.map(z => {
    const zOrders = orders.filter(o => o.deliveryZone === z.name);
    const zSales = zOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { zone: z, sales: zSales, ordersCount: zOrders.length };
  });

  const handleSavePriceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      basePricePerBox: editingProduct.basePricePerBox,
      wholesalePricePerBox: editingProduct.wholesalePricePerBox,
      commissionPerBox: editingProduct.commissionPerBox,
      tiers: editingProduct.tiers
    });
    alert(`نرخ‌های محصول ${editingProduct.name} با موفقیت به‌روزرسانی شد.`);
    setEditingProduct(null);
  };

  const handleAddTier = () => {
    if (!editingProduct) return;
    const currentTiers = editingProduct.tiers || [];
    const nextQty = (currentTiers[currentTiers.length - 1]?.minQtyBoxes || 50) + 30;
    const nextPrice = (currentTiers[currentTiers.length - 1]?.pricePerBox || editingProduct.wholesalePricePerBox) - 5000;
    setEditingProduct({
      ...editingProduct,
      tiers: [...currentTiers, { minQtyBoxes: nextQty, pricePerBox: nextPrice }]
    });
  };

  const handleUpdateTier = (idx: number, field: 'minQtyBoxes' | 'pricePerBox', val: number) => {
    if (!editingProduct) return;
    const newTiers = [...editingProduct.tiers];
    newTiers[idx] = { ...newTiers[idx], [field]: val };
    setEditingProduct({ ...editingProduct, tiers: newTiers });
  };

  const handleRemoveTier = (idx: number) => {
    if (!editingProduct) return;
    const newTiers = editingProduct.tiers.filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, tiers: newTiers });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCatName,
      slug: newCatSlug || `cat-${Date.now()}`,
      iconName: 'Package',
      description: 'دسته جدید تعریف شده توسط مدیر سیستم'
    });
    alert(`دسته‌بندی "${newCatName}" با موفقیت ایجاد شد.`);
    setNewCatName('');
    setNewCatSlug('');
  };

  const handleExportSalesReport = () => {
    const rows = orders.map(o => ({
      'شماره سفارش': o.orderNumber,
      'تاریخ': o.createdAt,
      'مشتری': o.customerName,
      'کد مشتری': o.customerCode,
      'ویزیتور': o.visitorName,
      'تعداد کل باکس': o.totalBoxes,
      'مبلغ کل (تومان)': o.totalAmount,
      'پورسانت ویزیتور': o.totalVisitorCommission,
      'منطقه ارسال': o.deliveryZone,
      'راننده': o.driverName || 'تخصیص‌نیافته',
      'روش پرداخت': o.paymentMethod,
      'وضعیت سفارش': o.status
    }));
    exportToCsv(rows, 'گزارش_جامع_فروش_گوارانو');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xl border border-rose-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">پنل مدیریت کلان و تصمیم‌گیری استراتژیک</h1>
                <span className="bg-rose-500/20 text-rose-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                کنترل متمرکز شبکه فروش B2B، سیاست‌های قیمت‌گذاری پلکانی، پورسانت‌ها، مناطق و گزارش‌های عملکرد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSalesReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>خروجی اکسل فروش جامع</span>
            </button>
          </div>
        </div>

        {/* Global Executive Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل فروش ثبت شده:</span>
            <span className="text-base font-black text-white font-mono">{totalSales.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">مجموع تناژ (باکس):</span>
            <span className="text-base font-black text-cyan-400 font-mono">{totalBoxes.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-slate-400 mr-1">باکس</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">تعداد مشتریان شبکه:</span>
            <span className="text-base font-black text-purple-300 font-mono">{customers.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">فروشگاه</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ویزیتورهای فعال:</span>
            <span className="text-base font-black text-amber-400 font-mono">{visitors.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">نفر</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>داشبورد تحلیلی و گزارشات</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'sms'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>پنل پیامک و اطلاع‌رسانی بار</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>موتور قیمت‌گذاری و تخفیف پلکانی</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'zones'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>محدوده‌های توزیع و کرایه‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>دسته‌بندی پویای FMCG</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>لاگ ممیزی و رویدادهای سیستم ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Executive Analytics & BI Dashboard */}
      {activeTab === 'analytics' && (
        <AdminExecutiveDashboard />
      )}

      {/* Tab 2: SMS Management & Shipment Notifications */}
      {activeTab === 'sms' && (
        <SmsManagementPortal />
      )}

      {/* Tab 2: Pricing Engine (Section 18 of brief: قیمت عمومی، عمده، پلکانی، پورسانت) */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">تنظیم نرخ‌ها و قیمت‌گذاری پلکانی</h2>
              <p className="text-xs text-slate-500">
                تعریف قیمت عمده، پله‌های تخفیف بر اساس تعداد باکس (۳۰، ۶۰، ۱۰۰ باکس) و پورسانت هر باکس
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">کد کالا</th>
                  <th className="p-3">نام کالا</th>
                  <th className="p-3 text-left">قیمت پایه (تک)</th>
                  <th className="p-3 text-left">قیمت عمده استاندارد</th>
                  <th className="p-3 text-left">پورسانت ویزیتور/باکس</th>
                  <th className="p-3">پله‌های تخفیف پلکانی</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-500">{prod.sku}</td>
                    <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                    <td className="p-3 text-left font-mono">{prod.basePricePerBox.toLocaleString('fa-IR')} ت</td>
                    <td className="p-3 text-left font-mono font-bold text-cyan-800">
                      {prod.wholesalePricePerBox.toLocaleString('fa-IR')} ت
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-amber-700">
                      {prod.commissionPerBox.toLocaleString('fa-IR')} ت
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {prod.tiers && prod.tiers.map((t, tidx) => (
                          <span key={tidx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                            {t.minQtyBoxes}+ باکس: {t.pricePerBox.toLocaleString('fa-IR')}ت
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 mx-auto transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ویرایش نرخ‌ها</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">
              ویرایش سیاست قیمت‌گذاری: {editingProduct.name}
            </h3>

            <form onSubmit={handleSavePriceEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">قیمت پایه هر باکس (تومان):</label>
                  <input
                    type="number"
                    value={editingProduct.basePricePerBox}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, basePricePerBox: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">قیمت عمده استاندارد (تومان):</label>
                  <input
                    type="number"
                    value={editingProduct.wholesalePricePerBox}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, wholesalePricePerBox: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">پورسانت ویزیتور به ازای هر باکس (تومان):</label>
                <input
                  type="number"
                  value={editingProduct.commissionPerBox}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, commissionPerBox: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              {/* Tiers list */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">پله‌های تخفیف پلکانی (تعداد باکس):</span>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن پله جدید</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editingProduct.tiers?.map((tier, tidx) => (
                    <div key={tidx} className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">از</span>
                      <input
                        type="number"
                        value={tier.minQtyBoxes}
                        onChange={e => handleUpdateTier(tidx, 'minQtyBoxes', Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                      />
                      <span className="text-slate-500 text-[11px]">باکس، قیمت هر باکس:</span>
                      <input
                        type="number"
                        value={tier.pricePerBox}
                        onChange={e => handleUpdateTier(tidx, 'pricePerBox', Number(e.target.value))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-left"
                      />
                      <span className="text-slate-500 text-[11px]">تومان</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tidx)}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
                >
                  ذخیره تغییرات نرخ‌ها
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Zones (Section 19 in brief) */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">مدیریت مناطق توزیع و شرایط ارسال رایگان</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">نام منطقه</th>
                  <th className="p-3 text-left">هزینه کرایه حمل</th>
                  <th className="p-3 text-left">سقف خرید برای ارسال رایگان</th>
                  <th className="p-3">زمان‌بندی تحویل</th>
                  <th className="p-3 text-center">وضعیت سرویس‌دهی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {deliveryZones.map(zone => (
                  <tr key={zone.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{zone.name}</td>
                    <td className="p-3 text-left font-mono font-bold text-cyan-800">
                      {zone.shippingFee === 0 ? 'رایگان' : `${zone.shippingFee.toLocaleString('fa-IR')} ت`}
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-emerald-700">
                      بالای {zone.freeShippingMinOrder.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3 text-slate-600">{zone.deliveryEstimate}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        پوشش فعال
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Categories (Section 4 & 26 in brief) */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900">تعریف دسته‌بندی جدید بدون کدنویسی</h3>
            <p className="text-xs text-slate-500">
              سیستم به صورت داینامیک طراحی شده تا کالاها مانند کیک، نوشابه، آبمیوه، تنقلات و... را بپذیرد.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام دسته‌بندی جدید:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً چای و دمنوش سازمانی"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شناسه انگلیسی (slug):</label>
                <input
                  type="text"
                  placeholder="tea-herbal"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition"
              >
                ایجاد دسته‌بندی در فروشگاه
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900">دسته‌بندی‌های فعال کاتالوگ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cat.slug}</div>
                  </div>
                  <span className="text-xs text-cyan-700 font-bold bg-cyan-50 px-2 py-1 rounded">
                    {products.filter(p => p.categoryId === cat.id).length} کالا
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log (Section 24 of brief: تمام فعالیت‌های مهم کاربران Log شود) */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">ثبت وقایع و لاگ امنیتی سیستم (Audit Log)</h2>
              <p className="text-xs text-slate-500">
                ردیابی هرگونه ثبت سفارش، تغییر موجودی، ویرایش قیمت و ورود/خروج کالا
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96 overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] sticky top-0">
                  <th className="p-3">زمان رویداد</th>
                  <th className="p-3">کاربر / نقش</th>
                  <th className="p-3">عنوان عملیات</th>
                  <th className="p-3">جزئیات کامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 mr-1">({log.role})</span>
                    </td>
                    <td className="p-3 font-bold text-cyan-800 whitespace-nowrap">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
