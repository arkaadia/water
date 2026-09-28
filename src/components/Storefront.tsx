import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  Droplets,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  TrendingDown,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  ChevronLeft,
  Info,
  Flame,
  Star,
  ExternalLink,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface StorefrontProps {
  selectedCategory: string;
  onOpenCart: () => void;
  onSelectCategory: (catId: string) => void;
  onNavigateDedicatedOrder: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  selectedCategory,
  onOpenCart,
  onSelectCategory,
  onNavigateDedicatedOrder
}) => {
  const {
    products,
    categories,
    addToCart,
    cart,
    updateCartQuantity,
    getEffectivePrice
  } = useApp();

  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Extract unique brands for filter
  const brands = Array.from(new Set(products.map(p => p.brand)));

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (brandFilter !== 'all' && p.brand !== brandFilter) return false;
    if (inStockOnly && (p.totalStock - p.reservedStock) <= 0) return false;
    return true;
  });

  const bestSellers = products.filter(p => p.isBestSeller);
  const specialOffers = products.filter(p => p.isSpecialOffer);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero B2B Banner (Digikala Festival Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-900 via-sky-800 to-blue-900 text-white shadow-2xl p-6 sm:p-10 border border-sky-700/40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_60%)] pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md text-cyan-200 text-xs px-3.5 py-1.5 rounded-full border border-cyan-400/30">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>پخش مستقیم کارخانه با قیمت پلکانی تناژ ویژه سوپرمارکت‌ها و رستوران‌ها</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight text-white">
            تأمین عمده و مویرگی آب آشامیدنی، معدنی و انواع نوشیدنی
          </h1>

          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed max-w-2xl">
            سفارش آسان با تخفیف‌های پلکانی ۳۰، ۶۰ و ۱۰۰ باکسی، تحویل در سریع‌ترین زمان در شهریار، شهرقدس، ملارد، سرآسیاب، تهرانسر و چیتگر، با تسویه اعتباری و چکی برای همکاران صنفی.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectCategory('water')}
              className="bg-white text-slate-900 hover:bg-cyan-50 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition flex items-center gap-1.5"
            >
              <span>مشاهده و خرید آب معدنی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateDedicatedOrder}
              className="bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-100 border border-cyan-300/40 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
            >
              ورود با کد اختصاصی مشتری (CUS)
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">ارسال سریع و رایگان</div>
              <div className="text-[10px] text-sky-200">در مناطق تحت پوشش</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">قیمت‌گذاری پلکانی</div>
              <div className="text-[10px] text-sky-200">سود حداکثری در تناژ بالا</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">اصالت و تاریخ روز</div>
              <div className="text-[10px] text-sky-200">تولید حداکثر یک هفته</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">تسویه اعتباری و چکی</div>
              <div className="text-[10px] text-sky-200">ویژه مشتریان ثابت B2B</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Badges (Section 4 in brief) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 group ${
                isSelected
                  ? 'border-cyan-600 bg-cyan-50/80 shadow-md ring-2 ring-cyan-500/20'
                  : 'border-slate-200 bg-white hover:border-cyan-400 hover:shadow-xs'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600'
              }`}>
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xs font-bold ${isSelected ? 'text-cyan-900 font-black' : 'text-slate-800'}`}>
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{count} کالا</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Brand Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
            <span>فیلتر برند:</span>
          </div>
          <select
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="all">همه برندها (گودیز، دماوند، واتا، عالیس...)</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="accent-cyan-600"
            />
            <span className="font-semibold text-slate-700">فقط کالاهای موجود در انبار</span>
          </label>
        </div>

        <div className="text-slate-500 font-medium">
          نمایش <strong>{filteredProducts.length}</strong> کالا
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.map(product => {
          const cartItem = cart.find(ci => ci.product.id === product.id);
          const currentQty = cartItem ? cartItem.quantityBoxes : 0;
          const { unitPrice, discountPerBox } = getEffectivePrice(product, Math.max(1, currentQty));
          const availableStock = Math.max(0, product.totalStock - product.reservedStock);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100 p-4 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isBestSeller && (
                    <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      پرفروش
                    </span>
                  )}
                  {product.isSpecialOffer && (
                    <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      پیشنهاد ویژه
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-cyan-800">{product.brand}</span>
                    <span className="font-mono">{product.volume}</span>
                  </div>

                  <h3
                    onClick={() => setSelectedProductDetails(product)}
                    className="text-xs sm:text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-cyan-700 line-clamp-2"
                  >
                    {product.name}
                  </h3>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>بسته‌بندی: <strong>{product.unitsPerBox} بطری در باکس</strong></span>
                    <span>حداقل: {product.minOrderQtyBoxes} باکس</span>
                  </div>

                  {/* Tier pricing teaser pills (Brief section 5 & 18) */}
                  {product.tiers && product.tiers.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">پله‌های تخفیف پلکانی تناژ:</div>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {product.tiers.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono"
                          >
                            {t.minQtyBoxes}+ باکس: {t.pricePerBox.toLocaleString('fa-IR')} ت
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Availability */}
                  <div className="text-[11px] pt-1">
                    {availableStock <= 0 ? (
                      <span className="text-rose-600 font-bold">ناموجود در انبار</span>
                    ) : availableStock < 100 ? (
                      <span className="text-amber-600 font-semibold">موجودی محدود: {availableStock} باکس</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">موجودی قابل فروش: {availableStock} باکس</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart footer */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-3">
                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-xs text-slate-500">قیمت عمده:</span>
                  <div className="text-left">
                    <span className="text-base font-black text-cyan-900 font-mono">
                      {product.wholesalePricePerBox.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-[10px] text-slate-500 mr-1">تومان/باکس</span>
                  </div>
                </div>

                {/* Add to cart / Stepper */}
                {cartItem ? (
                  <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-xl p-1">
                    <button
                      onClick={() => updateCartQuantity(product.id, currentQty - 1)}
                      className="w-8 h-8 rounded-lg bg-white text-cyan-800 font-bold flex items-center justify-center shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-black font-mono text-cyan-900">
                      {currentQty} باکس
                    </div>
                    <button
                      onClick={() => updateCartQuantity(product.id, currentQty + 1)}
                      className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={availableStock <= 0}
                    onClick={() => addToCart(product.id, product.minOrderQtyBoxes || 1)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      availableStock <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>افزودن به سبد ({product.minOrderQtyBoxes} باکس)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center aspect-square">
                <img
                  src={selectedProductDetails.image}
                  alt={selectedProductDetails.name}
                  className="max-h-56 object-contain"
                />
              </div>

              <div className="space-y-3">
                <div className="text-xs text-cyan-800 font-bold">
                  {selectedProductDetails.brand} • کد کالا: {selectedProductDetails.sku}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {selectedProductDetails.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedProductDetails.description}
                </p>

                <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                  <div>حجم بطری: <strong>{selectedProductDetails.volume}</strong></div>
                  <div>بسته‌بندی شرینک: <strong>{selectedProductDetails.unitsPerBox} عددی</strong></div>
                  <div>حداقل سفارش: <strong>{selectedProductDetails.minOrderQtyBoxes} باکس</strong></div>
                </div>

                {/* Price comparison link tags (Section 18 & 22) */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">استعلام رقابتی:</span>
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                    قیمت همگام با ترب
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                    ایمالز
                  </span>
                </div>
              </div>
            </div>

            {/* Tier pricing table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>جدول تخفیف‌های پلکانی حجمی (بر اساس تعداد باکس):</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {selectedProductDetails.tiers?.map((tier, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-slate-500 text-[11px]">{tier.minQtyBoxes}+ باکس</div>
                    <div className="font-black text-cyan-800 font-mono text-sm mt-0.5">
                      {tier.pricePerBox.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">تومان/باکس</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  addToCart(selectedProductDetails.id, selectedProductDetails.minOrderQtyBoxes || 1);
                  setSelectedProductDetails(null);
                  onOpenCart();
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>افزودن به سبد خرید و تکمیل سفارش</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
