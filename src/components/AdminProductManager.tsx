import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PricingTier } from '../types';
import { PRODUCT_IMAGE_PRESETS } from '../data/productImagePresets';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  Flame,
  Tag,
  DollarSign,
  Boxes,
  Eye,
  Filter,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AdminProductManager: React.FC = () => {
  const {
    products,
    categories,
    updateProduct,
    addProduct,
    deleteProduct
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form state for creating or editing
  const [formState, setFormState] = useState<Partial<Product>>({});
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'image' | 'pricing' | 'tiers' | 'stock'>('info');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique brands for filtering
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.includes(searchQuery) ||
      p.brand.includes(searchQuery) ||
      p.volume.includes(searchQuery) ||
      p.sku.includes(searchQuery);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
    return true;
  });

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsCreatingNew(false);
    setFormState({
      ...product,
      tiers: product.tiers ? JSON.parse(JSON.stringify(product.tiers)) : [],
      features: product.features ? [...product.features] : []
    });
    setActiveFormTab('info');
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setFormState({
      name: '',
      brand: 'گوارانو',
      categoryId: categories[0]?.id || 'water',
      volume: '۱.۵ لیتر',
      unitsPerBox: 6,
      basePricePerBox: 160000,
      wholesalePricePerBox: 145000,
      tiers: [
        { minQtyBoxes: 30, pricePerBox: 140000 },
        { minQtyBoxes: 60, pricePerBox: 135000 },
        { minQtyBoxes: 100, pricePerBox: 128000 }
      ],
      minOrderQtyBoxes: 5,
      totalStock: 500,
      reservedStock: 0,
      damagedStock: 0,
      image: PRODUCT_IMAGE_PRESETS[0]?.url || '',
      description: 'آب آشامیدنی باکیفیت و استاندارد مناسب مصرف خانواده، سوپرمارکت‌ها و رستوران‌ها.',
      features: ['تصفیه چندمرحله‌ای استاندارد', 'دارای سیب سلامت و استاندارد ملی'],
      deliveryConditions: 'نگهداری در محل خشک و خنک، دور از تابش مستقیم آفتاب',
      commissionPerBox: 5000,
      isSpecialOffer: false,
      isBestSeller: false,
      isNewArrival: true
    });
    setActiveFormTab('info');
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsCreatingNew(false);
    setFormState({});
  };

  // Image file upload handler (converts local file to base64 data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('لطفاً یک فایل تصویری معتبر انتخاب کنید.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل تصویر نباید بیشتر از ۵ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const base64Url = ev.target?.result as string;
      if (base64Url) {
        setFormState(prev => ({ ...prev, image: base64Url }));
        showToast('تصویر با موفقیت بارگذاری شد.', 'success');
      }
    };
    reader.onerror = () => {
      showToast('خطا در خواندن فایل تصویر.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Remove / clear product photo
  const handleRemovePhoto = () => {
    setFormState(prev => ({ ...prev, image: '' }));
    showToast('تصویر کالا حذف شد. می‌توانید آدرس جدید وارد کرده یا از گالری انتخاب کنید.', 'success');
  };

  // Save product (either edit or new)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name?.trim()) {
      showToast('نام محصول الزامی است.', 'error');
      return;
    }

    if (isCreatingNew) {
      addProduct({
        name: formState.name.trim(),
        brand: formState.brand?.trim() || 'گوارانو',
        categoryId: formState.categoryId || 'water',
        volume: formState.volume || '۱.۵ لیتر',
        unitsPerBox: Number(formState.unitsPerBox) || 6,
        basePricePerBox: Number(formState.basePricePerBox) || 160000,
        wholesalePricePerBox: Number(formState.wholesalePricePerBox) || 145000,
        tiers: formState.tiers || [],
        minOrderQtyBoxes: Number(formState.minOrderQtyBoxes) || 1,
        totalStock: Number(formState.totalStock) || 0,
        reservedStock: 0,
        damagedStock: 0,
        image: formState.image || PRODUCT_IMAGE_PRESETS[0]?.url || '',
        description: formState.description || '',
        features: formState.features || [],
        deliveryConditions: formState.deliveryConditions || '',
        commissionPerBox: Number(formState.commissionPerBox) || 0,
        isSpecialOffer: Boolean(formState.isSpecialOffer),
        isBestSeller: Boolean(formState.isBestSeller),
        isNewArrival: Boolean(formState.isNewArrival)
      });
      showToast(`محصول جدید "${formState.name}" با موفقیت به فروشگاه اضافه شد.`, 'success');
    } else if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formState.name.trim(),
        brand: formState.brand?.trim(),
        categoryId: formState.categoryId,
        volume: formState.volume,
        unitsPerBox: Number(formState.unitsPerBox),
        basePricePerBox: Number(formState.basePricePerBox),
        wholesalePricePerBox: Number(formState.wholesalePricePerBox),
        tiers: formState.tiers,
        minOrderQtyBoxes: Number(formState.minOrderQtyBoxes),
        totalStock: Number(formState.totalStock),
        damagedStock: Number(formState.damagedStock),
        image: formState.image,
        description: formState.description,
        features: formState.features,
        deliveryConditions: formState.deliveryConditions,
        commissionPerBox: Number(formState.commissionPerBox),
        isSpecialOffer: Boolean(formState.isSpecialOffer),
        isBestSeller: Boolean(formState.isBestSeller),
        isNewArrival: Boolean(formState.isNewArrival)
      });
      showToast(`مشخصات و عکس محصول "${formState.name}" با موفقیت به‌روزرسانی شد.`, 'success');
    }

    handleCloseModal();
  };

  // Delete product confirmation
  const handleConfirmDelete = () => {
    if (!deletingProductId) return;
    const target = products.find(p => p.id === deletingProductId);
    deleteProduct(deletingProductId);
    showToast(`محصول "${target?.name || ''}" با موفقیت از فروشگاه عمومی حذف شد.`, 'success');
    setDeletingProductId(null);
  };

  // Tier helper functions
  const handleAddTier = () => {
    const currentTiers = formState.tiers || [];
    const nextQty = (currentTiers[currentTiers.length - 1]?.minQtyBoxes || 50) + 30;
    const nextPrice = (currentTiers[currentTiers.length - 1]?.pricePerBox || Number(formState.wholesalePricePerBox) || 140000) - 5000;
    setFormState(prev => ({
      ...prev,
      tiers: [...currentTiers, { minQtyBoxes: nextQty, pricePerBox: Math.max(1000, nextPrice) }]
    }));
  };

  const handleUpdateTier = (idx: number, field: keyof PricingTier, val: number) => {
    const newTiers = [...(formState.tiers || [])];
    newTiers[idx] = { ...newTiers[idx], [field]: val };
    setFormState(prev => ({ ...prev, tiers: newTiers }));
  };

  const handleRemoveTier = (idx: number) => {
    const newTiers = (formState.tiers || []).filter((_, i) => i !== idx);
    setFormState(prev => ({ ...prev, tiers: newTiers }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`${
            toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          } text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold transition`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-white/90" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-white/90" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-white/70 mr-2">
            ✕
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>مدیریت و ویرایش کاتالوگ محصولات فروشگاه عمومی</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ویرایش نام، قیمت‌ها، تنظیم یا حذف عکس محصولات، کنترل موجودی و تعریف کالای جدید در فروشگاه
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن محصول جدید به فروشگاه</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="جستجوی محصول (نام، برند، حجم، کد انبار)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
            >
              <option value="all">همه دسته‌بندی‌ها ({products.length} کالا)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({products.filter(p => p.categoryId === cat.id).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
            >
              <option value="all">همه برندها</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3 w-16 text-center">تصویر</th>
                <th className="p-3">نام و مشخصات کالا</th>
                <th className="p-3">دسته‌بندی و برند</th>
                <th className="p-3">قیمت هر باکس (تومان)</th>
                <th className="p-3 text-center">پله‌های تخفیف</th>
                <th className="p-3 text-center">موجودی انبار</th>
                <th className="p-3 text-center">نشان‌های ویژه</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    محصولی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const categoryObj = categories.find(c => c.id === product.categoryId);
                  const availableStock = Math.max(0, product.totalStock - product.reservedStock);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      {/* Product Image Thumbnail */}
                      <td className="p-3 text-center">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center group">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEdit(product);
                              setActiveFormTab('image');
                            }}
                            className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                            title="تغییر / حذف عکس"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Name & Volume */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs">{product.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-600">
                            {product.sku}
                          </span>
                          <span>حجم: {product.volume}</span>
                          <span>({product.unitsPerBox} بطری در باکس)</span>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="p-3">
                        <span className="font-bold text-indigo-700 block">{product.brand}</span>
                        <span className="text-[10px] text-slate-500">{categoryObj?.name || product.categoryId}</span>
                      </td>

                      {/* Pricing */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-900">
                          عمده: {product.wholesalePricePerBox.toLocaleString('fa-IR')}
                        </div>
                        <div className="text-[10px] text-slate-400 line-through">
                          پایه: {product.basePricePerBox.toLocaleString('fa-IR')}
                        </div>
                      </td>

                      {/* Tiers count */}
                      <td className="p-3 text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px] font-mono">
                          {product.tiers?.length || 0} پله تخفیف
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="p-3 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            availableStock > 50
                              ? 'bg-emerald-50 text-emerald-700'
                              : availableStock > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {availableStock} باکس
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {product.isBestSeller && (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              پرفروش
                            </span>
                          )}
                          {product.isSpecialOffer && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              ویژه
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              جدید
                            </span>
                          )}
                          {!product.isBestSeller && !product.isSpecialOffer && !product.isNewArrival && (
                            <span className="text-slate-300 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition text-[11px]"
                            title="ویرایش مشخصات و عکس"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>ویرایش</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingProductId(product.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition text-[11px]"
                            title="حذف کالا از فروشگاه"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / CREATE PRODUCT MODAL */}
      {(editingProduct || isCreatingNew) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {isCreatingNew ? 'افزودن محصول جدید به فروشگاه' : `ویرایش محصول: ${editingProduct?.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold overflow-x-auto bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveFormTab('info')}
                className={`pb-2.5 border-b-2 transition ${
                  activeFormTab === 'info'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                مشخصات عمومی کالا
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('image')}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  activeFormTab === 'image'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>مدیریت و بارگذاری عکس</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('pricing')}
                className={`pb-2.5 border-b-2 transition ${
                  activeFormTab === 'pricing'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                قیمت و پورسانت
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('tiers')}
                className={`pb-2.5 border-b-2 transition ${
                  activeFormTab === 'tiers'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                پله‌های تخفیف تناژ ({formState.tiers?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('stock')}
                className={`pb-2.5 border-b-2 transition ${
                  activeFormTab === 'stock'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                موجودی انبار
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* TAB 1: GENERAL INFO */}
              {activeFormTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">نام کالا (فارسی):</label>
                      <input
                        type="text"
                        value={formState.name || ''}
                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                        placeholder="مثلاً آب معدنی ۱.۵ لیتری دماوند"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">برند تجاری:</label>
                      <input
                        type="text"
                        value={formState.brand || ''}
                        onChange={e => setFormState({ ...formState, brand: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                        placeholder="گوارانو، دماوند، نستله..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">دسته‌بندی کالا:</label>
                      <select
                        value={formState.categoryId || ''}
                        onChange={e => setFormState({ ...formState, categoryId: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">حجم / ابعاد:</label>
                      <input
                        type="text"
                        value={formState.volume || ''}
                        onChange={e => setFormState({ ...formState, volume: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
                        placeholder="۱.۵ لیتر، ۵۰۰ سی‌سی، ۱۹ لیتر..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">تعداد بطری در هر باکس:</label>
                      <input
                        type="number"
                        min="1"
                        value={formState.unitsPerBox || 6}
                        onChange={e => setFormState({ ...formState, unitsPerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">کد انبار (SKU):</label>
                      <input
                        type="text"
                        value={formState.sku || ''}
                        onChange={e => setFormState({ ...formState, sku: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                        placeholder="PRD-1002"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">توضیحات و مشخصات محصول:</label>
                    <textarea
                      rows={3}
                      value={formState.description || ''}
                      onChange={e => setFormState({ ...formState, description: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-500"
                      placeholder="توضیحات درباره خاستگاه چشمه، املاح و نحوه بسته‌بندی..."
                    />
                  </div>

                  {/* Status Checkboxes */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-800 block text-[11px]">نشان‌های بازاریابی روی کارت کالا:</span>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formState.isBestSeller)}
                          onChange={e => setFormState({ ...formState, isBestSeller: e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>پرفروش (Best Seller)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formState.isSpecialOffer)}
                          onChange={e => setFormState({ ...formState, isSpecialOffer: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span>پیشنهاد ویژه تخفیفی</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formState.isNewArrival)}
                          onChange={e => setFormState({ ...formState, isNewArrival: e.target.checked })}
                          className="rounded text-cyan-600"
                        />
                        <span>کالای جدید (New)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGE MANAGEMENT */}
              {activeFormTab === 'image' && (
                <div className="space-y-4">
                  {/* Current Image Preview & Quick Actions */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-28 h-28 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-xs shrink-0">
                      {formState.image ? (
                        <img
                          src={formState.image}
                          alt="پیش‌نمایش"
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
                      <div className="font-bold text-slate-800">پیش‌نمایش تصویر فعلی کالا</div>
                      <p className="text-slate-500 text-[11px]">
                        می‌توانید عکس را مستقیماً از کامپیوتر یا گوشی خود آپلود کنید، لینک اینترنتی وارد کنید یا از گالری تصاویر آماده انتخاب نمایید.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود عکس از سیستم</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />

                        {formState.image && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition"
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
                      value={formState.image || ''}
                      onChange={e => setFormState({ ...formState, image: e.target.value })}
                      placeholder="https://example.com/water-bottle.png"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* Pre-built Gallery Presets */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>انتخاب سریع از گالری تصاویر آماده آب و نوشیدنی:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">یک کلیک برای انتخاب</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRODUCT_IMAGE_PRESETS.map(preset => {
                        const isSelected = formState.image === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setFormState({ ...formState, image: preset.url });
                              showToast(`عکس "${preset.title}" انتخاب شد.`, 'success');
                            }}
                            className={`p-2 rounded-xl border-2 transition cursor-pointer flex flex-col items-center text-center space-y-1.5 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
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
                            <span className="text-[9px] text-indigo-700 font-mono">
                              {preset.volume}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & COMMISSION */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">قیمت پایه هر باکس (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formState.basePricePerBox || 0}
                        onChange={e => setFormState({ ...formState, basePricePerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                        required
                      />
                      <span className="text-[10px] text-slate-400 block font-mono">
                        معادل: {(Number(formState.basePricePerBox) || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">قیمت عمده استاندارد همکار (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formState.wholesalePricePerBox || 0}
                        onChange={e => setFormState({ ...formState, wholesalePricePerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                        required
                      />
                      <span className="text-[10px] text-slate-400 block font-mono">
                        معادل: {(Number(formState.wholesalePricePerBox) || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">پورسانت ویزیتور به ازای هر باکس (تومان):</label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={formState.commissionPerBox || 0}
                        onChange={e => setFormState({ ...formState, commissionPerBox: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">حداقل تعداد سفارش (باکس):</label>
                      <input
                        type="number"
                        min="1"
                        value={formState.minOrderQtyBoxes || 1}
                        onChange={e => setFormState({ ...formState, minOrderQtyBoxes: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VOLUME DISCOUNT TIERS */}
              {activeFormTab === 'tiers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">پله‌های تخفیف تناژ (تخفیف بر اساس تعداد باکس)</h4>
                      <p className="text-[11px] text-slate-500">
                        مشتریانی که تعداد بالاتری باکس بخرند، به‌صورت خودکار نرخ ارزان‌تری دریافت خواهند کرد.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن پله تخفیف</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(formState.tiers || []).map((tier, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-slate-500">پله {idx + 1}:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">حداقل باکس:</span>
                            <input
                              type="number"
                              min="1"
                              value={tier.minQtyBoxes}
                              onChange={e => handleUpdateTier(idx, 'minQtyBoxes', Number(e.target.value))}
                              className="w-20 border border-slate-200 rounded-lg px-2 py-1 font-mono text-center bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">قیمت هر باکس:</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={tier.pricePerBox}
                              onChange={e => handleUpdateTier(idx, 'pricePerBox', Number(e.target.value))}
                              className="w-28 border border-slate-200 rounded-lg px-2 py-1 font-mono text-center bg-white"
                            />
                            <span className="text-slate-400 font-mono text-[10px]">
                              ({tier.pricePerBox.toLocaleString('fa-IR')} ت)
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="حذف پله"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {(!formState.tiers || formState.tiers.length === 0) && (
                      <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        هیچ پله تخفیفی ثبت نشده است. قیمت عمده عادی اعمال خواهد شد.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: STOCK */}
              {activeFormTab === 'stock' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">موجودی فیزیکی کل انبار (باکس):</label>
                      <input
                        type="number"
                        min="0"
                        value={formState.totalStock || 0}
                        onChange={e => setFormState({ ...formState, totalStock: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">ضایعات و کالای آسیب‌دیده (باکس):</label>
                      <input
                        type="number"
                        min="0"
                        value={formState.damagedStock || 0}
                        onChange={e => setFormState({ ...formState, damagedStock: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">شرایط نگهداری و ارسال بار:</label>
                    <input
                      type="text"
                      value={formState.deliveryConditions || ''}
                      onChange={e => setFormState({ ...formState, deliveryConditions: e.target.value })}
                      placeholder="در دمای محیط، دور از یخ‌زدگی یا آفتاب شدید"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Footer Save & Cancel Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isCreatingNew ? 'افزودن قطعی به فروشگاه' : 'ذخیره تغییرات محصول'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">تأیید حذف محصول از فروشگاه</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                آیا از حذف محصول «
                <strong className="text-slate-800">
                  {products.find(p => p.id === deletingProductId)?.name}
                </strong>
                » اطمینان دارید؟ با این کار این کالا از ویترین فروشگاه عمومی برداشته خواهد شد.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، حذف شود</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
