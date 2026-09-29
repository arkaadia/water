import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Award,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  Layers,
  Truck,
  Calendar,
  Wallet,
  Percent,
  Boxes,
  CreditCard,
  ArrowUpRight,
  ShieldAlert,
  ArrowDownRight,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminExecutiveDashboard: React.FC = () => {
  const {
    products,
    orders,
    customers,
    visitors,
    warehouseTransactions,
    deliveryZones
  } = useApp();

  // Time-range filter
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Filtered orders based on selected time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = new Date();
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (timeRange === 'today') return diffDays <= 1;
      if (timeRange === '7days') return diffDays <= 7;
      if (timeRange === '30days') return diffDays <= 30;
      return true;
    });
  }, [orders, timeRange]);

  // ==========================================
  // 1. SALES OVERVIEW & METRICS
  // ==========================================
  const totalGrossSales = filteredOrders.reduce((sum, o) => sum + (o.subtotal || o.totalAmount), 0);
  const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.tierDiscount || 0), 0);
  const totalNetSales = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBoxesSold = filteredOrders.reduce((sum, o) => sum + o.totalBoxes, 0);
  const orderCount = filteredOrders.length;
  const averageOrderValue = orderCount > 0 ? Math.round(totalNetSales / orderCount) : 0;
  const completedOrders = filteredOrders.filter(o => ['delivered', 'settled'].includes(o.status)).length;
  const deliverySuccessRate = orderCount > 0 ? Math.round((completedOrders / orderCount) * 100) : 0;

  // ==========================================
  // 2. PROFIT & LOSS ESTIMATION (P&L)
  // ==========================================
  // COGS is estimated at ~74% of base wholesale price
  const estimatedCOGS = Math.round(totalGrossSales * 0.74);
  const grossProfit = totalNetSales - estimatedCOGS;
  const totalCommissionsPaid = filteredOrders.reduce((sum, o) => sum + (o.totalVisitorCommission || 0), 0);
  const totalShippingCosts = filteredOrders.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
  // Estimated Net Operating Profit = Gross Profit - Commissions - Logistics - Volume Discounts
  const estimatedNetProfit = grossProfit - totalCommissionsPaid - (totalShippingCosts * 0.4);
  const grossProfitMargin = totalNetSales > 0 ? Math.round((grossProfit / totalNetSales) * 100) : 0;
  const netProfitMargin = totalNetSales > 0 ? Math.round((estimatedNetProfit / totalNetSales) * 100) : 0;

  // ==========================================
  // 3. WAREHOUSE & INVENTORY VALUATION
  // ==========================================
  const totalInventoryBoxes = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
  const reservedInventoryBoxes = products.reduce((sum, p) => sum + (p.reservedStock || 0), 0);
  const availableInventoryBoxes = Math.max(0, totalInventoryBoxes - reservedInventoryBoxes);
  const damagedInventoryBoxes = products.reduce((sum, p) => sum + (p.damagedStock || 0), 0);
  
  // Total Inventory Valuation (wholesale value)
  const totalInventoryAssetValue = products.reduce(
    (sum, p) => sum + (p.totalStock || 0) * (p.wholesalePricePerBox || p.basePricePerBox),
    0
  );

  // Critical Low Stock Products (< 100 boxes or totalStock <= reservedStock)
  const lowStockProducts = products.filter(
    p => (p.totalStock - (p.reservedStock || 0)) < 80 || p.totalStock < 100
  );

  // Total warehouse transactions analysis
  const inboundBoxes = warehouseTransactions
    .filter(t => t.type === 'inbound')
    .reduce((sum, t) => sum + t.quantityBoxes, 0);
  const outboundBoxes = warehouseTransactions
    .filter(t => t.type === 'outbound')
    .reduce((sum, t) => sum + t.quantityBoxes, 0);

  // ==========================================
  // 4. TOP VISITORS (RANKED LEADERBOARD)
  // ==========================================
  const rankedVisitors = useMemo(() => {
    return [...visitors]
      .map(v => {
        const vOrders = filteredOrders.filter(o => o.visitorId === v.id);
        const vSales = vOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const vBoxes = vOrders.reduce((sum, o) => sum + o.totalBoxes, 0);
        const vCommissions = vOrders.reduce((sum, o) => sum + (o.totalVisitorCommission || 0), 0);
        const targetPercent = v.monthlyTarget > 0 ? Math.round((vSales / v.monthlyTarget) * 100) : 0;
        return {
          ...v,
          periodSales: vSales,
          periodBoxes: vBoxes,
          periodOrdersCount: vOrders.length,
          periodCommissions: vCommissions,
          targetPercent
        };
      })
      .sort((a, b) => b.periodSales - a.periodSales);
  }, [visitors, filteredOrders]);

  const topVisitor = rankedVisitors[0];

  // ==========================================
  // 5. BEST SELLING PRODUCTS (TOP SKUS)
  // ==========================================
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { product: typeof products[0]; totalBoxesSold: number; totalRevenue: number }>();
    
    products.forEach(p => {
      map.set(p.id, { product: p, totalBoxesSold: 0, totalRevenue: 0 });
    });

    filteredOrders.forEach(o => {
      o.items?.forEach(item => {
        const entry = map.get(item.productId);
        if (entry) {
          entry.totalBoxesSold += item.quantityBoxes;
          entry.totalRevenue += item.finalPrice || (item.unitPricePerBox * item.quantityBoxes);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalBoxesSold - a.totalBoxesSold);
  }, [products, filteredOrders]);

  const topSellingProducts = productSalesMap.slice(0, 5);
  const maxProductBoxes = topSellingProducts[0]?.totalBoxesSold || 1;

  // ==========================================
  // 6. ACCOUNTS RECEIVABLE & DEBT ANALYSIS
  // ==========================================
  const totalReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + (c.creditCeiling || 0), 0);
  const creditUtilizationPercent = totalCreditLimit > 0 ? Math.round((totalReceivables / totalCreditLimit) * 100) : 0;
  
  // Top Debtors (مشتریان با بالاترین مانده بدهی دفتری)
  const topDebtors = useMemo(() => {
    return [...customers]
      .filter(c => c.currentBalance > 0)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5);
  }, [customers]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const counts = { cheque: 0, cash: 0, card: 0, online: 0, credit: 0 };
    const amounts = { cheque: 0, cash: 0, card: 0, online: 0, credit: 0 };
    filteredOrders.forEach(o => {
      const method = o.paymentMethod || 'cash';
      if (counts[method] !== undefined) {
        counts[method] += 1;
        amounts[method] += o.totalAmount;
      }
    });
    return { counts, amounts };
  }, [filteredOrders]);

  // ==========================================
  // 7. REGIONAL SALES BREAKDOWN
  // ==========================================
  const zoneSales = useMemo(() => {
    return deliveryZones.map(zone => {
      const zOrders = filteredOrders.filter(o => o.deliveryZone === zone.name);
      const sales = zOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const boxes = zOrders.reduce((sum, o) => sum + o.totalBoxes, 0);
      return {
        zone,
        sales,
        boxes,
        ordersCount: zOrders.length
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [deliveryZones, filteredOrders]);

  const maxZoneSales = zoneSales[0]?.sales || 1;

  return (
    <div className="space-y-6">
      {/* Filter and Top Navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            <span>داشبورد جامع هوش تجاری و تصمیم‌گیری کلان (BI Suite)</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>تحلیل یکپارچه مالی، زنجیره تامین، انبارداری و بازاریابی میدانی</span>
            <span aria-hidden="true">·</span>
            <span>به‌روزرسانی در لحظه</span>
          </div>
        </div>

        {/* Time-Range Segmented Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'today'
                ? 'bg-white text-rose-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            امروز
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '7days'
                ? 'bg-white text-rose-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ۷ روز اخیر
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === '30days'
                ? 'bg-white text-rose-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ۳۰ روز گذشته
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'all'
                ? 'bg-white text-rose-700 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            کل دوره مالی
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فروش خالص تحقق‌یافته</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalNetSales.toLocaleString('fa-IR')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>تومان</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-bold">{orderCount} فاکتور معتبر</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>تخفیف‌های پلکانی اعطایی:</span>
            <span className="font-mono font-bold text-rose-600">{totalDiscounts.toLocaleString('fa-IR')} ت</span>
          </div>
        </div>

        {/* Card 2: Estimated Net Profit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">سود ناخالص و عملیاتی</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-900 font-mono tracking-tight">
              {estimatedNetProfit.toLocaleString('fa-IR')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>تومان سود خالص</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-700 font-bold">مارجین: {netProfitMargin}٪</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>سود ناخالص فروشگاهی:</span>
            <span className="font-mono font-bold text-slate-800">{grossProfit.toLocaleString('fa-IR')} ت</span>
          </div>
        </div>

        {/* Card 3: Inventory Asset Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">موجودی و ارزش ریالی انبار</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalInventoryBoxes.toLocaleString('fa-IR')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>باکس در انبار مرکزی</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-700 font-bold">{availableInventoryBoxes.toLocaleString('fa-IR')} آزاد</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ارزش دارایی انبار:</span>
            <span className="font-mono font-bold text-slate-800">{Math.round(totalInventoryAssetValue / 1000000).toLocaleString('fa-IR')} م.ت</span>
          </div>
        </div>

        {/* Card 4: Accounts Receivable */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مطالبات و طلب‌های دفتری</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalReceivables.toLocaleString('fa-IR')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>تومان طلب از بازار</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 font-bold">{creditUtilizationPercent}٪ مصرف اعتبار</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>مشتریان بدهکار:</span>
            <span className="font-mono font-bold text-amber-700">{customers.filter(c => c.currentBalance > 0).length} فروشگاه</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: PROFIT & LOSS BREAKDOWN + INVENTORY HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Profit & Loss Waterfall / Financial Anatomy */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-cyan-600" />
                <span>ترازنامه سود و زیان عملیاتی و ساختار هزینه‌ها</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تفکیک بهای تمام شده، پورسانت ویزیتورها، تخفیفات و مانده سود عملیاتی
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              حاشیه سود خالص: {netProfitMargin}٪
            </span>
          </div>

          {/* Visual Stacked Bar Chart for Revenue Distribution */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>تسهیم گردش مالی کل ({totalGrossSales.toLocaleString('fa-IR')} تومان)</span>
              <span className="font-mono">۱۰۰٪</span>
            </div>
            <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.max(5, Math.min(80, (estimatedCOGS / totalGrossSales) * 100))}%` }}
                className="bg-slate-700 h-full transition-all duration-500"
                title={`بهای تمام شده کالا (COGS): ${estimatedCOGS.toLocaleString('fa-IR')} تومان`}
              />
              <div
                style={{ width: `${Math.max(3, Math.min(25, (totalCommissionsPaid / totalGrossSales) * 100))}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`پورسانت ویزیتورها: ${totalCommissionsPaid.toLocaleString('fa-IR')} تومان`}
              />
              <div
                style={{ width: `${Math.max(2, Math.min(15, (totalDiscounts / totalGrossSales) * 100))}%` }}
                className="bg-rose-400 h-full transition-all duration-500"
                title={`تخفیفات پلکانی حجم بالا: ${totalDiscounts.toLocaleString('fa-IR')} تومان`}
              />
              <div
                style={{ width: `${Math.max(5, (estimatedNetProfit / totalGrossSales) * 100)}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`سود خالص عملیاتی: ${estimatedNetProfit.toLocaleString('fa-IR')} تومان`}
              />
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 shrink-0" />
                <span>بهای تأمین کالا (۷۴٪)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
                <span>پورسانت ویزیتورها</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 shrink-0" />
                <span>تخفیفات تناژ بالا</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
                <span className="font-bold text-emerald-800">سود خالص شبکه</span>
              </div>
            </div>
          </div>

          {/* Detailed Financial Breakdown Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="p-3 bg-slate-50/70 flex justify-between items-center font-bold text-slate-800">
              <span>درآمد ناخالص حاصل از سفارشات (Gross Revenue)</span>
              <span className="font-mono text-sm">{totalGrossSales.toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-slate-600">
              <span>کسر می‌شود: تخفیفات پلکانی حجم بالا (Volume Tier Discounts)</span>
              <span className="font-mono font-bold text-rose-600">({totalDiscounts.toLocaleString('fa-IR')}) تومان</span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-slate-600">
              <span>کسر می‌شود: برآورد بهای خرید کارخانه (COGS)</span>
              <span className="font-mono font-bold text-slate-700">({estimatedCOGS.toLocaleString('fa-IR')}) تومان</span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-slate-600">
              <span>کسر می‌شود: کل پورسانت پرداختی به بازاریابان میدانی</span>
              <span className="font-mono font-bold text-amber-600">({totalCommissionsPaid.toLocaleString('fa-IR')}) تومان</span>
            </div>
            <div className="p-3 bg-emerald-50/60 flex justify-between items-center font-black text-emerald-900 border-t border-emerald-100">
              <span>سود خالص نهایی عملیاتی شرکت (Net Profit)</span>
              <span className="font-mono text-base text-emerald-700">{estimatedNetProfit.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>
        </div>

        {/* Right (1 col): Inventory Health & Critical Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>وضعیت پایش انبارداری و هشدارها</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {products.length} کالا
            </span>
          </div>

          {/* Inventory Breakdown Circles/Indicators */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <span className="text-slate-500 block text-[11px]">موجودی کل انبار:</span>
              <span className="text-base font-black text-blue-900 font-mono">
                {totalInventoryBoxes.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 mr-1">باکس</span>
            </div>

            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              <span className="text-slate-500 block text-[11px]">موجودی آزاد قابل سفارش:</span>
              <span className="text-base font-black text-emerald-800 font-mono">
                {availableInventoryBoxes.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 mr-1">باکس</span>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
              <span className="text-slate-500 block text-[11px]">رزرو در حال ارسال:</span>
              <span className="text-base font-black text-amber-800 font-mono">
                {reservedInventoryBoxes.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 mr-1">باکس</span>
            </div>

            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              <span className="text-slate-500 block text-[11px]">ضایعات و آسیب‌دیده:</span>
              <span className="text-base font-black text-rose-800 font-mono">
                {damagedInventoryBoxes.toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-500 mr-1">باکس</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>کالاهای نزدیک به خط قرمز سفارش مجدد:</span>
              </span>
              <span className="text-[11px] font-mono text-amber-700">({lowStockProducts.length})</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تمامی اقلام موجودی کافی و امن در انبار دارند.</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between"
                  >
                    <div className="truncate pl-2">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                    </div>
                    <div className="text-left shrink-0 font-mono">
                      <div className="font-bold text-rose-600 text-xs">{p.totalStock} باکس</div>
                      <div className="text-[10px] text-slate-500">رزرو: {p.reservedStock}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: TOP VISITORS LEADERBOARD & BEST-SELLING PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-amber-500" />
                <span>رتبه‌بندی و لیدربورد ویزیتورهای برتر فروش (Top Performers)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ارزیابی عملکرد بر اساس حجم ریالی فروش، درصد تحقق تارگت ماهانه و پورسانت
              </p>
            </div>
          </div>

          {/* Top 1 Badge Showcase if exists */}
          {topVisitor && (
            <div className="bg-gradient-to-l from-amber-500/10 via-amber-50/50 to-white rounded-xl p-3.5 border border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  🥇
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-slate-900">{topVisitor.name}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      ویزیتور طلایی دوره
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{topVisitor.assignedRegions.join('، ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topVisitor.periodOrdersCount} سفارش موفق</span>
                  </div>
                </div>
              </div>

              <div className="text-left font-mono">
                <div className="text-sm font-black text-slate-900">
                  {topVisitor.periodSales.toLocaleString('fa-IR')} <span className="text-[10px] font-sans">تومان</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold">
                  تحقق: {topVisitor.targetPercent}٪ از تارگت
                </div>
              </div>
            </div>
          )}

          {/* Full Visitors List */}
          <div className="space-y-3">
            {rankedVisitors.map((v, index) => {
              const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
              return (
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-mono font-bold text-slate-700 text-sm">
                        {rankIcon}
                      </span>
                      <div>
                        <strong className="text-slate-900 font-bold">{v.name}</strong>
                        <span className="text-slate-400 font-mono text-[11px] mr-1.5">({v.id})</span>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="font-black text-slate-900 text-xs">
                        {v.periodSales.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {v.periodBoxes.toLocaleString('fa-IR')} باکس · {v.periodOrdersCount} فاکتور
                      </span>
                    </div>
                  </div>

                  {/* Progress bar towards monthly target */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>تارگت ماهانه: {v.monthlyTarget.toLocaleString('fa-IR')} تومان</span>
                      <span className="font-bold text-slate-700">{v.targetPercent}٪ تحقق</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          v.targetPercent >= 100
                            ? 'bg-emerald-500'
                            : v.targetPercent >= 70
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, v.targetPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                    <span>پورسانت محاسبه‌شده: <strong className="text-amber-800 font-mono">{v.periodCommissions.toLocaleString('fa-IR')} ت</strong></span>
                    <span>مشتریان فعال: <strong className="text-slate-800 font-mono">{v.activeCustomersCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best-Selling Products (Top SKUs) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-cyan-600" />
                <span>پرفروش‌ترین محصولات و کالاهای لیدر (Top Selling SKUs)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                بیشترین تناژ و ارزش فروش به تفکیک بطری و باکس
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-bold">
              {totalBoxesSold.toLocaleString('fa-IR')} کل باکس فروخته‌شده
            </span>
          </div>

          <div className="space-y-3">
            {topSellingProducts.map(({ product, totalBoxesSold: pBoxes, totalRevenue: pRevenue }, idx) => {
              const volumeShare = totalBoxesSold > 0 ? Math.round((pBoxes / totalBoxesSold) * 100) : 0;
              const barWidth = Math.max(5, Math.round((pBoxes / maxProductBoxes) * 100));

              return (
                <div key={product.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 text-center font-mono font-bold text-slate-400">
                        {idx + 1}.
                      </span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{product.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{product.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{product.volume}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0 font-mono">
                      <div className="font-black text-slate-900 text-xs">
                        {pBoxes.toLocaleString('fa-IR')} باکس
                      </div>
                      <div className="text-[11px] text-cyan-800 font-bold">
                        {pRevenue.toLocaleString('fa-IR')} ت
                      </div>
                    </div>
                  </div>

                  {/* Volume Share Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>سهم از کل حجم فروش:</span>
                      <span className="font-bold text-slate-600 font-mono">{volumeShare}٪</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regional Sales Mini-Bar */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-600" />
                <span>سهم مناطق توزیع از فروش:</span>
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              {zoneSales.slice(0, 4).map(({ zone, sales, ordersCount }) => {
                const zonePct = totalNetSales > 0 ? Math.round((sales / totalNetSales) * 100) : 0;
                return (
                  <div key={zone.id} className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="w-24 truncate font-medium text-slate-900">{zone.name}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round((sales / maxZoneSales) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-800 font-bold w-20 text-left">
                      {sales.toLocaleString('fa-IR')} ت ({zonePct}٪)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: DEBTORS, RECEIVABLES & PAYMENT METHODS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Top Debtors & Credit Risk Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                <span>بزرگ‌ترین مشتریان بدهکار و ریسک اعتباری (Accounts Receivable Risk)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                پایش مانده حساب‌های دفتری نسبت به سقف اعتبار و ویزیتور مسئول وصول
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
              کل مطالبات: {totalReceivables.toLocaleString('fa-IR')} تومان
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="p-3">کد مشتری</th>
                  <th className="p-3">نام فروشگاه و مالک</th>
                  <th className="p-3 text-left">مانده بدهی جاری</th>
                  <th className="p-3 text-left">سقف اعتبار مصوب</th>
                  <th className="p-3 text-center">میزان مصرف سقف</th>
                  <th className="p-3">ویزیتور مسئول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {topDebtors.map(cus => {
                  const utilization = cus.creditCeiling > 0
                    ? Math.round((cus.currentBalance / cus.creditCeiling) * 100)
                    : 100;
                  const isCritical = utilization >= 85;

                  return (
                    <tr key={cus.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">{cus.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{cus.storeName}</div>
                        <div className="text-[10px] text-slate-400">{cus.ownerName} · {cus.address.slice(0, 24)}...</div>
                      </td>
                      <td className="p-3 text-left font-mono font-bold text-rose-600">
                        {cus.currentBalance.toLocaleString('fa-IR')} ت
                      </td>
                      <td className="p-3 text-left font-mono text-slate-600">
                        {cus.creditCeiling.toLocaleString('fa-IR')} ت
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isCritical ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {utilization}٪
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {cus.assignedVisitorId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Payment Methods & Collections Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4.5 h-4.5 text-purple-600" />
              <span>ترکیب روش‌های تسویه و پرداخت</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              سهم پرداخت نقدی، پوز راننده، چک و اعتباری
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  نقدی
                </div>
                <div>
                  <div className="font-bold text-slate-900">نقد هنگام تحویل</div>
                  <div className="text-[10px] text-slate-400">{paymentBreakdown.counts.cash} فاکتور</div>
                </div>
              </div>
              <div className="text-left font-mono font-bold text-slate-900">
                {paymentBreakdown.amounts.cash.toLocaleString('fa-IR')} ت
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  پوز
                </div>
                <div>
                  <div className="font-bold text-slate-900">دستگاه کارتخوان سیار</div>
                  <div className="text-[10px] text-slate-400">{paymentBreakdown.counts.card} فاکتور</div>
                </div>
              </div>
              <div className="text-left font-mono font-bold text-slate-900">
                {paymentBreakdown.amounts.card.toLocaleString('fa-IR')} ت
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  چک
                </div>
                <div>
                  <div className="font-bold text-slate-900">چک صیادی معتبر</div>
                  <div className="text-[10px] text-slate-400">{paymentBreakdown.counts.cheque} فاکتور</div>
                </div>
              </div>
              <div className="text-left font-mono font-bold text-slate-900">
                {paymentBreakdown.amounts.cheque.toLocaleString('fa-IR')} ت
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  دفتری
                </div>
                <div>
                  <div className="font-bold text-slate-900">اعتباری / نسیه ۳۰ روزه</div>
                  <div className="text-[10px] text-slate-400">{paymentBreakdown.counts.credit} فاکتور</div>
                </div>
              </div>
              <div className="text-left font-mono font-bold text-slate-900">
                {paymentBreakdown.amounts.credit.toLocaleString('fa-IR')} ت
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
