import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, WarehouseTransaction } from '../types';
import {
  Package,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  ClipboardList,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet
} from 'lucide-react';

export const WarehousePortal: React.FC = () => {
  const {
    products,
    orders,
    warehouseTransactions,
    updateOrderStatus,
    recordWarehouseTransaction,
    updateProduct
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'prep-orders' | 'transactions' | 'reconciliation'>('inventory');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [txType, setTxType] = useState<'inbound' | 'outbound' | 'damaged' | 'returned'>('inbound');
  const [txQty, setTxQty] = useState<number>(50);
  const [txRef, setTxRef] = useState<string>('HVL-1403-');
  const [txNotes, setTxNotes] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  // Physical count state for reconciliation
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    products.forEach(p => {
      init[p.id] = p.totalStock;
    });
    return init;
  });

  // Orders that need warehouse attention
  const pendingOrders = orders.filter(
    o => o.status === 'registered' || o.status === 'confirmed' || o.status === 'pending_inventory' || o.status === 'warehouse_prep'
  );

  const filteredProducts = products.filter(p =>
    p.name.includes(searchFilter) || p.brand.includes(searchFilter) || p.sku.includes(searchFilter)
  );

  const handleRecordTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || txQty <= 0) {
      alert('لطفاً محصول و تعداد معتبر را وارد فرمایید.');
      return;
    }

    recordWarehouseTransaction({
      productId: selectedProductId,
      type: txType,
      quantityBoxes: Number(txQty),
      referenceNo: txRef || `HVL-${Date.now().toString().slice(-4)}`,
      notes: txNotes
    });

    alert('تراکنش انبار با موفقیت ثبت شد و موجودی به‌روز گردید.');
    setTxNotes('');
    setTxQty(50);
  };

  const handleApplyReconciliation = (productId: string) => {
    const actual = physicalCounts[productId];
    const product = products.find(p => p.id === productId);
    if (!product || actual === undefined) return;

    recordWarehouseTransaction({
      productId,
      type: 'reconciliation',
      quantityBoxes: actual,
      referenceNo: `RECON-${Date.now().toString().slice(-4)}`,
      notes: `انبارگردانی: تنظیم موجودی کل از ${product.totalStock} به ${actual} باکس`
    });

    alert(`موجودی کالا با موفقیت بر اساس شمارش فیزیکی (${actual} باکس) اصلاح شد.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/30">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">سامانه هوشمند انبارداری و کنترل کالا</h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/30">
                  انبار مرکزی غرب
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                کنترل لحظه‌ای: <strong className="text-white">موجودی کل - موجودی رزرو شده = موجودی قابل فروش</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
              <span className="text-[11px] text-slate-300 block">سفارشات در انتظار آماده‌سازی:</span>
              <span className="text-base font-black text-amber-400 font-mono">{pendingOrders.length} سفارش</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>ماتریس موجودی کالاها ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prep-orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'prep-orders'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>سفارشات آماده‌سازی انبار ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>ثبت ورود، خروج، ضایعات و مرجوعی</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activeTab === 'reconciliation'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>انبارگردانی و مغایرت‌گیری سیستمی</span>
        </button>
      </div>

      {/* Tab 1: Inventory Table (Formula: موجودی کل - رزرو = قابل فروش) */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="فیلتر نام محصول یا برند..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="text-xs text-slate-500">
              فرمول محاسباتی: <span className="text-slate-800 font-bold">موجودی کل</span> - <span className="text-amber-600 font-bold">رزرو سفارشات</span> = <span className="text-emerald-600 font-black">موجودی قابل فروش</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">تصویر</th>
                  <th className="p-3">کد کالا (SKU)</th>
                  <th className="p-3">شرح محصول</th>
                  <th className="p-3 text-center">بسته‌بندی</th>
                  <th className="p-3 text-center">موجودی کل</th>
                  <th className="p-3 text-center text-amber-700">رزرو شده</th>
                  <th className="p-3 text-center text-emerald-700 font-black">قابل فروش</th>
                  <th className="p-3 text-center text-rose-600">ضایعات/خراب</th>
                  <th className="p-3 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredProducts.map(prod => {
                  const available = Math.max(0, prod.totalStock - prod.reservedStock);
                  const isLow = available < 100;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">{prod.sku}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-slate-500">{prod.brand} ({prod.volume})</div>
                      </td>
                      <td className="p-3 text-center font-mono">{prod.unitsPerBox} بطری/باکس</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">{prod.totalStock} باکس</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-600 bg-amber-50/50">
                        {prod.reservedStock} باکس
                      </td>
                      <td className="p-3 text-center font-mono font-black text-emerald-700 bg-emerald-50/50 text-xs">
                        {available} باکس
                      </td>
                      <td className="p-3 text-center font-mono text-rose-600">{prod.damagedStock} باکس</td>
                      <td className="p-3 text-center">
                        {available === 0 ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            ناموجود
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>کسری انبار</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            موجود کافی
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

      {/* Tab 2: Orders Pending Preparation */}
      {activeTab === 'prep-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">سفارش‌های در انتظار آماده‌سازی و بسته‌بندی</h2>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                کلیه سفارشات انبار آماده‌سازی و به واحد ارسال تحویل داده شده است.
              </div>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                        {order.orderNumber}
                      </span>
                      <span className="font-bold text-xs text-slate-800">{order.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({order.customerCode})</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      محل تحویل: {order.deliveryZone} • تاریخ: {order.createdAt}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono">
                          {it.productName}: <strong className="text-indigo-700">{it.quantityBoxes} باکس</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'warehouse_prep', 'شروع بسته‌بندی در انبار')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      شروع آماده‌سازی
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready_to_ship', 'بسته‌بندی تکمیل و به سکوی ارسال تحویل شد')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>تأیید و آماده ارسال</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Record Transactions (Inbound, Outbound, Damaged, Return) */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-900">ثبت تراکنش انبار</h2>
            <form onSubmit={handleRecordTx} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع عملیات:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('inbound')}
                    className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                      txType === 'inbound' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ورود کالا (رسید)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('outbound')}
                    className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                      txType === 'outbound' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'border-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>خروج کالا (حواله)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('damaged')}
                    className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                      txType === 'damaged' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>ضایعات / خرابی</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('returned')}
                    className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1 transition ${
                      txType === 'returned' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'border-slate-200'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>برگشت از مشتری</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">انتخاب محصول:</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تعداد (باکس):</label>
                <input
                  type="number"
                  min={1}
                  value={txQty}
                  onChange={e => setTxQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شماره سند / بارنامه / حواله:</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={e => setTxRef(e.target.value)}
                  placeholder="مثلاً HVL-CAR-4402"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توضیحات تکمیلی:</label>
                <textarea
                  rows={2}
                  value={txNotes}
                  onChange={e => setTxNotes(e.target.value)}
                  placeholder="علت خروج یا ورود یا شرح ضایعات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
              >
                ثبت تراکنش در کاردکس انبار
              </button>
            </form>
          </div>

          {/* History of Transactions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-slate-900">تاریخچه اسناد و کاردکس انبار</h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="p-3">تاریخ و ساعت</th>
                    <th className="p-3">نوع عملیات</th>
                    <th className="p-3">نام کالا</th>
                    <th className="p-3 text-center">تعداد (باکس)</th>
                    <th className="p-3">شماره سند</th>
                    <th className="p-3">توضیحات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {warehouseTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-500">{tx.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'inbound' ? 'bg-emerald-100 text-emerald-800' :
                          tx.type === 'outbound' ? 'bg-blue-100 text-blue-800' :
                          tx.type === 'damaged' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.type === 'inbound' ? 'ورود' :
                           tx.type === 'outbound' ? 'خروج' :
                           tx.type === 'damaged' ? 'ضایعات' : 'مرجوعی'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{tx.productName}</td>
                      <td className="p-3 text-center font-mono font-black">{tx.quantityBoxes}</td>
                      <td className="p-3 font-mono text-slate-500">{tx.referenceNo}</td>
                      <td className="p-3 text-slate-500">{tx.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Stock Reconciliation (Section 13: مقایسه موجودی واقعی و سیستمی) */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">انبارگردانی و مغایرت‌گیری</h2>
              <p className="text-xs text-slate-500">
                موجودی شمارش‌شده واقعی در قفسه‌ها را وارد کرده و با موجودی ثبت‌شده در سیستم مقایسه فرمایید.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">کد کالا</th>
                  <th className="p-3">نام محصول</th>
                  <th className="p-3 text-center">موجودی سیستمی</th>
                  <th className="p-3 text-center">شمارش واقعی فیزیکی</th>
                  <th className="p-3 text-center">مغایرت (کسری/اضافه)</th>
                  <th className="p-3 text-center">عملیات اصلاح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {products.map(p => {
                  const physical = physicalCounts[p.id] ?? p.totalStock;
                  const diff = physical - p.totalStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                      <td className="p-3 font-bold text-slate-800">{p.name}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">{p.totalStock} باکس</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={physical}
                          onChange={e =>
                            setPhysicalCounts(prev => ({
                              ...prev,
                              [p.id]: parseInt(e.target.value) || 0
                            }))
                          }
                          className="w-24 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-xs"
                        />
                      </td>
                      <td className="p-3 text-center font-mono font-black">
                        {diff === 0 ? (
                          <span className="text-slate-400">بدون مغایرت</span>
                        ) : diff > 0 ? (
                          <span className="text-emerald-600">+{diff} باکس (اضافه)</span>
                        ) : (
                          <span className="text-rose-600">{diff} باکس (کسری)</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          disabled={diff === 0}
                          onClick={() => handleApplyReconciliation(p.id)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                            diff === 0
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          تطبیق و اصلاح
                        </button>
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
