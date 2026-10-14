import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PricingTier } from '../types';
import { AdminExecutiveDashboard } from './AdminExecutiveDashboard';
import { SmsManagementPortal } from './SmsManagementPortal';
import { AdminProductManager } from './AdminProductManager';
import { AdminThemeSelector } from './AdminThemeSelector';
import { UserManagementPanel } from './UserManagementPanel';
import { GroupManagementPanel } from './GroupManagementPanel';
import { LoginModal } from './LoginModal';
import { PRODUCT_IMAGE_PRESETS } from '../data/productImagePresets';
import { apiClient } from '../services/apiClient';
import {
  Shield,
  BarChart3,
  Tag,
  MapPin,
  FileSpreadsheet,
  History,
  FolderPlus,
  Plus,
  PlusCircle,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  Download,
  Settings,
  Edit2,
  MessageSquare,
  Palette,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Eye,
  Trash2,
  X,
  Layers,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

interface AdminPortalProps {
  onNavigateToStore?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateToStore }) => {
  const {
    products,
    updateProduct,
    addProduct,
    categories,
    addCategory,
    orders,
    customers,
    visitors,
    deliveryZones,
    updateDeliveryZone,
    auditLogs,
    exportToCsv
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'themes' | 'sms' | 'pricing' | 'zones' | 'categories' | 'logs' | 'users' | 'groups'>('products');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Edit pricing modal/state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // New Product Modal & Wizard State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStep, setCreateModalStep] = useState<'info' | 'image' | 'pricing'>('info');
  const [createdProductSuccess, setCreatedProductSuccess] = useState<Product | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [imageUploadToast, setImageUploadToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Check auth on mount
    apiClient('/auth/profile')
      .then((data) => {
        if (data && data.userId) {
          setIsAuthenticated(true);
          setShowLogin(false);
          setPermissions(data.permissions || []);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setShowLogin(true);
      });
  }, []);

  if (showLogin) {
    return <LoginModal onSuccess={() => {
        setShowLogin(false);
        window.location.reload(); // Quick refresh to grab profile properly
    }} onClose={() => onNavigateToStore?.()} />;
  }

  const hasPermission = (code: string) => permissions.includes(code);

  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'گوارانو',
    categoryId: 'water',
    volume: '۱.۵ لیتر',
    unitsPerBox: 6,
    basePricePerBox: 160000,
    wholesalePricePerBox: 145000,
    commissionPerBox: 5000,
    tiers: [
      { minQtyBoxes: 30, pricePerBox: 140000 },
      { minQtyBoxes: 60, pricePerBox: 135000 },
      { minQtyBoxes: 100, pricePerBox: 128000 }
    ],
    minOrderQtyBoxes: 5,
    totalStock: 500,
    image: PRODUCT_IMAGE_PRESETS[0]?.url || '',
    description: 'آب آشامیدنی باکیفیت و استاندارد مناسب مصرف خانواده، سوپرمارکت‌ها و رستوران‌ها.',
    features: ['تصفیه چندمرحله‌ای استاندارد', 'دارای سیب سلامت و استاندارد ملی'],
    deliveryConditions: 'نگهداری در محل خشک و خنک، دور از تابش مستقیم آفتاب',
    isSpecialOffer: false,
    isBestSeller: false,
    isNewArrival: true,
    sku: ''
  });

  // Executive KPIs
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBoxes = orders.reduce((sum, o) => sum + o.totalBoxes, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalCommissions = visitors.reduce((sum, v) => sum + v.totalCommissionEarned, 0);

  // Sales by visitor breakdown
  const visitorBreakdown = visitors.map(v => {
    const vOrders = orders.filter(o => o.visitorId === v.id);
    const vSales = vOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { visitor: v, sales: vSales, ordersCount: vOrders.length };
  });

  // Sales by region breakdown
  const regionBreakdown = deliveryZones.map(z => {
    const zOrders = orders.filter(o => o.deliveryZone === z.name);
    const zSales = zOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { zone: z, sales: zSales, ordersCount: zOrders.length };
  });

  const handleSavePriceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      basePricePerBox: editingProduct.basePricePerBox,
      wholesalePricePerBox: editingProduct.wholesalePricePerBox,
      commissionPerBox: editingProduct.commissionPerBox,
      tiers: editingProduct.tiers
    });
    setImageUploadToast(`نرخ‌های محصول ${editingProduct.name} با موفقیت به‌روزرسانی شد.`);
    setTimeout(() => setImageUploadToast(null), 3500);
    setEditingProduct(null);
  };

  const handleAddTier = () => {
    if (!editingProduct) return;
    const currentTiers = editingProduct.tiers || [];
    const nextQty = (currentTiers[currentTiers.length - 1]?.minQtyBoxes || 50) + 30;
    const nextPrice = (currentTiers[currentTiers.length - 1]?.pricePerBox || editingProduct.wholesalePricePerBox) - 5000;
    setEditingProduct({
      ...editingProduct,
      tiers: [...currentTiers, { minQtyBoxes: nextQty, pricePerBox: nextPrice }]
    });
  };

  const handleUpdateTier = (idx: number, field: 'minQtyBoxes' | 'pricePerBox', val: number) => {
    if (!editingProduct) return;
    const newTiers = [...editingProduct.tiers];
    newTiers[idx] = { ...newTiers[idx], [field]: val };
    setEditingProduct({ ...editingProduct, tiers: newTiers });
  };

  const handleRemoveTier = (idx: number) => {
    if (!editingProduct) return;
    const newTiers = editingProduct.tiers.filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, tiers: newTiers });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory({
      id: `cat-${Date.now()}`,
      name: newCatName,
      slug: newCatSlug || `cat-${Date.now()}`,
      iconName: 'Package',
      description: 'دسته جدید تعریف شده توسط مدیر سیستم'
    });
    setImageUploadToast(`دسته‌بندی "${newCatName}" با موفقیت ایجاد شد.`);
    setTimeout(() => setImageUploadToast(null), 3500);
    setNewCatName('');
    setNewCatSlug('');
  };

  const handleExportSalesReport = () => {
    const rows = orders.map(o => ({
      'شماره سفارش': o.orderNumber,
      'تاریخ': o.createdAt,
      'مشتری': o.customerName,
      'کد مشتری': o.customerCode,
      'ویزیتور': o.visitorName,
      'تعداد کل باکس': o.totalBoxes,
      'مبلغ کل (تومان)': o.totalAmount,
      'پورسانت ویزیتور': o.totalVisitorCommission,
      'منطقه ارسال': o.deliveryZone,
      'راننده': o.driverName || 'تخصیص‌نیافته',
      'روش پرداخت': o.paymentMethod,
      'وضعیت سفارش': o.status
    }));
    exportToCsv(rows, 'گزارش_جامع_فروش_گوارانو');
  };

  const handleOpenCreateProduct = () => {
    setNewProductForm({
      name: '',
      brand: 'گوارانو',
      categoryId: categories[0]?.id || 'water',
      volume: '۱.۵ لیتر',
      unitsPerBox: 6,
      basePricePerBox: 160000,
      wholesalePricePerBox: 145000,
      commissionPerBox: 5000,
      tiers: [
        { minQtyBoxes: 30, pricePerBox: 140000 },
        { minQtyBoxes: 60, pricePerBox: 135000 },
        { minQtyBoxes: 100, pricePerBox: 128000 }
      ],
      minOrderQtyBoxes: 5,
      totalStock: 500,
      image: PRODUCT_IMAGE_PRESETS[0]?.url || '',
      description: 'آب آشامیدنی باکیفیت و استاندارد مناسب مصرف خانواده، سوپرمارکت‌ها و رستوران‌ها.',
      features: ['تصفیه چندمرحله‌ای استاندارد', 'دارای سیب سلامت و استاندارد ملی'],
      deliveryConditions: 'نگهداری در محل خشک و خنک، دور از تابش مستقیم آفتاب',
      isSpecialOffer: false,
      isBestSeller: false,
      isNewArrival: true,
      sku: `PRD-${Date.now().toString().slice(-6)}`
    });
    setCreateModalStep('info');
    setIsCreateModalOpen(true);
    setCreatedProductSuccess(null);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadToast('لطفاً یک فایل تصویری معتبر انتخاب کنید.');
      setTimeout(() => setImageUploadToast(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadToast('حجم فایل تصویر نباید بیشتر از ۵ مگابایت باشد.');
      setTimeout(() => setImageUploadToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const base64Url = ev.target?.result as string;
      if (base64Url) {
        setNewProductForm(prev => ({ ...prev, image: base64Url }));
        setImageUploadToast('تصویر با موفقیت بارگذاری شد.');
        setTimeout(() => setImageUploadToast(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewTier = () => {
    const currentTiers = newProductForm.tiers || [];
    const nextQty = (currentTiers[currentTiers.length - 1]?.minQtyBoxes || 50) + 30;
    const nextPrice = (currentTiers[currentTiers.length - 1]?.pricePerBox || Number(newProductForm.wholesalePricePerBox) || 140000) - 5000;
    setNewProductForm(prev => ({
      ...prev,
      tiers: [...currentTiers, { minQtyBoxes: nextQty, pricePerBox: Math.max(1000, nextPrice) }]
    }));
  };

  const handleUpdateNewTier = (idx: number, field: keyof PricingTier, val: number) => {
    const newTiers = [...(newProductForm.tiers || [])];
    newTiers[idx] = { ...newTiers[idx], [field]: val };
    setNewProductForm(prev => ({ ...prev, tiers: newTiers }));
  };

  const handleRemoveNewTier = (idx: number) => {
    const newTiers = (newProductForm.tiers || []).filter((_, i) => i !== idx);
    setNewProductForm(prev => ({ ...prev, tiers: newTiers }));
  };

  const handleSaveNewProduct = (e?: React.FormEvent, transferToStore: boolean = true) => {
    if (e) e.preventDefault();
    if (!newProductForm.name?.trim()) {
      setImageUploadToast('لطفاً نام محصول را وارد نمایید.');
      setTimeout(() => setImageUploadToast(null), 3000);
      setCreateModalStep('info');
      return;
    }

    const newSku = newProductForm.sku?.trim() || `PRD-${Date.now().toString().slice(-6)}`;
    const finalImage = newProductForm.image?.trim() || PRODUCT_IMAGE_PRESETS[0]?.url || '';

    const productPayload = {
      name: newProductForm.name.trim(),
      brand: newProductForm.brand?.trim() || 'گوارانو',
      categoryId: newProductForm.categoryId || categories[0]?.id || 'water',
      volume: newProductForm.volume?.trim() || '۱.۵ لیتر',
      unitsPerBox: Number(newProductForm.unitsPerBox) || 6,
      basePricePerBox: Number(newProductForm.basePricePerBox) || 160000,
      wholesalePricePerBox: Number(newProductForm.wholesalePricePerBox) || 145000,
      commissionPerBox: Number(newProductForm.commissionPerBox) || 0,
      tiers: newProductForm.tiers && newProductForm.tiers.length > 0 ? newProductForm.tiers : [
        { minQtyBoxes: 30, pricePerBox: Number(newProductForm.wholesalePricePerBox || 145000) - 5000 }
      ],
      minOrderQtyBoxes: Number(newProductForm.minOrderQtyBoxes) || 1,
      totalStock: Number(newProductForm.totalStock) || 500,
      reservedStock: 0,
      damagedStock: 0,
      image: finalImage,
      description: newProductForm.description || '',
      features: newProductForm.features || ['تصفیه استاندارد', 'دارای سیب سلامت'],
      deliveryConditions: newProductForm.deliveryConditions || '',
      isSpecialOffer: Boolean(newProductForm.isSpecialOffer),
      isBestSeller: Boolean(newProductForm.isBestSeller),
      isNewArrival: Boolean(newProductForm.isNewArrival),
      sku: newSku
    };

    addProduct(productPayload);

    const savedProductRef: Product = {
      ...productPayload,
      id: `prod-${Date.now()}`
    };

    setIsCreateModalOpen(false);
    setHighlightedProductId(savedProductRef.id);

    if (transferToStore && onNavigateToStore) {
      onNavigateToStore();
    } else {
      setCreatedProductSuccess(savedProductRef);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl p-6 shadow-xl border border-rose-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xl border border-rose-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">پنل مدیریت کلان و تصمیم‌گیری استراتژیک</h1>
                <span className="bg-rose-500/20 text-rose-300 text-xs font-mono font-bold px-2 py-0.5 rounded border border-rose-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                کنترل متمرکز شبکه فروش B2B، سیاست‌های قیمت‌گذاری پلکانی، پورسانت‌ها، مناطق و گزارش‌های عملکرد
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateProduct}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>ایجاد محصول جدید</span>
            </button>

            {onNavigateToStore && (
              <button
                onClick={onNavigateToStore}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Eye className="w-4 h-4 text-cyan-300" />
                <span>مشاهده فروشگاه عمومی</span>
              </button>
            )}

            <button
              onClick={handleExportSalesReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>اکسل فروش</span>
            </button>
          </div>
        </div>

        {/* Global Executive Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">کل فروش ثبت شده:</span>
            <span className="text-base font-black text-white font-mono">{totalSales.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-slate-400 mr-1">تومان</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">مجموع تناژ (باکس):</span>
            <span className="text-base font-black text-cyan-400 font-mono">{totalBoxes.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-slate-400 mr-1">باکس</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">تعداد مشتریان شبکه:</span>
            <span className="text-base font-black text-purple-300 font-mono">{customers.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">فروشگاه</span>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 block text-[11px]">ویزیتورهای فعال:</span>
            <span className="text-base font-black text-amber-400 font-mono">{visitors.length}</span>
            <span className="text-[10px] text-slate-400 mr-1">نفر</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-indigo-600" />
          <span>مدیریت و ویرایش محصولات فروشگاه ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('themes')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'themes'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4 text-rose-600" />
          <span>قالب و پوسته‌های فروشگاه (Themes)</span>
        </button>

        {hasPermission('users.view') && (
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>کاربران</span>
        </button>
        )}

        {hasPermission('groups.manage') && (
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'groups'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>گروه‌ها و دسترسی‌ها</span>
        </button>
        )}

        {hasPermission('dashboard.view') && (
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>داشبورد تحلیلی و گزارشات</span>
        </button>
        )}

        <button
          onClick={() => setActiveTab('sms')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'sms'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>پنل پیامک و اطلاع‌رسانی بار</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>موتور قیمت‌گذاری و تخفیف پلکانی</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'zones'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>محدوده‌های توزیع و کرایه‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>دسته‌بندی پویای FMCG</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>لاگ ممیزی و رویدادهای سیستم ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab: Store Products & Catalog Management */}
      {activeTab === 'products' && (
        <AdminProductManager
          onOpenPricingEngine={(prodId) => {
            setActiveTab('pricing');
            if (prodId) {
              const p = products.find(prod => prod.id === prodId);
              if (p) setEditingProduct(p);
            }
          }}
          onNavigateToStore={onNavigateToStore}
        />
      )}

      {/* Tab: Store Themes Selection */}
      {activeTab === 'themes' && (
        <AdminThemeSelector />
      )}

      {activeTab === 'users' && <UserManagementPanel />}
      {activeTab === 'groups' && <GroupManagementPanel />}

      {/* Tab 1: Executive Analytics & BI Dashboard */}
      {activeTab === 'analytics' && (
        <AdminExecutiveDashboard onOpenCreateProduct={handleOpenCreateProduct} />
      )}

      {/* Tab 2: SMS Management & Shipment Notifications */}
      {activeTab === 'sms' && (
        <SmsManagementPortal />
      )}

      {/* Tab 2: Pricing Engine (Section 18 of brief: قیمت عمومی، عمده، پلکانی، پورسانت) */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-600" />
                <span>موتور قیمت‌گذاری، تخفیف پلکانی و پورسانت</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تعریف قیمت عمده، پله‌های تخفیف بر اساس تعداد باکس (۳۰، ۶۰، ۱۰۰ باکس) و پورسانت هر باکس کالا
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenCreateProduct}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ تعریف محصول جدید و تنظیم نرخ</span>
              </button>

              {onNavigateToStore && (
                <button
                  type="button"
                  onClick={onNavigateToStore}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>مشاهده در فروشگاه عمومی</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3 w-14 text-center">تصویر</th>
                  <th className="p-3">کد کالا</th>
                  <th className="p-3">نام و مشخصات کالا</th>
                  <th className="p-3 text-left">قیمت پایه (تک)</th>
                  <th className="p-3 text-left">قیمت عمده استاندارد</th>
                  <th className="p-3 text-left">پورسانت ویزیتور/باکس</th>
                  <th className="p-3">پله‌های تخفیف پلکانی تناژ</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {products.map(prod => {
                  const isNewlyHighlighted = highlightedProductId === prod.id;
                  return (
                    <tr
                      key={prod.id}
                      className={`transition ${
                        isNewlyHighlighted
                          ? 'bg-emerald-50/70 border-y-2 border-emerald-400'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Product Thumbnail */}
                      <td className="p-2.5 text-center">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center p-0.5">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-500">
                        {prod.sku}
                        {isNewlyHighlighted && (
                          <span className="block text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded mt-0.5 font-bold">
                            تازه افزوده شده
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{prod.brand}</span>
                          <span>·</span>
                          <span className="font-mono">{prod.volume}</span>
                          <span>·</span>
                          <span>{prod.unitsPerBox} بطری/باکس</span>
                        </div>
                      </td>

                      <td className="p-3 text-left font-mono">{prod.basePricePerBox.toLocaleString('fa-IR')} ت</td>

                      <td className="p-3 text-left font-mono font-bold text-cyan-800">
                        {prod.wholesalePricePerBox.toLocaleString('fa-IR')} ت
                      </td>

                      <td className="p-3 text-left font-mono font-bold text-amber-700">
                        {prod.commissionPerBox.toLocaleString('fa-IR')} ت
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {prod.tiers && prod.tiers.length > 0 ? (
                            prod.tiers.map((t, tidx) => (
                              <span key={tidx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[10px]">
                                {t.minQtyBoxes}+ باکس: {t.pricePerBox.toLocaleString('fa-IR')}ت
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">بدون پله تخفیف</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(prod)}
                            className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition text-[11px] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>ویرایش نرخ‌ها</span>
                          </button>

                          {onNavigateToStore && (
                            <button
                              type="button"
                              onClick={onNavigateToStore}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition text-[11px] cursor-pointer"
                              title="مشاهده در ویترین فروشگاه عمومی"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                              <span>فروشگاه</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pricing Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {editingProduct.image && (
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-0.5"
                  />
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    موتور قیمت‌گذاری: {editingProduct.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>کد SKU: {editingProduct.sku}</span>
                    <span>·</span>
                    <span>برند: {editingProduct.brand}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">قیمت پایه هر باکس (تومان):</label>
                  <input
                    type="number"
                    value={editingProduct.basePricePerBox}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, basePricePerBox: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    {editingProduct.basePricePerBox?.toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">قیمت عمده استاندارد (تومان):</label>
                  <input
                    type="number"
                    value={editingProduct.wholesalePricePerBox}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, wholesalePricePerBox: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                    {editingProduct.wholesalePricePerBox?.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">پورسانت ویزیتور به ازای هر باکس (تومان):</label>
                <input
                  type="number"
                  value={editingProduct.commissionPerBox}
                  onChange={e =>
                    setEditingProduct({ ...editingProduct, commissionPerBox: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              {/* Tiers list */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">پله‌های تخفیف پلکانی تناژ (تعداد باکس):</span>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن پله جدید</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {editingProduct.tiers?.map((tier, tidx) => (
                    <div key={tidx} className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">از</span>
                      <input
                        type="number"
                        value={tier.minQtyBoxes}
                        onChange={e => handleUpdateTier(tidx, 'minQtyBoxes', Number(e.target.value))}
                        className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-center"
                      />
                      <span className="text-slate-500 text-[11px]">باکس، قیمت هر باکس:</span>
                      <input
                        type="number"
                        value={tier.pricePerBox}
                        onChange={e => handleUpdateTier(tidx, 'pricePerBox', Number(e.target.value))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-left"
                      />
                      <span className="text-slate-500 text-[11px]">تومان</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tidx)}
                        className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  ذخیره تغییرات نرخ‌ها
                </button>

                {onNavigateToStore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      handleSavePriceEdit(e);
                      onNavigateToStore();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>ذخیره و رفتن به فروشگاه عمومی</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT WIZARD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    تعریف، بارگذاری تصویر و تنظیم نرخ محصول در موتور قیمت‌گذاری
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    پس از ذخیره، محصول بلافاصله در موتور قیمت‌گذاری و فروشگاه عمومی منتشر می‌شود.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Step Navigation Bar */}
            <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold overflow-x-auto bg-slate-50">
              <button
                type="button"
                onClick={() => setCreateModalStep('info')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  createModalStep === 'info'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>۱. مشخصات عمومی کالا</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateModalStep('image')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  createModalStep === 'image'
                    ? 'border-emerald-600 text-emerald-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>۲. بارگذاری و انتخاب عکس کالا</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateModalStep('pricing')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  createModalStep === 'pricing'
                    ? 'border-rose-600 text-rose-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Tag className="w-4 h-4 text-rose-600" />
                <span>۳. موتور قیمت‌گذاری و پله‌های تخفیف تناژ</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveNewProduct} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* STEP 1: GENERAL INFO */}
              {createModalStep === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <span>نام محصول (فارسی):</span>
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProductForm.name || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                        placeholder="مثلاً آب معدنی ۱.۵ لیتری دماوند (باکس ۶ عددی)"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">برند تجاری کالا:</label>
                      <input
                        type="text"
                        value={newProductForm.brand || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                        placeholder="گوارانو، دماوند، واتا، نستله..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">دسته‌بندی کاتالوگ:</label>
                      <select
                        value={newProductForm.categoryId || 'water'}
                        onChange={e => setNewProductForm({ ...newProductForm, categoryId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">حجم / ابعاد کالا:</label>
                      <input
                        type="text"
                        value={newProductForm.volume || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, volume: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                        placeholder="۱.۵ لیتر، ۵۰۰ سی‌سی، ۱۹ لیتر، ۳۳۰ سی‌سی..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">تعداد بطری/قوطی در هر باکس:</label>
                      <input
                        type="number"
                        min="1"
                        value={newProductForm.unitsPerBox || 6}
                        onChange={e => setNewProductForm({ ...newProductForm, unitsPerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">کد انبار (SKU):</label>
                      <input
                        type="text"
                        value={newProductForm.sku || ''}
                        onChange={e => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50/50"
                        placeholder="PRD-1002"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">موجودی اولیه انبار (باکس):</label>
                      <input
                        type="number"
                        min="0"
                        value={newProductForm.totalStock || 500}
                        onChange={e => setNewProductForm({ ...newProductForm, totalStock: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">حداقل تعداد سفارش (باکس):</label>
                      <input
                        type="number"
                        min="1"
                        value={newProductForm.minOrderQtyBoxes || 5}
                        onChange={e => setNewProductForm({ ...newProductForm, minOrderQtyBoxes: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">توضیحات معرفی محصول در فروشگاه:</label>
                    <textarea
                      rows={3}
                      value={newProductForm.description || ''}
                      onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                      placeholder="توضیحات در مورد کیفیت، ویژگی‌ها و خاستگاه چشمه یا کارخانه..."
                    />
                  </div>

                  {/* Marketing Badges */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 block text-[11px]">نشان‌های ویژه روی کارت کالا در فروشگاه:</span>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(newProductForm.isNewArrival)}
                          onChange={e => setNewProductForm({ ...newProductForm, isNewArrival: e.target.checked })}
                          className="rounded text-cyan-600"
                        />
                        <span>کالای جدید (New Arrival)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(newProductForm.isSpecialOffer)}
                          onChange={e => setNewProductForm({ ...newProductForm, isSpecialOffer: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span>پیشنهاد ویژه تخفیفی (Special Offer)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(newProductForm.isBestSeller)}
                          onChange={e => setNewProductForm({ ...newProductForm, isBestSeller: e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>پرفروش‌ترین کالا (Best Seller)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: IMAGE UPLOAD & SELECTION */}
              {createModalStep === 'image' && (
                <div className="space-y-4">
                  {/* Upload Toast */}
                  {imageUploadToast && (
                    <div className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{imageUploadToast}</span>
                    </div>
                  )}

                  {/* Image Preview & Local Upload */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-sm shrink-0">
                      {newProductForm.image ? (
                        <img
                          src={newProductForm.image}
                          alt="پیش‌نمایش کالا"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-[10px]">
                          <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                          <span>عکسی انتخاب نشده</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1 text-xs">
                      <div className="font-bold text-slate-800">پیش‌نمایش تصویر انتخابی کالا</div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        تصویر کالا در فروشگاه عمومی، کاتالوگ B2B و فیدهای ترب و ایمالز نمایش داده می‌شود. می‌توانید عکسی از سیستم خود بارگذاری کنید یا از گالری زیر انتخاب نمایید.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>بارگذاری و آپلود عکس از دستگاه</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />

                        {newProductForm.image && (
                          <button
                            type="button"
                            onClick={() => setNewProductForm(prev => ({ ...prev, image: '' }))}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف عکس</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">آدرس اینترنتی مستقیم عکس (Image URL):</label>
                    <input
                      type="url"
                      dir="ltr"
                      value={newProductForm.image || ''}
                      onChange={e => setNewProductForm({ ...newProductForm, image: e.target.value })}
                      placeholder="https://example.com/water-product.png"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  {/* Pre-built Gallery Presets */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>انتخاب سریع از گالری تصاویر آماده آب و نوشیدنی:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">کلیک برای انتخاب فوری</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRODUCT_IMAGE_PRESETS.map(preset => {
                        const isSelected = newProductForm.image === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setNewProductForm({ ...newProductForm, image: preset.url });
                              setImageUploadToast(`عکس "${preset.title}" با موفقیت انتخاب شد.`);
                              setTimeout(() => setImageUploadToast(null), 3000);
                            }}
                            className={`p-2 rounded-xl border-2 transition cursor-pointer flex flex-col items-center text-center space-y-1.5 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 bg-white hover:border-emerald-400'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                              <img
                                src={preset.url}
                                alt={preset.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                              {preset.title}
                            </span>
                            <span className="text-[9px] text-cyan-800 font-mono">
                              {preset.volume}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PRICING ENGINE & TIERS */}
              {createModalStep === 'pricing' && (
                <div className="space-y-4">
                  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-rose-600" />
                      <span>پیکربندی نرخ‌ها در موتور قیمت‌گذاری گوارانو</span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      قیمت پایه (تک‌فروشی)، قیمت عمده استاندارد همکار، پورسانت ویزیتور و تخفیفات پلکانی متناسب با تعداد باکس را تنظیم نمایید.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">قیمت پایه هر باکس (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={newProductForm.basePricePerBox || 0}
                        onChange={e => setNewProductForm({ ...newProductForm, basePricePerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs bg-slate-50/50"
                        required
                      />
                      <span className="text-[10px] text-slate-400 block font-mono">
                        معادل: {(Number(newProductForm.basePricePerBox) || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">قیمت عمده استاندارد همکار (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={newProductForm.wholesalePricePerBox || 0}
                        onChange={e => setNewProductForm({ ...newProductForm, wholesalePricePerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs bg-slate-50/50"
                        required
                      />
                      <span className="text-[10px] text-slate-400 block font-mono">
                        معادل: {(Number(newProductForm.wholesalePricePerBox) || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">پورسانت ویزیتور به ازای هر باکس (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={newProductForm.commissionPerBox || 0}
                        onChange={e => setNewProductForm({ ...newProductForm, commissionPerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs bg-slate-50/50"
                      />
                      <span className="text-[10px] text-slate-400 block font-mono">
                        معادل: {(Number(newProductForm.commissionPerBox) || 0).toLocaleString('fa-IR')} تومان به ازای هر باکس
                      </span>
                    </div>
                  </div>

                  {/* Volume Discount Tiers */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">پله‌های تخفیف پلکانی تناژ (موتور قیمت‌گذاری)</h4>
                        <p className="text-[11px] text-slate-500">
                          مشتریانی که در سفارش خود تعداد بالاتری باکس خرید کنند، این نرخ‌ها برایشان محاسبه می‌گردد.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddNewTier}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>افزودن پله جدید</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(newProductForm.tiers || []).map((tier, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="font-bold text-slate-600">پله {idx + 1}:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">حداقل باکس:</span>
                              <input
                                type="number"
                                min="1"
                                value={tier.minQtyBoxes}
                                onChange={e => handleUpdateNewTier(idx, 'minQtyBoxes', Number(e.target.value))}
                                className="w-20 border border-slate-200 rounded-lg px-2 py-1 font-mono text-center bg-white"
                              />
                            </div>

                            <div className="flex items-center gap-1 flex-1">
                              <span className="text-slate-500">قیمت هر باکس:</span>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={tier.pricePerBox}
                                onChange={e => handleUpdateNewTier(idx, 'pricePerBox', Number(e.target.value))}
                                className="flex-1 max-w-40 border border-slate-200 rounded-lg px-2 py-1 font-mono text-left bg-white"
                              />
                              <span className="text-slate-500 text-[10px]">تومان</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveNewTier(idx)}
                            className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Step Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {createModalStep !== 'info' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (createModalStep === 'pricing') setCreateModalStep('image');
                        else if (createModalStep === 'image') setCreateModalStep('info');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      ← مرحله قبل
                    </button>
                  )}

                  {createModalStep !== 'pricing' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (createModalStep === 'info') setCreateModalStep('image');
                        else if (createModalStep === 'image') setCreateModalStep('pricing');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      مرحله بعد: {createModalStep === 'info' ? 'بارگذاری عکس کالا' : 'موتور قیمت‌گذاری'} →
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => handleSaveNewProduct(e, true)}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                    <span>ذخیره و انتقال مستقیم به فروشگاه عمومی</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSaveNewProduct(e, false)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>ذخیره و ماندن در پنل مدیریت</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CELEBRATORY SUCCESS MODAL AFTER PRODUCT CREATION */}
      {createdProductSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-emerald-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">محصول با موفقیت بارگذاری و تعریف شد!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  کالا در سیستم ثبت گردید و هم‌اکنون در موتور قیمت‌گذاری و فروشگاه عمومی فعال است.
                </p>
              </div>
            </div>

            {/* Product Summary Preview */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-xs">
              <img
                src={createdProductSuccess.image}
                alt={createdProductSuccess.name}
                className="w-16 h-16 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0"
              />
              <div className="space-y-1 flex-1">
                <div className="font-bold text-slate-900">{createdProductSuccess.name}</div>
                <div className="text-[11px] text-slate-500">
                  برند: <strong>{createdProductSuccess.brand}</strong> | حجم: <strong>{createdProductSuccess.volume}</strong>
                </div>
                <div className="font-mono text-cyan-800 font-bold">
                  قیمت عمده: {createdProductSuccess.wholesalePricePerBox.toLocaleString('fa-IR')} تومان
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">
                  موجودی قابل سفارش: {createdProductSuccess.totalStock} باکس
                </div>
              </div>
            </div>

            {/* Action Buttons as requested by user */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pricing');
                  const target = products.find(p => p.name === createdProductSuccess.name) || createdProductSuccess;
                  setEditingProduct(target);
                  setCreatedProductSuccess(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                <span>ورود به موتور قیمت‌گذاری برای ویرایش نرخ‌ها و پله‌های تخفیف</span>
              </button>

              {onNavigateToStore && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatedProductSuccess(null);
                    onNavigateToStore();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>مشاهده محصول در صفحه فروشگاه عمومی</span>
                </button>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedProductSuccess(null);
                    handleOpenCreateProduct();
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  + تعریف محصول جدید دیگر
                </button>

                <button
                  type="button"
                  onClick={() => setCreatedProductSuccess(null)}
                  className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Zones (Section 19 in brief) */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-black text-slate-900">مدیریت مناطق توزیع و شرایط ارسال رایگان</h2>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">نام منطقه</th>
                  <th className="p-3 text-left">هزینه کرایه حمل</th>
                  <th className="p-3 text-left">سقف خرید برای ارسال رایگان</th>
                  <th className="p-3">زمان‌بندی تحویل</th>
                  <th className="p-3 text-center">وضعیت سرویس‌دهی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {deliveryZones.map(zone => (
                  <tr key={zone.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{zone.name}</td>
                    <td className="p-3 text-left font-mono font-bold text-cyan-800">
                      {zone.shippingFee === 0 ? 'رایگان' : `${zone.shippingFee.toLocaleString('fa-IR')} ت`}
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-emerald-700">
                      بالای {zone.freeShippingMinOrder.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3 text-slate-600">{zone.deliveryEstimate}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        پوشش فعال
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Categories (Section 4 & 26 in brief) */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900">تعریف دسته‌بندی جدید بدون کدنویسی</h3>
            <p className="text-xs text-slate-500">
              سیستم به صورت داینامیک طراحی شده تا کالاها مانند کیک، نوشابه، آبمیوه، تنقلات و... را بپذیرد.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام دسته‌بندی جدید:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً چای و دمنوش سازمانی"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شناسه انگلیسی (slug):</label>
                <input
                  type="text"
                  placeholder="tea-herbal"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition"
              >
                ایجاد دسته‌بندی در فروشگاه
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm text-slate-900">دسته‌بندی‌های فعال کاتالوگ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cat.slug}</div>
                  </div>
                  <span className="text-xs text-cyan-700 font-bold bg-cyan-50 px-2 py-1 rounded">
                    {products.filter(p => p.categoryId === cat.id).length} کالا
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log (Section 24 of brief: تمام فعالیت‌های مهم کاربران Log شود) */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">ثبت وقایع و لاگ امنیتی سیستم (Audit Log)</h2>
              <p className="text-xs text-slate-500">
                ردیابی هرگونه ثبت سفارش، تغییر موجودی، ویرایش قیمت و ورود/خروج کالا
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96 overflow-y-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] sticky top-0">
                  <th className="p-3">زمان رویداد</th>
                  <th className="p-3">کاربر / نقش</th>
                  <th className="p-3">عنوان عملیات</th>
                  <th className="p-3">جزئیات کامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 mr-1">({log.role})</span>
                    </td>
                    <td className="p-3 font-bold text-cyan-800 whitespace-nowrap">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
