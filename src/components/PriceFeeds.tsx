import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  Code,
  CheckCircle2,
  Copy,
  Download,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const PriceFeeds: React.FC = () => {
  const { products } = useApp();
  const [activePlatform, setActivePlatform] = useState<'torob' | 'emalls' | 'basalam'>('torob');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate standard platform-compliant feeds based on section 18 & 22
  const torobFeed = {
    generator: "Gowarano B2B Platform Feed Engine v1.0",
    updated_at: new Date().toISOString(),
    products: products.map(p => ({
      page_unique_code: p.sku,
      title: `${p.name} - ${p.brand}`,
      page_url: `https://gowarano.ir/product/${p.sku}`,
      price: p.wholesalePricePerBox,
      old_price: p.basePricePerBox,
      availability: (p.totalStock - p.reservedStock) > 0 ? "instock" : "outofstock",
      stock_quantity: Math.max(0, p.totalStock - p.reservedStock),
      min_cart: p.minOrderQtyBoxes,
      image_links: [p.image],
      spec: {
        "برند": p.brand,
        "حجم": p.volume,
        "تعداد در هر باکس": `${p.unitsPerBox} عدد`,
        "نوع بسته‌بندی": "شرینک صنعتی"
      }
    }))
  };

  const emallsFeed = {
    shop_title: "پخش عمده آب و نوشیدنی گوارانو",
    items: products.map(p => ({
      id: p.id,
      sku: p.sku,
      title: p.name,
      brand: p.brand,
      price: p.wholesalePricePerBox,
      in_stock: (p.totalStock - p.reservedStock) > 0,
      url: `https://gowarano.ir/p/${p.sku}`,
      image: p.image,
      guarantee: "ضمانت اصالت و تاریخ روز",
      category: p.categoryId
    }))
  };

  const basalamFeed = {
    store_vendor: "gowarano_distribution",
    payload: products.map(p => ({
      vendor_product_code: p.sku,
      name: p.name,
      brand: p.brand,
      package_count: p.unitsPerBox,
      primary_price: p.basePricePerBox,
      sale_price: p.wholesalePricePerBox,
      inventory: Math.max(0, p.totalStock - p.reservedStock),
      status: "ACTIVE"
    }))
  };

  const activeContent =
    activePlatform === 'torob' ? torobFeed : activePlatform === 'emalls' ? emallsFeed : basalamFeed;

  const jsonString = JSON.stringify(activeContent, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-sky-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>موتورهای مقایسه قیمت و فید مارکت‌پلیس‌ها (Section 22)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              اتصال استاندارد به ترب (Torob)، ایمالز (Emalls) و باسلام (Basalam)
            </h1>
            <p className="text-xs text-slate-300">
              فیدهای زنده و منطبق بر پروتکل‌های رسمی همراه با SKU، حجم، قیمت عمده و موجودی انبار
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'کپی شد!' : 'کپی خروجی JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Switcher */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActivePlatform('torob')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activePlatform === 'torob' ? 'border-red-500 text-red-700' : 'border-transparent text-slate-500'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>فید اختصاصی موتور جستجوی ترب (Torob API)</span>
        </button>

        <button
          onClick={() => setActivePlatform('emalls')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activePlatform === 'emalls' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>فید ایمالز (Emalls Feed)</span>
        </button>

        <button
          onClick={() => setActivePlatform('basalam')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
            activePlatform === 'basalam' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>اتصال باسلام (Basalam Vendor API)</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex items-center gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0" />
        <div>
          طبق بخش ۲۲ دفترچه راهنما، ساختار دیتابیس کالاها شامل فیلدهای استاندارد <strong>نام، برند، مدل/حجم، SKU، قیمت عمده، موجودی قابل فروش و لینک عکس</strong> با وب‌سرویس‌های خزشگر ترب و ایمالز کاملاً مطابقت دارد.
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span>خروجی فرمت JSON زنده ({products.length} کالا):</span>
          <span>پاسخ HTTP 200 OK</span>
        </div>
        <pre className="text-left font-mono text-xs text-cyan-400 max-h-[500px] overflow-y-auto pt-4 leading-relaxed">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
