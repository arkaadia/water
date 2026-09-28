import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShoppingCart,
  Search,
  Store,
  Briefcase,
  User,
  Package,
  Truck,
  Calculator,
  Shield,
  QrCode,
  MapPin,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  PhoneCall,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onSelectCategory,
  selectedCategory,
  onNavigate,
  currentView
}) => {
  const {
    currentUserRole,
    switchRole,
    cart,
    customers,
    currentCustomer,
    currentVisitor,
    visitors,
    products,
    setDedicatedCustomerCode,
    resetAllData
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchCode, setCustomerSearchCode] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartTotalBoxes = cart.reduce((acc, item) => acc + item.quantityBoxes, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.wholesalePricePerBox * item.quantityBoxes), 0);

  const roleLabels: Record<UserRole, { title: string; color: string; icon: React.ReactNode }> = {
    public: { title: 'فروشگاه عمومی', color: 'bg-emerald-600', icon: <Store className="w-4 h-4" /> },
    customer: { title: 'پنل اختصاصی مشتری', color: 'bg-blue-600', icon: <User className="w-4 h-4" /> },
    visitor: { title: 'پنل ویزیتور فروش', color: 'bg-amber-600', icon: <Briefcase className="w-4 h-4" /> },
    warehouse: { title: 'پنل انبارداری هوشمند', color: 'bg-indigo-600', icon: <Package className="w-4 h-4" /> },
    delivery: { title: 'پنل مسئول توزیع و راننده', color: 'bg-cyan-600', icon: <Truck className="w-4 h-4" /> },
    accounting: { title: 'پنل حسابداری و مالی', color: 'bg-purple-600', icon: <Calculator className="w-4 h-4" /> },
    admin: { title: 'پنل مدیریت کلان (Admin)', color: 'bg-rose-600', icon: <Shield className="w-4 h-4" /> }
  };

  const handleSearchCustomerCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerSearchCode.trim()) return;
    const cleanCode = customerSearchCode.trim().toUpperCase();
    const found = customers.find(c => c.id.toUpperCase() === cleanCode);
    if (found) {
      setDedicatedCustomerCode(found.id);
      switchRole('customer', found.id);
      onNavigate('dedicated-order');
    } else {
      alert(`مشتری با کد ${cleanCode} یافت نشد. می‌توانید از کدهای نمونه مثل CUS-000125 استفاده فرمایید.`);
    }
  };

  const filteredSearchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.includes(searchQuery) ||
        p.brand.includes(searchQuery) ||
        p.volume.includes(searchQuery)
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-6 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden sm:inline">سوئیچ نقش کاربری (تست زنده سناریوها):</span>
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-white font-medium text-xs shadow-xs transition ${roleLabels[currentUserRole].color}`}
              >
                {roleLabels[currentUserRole].icon}
                <span>{roleLabels[currentUserRole].title}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50 text-right">
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 border-b border-slate-700 font-bold">
                    انتخاب نقش برای بررسی سیستم:
                  </div>
                  {(Object.keys(roleLabels) as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleDropdown(false);
                        if (r === 'public') onNavigate('store');
                        else if (r === 'customer') onNavigate('customer-portal');
                        else if (r === 'visitor') onNavigate('visitor-portal');
                        else if (r === 'warehouse') onNavigate('warehouse-portal');
                        else if (r === 'delivery') onNavigate('delivery-portal');
                        else if (r === 'accounting') onNavigate('accounting-portal');
                        else if (r === 'admin') onNavigate('admin-portal');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-700 transition ${
                        currentUserRole === r ? 'text-cyan-400 font-bold bg-slate-700/50' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {roleLabels[r].icon}
                        <span>{roleLabels[r].title}</span>
                      </div>
                      {currentUserRole === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentUserRole === 'customer' && currentCustomer && (
              <span className="hidden md:inline-flex items-center gap-1 bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-800/60 text-[11px]">
                مشتری فعال: <strong className="text-white">{currentCustomer.storeName}</strong> ({currentCustomer.id})
              </span>
            )}
            {currentUserRole === 'visitor' && currentVisitor && (
              <span className="hidden md:inline-flex items-center gap-1 bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60 text-[11px]">
                ویزیتور فعال: <strong className="text-white">{currentVisitor.name}</strong> ({currentVisitor.id})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => {
                setDedicatedCustomerCode('CUS-000125');
                switchRole('customer', 'CUS-000125');
                onNavigate('dedicated-order');
              }}
              className="hidden lg:flex items-center gap-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800/40"
              title="مشاهده نمونه صفحه اختصاصی سفارش سوپرمارکت بهار"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>لینک اختصاصی CUS-000125</span>
            </button>

            <button
              onClick={() => {
                if (confirm('آیا مایل به بازنشانی داده‌های اولیه به حالت پیش‌فرض هستید؟')) {
                  resetAllData();
                  alert('اطلاعات با موفقیت به حالت پیش‌فرض بازگردانی شد.');
                }
              }}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
              title="بازنشانی داده‌ها به حالت اول"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">ریست دمو</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('all');
              }}
              className="flex items-center gap-2 text-right group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-xl font-black tracking-tight text-slate-900 group-hover:text-cyan-700 transition">
                  گوارانو <span className="text-xs font-bold text-cyan-600 px-1.5 py-0.5 bg-cyan-50 rounded">B2B</span>
                </span>
                <span className="text-[11px] text-slate-500 block -mt-1 font-medium">پخش مویرگی آب و نوشیدنی</span>
              </div>
            </button>
          </div>

          {/* Search Bar (Digikala style) */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی آب معدنی، نوشابه، آبمیوه، گودیز، دماوند..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 border border-slate-200 focus:border-cyan-500 focus:bg-white text-sm rounded-xl pr-10 pl-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Quick Live Search Results */}
            {filteredSearchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                {filteredSearchResults.map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onNavigate('store');
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition"
                  >
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1 text-right">
                      <div className="text-xs font-bold text-slate-800">{product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {product.brand} • موجودی قابل فروش: <span className="text-emerald-600 font-bold">{product.totalStock - product.reservedStock} باکس</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-cyan-700">{product.wholesalePricePerBox.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Customer Code Search (Section 9 in brief) */}
          <form onSubmit={handleSearchCustomerCode} className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-cyan-600" />
              کد مشتری:
            </span>
            <input
              type="text"
              placeholder="مثلاً CUS-000125"
              value={customerSearchCode}
              onChange={e => setCustomerSearchCode(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs w-32 text-center uppercase font-mono font-bold text-slate-800 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
            >
              ورود سریع
            </button>
          </form>

          {/* Actions: Portal quick buttons & Cart */}
          <div className="flex items-center gap-2">
            {/* Direct role panel button */}
            <button
              onClick={() => {
                if (currentUserRole === 'customer') onNavigate('customer-portal');
                else if (currentUserRole === 'visitor') onNavigate('visitor-portal');
                else if (currentUserRole === 'warehouse') onNavigate('warehouse-portal');
                else if (currentUserRole === 'delivery') onNavigate('delivery-portal');
                else if (currentUserRole === 'accounting') onNavigate('accounting-portal');
                else if (currentUserRole === 'admin') onNavigate('admin-portal');
                else onNavigate('customer-portal');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            >
              {roleLabels[currentUserRole].icon}
              <span className="hidden sm:inline">داشبورد من</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">سبد سفارش</span>
              {cartTotalBoxes > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartTotalBoxes}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Navigation Subbar */}
      <div className="border-t border-slate-100 bg-slate-50/70 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('all');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'all'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              همه کالاها
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('water');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'water'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              آب معدنی و آشامیدنی
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('soda');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'soda'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              نوشابه
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('dough');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'dough'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              دوغ
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('juice');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'juice'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              آبمیوه
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('energy');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'energy'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              انرژی‌زا
            </button>
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('snacks');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                currentView === 'store' && selectedCategory === 'snacks'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              کیک و تنقلات
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <button
              onClick={() => onNavigate('regional-landing')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                currentView === 'regional-landing' ? 'text-cyan-700 bg-cyan-100 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>محدوده‌های ارسال و صفحات سئو</span>
            </button>
            <button
              onClick={() => onNavigate('price-feeds')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                currentView === 'price-feeds' ? 'text-cyan-700 bg-cyan-100 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span>فید ترب / ایمالز / باسلام</span>
            </button>
            <a
              href="tel:02165000000"
              className="flex items-center gap-1 text-slate-600 hover:text-cyan-700 border-r border-slate-200 pr-3"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>پشتیبانی: ۰۲۱-۶۵۰۰۰۰۰۰</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pr-9 pl-3 py-2 text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          <form onSubmit={handleSearchCustomerCode} className="flex gap-2">
            <input
              type="text"
              placeholder="کد مشتری مثلا CUS-000125"
              value={customerSearchCode}
              onChange={e => setCustomerSearchCode(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs uppercase"
            />
            <button type="submit" className="bg-cyan-600 text-white px-3 py-2 rounded-lg text-xs font-bold">
              ورود
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <button
              onClick={() => {
                onNavigate('store');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-slate-100 rounded-lg text-right font-medium"
            >
              🛒 فروشگاه محصولات
            </button>
            <button
              onClick={() => {
                onNavigate('customer-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-blue-50 text-blue-800 rounded-lg text-right font-medium"
            >
              👤 پنل مشتری
            </button>
            <button
              onClick={() => {
                onNavigate('visitor-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-amber-50 text-amber-800 rounded-lg text-right font-medium"
            >
              💼 پنل ویزیتور
            </button>
            <button
              onClick={() => {
                onNavigate('warehouse-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-indigo-50 text-indigo-800 rounded-lg text-right font-medium"
            >
              🏢 پنل انبار
            </button>
            <button
              onClick={() => {
                onNavigate('delivery-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-cyan-50 text-cyan-800 rounded-lg text-right font-medium"
            >
              🚚 پنل ارسال و توزیع
            </button>
            <button
              onClick={() => {
                onNavigate('accounting-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-purple-50 text-purple-800 rounded-lg text-right font-medium"
            >
              📊 پنل حسابداری
            </button>
            <button
              onClick={() => {
                onNavigate('admin-portal');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-rose-50 text-rose-800 rounded-lg text-right font-medium"
            >
              👑 پنل مدیریت
            </button>
            <button
              onClick={() => {
                onNavigate('regional-landing');
                setMobileMenuOpen(false);
              }}
              className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-right font-medium"
            >
              📍 صفحات سئو مناطق
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
