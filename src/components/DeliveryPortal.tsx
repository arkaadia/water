import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  UserCheck,
  Package,
  Calendar,
  DollarSign,
  Printer,
  ChevronLeft,
  Navigation,
  MessageSquare
} from 'lucide-react';

interface DeliveryPortalProps {
  onOpenInvoice: (order: Order) => void;
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({ onOpenInvoice }) => {
  const {
    orders,
    drivers,
    deliveryZones,
    updateOrderStatus,
    assignDriverToOrder,
    sendOrderSms
  } = useApp();

  const [smsSentToast, setSmsSentToast] = useState<string | null>(null);

  const handleSendSms = async (orderId: string, orderNumber: string) => {
    const success = await sendOrderSms(orderId, 'order_shipped');
    if (success) {
      setSmsSentToast(orderNumber);
      setTimeout(() => setSmsSentToast(null), 3500);
    }
  };

  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Filter orders relevant to delivery: ready_to_ship, handed_to_driver, shipped, delivered
  const deliveryOrders = orders.filter(o => {
    if (zoneFilter !== 'all' && o.deliveryZone !== zoneFilter) return false;
    if (statusFilter === 'active') {
      return o.status === 'ready_to_ship' || o.status === 'handed_to_driver' || o.status === 'shipped';
    }
    if (statusFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 text-white rounded-2xl p-6 shadow-xl border border-cyan-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xl border border-cyan-500/30">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">سامانه هوشمند ناوگان توزیع و تحویل B2B</h1>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                  لجستیک غرب تهران
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تخصیص به رانندگان، مانیفست پخش روزانه و ثبت تحویل بار با امضای مشتری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>چاپ مانیفست رانندگان</span>
            </button>
          </div>
        </div>

        {/* Fleet drivers quick stats */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {drivers.map(drv => (
            <div key={drv.id} className="bg-black/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{drv.name}</div>
                <div className="text-[11px] text-slate-400">{drv.vehicle} • {drv.plate}</div>
              </div>
              <span className="bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-1 rounded text-xs">
                {drv.activeOrders} بار فعال
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">فیلتر منطقه پخش:</span>
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold"
          >
            <option value="all">همه مناطق پخش</option>
            {deliveryZones.map(z => (
              <option key={z.id} value={z.name}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              statusFilter === 'active' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            بارهای فعال و در مسیر ({orders.filter(o => o.status === 'ready_to_ship' || o.status === 'handed_to_driver' || o.status === 'shipped').length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              statusFilter === 'delivered' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            تحویل داده شده ({orders.filter(o => o.status === 'delivered').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              statusFilter === 'all' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            همه
          </button>
        </div>
      </div>

      {/* Toast */}
      {smsSentToast && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-200" />
            <span>پیامک وضعیت بار و لینک فاکتور برای سفارش {smsSentToast} به مشتری ارسال شد.</span>
          </div>
          <button onClick={() => setSmsSentToast(null)} className="text-white hover:text-indigo-200 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Orders Dispatch Cards Grid (Section 14: بهینه‌شده برای کارکرد راننده روی موبایل) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveryOrders.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-xs">
            سفارشی با این مشخصات برای تحویل وجود ندارد.
          </div>
        ) : (
          deliveryOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {order.orderNumber}
                    </span>
                    <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {order.customerCode}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 mt-1">{order.customerName}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{order.customerPhone}</div>
                </div>

                <div className="text-left">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    order.status === 'ready_to_ship' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'handed_to_driver' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {order.status === 'ready_to_ship' ? 'آماده ارسال' :
                     order.status === 'handed_to_driver' ? 'تحویل راننده' :
                     order.status === 'shipped' ? 'در مسیر تحویل' : 'تحویل مشتری شد'}
                  </span>
                  <div className="text-xs font-black text-slate-900 font-mono mt-1">
                    {order.totalAmount.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              </div>

              {/* Destination Address & Call */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                    <span>محدوده: {order.deliveryZone}</span>
                  </span>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>تماس با مغازه‌دار</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-600">{order.deliveryAddress}</p>
              </div>

              {/* Items summary */}
              <div className="text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex justify-between">
                  <span>اقلام بار ({order.totalBoxes} باکس):</span>
                  <span className="font-mono text-[11px] text-slate-500">ویزیتور: {order.visitorName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map((it, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {it.productName} (<strong>{it.quantityBoxes}</strong> باکس)
                    </span>
                  ))}
                </div>
              </div>

              {/* Payment status badge */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">
                  وضعیت مالی: <strong className="text-slate-800">
                    {order.paymentMethod === 'online' ? 'آنلاین پرداخت شده' :
                     order.paymentMethod === 'cheque' ? 'چک صیادی اخذ شده' :
                     order.paymentMethod === 'credit' ? 'اعتباری (حساب دفتری)' : 'تسویه نقدی/کارت در محل'}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendSms(order.id, order.orderNumber)}
                    className="text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                    title="ارسال پیامک وضعیت بارگیری و لینک فاکتور به مشتری"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>پیامک وضعیت بار</span>
                  </button>
                  <button
                    onClick={() => onOpenInvoice(order)}
                    className="text-cyan-700 hover:underline font-bold text-[11px]"
                  >
                    مشاهده فاکتور
                  </button>
                </div>
              </div>

              {/* Driver Assignment & Step-wise dispatch buttons (Section 14 in brief) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {order.status === 'ready_to_ship' && (
                  <div className="flex items-center gap-2">
                    <select
                      onChange={e => {
                        if (e.target.value) assignDriverToOrder(order.id, e.target.value);
                      }}
                      defaultValue=""
                      className="flex-1 bg-cyan-50 border border-cyan-200 rounded-xl p-2 text-xs font-bold text-cyan-900 outline-none"
                    >
                      <option value="" disabled>تخصیص به راننده...</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.vehicle})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {order.status === 'handed_to_driver' && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-bold">
                      راننده: {order.driverName}
                    </span>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped', 'راننده حرکت کرد به سمت آدرس مشتری')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>اعلام حرکت (در مسیر)</span>
                    </button>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-purple-700 font-bold">
                      بار در مسیر تحویل است...
                    </span>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered', 'کالا تحویل مشتری شد و رسید امضا گردید')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأیید تحویل به مشتری و امضا</span>
                    </button>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تحویل به مشتری انجام شد.</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
