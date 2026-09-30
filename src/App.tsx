/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Storefront } from './components/Storefront';
import { CustomerOrderPortal } from './components/CustomerOrderPortal';
import { CustomerPortal } from './components/CustomerPortal';
import { VisitorPortal } from './components/VisitorPortal';
import { WarehousePortal } from './components/WarehousePortal';
import { DeliveryPortal } from './components/DeliveryPortal';
import { AccountingPortal } from './components/AccountingPortal';
import { AdminPortal } from './components/AdminPortal';
import { RegionalLandingPages } from './components/RegionalLandingPages';
import { PriceFeeds } from './components/PriceFeeds';
import { CartDrawer } from './components/CartDrawer';
import { InvoiceModal } from './components/InvoiceModal';
import { RepoUpdateIndicator } from './components/RepoUpdateIndicator';
import { Customer, Order } from './types';
import {
  Store,
  User,
  Briefcase,
  Package,
  Truck,
  Calculator,
  Shield,
  PhoneCall,
  CheckCircle2,
  QrCode,
  MapPin
} from 'lucide-react';

function MainAppContent() {
  const {
    currentUserRole,
    switchRole,
    orders,
    selectedInvoiceOrder,
    setSelectedInvoiceOrder,
    setDedicatedCustomerCode,
    currentCustomer
  } = useApp();

  const [currentView, setCurrentView] = useState<string>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [successOrderToast, setSuccessOrderToast] = useState<string | null>(null);

  const handleOrderSuccess = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSuccessOrderToast(order.orderNumber);
      setSelectedInvoiceOrder(order);
    }
    setTimeout(() => setSuccessOrderToast(null), 6000);
  };

  const handleStartOrderForCustomer = (cust: Customer) => {
    setDedicatedCustomerCode(cust.id);
    switchRole('customer', cust.id);
    setCurrentView('dedicated-order');
  };

  const handleOpenInvoice = (order: Order) => {
    setSelectedInvoiceOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* Top Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        selectedCategory={selectedCategory}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
      />

      {/* Success Notification Banner */}
      {successOrderToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 shadow-lg flex items-center justify-between text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>
              سفارش شماره <strong>{successOrderToast}</strong> با موفقیت ثبت شد و به انبار و ویزیتور مربوطه ارسال گردید.
            </span>
          </div>
          <button
            onClick={() => setSuccessOrderToast(null)}
            className="text-white hover:text-emerald-200 text-xs font-bold"
          >
            بستن
          </button>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16 md:pb-8">
        {currentView === 'store' && (
          <Storefront
            selectedCategory={selectedCategory}
            onOpenCart={() => setIsCartOpen(true)}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
            onNavigateDedicatedOrder={() => {
              setDedicatedCustomerCode('CUS-000125');
              switchRole('customer', 'CUS-000125');
              setCurrentView('dedicated-order');
            }}
          />
        )}

        {currentView === 'dedicated-order' && (
          <CustomerOrderPortal
            onOrderSuccess={handleOrderSuccess}
            onBackToStore={() => setCurrentView('store')}
          />
        )}

        {currentView === 'customer-portal' && (
          <CustomerPortal
            onNavigateOrder={() => setCurrentView('dedicated-order')}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {currentView === 'visitor-portal' && (
          <VisitorPortal
            onStartOrderForCustomer={handleStartOrderForCustomer}
            onOpenInvoice={handleOpenInvoice}
          />
        )}

        {currentView === 'warehouse-portal' && <WarehousePortal />}

        {currentView === 'delivery-portal' && (
          <DeliveryPortal onOpenInvoice={handleOpenInvoice} />
        )}

        {currentView === 'accounting-portal' && (
          <AccountingPortal onOpenInvoice={handleOpenInvoice} />
        )}

        {currentView === 'admin-portal' && <AdminPortal />}

        {currentView === 'regional-landing' && (
          <RegionalLandingPages onStartOrder={() => setCurrentView('dedicated-order')} />
        )}

        {currentView === 'price-feeds' && <PriceFeeds />}
      </main>

      {/* Official Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Mobile Sticky Bottom Navigation (PWA-optimized, Section 25) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentView('store')}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            currentView === 'store' ? 'text-cyan-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>فروشگاه</span>
        </button>

        <button
          onClick={() => {
            switchRole('customer');
            setCurrentView('customer-portal');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            currentView === 'customer-portal' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>پنل مشتری</span>
        </button>

        <button
          onClick={() => {
            switchRole('visitor');
            setCurrentView('visitor-portal');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            currentView === 'visitor-portal' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>ویزیتور</span>
        </button>

        <button
          onClick={() => {
            switchRole('delivery');
            setCurrentView('delivery-portal');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            currentView === 'delivery-portal' ? 'text-cyan-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span>ارسال و بار</span>
        </button>

        <button
          onClick={() => {
            switchRole('admin');
            setCurrentView('admin-portal');
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${
            currentView === 'admin-portal' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>مدیریت</span>
        </button>
      </div>

      {/* Floating Repository Update Button (Left Side) */}
      <RepoUpdateIndicator />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2">
              <span className="text-base font-black text-white">پخش آب و نوشیدنی گوارانو</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                سامانه هوشمند توزیع و پخش مویرگی B2B برای سوپرمارکت‌ها، رستوران‌ها و ارگان‌ها در غرب استان تهران و البرز.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-white font-bold block mb-2">محدوده‌های تحت پوشش توزیع:</span>
              <div className="text-[11px] space-y-1">
                <div>شهریار، شهرقدس، ملارد، سرآسیاب</div>
                <div>مارلیک، رباط‌کریم، تهرانسر، چیتگر</div>
                <div>میدان آزادی، شهرک راه‌آهن</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-white font-bold block mb-2">دسترسی سریع به پنل‌ها:</span>
              <div className="text-[11px] space-y-1">
                <button onClick={() => { switchRole('customer'); setCurrentView('customer-portal'); }} className="hover:text-white block">پنل مشتریان و رهگیری سفارش</button>
                <button onClick={() => { switchRole('visitor'); setCurrentView('visitor-portal'); }} className="hover:text-white block">داشبورد ویزیتورها و پورسانت</button>
                <button onClick={() => { switchRole('warehouse'); setCurrentView('warehouse-portal'); }} className="hover:text-white block">سیستم انبارداری و کاردکس</button>
                <button onClick={() => { switchRole('accounting'); setCurrentView('accounting-portal'); }} className="hover:text-white block">حسابداری و صدور فاکتور</button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-white font-bold block mb-2">اطلاعات تماس و دفتر مرکزی:</span>
              <div className="text-[11px] space-y-1">
                <div>تلفن دفتر مرکزی: ۰۲۱-۶۵۰۰۰۰۰۰</div>
                <div>پشتیبانی سفارشات: ۰۹۱۲۱۱۱۰۰۰۰</div>
                <div>نشانی انبار: کیلومتر ۱۴ جاده مخصوص کرج، سوله ۱۲</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
            <div>تمامی حقوق محفوظ و متعلق به شرکت پخش سراسری آب و نوشیدنی گوارانو می‌باشد.</div>
            <div className="mt-2 sm:mt-0 font-mono">Gowarano B2B ERP • Version 1.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
