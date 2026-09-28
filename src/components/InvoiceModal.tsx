import React from 'react';
import { Order } from '../types';
import { Printer, Download, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4">
        {/* Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm">پیش‌نمایش و صدور فاکتور رسمی B2B</span>
            <span className="text-xs text-slate-400">({order.invoiceId})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ فاکتور / ذخیره PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-10 bg-white text-slate-900 text-xs">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                  شرکت بازرگانی و پخش سراسری گوارانو (سهامی خاص)
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  سیستم پخش مویرگی و توزیع مستقیم آب آشامیدنی، معدنی و انواع نوشیدنی
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  شناسه ملی: ۱۰۱۰۳۸۹۴۵۰۲ • کد اقتصادی: ۴۱۱۴۹۸۵۳۲۱ • شماره ثبت: ۵۴۸۹۲
                </div>
              </div>

              <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-base font-black text-cyan-800">صورت‌حساب فروش کالا</div>
                <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 font-mono">
                  <div>شماره فاکتور: <strong className="text-slate-900">{order.invoiceId}</strong></div>
                  <div>شماره سفارش: <strong className="text-slate-900">{order.orderNumber}</strong></div>
                  <div>تاریخ صدور: <span className="font-sans">{order.createdAt}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller & Buyer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Seller */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                <span>مشخصات فروشنده (توزیع‌کننده):</span>
                <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">مرکز پخش غرب تهران و البرز</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div>نام فروشنده: <strong>انبار مرکزی پخش گوارانو</strong></div>
                <div>نشانی: تهران، جاده مخصوص کرج، کیلومتر ۱۴، شهرک صنعتی، سوله ۱۲</div>
                <div>تلفن تماس: ۰۲۱-۶۵۰۰۰۰۰۰ | پشتیبانی ویزیتوری: ۰۹۱۲۱۱۱۰۰۰۰</div>
                <div>ویزیتور مسئول این مشتری: <strong className="text-amber-700">{order.visitorName} ({order.visitorId})</strong></div>
              </div>
            </div>

            {/* Buyer */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                <span>مشخصات خریدار (مشتری B2B):</span>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  کد: {order.customerCode}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600">
                <div>نام واحد صنفی: <strong className="text-slate-900">{order.customerName}</strong></div>
                <div>شماره تماس خریدار: <span className="font-mono">{order.customerPhone}</span></div>
                <div>محدوده تحویل: <strong>{order.deliveryZone}</strong></div>
                <div>نشانی تحویل بار: {order.deliveryAddress}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6 border border-slate-200 rounded-xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center w-10">ردیف</th>
                  <th className="py-2.5 px-3">شرح کالا یا خدمت</th>
                  <th className="py-2.5 px-3 text-center">برند / حجم</th>
                  <th className="py-2.5 px-3 text-center">تعداد بطری در باکس</th>
                  <th className="py-2.5 px-3 text-center">تعداد (باکس)</th>
                  <th className="py-2.5 px-3 text-left">مبلغ واحد (تومان)</th>
                  <th className="py-2.5 px-3 text-left">تخفیف حجمی</th>
                  <th className="py-2.5 px-3 text-left">مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{item.brand} ({item.volume})</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-mono">{item.unitsPerBox} عدد</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono text-sm">{item.quantityBoxes}</td>
                    <td className="py-2.5 px-3 text-left font-mono">{item.unitPricePerBox.toLocaleString('fa-IR')}</td>
                    <td className="py-2.5 px-3 text-left font-mono text-emerald-600">
                      {(item.discountPerBox * item.quantityBoxes).toLocaleString('fa-IR')}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-slate-900">
                      {item.totalPrice.toLocaleString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Notes & Payment Terms */}
            <div className="text-[11px] text-slate-600 space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/30">
              <div className="font-bold text-slate-800">شرایط تحویل و تسویه:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>نحوه پرداخت انتخابی: <strong className="text-slate-900">
                  {order.paymentMethod === 'online' ? 'پرداخت اینترنتی موفق' :
                   order.paymentMethod === 'cheque' ? 'چک صیادی با استعلام معتبر' :
                   order.paymentMethod === 'credit' ? 'اعتباری (حساب دفتری)' : 'نقدی / کارتخوان راننده'}
                </strong></li>
                <li>وضعیت تسویه فعلی: <span className="font-bold text-cyan-700">
                  {order.paymentStatus === 'paid' ? 'تسویه کامل' : order.paymentStatus === 'partial' ? 'تسویه بخشی از فاکتور' : 'در انتظار تسویه'}
                </span></li>
                <li>تعداد کل باکس‌های تحویلی: <strong className="text-slate-900 font-mono">{order.totalBoxes} باکس</strong></li>
                {order.notes && <li>یادداشت مشتری: {order.notes}</li>}
              </ul>
            </div>

            {/* Calculations Box */}
            <div className="border border-slate-200 rounded-xl p-3 space-y-2 text-xs bg-slate-50">
              <div className="flex justify-between text-slate-600">
                <span>جمع کل اقلام (تومان):</span>
                <span className="font-mono">{order.subtotal.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>مجموع تخفیف پلکانی و جشنواره:</span>
                <span className="font-mono">-{order.tierDiscount.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>هزینه حمل و نقل ({order.deliveryZone}):</span>
                <span className="font-mono">
                  {order.shippingCost === 0 ? 'رایگان (طرح ویژه)' : `${order.shippingCost.toLocaleString('fa-IR')} تومان`}
                </span>
              </div>
              <div className="border-t-2 border-slate-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>مبلغ قابل پرداخت فاکتور:</span>
                <span className="text-cyan-800 font-mono text-base">{order.totalAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>مبلغ پرداخت شده:</span>
                <span className="font-mono">{order.paidAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-rose-600">
                <span>مانده بدهی این سفارش:</span>
                <span className="font-mono">{Math.max(0, order.totalAmount - order.paidAmount).toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="border-t border-slate-200 pt-6 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-600">
            <div className="space-y-12">
              <div className="font-bold">امضاء و مهر خریدار (تحویل گیرنده)</div>
              <div className="text-[10px] text-slate-400">صحت تحویل سلامت بسته‌بندی</div>
            </div>
            <div className="space-y-12">
              <div className="font-bold">امضاء راننده و مسئول توزیع</div>
              <div className="text-[10px] text-slate-400">{order.driverName || 'واحد لجستیک'}</div>
            </div>
            <div className="space-y-12">
              <div className="font-bold">امضاء و مهر رسمی شرکت پخش گوارانو</div>
              <div className="text-[10px] text-cyan-700 font-bold">صادره به صورت سیستمیک</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
