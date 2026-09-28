import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  QrCode,
  Store,
  UserCheck,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  CreditCard,
  Building,
  RotateCcw,
  Printer,
  ChevronLeft,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface CustomerOrderPortalProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToStore: () => void;
}

export const CustomerOrderPortal: React.FC<CustomerOrderPortalProps> = ({
  onOrderSuccess,
  onBackToStore
}) => {
  const {
    customers,
    visitors,
    products,
    currentCustomer,
    setCurrentCustomer,
    dedicatedCustomerCode,
    setDedicatedCustomerCode,
    placeOrder,
    getEffectivePrice,
    orders,
    deliveryZones
  } = useApp();

  // Find customer based on dedicatedCustomerCode or currentCustomer
  const activeCustomer =
    (dedicatedCustomerCode ? customers.find(c => c.id === dedicatedCustomerCode) : null) ||
    currentCustomer ||
    customers[0];

  const assignedVisitor = visitors.find(v => v.id === activeCustomer.assignedVisitorId) || visitors[0];

  // Cart specific to this quick ordering flow
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.slice(0, 3).forEach(p => {
      initial[p.id] = p.minOrderQtyBoxes;
    });
    return initial;
  });

  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cheque' | 'card' | 'online'>('credit');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedZone, setSelectedZone] = useState(
    deliveryZones.find(z => z.id === activeCustomer.regionId)?.name || 'شهریار'
  );
  const [showQrModal, setShowQrModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Past orders for this customer
  const customerPastOrders = orders.filter(o => o.customerId === activeCustomer.id);
  const lastOrder = customerPastOrders[0];

  const handleQtyChange = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const current = quantities[productId] || 0;
    const next = Math.max(0, current + delta);
    setQuantities(prev => ({ ...prev, [productId]: next }));
  };

  const handleSetDirectQty = (productId: string, val: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  // Reorder from past order (Brief section 10: "سفارش قبلی را مجدداً سفارش دهد")
  const handleReorderPast = () => {
    if (!lastOrder) return;
    const newQtys: Record<string, number> = {};
    lastOrder.items.forEach(item => {
      newQtys[item.productId] = item.quantityBoxes;
    });
    setQuantities(newQtys);
    alert(`اقلام آخرین سفارش (${lastOrder.totalBoxes} باکس) در فرم بارگذاری شد.`);
  };

  // Calculate order totals
  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([prodId, qty]) => {
      const prod = products.find(p => p.id === prodId)!;
      const { unitPrice, discountPerBox } = getEffectivePrice(prod, qty);
      return {
        product: prod,
        quantityBoxes: qty,
        unitPrice,
        discountPerBox,
        total: unitPrice * qty
      };
    });

  const totalBoxes = selectedItems.reduce((sum, item) => sum + item.quantityBoxes, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
  const totalDiscount = selectedItems.reduce((sum, item) => sum + (item.discountPerBox * item.quantityBoxes), 0);
  const zoneObj = deliveryZones.find(z => z.name === selectedZone);
  const shippingFee = zoneObj && subtotal >= zoneObj.freeShippingMinOrder ? 0 : (zoneObj?.shippingFee || 0);
  const grandTotal = subtotal + shippingFee;

  const handleConfirmOrder = () => {
    if (selectedItems.length === 0) {
      alert('لطفاً حداقل یک محصول را با تعداد مورد نظر انتخاب فرمایید.');
      return;
    }

    setSubmitting(true);
    const orderItems = selectedItems.map(item => ({
      product: item.product,
      quantityBoxes: item.quantityBoxes
    }));

    const newOrder = placeOrder({
      customerId: activeCustomer.id,
      deliveryZone: selectedZone,
      deliveryAddress: activeCustomer.address,
      paymentMethod,
      notes: orderNotes || 'سفارش مستقیم از طریق لینک اختصاصی B2B',
      createdByType: 'customer',
      itemsOverride: orderItems
    });

    setSubmitting(false);
    if (newOrder) {
      onOrderSuccess(newOrder.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Dedicated Customer & Visitor Identity (Section 7, 8, 9) */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-cyan-900/60 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-700/50">
              <Store className="w-3.5 h-3.5" />
              <span>صفحه اختصاصی سفارش B2B</span>
              <span className="font-mono font-bold bg-cyan-950 px-1.5 py-0.5 rounded text-white">
                {activeCustomer.id}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              خوش آمدید، {activeCustomer.storeName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              صاحب فروشگاه: <strong className="text-white">{activeCustomer.ownerName}</strong> • تلفن: {activeCustomer.phone}
            </p>
            <p className="text-xs text-slate-400">
              آدرس تحویل: {activeCustomer.address}
            </p>
          </div>

          {/* Visitor Card Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-300 text-[11px] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>ویزیتور مسئول شما:</span>
              </div>
              <div className="font-bold text-white text-sm">
                {assignedVisitor.name}
              </div>
              <div className="text-[11px] text-amber-300 font-mono">
                کد ویزیتور: {assignedVisitor.id} • {assignedVisitor.phone}
              </div>
              <div className="text-[10px] text-slate-300">
                (سفارش شما به‌صورت خودکار در کارکرد ویزیتور محاسبه می‌شود)
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-white text-slate-900 hover:bg-cyan-50 px-3 py-2 rounded-lg font-bold flex flex-col items-center gap-1 shadow-md transition"
              title="نمایش و چاپ بارکد QR اختصاصی فروشگاه شما"
            >
              <QrCode className="w-5 h-5 text-cyan-700" />
              <span className="text-[10px]">کارت QR</span>
            </button>
          </div>
        </div>

        {/* Quick financial indicator bar */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[11px]">سقف اعتبار اعطایی:</span>
            <span className="font-bold text-white font-mono text-sm">
              {activeCustomer.creditCeiling.toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[11px]">مانده بدهی فعلی:</span>
            <span className={`font-bold font-mono text-sm ${activeCustomer.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeCustomer.currentBalance.toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[11px]">مجموع خریدهای قبلی:</span>
            <span className="font-bold text-white font-mono text-sm">
              {activeCustomer.totalPurchases.toLocaleString('fa-IR')} تومان
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">آخرین خرید:</span>
              <span className="font-bold text-cyan-300 text-xs">
                {activeCustomer.lastOrderDate || 'اولین سفارش'}
              </span>
            </div>
            {lastOrder && (
              <button
                onClick={handleReorderPast}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                title="سفارش مجدد اقلام آخرین فاکتور"
              >
                <RotateCcw className="w-3 h-3" />
                <span>سفارش مجدد</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Order Form with Tier Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product selector column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-600" />
              <span>انتخاب محصولات و تعداد باکس درخواستی</span>
            </h2>
            <span className="text-xs text-slate-500">
              تخفیف پلکانی متناسب با تعداد باکس اعمال می‌شود
            </span>
          </div>

          <div className="space-y-3">
            {products.map(product => {
              const currentQty = quantities[product.id] || 0;
              const { unitPrice, discountPerBox } = getEffectivePrice(product, currentQty);
              const availableStock = Math.max(0, product.totalStock - product.reservedStock);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl border p-4 transition ${
                    currentQty > 0
                      ? 'border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl bg-slate-100 border border-slate-100 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{product.name}</span>
                          {product.isBestSeller && (
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              پرفروش
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          برند: <strong>{product.brand}</strong> • حجم: {product.volume} • هر باکس: {product.unitsPerBox} بطری
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                          <span>
                            موجودی انبار: <strong className="text-emerald-700">{availableStock} باکس</strong>
                          </span>
                          <span>
                            حداقل سفارش: <strong className="text-slate-700">{product.minOrderQtyBoxes} باکس</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stepper & Pricing */}
                    <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left">
                        <div className="text-xs font-black text-cyan-800 font-mono">
                          {unitPrice.toLocaleString('fa-IR')} <span className="text-[10px] font-normal">تومان/باکس</span>
                        </div>
                        {discountPerBox > 0 && (
                          <div className="text-[10px] text-emerald-600 flex items-center gap-0.5 justify-end font-medium">
                            <TrendingDown className="w-3 h-3" />
                            <span>{discountPerBox.toLocaleString('fa-IR')} ت تخفیف پلکانی</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, -5)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs transition"
                          title="-۵ باکس"
                        >
                          -۵
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={currentQty}
                          onChange={e => handleSetDirectQty(product.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center text-xs font-black font-mono bg-transparent text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.id, 5)}
                          className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shadow-xs transition"
                          title="+۵ باکس"
                        >
                          +۵
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tier pricing brackets pills (Pages 5 & 14 in brief) */}
                  {product.tiers && product.tiers.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="text-slate-400 font-semibold">پله‌های تخفیف تناژ:</span>
                      {product.tiers.map((tier, tidx) => (
                        <span
                          key={tidx}
                          onClick={() => handleSetDirectQty(product.id, tier.minQtyBoxes)}
                          className={`cursor-pointer px-2 py-0.5 rounded-md font-mono transition ${
                            currentQty >= tier.minQtyBoxes
                              ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tier.minQtyBoxes}+ باکس: {tier.pricePerBox.toLocaleString('fa-IR')} ت
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Checkout Card (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-4 sticky top-24">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>خلاصه پیش‌فاکتور B2B</span>
              <span className="text-xs text-cyan-600 font-mono font-bold">
                {totalBoxes} باکس
              </span>
            </h3>

            {/* Selected items quick review */}
            <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {selectedItems.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  هیچ محصولی انتخاب نشده است. از لیست روبرو باکس اضافه فرمایید.
                </div>
              ) : (
                selectedItems.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.quantityBoxes} باکس × {item.unitPrice.toLocaleString('fa-IR')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      {item.total.toLocaleString('fa-IR')} ت
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Delivery Zone Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700">محدوده ارسال بار:</label>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 outline-none focus:border-cyan-500"
              >
                {deliveryZones.map(z => (
                  <option key={z.id} value={z.name}>
                    {z.name} ({z.shippingFee === 0 ? 'ارسال رایگان' : `${z.shippingFee.toLocaleString('fa-IR')} ت`})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">روش تسویه حساب:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2 rounded-xl border text-right transition ${
                    paymentMethod === 'credit'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4 mb-1 text-cyan-600" />
                  <div>اعتباری (حساب دفتری)</div>
                  <div className="text-[9px] text-slate-500">طبق سقف مجاز</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cheque')}
                  className={`p-2 rounded-xl border text-right transition ${
                    paymentMethod === 'cheque'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-purple-600" />
                  <div>چک صیادی</div>
                  <div className="text-[9px] text-slate-500">راس ۳۰ تا ۴۵ روز</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border text-right transition ${
                    paymentMethod === 'card'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1 text-emerald-600" />
                  <div>کارتخوان راننده</div>
                  <div className="text-[9px] text-slate-500">هنگام تخلیه بار</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-2 rounded-xl border text-right transition ${
                    paymentMethod === 'online'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mb-1 text-amber-600" />
                  <div>درگاه آنلاین</div>
                  <div className="text-[9px] text-slate-500">تسویه لحظه‌ای</div>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">یادداشت برای انبار و راننده (اختیاری):</label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                placeholder="مثلاً: بار قبل از ساعت ۱۲ تخلیه شود..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-cyan-500"
              />
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>جمع کل اقلام:</span>
                <span className="font-mono">{subtotal.toLocaleString('fa-IR')} ت</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>سود شما از خرید عمده:</span>
                  <span className="font-mono">-{totalDiscount.toLocaleString('fa-IR')} ت</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>کرایه حمل و تحویل:</span>
                <span className="font-mono">
                  {shippingFee === 0 ? 'رایگان' : `${shippingFee.toLocaleString('fa-IR')} ت`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>مبلغ نهایی فاکتور:</span>
                <span className="text-cyan-800 font-mono text-base">
                  {grandTotal.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={submitting || selectedItems.length === 0}
              onClick={handleConfirmOrder}
              className={`w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition ${
                selectedItems.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 shadow-cyan-600/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ثبت نهایی سفارش B2B</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>سفارش مستقیماً به نام ویزیتور شما ({assignedVisitor.name}) متصل می‌شود.</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Customer Counter */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <h4 className="text-base font-black text-slate-900">
              کارت QR اختصاصی {activeCustomer.storeName}
            </h4>
            <p className="text-xs text-slate-500">
              این بارکد را چاپ کرده و روی پیشخوان فروشگاه بچسبانید تا بدون لاگین، مستقیماً سفارش ثبت کنید.
            </p>

            <div className="bg-slate-100 p-6 rounded-2xl inline-block border border-slate-200">
              {/* Simulated High-Res Persian QR Code representation */}
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 flex flex-col items-center justify-center relative shadow-inner">
                <QrCode className="w-36 h-36 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-cyan-600 text-white rounded-lg flex items-center justify-center font-bold text-xs border-2 border-white shadow-md">
                    G
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
              site.ir/order/{activeCustomer.id}
            </div>

            <div className="text-[11px] text-slate-500">
              ویزیتور پشتیبان: <strong>{assignedVisitor.name}</strong> ({assignedVisitor.id})
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ کارت</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 rounded-xl"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
