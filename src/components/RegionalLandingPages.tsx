import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Truck,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Clock,
  Sparkles,
  Code,
  Store,
  ChevronLeft
} from 'lucide-react';

interface RegionalLandingPagesProps {
  onStartOrder: () => void;
}

export const RegionalLandingPages: React.FC<RegionalLandingPagesProps> = ({ onStartOrder }) => {
  const { deliveryZones, products } = useApp();

  const [activeZoneId, setActiveZoneId] = useState<string>(deliveryZones[0]?.id || 'shahriar');
  const [showSchemaCode, setShowSchemaCode] = useState<boolean>(false);

  const activeZone = deliveryZones.find(z => z.id === activeZoneId) || deliveryZones[0];

  // Simulated SEO Meta & Schema.org JSON-LD for this region
  const pageTitle = `پخش عمده آب معدنی و نوشیدنی در ${activeZone.name} | گوارانو`;
  const pageDescription = `مرکز پخش مستقیم و مویرگی آب آشامیدنی، آب معدنی گودیز و دماوند، انواع نوشابه و آبمیوه در منطقه ${activeZone.name}. ارسال سریع با کرایه ${activeZone.shippingFee === 0 ? 'رایگان' : `${activeZone.shippingFee.toLocaleString('fa-IR')} تومان`} و تسویه اعتباری.`;

  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `پخش سراسری آب و نوشیدنی گوارانو در ${activeZone.name}`,
    "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
    "telephone": "021-65000000",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": activeZone.name,
      "addressRegion": "تهران و البرز",
      "addressCountry": "IR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 35.6582,
      "longitude": 51.0588
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "opens": "07:30",
      "closes": "19:00"
    },
    "areaServed": activeZone.name
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner & Area Selector */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>صفحات سئو لندینگ مناطق تحت پوشش پخش B2B</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              توزیع مویرگی روزانه سوپرمارکت‌ها، رستوران‌ها، تالارها و ارگان‌ها در سراسر {activeZone.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSchemaCode(!showSchemaCode)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition font-bold"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>{showSchemaCode ? 'بستن Schema.org' : 'کد اسکیما سئو'}</span>
            </button>
            <button
              onClick={onStartOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1 transition"
            >
              <span>ثبت سفارش در {activeZone.name}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Region Pills (Brief Section 19: شهریار، شهرقدس، ملارد، سرآسیاب، مارلیک، رباط کریم، تهرانسر، چیتگر، میدان آزادی) */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs text-slate-400 block mb-2 font-bold">انتخاب صفحه منطقه هدف:</span>
          <div className="flex flex-wrap gap-2">
            {deliveryZones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setActiveZoneId(zone.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeZoneId === zone.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>پخش آب در {zone.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schema.org code preview if toggled */}
      {showSchemaCode && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-left font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
          <div className="text-right text-xs text-slate-400 mb-2 font-sans font-bold">
            Schema.org Structured Data (JSON-LD) ویژه ربات‌های گوگل و بینگ:
          </div>
          <pre>{JSON.stringify(schemaJsonLd, null, 2)}</pre>
        </div>
      )}

      {/* SEO Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              خدمات پخش آب معدنی و نوشیدنی گوارانو در محدوده {activeZone.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              اگر در محدوده <strong className="text-slate-900">{activeZone.name}</strong> صاحب سوپرمارکت، هایپرمارکت، رستوران، فست‌فود، کترینگ یا سازمان اداری هستید، شرکت گوارانو به عنوان مرکز پخش مستقیم کارخانه، بارهای شما را با نازل‌ترین قیمت عمده و تخفیف‌های پلکانی تناژ تامین می‌نماید.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>برنامه زمان‌بندی توزیع در {activeZone.name}:</span>
                </div>
                <div className="text-xs text-slate-600">{activeZone.deliveryEstimate}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>شرایط ارسال رایگان:</span>
                </div>
                <div className="text-xs text-slate-600">
                  {activeZone.shippingFee === 0 ? 'کاملاً رایگان بدون محدودیت' : `سفارشات بالای ${activeZone.freeShippingMinOrder.toLocaleString('fa-IR')} تومان`}
                </div>
              </div>
            </div>
          </div>

          {/* Popular products in this region */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900">
              پرفروش‌ترین محصولات نوشیدنی در {activeZone.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.slice(0, 4).map(prod => (
                <div key={prod.id} className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <img src={prod.image} alt={prod.name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg" />
                  <div className="flex-1 text-right">
                    <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {prod.wholesalePricePerBox.toLocaleString('fa-IR')} ت/باکس
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Contact & Visitor in Area Widget */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>ویزیتور و سرپرست منطقه {activeZone.name}</span>
            </h3>

            <p className="text-xs text-slate-500">
              جهت عقد قرارداد همکاری، دریافت استند و کاتالوگ یا ثبت سفارش اعتباری، با سرپرست فروش منطقه تماس حاصل فرمایید.
            </p>

            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-800">
                <span>تلفن تماس مستقیم:</span>
                <span className="font-mono text-emerald-800">۰۲۱-۶۵۰۰۰۰۰۰</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>پشتیبانی واتساپ / ایتا:</span>
                <span className="font-mono">۰۹۱۲۱۱۱۰۰۰۰</span>
              </div>
            </div>

            <a
              href="tel:02165000000"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>تماس با واحد فروش منطقه {activeZone.name}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
