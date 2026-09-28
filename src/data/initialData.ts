import { Category, Customer, DeliveryZone, Driver, Order, Product, Visitor, WarehouseTransaction, CustomerLedgerEntry, AuditLog } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'water', name: 'آب آشامیدنی و معدنی', slug: 'drinking-water', iconName: 'Droplets', description: 'انواع آب‌های ۱.۵ لیتری، کوچک، کتابی و گالنی' },
  { id: 'soda', name: 'نوشابه و گازدار', slug: 'soda-carbonated', iconName: 'Sparkles', description: 'انواع نوشابه قوطی، ۱.۵ لیتری و شیشه‌ای' },
  { id: 'dough', name: 'دوغ سنتی و صنعتی', slug: 'dough-yogurt-drink', iconName: 'Milk', description: 'دوغ نعناعی، محلی و گازدار' },
  { id: 'juice', name: 'آبمیوه و اسموتی', slug: 'fruit-juice', iconName: 'Citrus', description: 'آبمیوه پاکتی، شیشه‌ای و نکتار طبیعی' },
  { id: 'energy', name: 'انرژی‌درینک و ورزشی', slug: 'energy-drink', iconName: 'Zap', description: 'نوشیدنی‌های انرژی‌زا خارجی و داخلی' },
  { id: 'snacks', name: 'کیک، کلوچه و تنقلات', slug: 'cakes-snacks', iconName: 'Cookie', description: 'کیک، بیسکویت، شکلات و تنقلات سوپرمارکتی' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'WTR-GDZ-15L',
    name: 'آب آشامیدنی گودیز ۱.۵ لیتری (باکس ۶ عددی)',
    brand: 'گودیز (Goodys)',
    categoryId: 'water',
    volume: '۱.۵ لیتر',
    unitsPerBox: 6,
    basePricePerBox: 155000,
    wholesalePricePerBox: 145000,
    tiers: [
      { minQtyBoxes: 30, pricePerBox: 140000 },
      { minQtyBoxes: 60, pricePerBox: 134000 },
      { minQtyBoxes: 100, pricePerBox: 128000 }
    ],
    minOrderQtyBoxes: 10,
    totalStock: 850,
    reservedStock: 120,
    damagedStock: 4,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
    description: 'آب خالص و فرآوری شده گودیز با بالاترین استاندارد بهداشتی، بسته‌بندی مقاوم، مناسب فروشگاه‌ها و رستوران‌ها.',
    features: ['حجم ۱.۵ لیتر', 'بسته بندی ۶ عددی محکم', 'TDS استاندارد زیر ۱۲۰', 'تاریخ تولید به‌روز (حداکثر ۱ هفته)'],
    deliveryConditions: 'ارسال با ماشین مسقف در سریع‌ترین زمان در محدوده پخش',
    commissionPerBox: 5000,
    isBestSeller: true,
    torobUrl: 'https://torob.com/p/goodys-15l-box/',
    emallsUrl: 'https://emalls.ir/p/goodys-15l/'
  },
  {
    id: 'prod-2',
    sku: 'WTR-DMV-05L',
    name: 'آب معدنی طبیعی دماوند ۵۰۰ سی‌سی (باکس ۱۲ عددی)',
    brand: 'دماوند (Damavand)',
    categoryId: 'water',
    volume: '۵۰۰ سی‌سی',
    unitsPerBox: 12,
    basePricePerBox: 130000,
    wholesalePricePerBox: 120000,
    tiers: [
      { minQtyBoxes: 25, pricePerBox: 115000 },
      { minQtyBoxes: 50, pricePerBox: 110000 },
      { minQtyBoxes: 100, pricePerBox: 104000 }
    ],
    minOrderQtyBoxes: 10,
    totalStock: 1200,
    reservedStock: 180,
    damagedStock: 6,
    image: 'https://images.unsplash.com/photo-1559839914-1b34645a380e?auto=format&fit=crop&w=600&q=80',
    description: 'آب معدنی طبیعی سرچشمه دماوند، پرطرفدارترین بطری کوچک تک‌نفره برای سوپرمارکت‌ها، همایش‌ها و فست‌فودها.',
    features: ['حجم نیم لیتری', 'باکس ۱۲ عددی شرینک شده', 'سرشار از املاح مفید', 'کیفیت بطری مرغوب بدون نشتی'],
    deliveryConditions: 'امکان سفارش روزانه و توزیع طبق برنامه ویزیتور',
    commissionPerBox: 4500,
    isBestSeller: true,
    isSpecialOffer: true
  },
  {
    id: 'prod-3',
    sku: 'WTR-VTA-19L',
    name: 'آب معدنی گالنی ۱۹ لیتری واتا (ویژه آبسردکن)',
    brand: 'واتا (Vata)',
    categoryId: 'water',
    volume: '۱۹ لیتر',
    unitsPerBox: 1,
    basePricePerBox: 110000,
    wholesalePricePerBox: 98000,
    tiers: [
      { minQtyBoxes: 10, pricePerBox: 92000 },
      { minQtyBoxes: 30, pricePerBox: 86000 },
      { minQtyBoxes: 50, pricePerBox: 80000 }
    ],
    minOrderQtyBoxes: 5,
    totalStock: 340,
    reservedStock: 45,
    damagedStock: 2,
    image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=600&q=80',
    description: 'گالن استاندارد ۱۹ لیتری بهداشتی پلمپ‌شده چشمه گرگر سبلان مخصوص شرکت‌ها، ارگان‌ها و فروشگاه‌ها.',
    features: ['گالن بهداشتی بدون BPA', 'مناسب تمام آبسردکن‌ها', 'خالص و بدون بو و مزه', 'امکان تحویل تعویض گالن'],
    deliveryConditions: 'تحویل درب انبار یا تحویل طبقاتی با هماهنگی راننده',
    commissionPerBox: 6000
  },
  {
    id: 'prod-4',
    sku: 'SOD-ZAM-CAN',
    name: 'نوشابه قوطی کولا ۳۳۰ سی‌سی زمزم (باکس ۲۴ عددی)',
    brand: 'زمزم (Zamzam)',
    categoryId: 'soda',
    volume: '۳۳۰ سی‌سی',
    unitsPerBox: 24,
    basePricePerBox: 380000,
    wholesalePricePerBox: 350000,
    tiers: [
      { minQtyBoxes: 20, pricePerBox: 340000 },
      { minQtyBoxes: 50, pricePerBox: 328000 },
      { minQtyBoxes: 100, pricePerBox: 315000 }
    ],
    minOrderQtyBoxes: 5,
    totalStock: 620,
    reservedStock: 90,
    damagedStock: 3,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    description: 'نوشابه قوطی گازدار زمزم با طعم اصیل کولا، فروش بالا در رستوران‌ها، فست‌فودها و سوپرمارکت‌ها.',
    features: ['قوطی آسان‌بازشو', 'باکس ۲۴ تایی اقتصادی', 'گاز استاندارد و طعم عالی', 'حاشیه سود بالا برای فروشنده'],
    deliveryConditions: 'توزیع همراه با نوشیدنی‌های خنک یا انبار',
    commissionPerBox: 8000,
    isBestSeller: true
  },
  {
    id: 'prod-5',
    sku: 'DGH-ALI-15L',
    name: 'دوغ بدون گاز نعناعی سنتی عالیس ۱.۵ لیتری (باکس ۶ عددی)',
    brand: 'عالیس (Alis)',
    categoryId: 'dough',
    volume: '۱.۵ لیتر',
    unitsPerBox: 6,
    basePricePerBox: 175000,
    wholesalePricePerBox: 162000,
    tiers: [
      { minQtyBoxes: 20, pricePerBox: 156000 },
      { minQtyBoxes: 50, pricePerBox: 150000 },
      { minQtyBoxes: 80, pricePerBox: 144000 }
    ],
    minOrderQtyBoxes: 6,
    totalStock: 480,
    reservedStock: 60,
    damagedStock: 2,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
    description: 'دوغ خوش‌عطر نعناعی با ماست طبیعی و فرآوری بهداشتی، بدون مواد نگهدارنده مضر.',
    features: ['طعم نعناع طبیعی کوهی', 'باکس ۶ عددی پرفروش', 'ماندگاری مناسب در شرایط دمایی فروشگاه', 'مصرف خانگی و رستورانی'],
    deliveryConditions: 'ارسال با ماشین دارای پوشش عایق دمایی',
    commissionPerBox: 5500
  },
  {
    id: 'prod-6',
    sku: 'JUC-SUN-1L',
    name: 'نکتار پرتقال و پالپ ۱ لیتری سن‌ایچ (باکس ۱۲ عددی)',
    brand: 'سن‌ایچ (Sunich)',
    categoryId: 'juice',
    volume: '۱ لیتر',
    unitsPerBox: 12,
    basePricePerBox: 460000,
    wholesalePricePerBox: 420000,
    tiers: [
      { minQtyBoxes: 15, pricePerBox: 405000 },
      { minQtyBoxes: 40, pricePerBox: 395000 },
      { minQtyBoxes: 80, pricePerBox: 380000 }
    ],
    minOrderQtyBoxes: 5,
    totalStock: 390,
    reservedStock: 50,
    damagedStock: 1,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
    description: 'نکتار طبیعی پرتقال دارای پالپ با کیفیت درجه یک سن‌ایچ، برند اول آبمیوه در ایران.',
    features: ['حاوی پالپ طبیعی میوه', 'بسته‌بندی تتراپک مقاوم', 'دارای ویتامین C', 'باکس ۱۲ عددی'],
    deliveryConditions: 'ارسال ایمن و ضد ضربه',
    commissionPerBox: 10000,
    isSpecialOffer: true
  },
  {
    id: 'prod-7',
    sku: 'ENG-HYP-CAN',
    name: 'نوشیدنی انرژی‌زا هایپ اورجینال ۲۵۰ سی‌سی (باکس ۲۴ عددی)',
    brand: 'هایپ (Hype Energy)',
    categoryId: 'energy',
    volume: '۲۵۰ سی‌سی',
    unitsPerBox: 24,
    basePricePerBox: 1280000,
    wholesalePricePerBox: 1190000,
    tiers: [
      { minQtyBoxes: 10, pricePerBox: 1150000 },
      { minQtyBoxes: 25, pricePerBox: 1110000 },
      { minQtyBoxes: 50, pricePerBox: 1070000 }
    ],
    minOrderQtyBoxes: 3,
    totalStock: 280,
    reservedStock: 35,
    damagedStock: 0,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    description: 'انرژی‌زا اورجینال هایپ با کافئین و تائورین، دارای بچ‌کد اصالت و هولوگرام مجاز.',
    features: ['انرژی‌زای وارداتی درجه یک', 'باکس ۲۴ تایی شرینک اصل', 'فروش تضمینی در هایپرمارکت‌ها', 'حاشیه سود چشمگیر'],
    deliveryConditions: 'تحویل فوق سریع در مناطق تحت پوشش',
    commissionPerBox: 25000,
    isNewArrival: true
  },
  {
    id: 'prod-8',
    sku: 'SNK-CHOC-CK',
    name: 'کیک صبحانه دوقلو مغزدار کره‌ای (باکس ۳۶ عددی)',
    brand: 'نظری (Nazari)',
    categoryId: 'snacks',
    volume: '۷۵ گرم',
    unitsPerBox: 36,
    basePricePerBox: 320000,
    wholesalePricePerBox: 295000,
    tiers: [
      { minQtyBoxes: 15, pricePerBox: 285000 },
      { minQtyBoxes: 40, pricePerBox: 275000 },
      { minQtyBoxes: 80, pricePerBox: 262000 }
    ],
    minOrderQtyBoxes: 5,
    totalStock: 510,
    reservedStock: 40,
    damagedStock: 2,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    description: 'کیک دوقلو کره‌ای تازه مناسب بوفه مدارس، دانشگاه‌ها، بیمارستان‌ها و سوپرمارکت‌های محلی.',
    features: ['تاریخ مصرف ۴ ماهه', 'بسته‌بندی سلفونی با طرح جذاب', 'باکس ۳۶ تایی خوش‌قیمت', 'حاشیه سود خرده‌فروشی عالی'],
    deliveryConditions: 'توزیع همزمان با بار نوشیدنی',
    commissionPerBox: 7000
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'SAL-0001',
    name: 'علی کریمی',
    phone: '09121112233',
    email: 'ali.karimi@gowarano.ir',
    assignedRegions: ['شهریار', 'سرآسیاب', 'مارلیک'],
    monthlyTarget: 180000000,
    currentMonthSales: 142500000,
    todaySales: 14600000,
    totalOrdersCount: 68,
    activeCustomersCount: 34,
    newCustomersCount: 6,
    totalCommissionEarned: 4850000,
    commissionPerBoxDefault: 5000
  },
  {
    id: 'SAL-0002',
    name: 'رضا مرادی',
    phone: '09123334455',
    email: 'reza.moradi@gowarano.ir',
    assignedRegions: ['شهرقدس', 'ملارد', 'رباط کریم'],
    monthlyTarget: 160000000,
    currentMonthSales: 118000000,
    todaySales: 8900000,
    totalOrdersCount: 52,
    activeCustomersCount: 28,
    newCustomersCount: 4,
    totalCommissionEarned: 3720000,
    commissionPerBoxDefault: 5000
  },
  {
    id: 'SAL-0003',
    name: 'حسین احمدی',
    phone: '09125556677',
    email: 'hossein.ahmadi@gowarano.ir',
    assignedRegions: ['تهرانسر', 'چیتگر', 'میدان آزادی'],
    monthlyTarget: 220000000,
    currentMonthSales: 195000000,
    todaySales: 21300000,
    totalOrdersCount: 89,
    activeCustomersCount: 42,
    newCustomersCount: 9,
    totalCommissionEarned: 6420000,
    commissionPerBoxDefault: 5500
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUS-000125',
    storeName: 'هایپرمارکت ستاره شهر (شهریار)',
    ownerName: 'محمدرضا رضایی',
    phone: '09129876543',
    nationalId: '0019842511',
    address: 'شهریار، میدان فرمانداری، بلوار انقلاب، جنب بانک تجارت پلاک ۴۵',
    regionId: 'shahriar',
    coordinates: { lat: 35.6582, lng: 51.0588 },
    assignedVisitorId: 'SAL-0001',
    creditCeiling: 25000000,
    currentBalance: 2200000, // بدهی ۲,۲۰۰,۰۰۰ تومان مطابق مثال صفحه ۱۲ بریف
    lastOrderDate: '۱۴۰۳/۰۷/۱۵',
    totalPurchases: 42000000,
    status: 'active',
    createdAt: '۱۴۰۲/۱۱/۱۰'
  },
  {
    id: 'CUS-000126',
    storeName: 'سوپرمارکت میلاد (شهرقدس)',
    ownerName: 'کامران بهرامی',
    phone: '09351234567',
    nationalId: '0047812954',
    address: 'شهرقدس، بلوار مصلی، نبش شقایق چهارم',
    regionId: 'shahr-e-qods',
    coordinates: { lat: 35.7153, lng: 51.1098 },
    assignedVisitorId: 'SAL-0002',
    creditCeiling: 15000000,
    currentBalance: 0,
    lastOrderDate: '۱۴۰۳/۰۷/۱۲',
    totalPurchases: 28500000,
    status: 'active',
    createdAt: '۱۴۰۳/۰۱/۱۵'
  },
  {
    id: 'CUS-000127',
    storeName: 'مینی‌مارکت دریاچه (چیتگر)',
    ownerName: 'مهرداد صادقی',
    phone: '09197778899',
    nationalId: '0078124987',
    address: 'تهران، منطقه ۲۲، شمال دریاچه چیتگر، مجتمع تجاری خلیج فارس، واحد ۱۲',
    regionId: 'chitgar',
    coordinates: { lat: 35.7483, lng: 51.2185 },
    assignedVisitorId: 'SAL-0003',
    creditCeiling: 30000000,
    currentBalance: 5800000,
    lastOrderDate: '۱۴۰۳/۰۷/۱۶',
    totalPurchases: 64000000,
    status: 'active',
    createdAt: '۱۴۰۲/۰۸/۰۵'
  },
  {
    id: 'CUS-000128',
    storeName: 'پروتئینی و فروشگاه البرز (ملارد)',
    ownerName: 'اصغر کرمی',
    phone: '09124443322',
    nationalId: '0065412890',
    address: 'ملارد، بلوار اصلی، بعد از چهارراه دخانیات',
    regionId: 'malard',
    coordinates: { lat: 35.6672, lng: 50.9854 },
    assignedVisitorId: 'SAL-0002',
    creditCeiling: 10000000,
    currentBalance: 1400000,
    lastOrderDate: '۱۴۰۳/۰۷/۰۸',
    totalPurchases: 19200000,
    status: 'active',
    createdAt: '۱۴۰۳/۰۳/۲۰'
  },
  {
    id: 'CUS-000129',
    storeName: 'رستوران سنتی و شاندیز تهرانسر',
    ownerName: 'حامد شریفی',
    phone: '09126665544',
    nationalId: '0089123765',
    address: 'تهرانسر، بلوار شاهد شرقی، نبش لاله پنجم',
    regionId: 'tehransar',
    coordinates: { lat: 35.6987, lng: 51.2589 },
    assignedVisitorId: 'SAL-0003',
    creditCeiling: 40000000,
    currentBalance: 0,
    lastOrderDate: '۱۴۰۳/۰۷/۱۷',
    totalPurchases: 92000000,
    status: 'active',
    createdAt: '۱۴۰۲/۰۵/۱۱'
  }
];

export const INITIAL_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'shahriar', name: 'شهریار', shippingFee: 0, freeShippingMinOrder: 2000000, deliveryEstimate: 'تحویل روزانه (صبح و عصر)', active: true },
  { id: 'shahr-e-qods', name: 'شهرقدس', shippingFee: 50000, freeShippingMinOrder: 2500000, deliveryEstimate: 'حداکثر ۲۴ ساعت کاری', active: true },
  { id: 'malard', name: 'ملارد', shippingFee: 60000, freeShippingMinOrder: 2500000, deliveryEstimate: 'تحویل روزانه', active: true },
  { id: 'sarasiab', name: 'سرآسیاب', shippingFee: 60000, freeShippingMinOrder: 2500000, deliveryEstimate: 'روزهای زوج و فرد', active: true },
  { id: 'marlik', name: 'مارلیک', shippingFee: 50000, freeShippingMinOrder: 2000000, deliveryEstimate: 'تحویل روزانه', active: true },
  { id: 'robat-karim', name: 'رباط کریم', shippingFee: 80000, freeShippingMinOrder: 3000000, deliveryEstimate: 'روزهای دوشنبه و پنج‌شنبه', active: true },
  { id: 'tehransar', name: 'تهرانسر', shippingFee: 0, freeShippingMinOrder: 2000000, deliveryEstimate: 'تحویل فوق سریع در همان روز', active: true },
  { id: 'chitgar', name: 'چیتگر', shippingFee: 0, freeShippingMinOrder: 2000000, deliveryEstimate: 'تحویل روزانه صبح', active: true },
  { id: 'meydan-azadi', name: 'میدان آزادی', shippingFee: 70000, freeShippingMinOrder: 2500000, deliveryEstimate: 'تحویل روزانه عصر', active: true }
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'DRV-1', name: 'حمید جهانبخشی', phone: '09121010101', vehicle: 'کامیونت ایسوزو ۵ تن (مسقف)', plate: '۲۲ ج ۳۴۱ ایران ۲۱', activeOrders: 3 },
  { id: 'DRV-2', name: 'مجید اکبری', phone: '09122020202', vehicle: 'وانت نیسان اتاق‌دار', plate: '۴۴ ب ۸۹۲ ایران ۶۸', activeOrders: 2 },
  { id: 'DRV-3', name: 'مرتضی قربانی', phone: '09123030303', vehicle: 'وانت پراید باربند دار (سفارش‌های فوری)', plate: '۷۷ د ۱۱۸ ایران ۱۰', activeOrders: 1 }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-1403-0841',
    customerId: 'CUS-000125',
    customerName: 'هایپرمارکت ستاره شهر (شهریار)',
    customerCode: 'CUS-000125',
    customerPhone: '09129876543',
    visitorId: 'SAL-0001',
    visitorName: 'علی کریمی',
    createdByType: 'customer',
    items: [
      {
        productId: 'prod-1',
        productName: 'آب آشامیدنی گودیز ۱.۵ لیتری (باکس ۶ عددی)',
        brand: 'گودیز (Goodys)',
        volume: '۱.۵ لیتر',
        unitsPerBox: 6,
        quantityBoxes: 30, // ۳۰ باکس = قیمت پلکانی ۱۴۰,۰۰۰ تومان
        unitPricePerBox: 140000,
        totalPrice: 4200000,
        discountPerBox: 15000,
        finalPrice: 4200000,
        commissionPerBox: 5000
      }
    ],
    subtotal: 4200000,
    tierDiscount: 450000,
    shippingCost: 0,
    totalAmount: 4200000,
    totalBoxes: 30,
    totalVisitorCommission: 150000, // ۳۰ * ۵۰۰۰ = ۱۵۰,۰۰۰ تومان مطابق مثال صفحه ۱۳ بریف
    paymentMethod: 'card',
    paymentStatus: 'partial',
    paidAmount: 2000000, // پرداخت ۲ میلیون، مانده ۲.۲ میلیون تومان مطابق مثال صفحه ۱۲ بریف
    status: 'delivered',
    statusHistory: [
      { status: 'registered', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۰:۱۵', byRole: 'مشتری (خودکار)' },
      { status: 'confirmed', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۰:۳۰', byRole: 'سیستم / ویزیتور' },
      { status: 'warehouse_prep', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۱:۲۰', byRole: 'انباردار' },
      { status: 'ready_to_ship', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۲:۰۰', byRole: 'انباردار' },
      { status: 'handed_to_driver', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۲:۴۵', byRole: 'مسئول ارسال' },
      { status: 'delivered', timestamp: '۱۴۰۳/۰۷/۱۵ ۱۵:۳۰', byRole: 'راننده / مسئول ارسال' }
    ],
    deliveryZone: 'شهریار',
    deliveryAddress: 'شهریار، میدان فرمانداری، بلوار انقلاب، جنب بانک تجارت پلاک ۴۵',
    driverId: 'DRV-1',
    driverName: 'حمید جهانبخشی',
    createdAt: '۱۴۰۳/۰۷/۱۵ ۱۰:۱۵',
    invoiceId: 'INV-1403-1001'
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-1403-0842',
    customerId: 'CUS-000127',
    customerName: 'مینی‌مارکت دریاچه (چیتگر)',
    customerCode: 'CUS-000127',
    customerPhone: '09197778899',
    visitorId: 'SAL-0003',
    visitorName: 'حسین احمدی',
    createdByType: 'visitor',
    items: [
      {
        productId: 'prod-2',
        productName: 'آب معدنی طبیعی دماوند ۵۰۰ سی‌سی (باکس ۱۲ عددی)',
        brand: 'دماوند (Damavand)',
        volume: '۵۰۰ سی‌سی',
        unitsPerBox: 12,
        quantityBoxes: 50,
        unitPricePerBox: 110000,
        totalPrice: 5500000,
        discountPerBox: 10000,
        finalPrice: 5500000,
        commissionPerBox: 4500
      },
      {
        productId: 'prod-4',
        productName: 'نوشابه قوطی کولا ۳۳۰ سی‌سی زمزم (باکس ۲۴ عددی)',
        brand: 'زمزم (Zamzam)',
        volume: '۳۳۰ سی‌سی',
        unitsPerBox: 24,
        quantityBoxes: 20,
        unitPricePerBox: 340000,
        totalPrice: 6800000,
        discountPerBox: 10000,
        finalPrice: 6800000,
        commissionPerBox: 8000
      }
    ],
    subtotal: 12300000,
    tierDiscount: 700000,
    shippingCost: 0,
    totalAmount: 12300000,
    totalBoxes: 70,
    totalVisitorCommission: 385000,
    paymentMethod: 'cheque',
    paymentStatus: 'paid',
    paidAmount: 12300000,
    status: 'shipped',
    statusHistory: [
      { status: 'registered', timestamp: '۱۴۰۳/۰۷/۱۶ ۰۹:۰۰', byRole: 'ویزیتور حسین احمدی' },
      { status: 'confirmed', timestamp: '۱۴۰۳/۰۷/۱۶ ۰۹:۱۵', byRole: 'مدیر فروش' },
      { status: 'warehouse_prep', timestamp: '۱۴۰۳/۰۷/۱۶ ۰۹:۴۵', byRole: 'انبار مرکزی' },
      { status: 'ready_to_ship', timestamp: '۱۴۰۳/۰۷/۱۶ ۱۰:۳۰', byRole: 'انبار مرکزی' },
      { status: 'handed_to_driver', timestamp: '۱۴۰۳/۰۷/۱۶ ۱۱:۰۰', byRole: 'واحد توزیع' },
      { status: 'shipped', timestamp: '۱۴۰۳/۰۷/۱۶ ۱۱:۱۵', byRole: 'راننده مجید اکبری' }
    ],
    deliveryZone: 'چیتگر',
    deliveryAddress: 'تهران، منطقه ۲۲، شمال دریاچه چیتگر، مجتمع تجاری خلیج فارس، واحد ۱۲',
    driverId: 'DRV-2',
    driverName: 'مجید اکبری',
    createdAt: '۱۴۰۳/۰۷/۱۶ ۰۹:۰۰',
    invoiceId: 'INV-1403-1002'
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-1403-0843',
    customerId: 'CUS-000126',
    customerName: 'سوپرمارکت میلاد (شهرقدس)',
    customerCode: 'CUS-000126',
    customerPhone: '09351234567',
    visitorId: 'SAL-0002',
    visitorName: 'رضا مرادی',
    createdByType: 'customer',
    items: [
      {
        productId: 'prod-1',
        productName: 'آب آشامیدنی گودیز ۱.۵ لیتری (باکس ۶ عددی)',
        brand: 'گودیز (Goodys)',
        volume: '۱.۵ لیتر',
        unitsPerBox: 6,
        quantityBoxes: 60,
        unitPricePerBox: 134000,
        totalPrice: 8040000,
        discountPerBox: 21000,
        finalPrice: 8040000,
        commissionPerBox: 5000
      }
    ],
    subtotal: 8040000,
    tierDiscount: 1260000,
    shippingCost: 0,
    totalAmount: 8040000,
    totalBoxes: 60,
    totalVisitorCommission: 300000,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    paidAmount: 8040000,
    status: 'ready_to_ship',
    statusHistory: [
      { status: 'registered', timestamp: '۱۴۰۳/۰۷/۱۷ ۰۸:۲۰', byRole: 'مشتری از وبسایت' },
      { status: 'confirmed', timestamp: '۱۴۰۳/۰۷/۱۷ ۰۸:۳۰', byRole: 'تایید خودکار آنلاین' },
      { status: 'warehouse_prep', timestamp: '۱۴۰۳/۰۷/۱۷ ۰۹:۰۰', byRole: 'انبار مرکزی' },
      { status: 'ready_to_ship', timestamp: '۱۴۰۳/۰۷/۱۷ ۱۰:۰۰', byRole: 'انبار مرکزی' }
    ],
    deliveryZone: 'شهرقدس',
    deliveryAddress: 'شهرقدس، بلوار مصلی، نبش شقایق چهارم',
    createdAt: '۱۴۰۳/۰۷/۱۷ ۰۸:۲۰',
    invoiceId: 'INV-1403-1003'
  }
];

export const INITIAL_LEDGER: CustomerLedgerEntry[] = [
  {
    id: 'led-1',
    date: '۱۴۰۳/۰۷/۱۵',
    customerId: 'CUS-000125',
    customerCode: 'CUS-000125',
    type: 'invoice',
    title: 'فاکتور فروش شماره INV-1403-1001 (۳۰ باکس آب گودیز)',
    debit: 4200000, // خرید ۴,۲۰۰,۰۰۰ تومان
    credit: 0,
    balance: 4200000,
    referenceId: 'INV-1403-1001',
    notes: 'سفارش آنلاین با تخفیف پلکانی'
  },
  {
    id: 'led-2',
    date: '۱۴۰۳/۰۷/۱۵',
    customerId: 'CUS-000125',
    customerCode: 'CUS-000125',
    type: 'card',
    title: 'پرداخت پوز در محل تحویل (رسید ۷۸۲۱۰)',
    debit: 0,
    credit: 2000000, // پرداخت ۲,۰۰۰,۰۰۰ تومان
    balance: 2200000, // مانده ۲,۲۰۰,۰۰۰ تومان
    referenceId: 'POS-78210',
    notes: 'پرداخت نقدی کارتخوان راننده'
  }
];

export const INITIAL_TRANSACTIONS: WarehouseTransaction[] = [
  {
    id: 'tx-1',
    date: '۱۴۰۳/۰۷/۱۴ ۱۱:۰۰',
    type: 'inbound',
    productId: 'prod-1',
    productName: 'آب آشامیدنی گودیز ۱.۵ لیتری',
    quantityBoxes: 500,
    referenceNo: 'HVL-CAR-4401',
    recordedBy: 'انباردار مرکزی',
    notes: 'ورود مستقیم از خط تولید کارخانه دماوند'
  },
  {
    id: 'tx-2',
    date: '۱۴۰3/۰۷/۱۵ ۱۲:۳۰',
    type: 'outbound',
    productId: 'prod-1',
    productName: 'آب آشامیدنی گودیز ۱.۵ لیتری',
    quantityBoxes: 30,
    referenceNo: 'ORD-1403-0841',
    recordedBy: 'انباردار مرکزی',
    notes: 'خروج جهت تحویل به راننده حمید جهانبخشی'
  },
  {
    id: 'tx-3',
    date: '۱۴۰۳/۰۷/۱۵ ۰۹:۰۰',
    type: 'damaged',
    productId: 'prod-2',
    productName: 'آب معدنی دماوند ۵۰۰ سی‌سی',
    quantityBoxes: 2,
    referenceNo: 'DMG-102',
    recordedBy: 'انباردار مرکزی',
    notes: 'پارگی شرینک و شکستگی درب بطری حین تخلیه بار'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '۱۴۰۳/۰۷/۱۷ ۱۰:۳۲',
    role: 'مدیر سیستم',
    userName: 'مهندس رضوی',
    action: 'به‌روزرسانی قیمت پلکانی',
    details: 'تنظیم قیمت پلکانی آب گودیز ۱.۵ لیتری به ۱۳۹,۰۰۰ تومان برای سفارشات بالای ۱۰۰ باکس'
  },
  {
    id: 'log-2',
    timestamp: '۱۴۰۳/۰۷/۱۷ ۱۰:۰۰',
    role: 'انباردار',
    userName: 'امیر حسینی',
    action: 'تغییر وضعیت سفارش',
    details: 'تغییر وضعیت سفارش ORD-1403-0843 به آماده ارسال و کسر از رزرو انبار'
  },
  {
    id: 'log-3',
    timestamp: '۱۴۰۳/۰۷/۱۷ ۰۸:۲۰',
    role: 'مشتری',
    userName: 'محمدرضا رضایی (CUS-000125)',
    action: 'ثبت سفارش اینترنتی',
    details: 'ثبت سفارش ۳۰ باکس آب گودیز و محاسبه خودکار پورسانت ویزیتور علی کریمی'
  }
];
