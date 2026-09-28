export type UserRole = 
  | 'admin'       // مدیر کل مجموعه
  | 'visitor'     // ویزیتور فروش
  | 'customer'    // مشتری B2B (سوپرمارکت، رستوران، ارگان)
  | 'warehouse'   // انباردار
  | 'delivery'    // مسئول ارسال و توزیع
  | 'accounting'  // حسابدار
  | 'public';     // بازدیدکننده عمومی

export type OrderStatus =
  | 'registered'          // ۱. ثبت سفارش
  | 'confirmed'           // ۲. تأیید سفارش
  | 'pending_inventory'   // ۳. در انتظار تأیید موجودی
  | 'warehouse_prep'      // ۴. آماده‌سازی در انبار
  | 'ready_to_ship'       // ۵. آماده ارسال
  | 'handed_to_driver'    // ۶. تحویل به راننده
  | 'shipped'             // ۷. ارسال شد (در مسیر)
  | 'delivered'           // ۸. تحویل مشتری شد
  | 'settled'             // ۹. تسویه شد
  | 'cancelled'           // ۱۰. لغو شد
  | 'returned';           // ۱۱. برگشت خورد

export interface PricingTier {
  minQtyBoxes: number;
  pricePerBox: number; // قیمت هر باکس بر حسب تومان
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  volume: string;              // مثلاً "۱.۵ لیتر" یا "۵۰۰ سی‌سی" یا "۱۹ لیتر"
  unitsPerBox: number;         // تعداد بطری در هر باکس (مثلاً ۶ یا ۱۲ یا ۲۴)
  basePricePerBox: number;     // قیمت پایه تک‌فروشی/عمده معمولی
  wholesalePricePerBox: number;// قیمت عمده استاندارد
  tiers: PricingTier[];        // قیمت پلکانی (مثلاً ۳۰ باکس: ۱۴۰ت، ۶۰ باکس: ۱۳۴ت، ۱۰۰ باکس: ۱۲۸ت)
  minOrderQtyBoxes: number;    // حداقل سفارش به باکس
  totalStock: number;          // موجودی کل انبار
  reservedStock: number;       // موجودی رزرو شده برای سفارشات در جریان
  damagedStock: number;        // کالای ضایعات/خراب
  image: string;
  description: string;
  features: string[];
  deliveryConditions: string;
  commissionPerBox: number;    // پورسانت ویزیتور به ازای هر باکس (مثلا ۵۰۰۰ تومان)
  isSpecialOffer?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  torobUrl?: string;
  emallsUrl?: string;
  basalamUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description?: string;
}

export interface Customer {
  id: string;               // e.g. CUS-000125
  storeName: string;        // نام فروشگاه / هایپرمارکت
  ownerName: string;        // نام صاحب فروشگاه
  phone: string;            // شماره تماس
  nationalId?: string;      // کد ملی / شناسه اقتصادی
  address: string;          // آدرس دقیق
  regionId: string;         // منطقه (شهریار، شهرقدس، ملارد، ...)
  coordinates: {
    lat: number;
    lng: number;
  };
  assignedVisitorId: string;// کد ویزیتور مسئول e.g. SAL-0001
  creditCeiling: number;    // سقف اعتبار به تومان
  currentBalance: number;   // مانده حساب (مثبت یعنی بدهکار به شرکت)
  lastOrderDate?: string;   // تاریخ آخرین خرید
  totalPurchases: number;   // مجموع خرید تا الان به تومان
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Visitor {
  id: string;                 // e.g. SAL-0001
  name: string;
  phone: string;
  email: string;
  assignedRegions: string[];  // مناطق تحت پوشش
  monthlyTarget: number;      // هدف فروش ماهانه به تومان
  currentMonthSales: number;  // فروش تحقق یافته این ماه
  todaySales: number;         // فروش امروز
  totalOrdersCount: number;   // تعداد سفارش‌های ثبت شده
  activeCustomersCount: number;// تعداد مشتریان فعال
  newCustomersCount: number;  // مشتریان جدید جذب شده
  totalCommissionEarned: number;// کل پورسانت دریافتی/محاسبه شده
  commissionPerBoxDefault: number; // پورسانت پیش‌فرض هر باکس
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  volume: string;
  unitsPerBox: number;
  quantityBoxes: number;
  unitPricePerBox: number;
  totalPrice: number;
  discountPerBox: number;
  finalPrice: number;
  commissionPerBox: number;
}

export interface Order {
  id: string;
  orderNumber: string;         // e.g. ORD-1403-0842
  customerId: string;          // e.g. CUS-000125
  customerName: string;
  customerCode: string;
  customerPhone: string;
  visitorId: string;           // e.g. SAL-0001
  visitorName: string;
  createdByType: 'customer' | 'visitor' | 'admin';
  items: OrderItem[];
  subtotal: number;
  tierDiscount: number;
  shippingCost: number;
  totalAmount: number;
  totalBoxes: number;
  totalVisitorCommission: number;
  paymentMethod: 'cash' | 'card' | 'online' | 'cheque' | 'credit';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
    byRole: string;
  }>;
  deliveryZone: string;
  deliveryAddress: string;
  driverId?: string;
  driverName?: string;
  notes?: string;
  createdAt: string;
  invoiceId: string;
}

export interface WarehouseTransaction {
  id: string;
  date: string;
  type: 'inbound' | 'outbound' | 'damaged' | 'returned' | 'reconciliation';
  productId: string;
  productName: string;
  quantityBoxes: number;
  referenceNo: string;
  recordedBy: string;
  notes?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  customerId: string;
  customerCode: string;
  type: 'invoice' | 'cash' | 'card' | 'online' | 'cheque' | 'return' | 'discount' | 'credit_adjust';
  title: string;
  debit: number;    // بدهکار (خرید / افزایش بدهی)
  credit: number;   // بستانکار (پرداخت / واریز)
  balance: number;  // مانده لحظه‌ای
  referenceId: string;
  chequeNumber?: string;
  chequeDueDate?: string;
  notes?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  shippingFee: number;
  freeShippingMinOrder: number; // حداقل مبلغ سفارش برای ارسال رایگان
  deliveryEstimate: string;     // مثلاً "همان روز یا حداکثر ۲۴ ساعت"
  active: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  activeOrders: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  role: string;
  userName: string;
  action: string;
  details: string;
}
