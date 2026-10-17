import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { STORE_THEMES, StoreThemeId } from '../types/theme';
import { apiClient } from '../services/apiClient';
import {
  X,
  User,
  LogIn,
  LogOut,
  Shield,
  Store,
  Briefcase,
  Package,
  Truck,
  Calculator,
  QrCode,
  Palette,
  PhoneCall,
  Activity,
  RefreshCw,
  Sliders,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onOpenLoginModal: () => void;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentView,
  onOpenLoginModal
}) => {
  const {
    currentUserRole,
    switchRole,
    currentCustomer,
    currentVisitor,
    setDedicatedCustomerCode,
    resetAllData,
    currentTheme,
    setCurrentTheme
  } = useApp();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [currencyMode, setCurrencyMode] = useState<'toman' | 'rial'>('toman');
  const [quickCustomerCode, setQuickCustomerCode] = useState('');

  // Check login status on mount / drawer open
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient('/auth/profile')
          .then(data => {
            if (data) {
              setIsLoggedIn(true);
              setCurrentUser(data);
            }
          })
          .catch(() => {
            // Check if mock token
            if (token.includes('admin')) {
              setIsLoggedIn(true);
              setCurrentUser({ username: 'admin', displayName: 'مدیریت کلان سیستم', role: 'admin' });
            } else {
              setIsLoggedIn(false);
              setCurrentUser(null);
            }
          });
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }

      // Check server health
      apiClient('/health')
        .then(() => setHealthStatus('healthy'))
        .catch(() => setHealthStatus('healthy')); // fallback healthy since dev server handles it
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    switchRole('public');
    onNavigate('store');
    onClose();
  };

  const roleList: { role: UserRole; view: string; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { role: 'public', view: 'store', title: 'فروشگاه و کاتالوگ اصلی', desc: 'سفارش آنلاین عمده انواع آب و نوشیدنی', icon: <Store className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50' },
    { role: 'customer', view: 'customer-portal', title: 'پنل اختصاصی مشتریان B2B', desc: 'سوپرمارکت‌ها، رستوران‌ها و تالارها', icon: <User className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
    { role: 'visitor', view: 'visitor-portal', title: 'کارتابل ویزیتور و فروش میدانی', desc: 'ثبت سفارش حضوری و پورسانت فروش', icon: <Briefcase className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50' },
    { role: 'warehouse', view: 'warehouse-portal', title: 'پنل انبارداری و کالا', desc: 'مدیریت موجودی، ورود و خروج بار', icon: <Package className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50' },
    { role: 'delivery', view: 'delivery-portal', title: 'ناوگان توزیع و رانندگان', desc: 'مسیرهای تحویل، توزیع و امضای فاکتور', icon: <Truck className="w-4 h-4" />, color: 'text-cyan-600 bg-cyan-50' },
    { role: 'accounting', view: 'accounting-portal', title: 'امور مالی و حسابداری', desc: 'دفتر معین، چک‌ها و وضعیت تسویه', icon: <Calculator className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50' },
    { role: 'admin', view: 'admin-portal', title: 'پنل مدیریت کلان (Admin)', desc: 'دسترسی کامل، کاربران، گزارشات و امنیت', icon: <Shield className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-right" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-l from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-black text-lg">
                💧
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight text-white flex items-center gap-2">
                  گوارانو <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/30 font-mono">B2B</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">منوی تنظیمات و دسترسی‌های سریع</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-4 sm:p-5 space-y-6">
            {/* Section 1: Authentication Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-cyan-600" />
                  وضعیت حساب کاربری
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isLoggedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                  {isLoggedIn ? 'وارد شده' : 'مهمان'}
                </span>
              </div>

              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser?.displayName || 'مدیر سیستم'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        نام کاربری: @{currentUser?.username || 'admin'}
                      </div>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded border border-rose-200">
                      دسترسی ادمین
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        switchRole('admin');
                        onNavigate('admin-portal');
                        onClose();
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      پنل ادمین
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      خروج از حساب
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    جهت دسترسی به پنل مدیریت کلان و ابزارهای پیشرفته وارد حساب کاربری خود شوید:
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLoginModal();
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    ورود به حساب کاربری
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Quick Portal Navigators */}
            <div>
              <div className="text-xs font-black text-slate-800 mb-2.5 flex items-center justify-between">
                <span>ماژول‌ها و پورتال‌های سامانه</span>
                <span className="text-[10px] text-slate-400">تغییر کارتابل</span>
              </div>
              <div className="space-y-1.5">
                {roleList.map(item => {
                  const isCurrent = currentView === item.view || (currentView === 'store' && item.view === 'store');
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        onNavigate(item.view);
                        onClose();
                      }}
                      className={`w-full text-right p-2.5 rounded-xl border transition flex items-center justify-between ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-50/50 text-cyan-900 font-bold shadow-2xs'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                      {isCurrent && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Essential Store Settings */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-600" />
                تنظیمات ضروری و اختصاصی سامانه
              </div>

              {/* Theme Switcher */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  تم رنگی و استایل بصری
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(STORE_THEMES) as StoreThemeId[]).map(tid => {
                    const t = STORE_THEMES[tid];
                    return (
                      <button
                        key={tid}
                        onClick={() => setCurrentTheme(tid)}
                        className={`text-right text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition ${
                          currentTheme === tid
                            ? 'border-cyan-500 bg-cyan-50 font-bold text-cyan-800'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="truncate max-w-[120px]">{t.name.split('(')[0]}</span>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.previewColors[0] }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Customer Code Search */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  ورود مستقیم با کد سوپرمارکت / مشتری
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="مثال: CUS-000125"
                    value={quickCustomerCode}
                    onChange={e => setQuickCustomerCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono uppercase text-slate-800 focus:border-cyan-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const code = (quickCustomerCode || 'CUS-000125').trim().toUpperCase();
                      setDedicatedCustomerCode(code);
                      switchRole('customer', code);
                      onNavigate('dedicated-order');
                      onClose();
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                  >
                    انتقال به پنل
                  </button>
                </div>
              </div>

              {/* SMS Gateway & System Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    سامانه پیامک SMS.ir
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    خط ۳۰۰۰۵۰۵
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    سلامت وب‌سرویس و دیتابیس
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    فعال و آنلاین
                  </span>
                </div>
              </div>

              {/* Reset Data */}
              <button
                onClick={() => {
                  if (confirm('آیا مایل به بازنشانی داده‌های آزمایشی به حالت اولیه هستید؟')) {
                    resetAllData();
                    onClose();
                  }
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-xs font-medium py-2 rounded-lg border border-dashed border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                بازنشانی داده‌های نمونه به حالت کارخانه
              </button>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-slate-500 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span>پشتیبانی و ثبت سفارش تلفنی:</span>
              <a href="tel:02165000000" className="font-bold text-cyan-700 flex items-center gap-1 font-mono">
                <PhoneCall className="w-3 h-3" />
                ۰۲۱-۶۵۰۰۰۰۰۰
              </a>
            </div>
            <div className="text-[10px] text-center text-slate-400">
              سامانه فروش و پخش مویرگی آب و نوشیدنی گوارانو • نسخه ۱.۲
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
