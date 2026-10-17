import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingCart,
  Search,
  Store,
  User,
  Menu,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { RepoUpdateIndicator } from './RepoUpdateIndicator';
import { HamburgerDrawer } from './HamburgerDrawer';
import { LoginModal } from './LoginModal';

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
    products
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const cartTotalBoxes = cart.reduce((acc, item) => acc + item.quantityBoxes, 0);

  const filteredSearchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.includes(searchQuery) ||
        p.brand.includes(searchQuery) ||
        p.volume.includes(searchQuery)
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs text-right" dir="rtl">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Hamburger Menu Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-cyan-700 transition flex items-center justify-center shadow-2xs group cursor-pointer"
              title="باز کردن منو و دسترسی‌ها"
            >
              <Menu className="w-5 h-5 text-slate-700 group-hover:text-cyan-600 transition" />
            </button>

            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('all');
              }}
              className="flex items-center gap-2 text-right group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-cyan-700 transition">
                  گوارانو <span className="text-xs font-bold text-cyan-600 px-1.5 py-0.5 bg-cyan-50 rounded">B2B</span>
                </span>
                <span className="text-[11px] text-slate-500 block -mt-1 font-medium">پخش مویرگی آب و نوشیدنی</span>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی آب معدنی، نوشابه، آبمیوه، دوغ، گودیز، دماوند..."
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
                        {product.brand} • موجودی: <span className="text-emerald-600 font-bold">{product.totalStock - product.reservedStock} باکس</span>
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

          {/* Actions: Repo Indicator, User Login & Cart */}
          <div className="flex items-center gap-2">
            {/* Blinking Beacon Repo Update Indicator */}
            <RepoUpdateIndicator variant="header" />

            {/* Quick Login / User Account Button */}
            <button
              onClick={() => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                if (token) {
                  setIsDrawerOpen(true);
                } else {
                  setShowLoginModal(true);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100/70 text-cyan-800 transition cursor-pointer"
              title="ورود به حساب کاربری یا مشاهده وضعیت"
            >
              <User className="w-4 h-4 text-cyan-700" />
              <span className="hidden sm:inline">ورود / حساب</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">سبد سفارش</span>
              {cartTotalBoxes > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartTotalBoxes}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Navigation Subbar */}
      <div className="border-t border-slate-100 bg-slate-50/80 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                onNavigate('store');
                onSelectCategory('all');
              }}
              className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
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
                onSelectCategory('doogh');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                currentView === 'store' && selectedCategory === 'doogh'
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
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                currentView === 'regional-landing' ? 'text-cyan-700 bg-cyan-100 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>محدوده‌های ارسال و مناطق</span>
            </button>
            <a
              href="tel:02165000000"
              className="flex items-center gap-1 text-slate-600 hover:text-cyan-700 border-r border-slate-200 pr-3 font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              <span>۰۲۱-۶۵۰۰۰۰۰۰</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hamburger & Settings Drawer */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={onNavigate}
        currentView={currentView}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onSuccess={() => {
            setShowLoginModal(false);
            switchRole('admin');
            onNavigate('admin-portal');
          }}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </header>
  );
};
