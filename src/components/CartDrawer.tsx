import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Building,
  CreditCard,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getEffectivePrice,
    customers,
    currentCustomer,
    deliveryZones,
    placeOrder
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(currentCustomer?.id || customers[0]?.id || '');
  const [selectedZone, setSelectedZone] = useState<string>(deliveryZones[0]?.name || 'شهریار');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cheque' | 'card' | 'online'>('credit');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetCustomer = customers.find(c => c.id === selectedCustomerId) || currentCustomer || customers[0];

  const cartCalculations = cart.map(item => {
    const { unitPrice, discountPerBox } = getEffectivePrice(item.product, item.quantityBoxes);
    const totalPrice = unitPrice * item.quantityBoxes;
    return {
      ...item,
      unitPrice,
      discountPerBox,
      totalPrice
    };
  });

  const totalBoxes = cartCalculations.reduce((sum, item) => sum + item.quantityBoxes, 0);
  const subtotal = cartCalculations.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cartCalculations.reduce((sum, item) => sum + (item.discountPerBox * item.quantityBoxes), 0);

  const zoneObj = deliveryZones.find(z => z.name === selectedZone);
  const shippingFee = zoneObj && subtotal >= zoneObj.freeShippingMinOrder ? 0 : (zoneObj?.shippingFee || 0);
  const grandTotal = subtotal + shippingFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    const newOrder = placeOrder({
      customerId: targetCustomer.id,
      deliveryZone: selectedZone,
      deliveryAddress: targetCustomer.address,
      paymentMethod,
      notes,
      createdByType: 'customer'
    });

    setSubmitting(false);
    if (newOrder) {
      onClose();
      onOrderSuccess(newOrder.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">سبد سفارش عمده B2B</h2>
            <span className="bg-cyan-100 text-cyan-800 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {totalBoxes} باکس
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">سبد سفارش شما خالی است.</h3>
              <p className="text-xs text-slate-400">
                لطفاً از فروشگاه، باکس‌های مورد نظر خود را اضافه فرمایید.
              </p>
            </div>
          ) : (
            <>
              {/* Customer Selector */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <label className="block font-bold text-slate-700">مشتری سفارش‌دهنده (B2B):</label>
                <select
                  value={targetCustomer.id}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.storeName} ({c.id}) - سقف اعتبار: {c.creditCeiling.toLocaleString('fa-IR')} ت
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500">
                  نشانی تحویل: {targetCustomer.address}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartCalculations.map(item => (
                  <div
                    key={item.product.id}
                    className="border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 bg-white hover:border-slate-300 transition"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-contain rounded-lg bg-slate-50 shrink-0"
                    />

                    <div className="flex-1 text-right">
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.unitPrice.toLocaleString('fa-IR')} ت/باکس
                        {item.discountPerBox > 0 && (
                          <span className="text-emerald-600 font-bold mr-1">
                            (تخفیف: {item.discountPerBox.toLocaleString('fa-IR')} ت)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantityBoxes - 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">
                        {item.quantityBoxes}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantityBoxes + 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Zone Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-bold text-slate-700">محدوده ارسال:</label>
                <select
                  value={selectedZone}
                  onChange={e => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                >
                  {deliveryZones.map(z => (
                    <option key={z.id} value={z.name}>
                      {z.name} ({z.shippingFee === 0 ? 'ارسال رایگان' : `${z.shippingFee.toLocaleString('fa-IR')} تومان`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-slate-700">روش تسویه حساب:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-2 rounded-xl border text-right transition ${
                      paymentMethod === 'credit'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 mb-1 text-cyan-600" />
                    <div>اعتباری (حساب دفتری)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cheque')}
                    className={`p-2 rounded-xl border text-right transition ${
                      paymentMethod === 'cheque'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 mb-1 text-purple-600" />
                    <div>چک صیادی ۳۰ روزه</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-xl border text-right transition ${
                      paymentMethod === 'card'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                    <div>کارتخوان راننده</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-2 rounded-xl border text-right transition ${
                      paymentMethod === 'online'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mb-1 text-amber-600" />
                    <div>درگاه اینترنتی</div>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">یادداشت برای راننده و انبار:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="ساعت تحویل مناسب، هماهنگی قبلی..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>جمع اقلام ({totalBoxes} باکس):</span>
                <span className="font-mono">{subtotal.toLocaleString('fa-IR')} ت</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>سود تخفیف پلکانی تناژ:</span>
                  <span className="font-mono">-{totalDiscount.toLocaleString('fa-IR')} ت</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>هزینه حمل و نقل ({selectedZone}):</span>
                <span className="font-mono">
                  {shippingFee === 0 ? 'رایگان' : `${shippingFee.toLocaleString('fa-IR')} ت`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>مبلغ قابل پرداخت فاکتور:</span>
                <span className="text-cyan-800 font-mono text-base">
                  {grandTotal.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            <button
              disabled={submitting}
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ثبت نهایی سفارش B2B</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
