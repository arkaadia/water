export type StoreThemeId =
  | 'mineral_spring'      // آب معدنی و چشمه‌های طبیعی (Glacier Cyan & Deep Sky)
  | 'fmcg_hyper'          // هایپرمارکت و سوپرمارکت زنجیره‌ای B2B (Fresh Emerald & Modern Green)
  | 'horeca_luxury'       // کافه‌رستوران، هتل و تشریفات لوکس (Royal Gold & Obsidian Slate)
  | 'energy_sports'       // آبمیوه، انرژی‌زا و ورزشکاران (Electric Violet & Sunset Coral)
  | 'corporate_navy'      // سازمانی، ارگان‌ها و پخش صنعتی (Classic Navy & Corporate Indigo)
  | 'tropical_citrus';    // مرکبات و نوشیدنی‌های گرمسیری (Warm Amber & Tangerine)

export interface StoreTheme {
  id: StoreThemeId;
  name: string;
  storeTypeTitle: string;
  description: string;
  tagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerGradient: string;
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
  accentBorder: string;
  badgeClass: string;
  buttonClass: string;
  cardBorderHover: string;
  previewColors: string[];
}

export const STORE_THEMES: Record<StoreThemeId, StoreTheme> = {
  mineral_spring: {
    id: 'mineral_spring',
    name: 'آب معدنی و چشمه طبیعی (Glacier Cyan)',
    storeTypeTitle: 'فروشگاه تخصصی آب آشامیدنی، آب معدنی و گالن‌های ۱۹ لیتری',
    description: 'تم زلال، شفاف و خنک با پالت رنگی فیروزه‌ای و آبی آلپی؛ نماد پاکی و گوارایی چشمه‌های کوهستانی.',
    tagline: 'گوارایی چشمه‌های پاک دماوند و سبلان بر سر سفره شما',
    heroBadge: 'پخش مستقیم کارخانه با قیمت پلکانی تناژ ویژه سوپرمارکت‌ها و رستوران‌ها',
    heroTitle: 'تأمین عمده و مویرگی آب آشامیدنی، معدنی و انواع نوشیدنی',
    heroSubtitle: 'سفارش آسان با تخفیف‌های پلکانی ۳۰، ۶۰ و ۱۰۰ باکسی، تحویل در سریع‌ترین زمان در غرب و مرکز استان با تسویه اعتباری و چکی.',
    bannerGradient: 'from-cyan-900 via-sky-800 to-blue-900',
    accentBg: 'bg-cyan-600',
    accentHoverBg: 'hover:bg-cyan-700',
    accentText: 'text-cyan-700',
    accentBorder: 'border-cyan-500',
    badgeClass: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    cardBorderHover: 'hover:border-cyan-400',
    previewColors: ['#06b6d4', '#0284c7', '#0f172a']
  },
  fmcg_hyper: {
    id: 'fmcg_hyper',
    name: 'هایپرمارکت و سوپرمارکت زنجیره‌ای (Fresh Emerald)',
    storeTypeTitle: 'پخش مویرگی FMCG، هایپرمارکت‌ها و فروشگاه‌های تخفیفی',
    description: 'تم سرسبز و تجاری با پالت رنگی امرالد و نعنایی؛ القاکننده قیمت رقابتی، سبد کالای روزمره و تازگی محصولات.',
    tagline: 'مرکز خرید عمده و تحویل روزانه اقلام پرمصرف سوپرمارکتی',
    heroBadge: 'طرح ویژه بنکداران و سوپرمارکت‌های زنجیره‌ای با حاشیه سود بالا',
    heroTitle: 'سامانه پخش عمده نوشیدنی و FMCG با تضمین رقابتی‌ترین قیمت بازار',
    heroSubtitle: 'تأمین مطمئن پرفروش‌ترین برندهای نوشیدنی ایران با فاکتور رسمی، تخفیف نقدی و جوایز دوره‌ای برای فروشگاه‌های همکار.',
    bannerGradient: 'from-emerald-950 via-teal-900 to-emerald-900',
    accentBg: 'bg-emerald-600',
    accentHoverBg: 'hover:bg-emerald-700',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-500',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    cardBorderHover: 'hover:border-emerald-400',
    previewColors: ['#10b981', '#0d9488', '#064e3b']
  },
  horeca_luxury: {
    id: 'horeca_luxury',
    name: 'کافه‌رستوران، هتل و تشریفات لوکس (Royal Gold & Slate)',
    storeTypeTitle: 'تأمین اختصاصی هتل‌های ۵ ستاره، رستوران‌های VIP و مجالس تشریفاتی',
    description: 'تم لوکس و اشرافی با پالت مشکی مات، خاکستری زغالی و طلایی متالیک؛ مناسب آب‌های شیشه‌ای پریمیوم و پذیرایی خاص.',
    tagline: 'تجربه ناب میزبانی مجلل با بطری‌های شیشه‌ای و پریمیوم بین‌المللی',
    heroBadge: 'پکیج پذیرایی تشریفاتی VIP ویژه هتل‌ها، کافه‌ها و تالارهای پذیرایی',
    heroTitle: 'تأمین انحصاری بطری‌های شیشه‌ای، آب‌های گازدار و نوشیدنی‌های پریمیوم',
    heroSubtitle: 'ارائه بسته‌بندی‌های لوکس با طراحی متمایز، تحویل زمان‌بندی‌شده دقیق با خودروهای اختصاصی و تسویه مالی منعطف سازمانی.',
    bannerGradient: 'from-slate-950 via-zinc-900 to-amber-950',
    accentBg: 'bg-amber-500',
    accentHoverBg: 'hover:bg-amber-600',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-500',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    buttonClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black',
    cardBorderHover: 'hover:border-amber-400',
    previewColors: ['#f59e0b', '#78350f', '#0f172a']
  },
  energy_sports: {
    id: 'energy_sports',
    name: 'آبمیوه، انرژی‌زا و ورزشکاران (Electric Violet)',
    storeTypeTitle: 'باشگاه‌های ورزشی، استخرها، فیتنس و غرفه‌های نوشیدنی پرانرژی',
    description: 'تم پرحرارت، پویا و جوان‌پسند با پالت بنفش الکتریک و سرخابی نئونی؛ نماد قدرت، آبرسانی ورزشی و انرژی بی‌پایان.',
    tagline: 'سوخت اصلی تمرینات قدرتی و هایدریشن حرفه‌ای ورزشکاران',
    heroBadge: 'توزیع مستقیم نوشیدنی‌های ایزوتونیک، الکترولیت و انرژی‌زای استاندارد',
    heroTitle: 'هایپرمارکت تخصصی نوشیدنی‌های ورزشی، ویتامینه و انرژی‌بخش',
    heroSubtitle: 'تأمین عمده برای بوفه‌های ورزشی، مراکز تناسب اندام و باشگاه‌ها با تاریخ انقضای معتبر و برترین برندهای داخلی و وارداتی.',
    bannerGradient: 'from-violet-950 via-purple-900 to-fuchsia-950',
    accentBg: 'bg-violet-600',
    accentHoverBg: 'hover:bg-violet-700',
    accentText: 'text-violet-700',
    accentBorder: 'border-violet-500',
    badgeClass: 'bg-violet-500/20 text-violet-200 border-violet-400/30',
    buttonClass: 'bg-violet-600 hover:bg-violet-700 text-white',
    cardBorderHover: 'hover:border-violet-400',
    previewColors: ['#8b5cf6', '#d946ef', '#2e1065']
  },
  corporate_navy: {
    id: 'corporate_navy',
    name: 'سازمانی، ارگان‌ها و پخش صنعتی (Corporate Navy)',
    storeTypeTitle: 'تأمین قراردادی سازمان‌ها، کارخانجات بزرگ، دانشگاه‌ها و ارگان‌های دولتی',
    description: 'تم رسمی، معتبر و اداری با پالت سرمه‌ای ناوی و ایندیگو کلاسیک؛ مناسب مناقصات و قراردادهای حجیم تناژ بالا.',
    tagline: 'زنجیره پایدار تأمین آب آشامیدنی صنایع و سازمان‌های سراسر کشور',
    heroBadge: 'قراردادهای رسمی سازمانی با گواهی استاندارد، آنالیز آزمایشگاهی و بارنامه دولتی',
    heroTitle: 'تأمین تناژ سازمانی آب آشامیدنی با فاکتور رسمی و اعتبار مالیاتی',
    heroSubtitle: 'ارسال با تریلی و خاور مستقیم از خط تولید به انبار ارگان‌ها و شرکت‌ها با امکان تسویه مدت‌دار پس از تأیید سلامت بار.',
    bannerGradient: 'from-slate-950 via-indigo-950 to-blue-950',
    accentBg: 'bg-indigo-600',
    accentHoverBg: 'hover:bg-indigo-700',
    accentText: 'text-indigo-700',
    accentBorder: 'border-indigo-500',
    badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    cardBorderHover: 'hover:border-indigo-400',
    previewColors: ['#4f46e5', '#1e3a8a', '#020617']
  },
  tropical_citrus: {
    id: 'tropical_citrus',
    name: 'مرکبات و نوشیدنی‌های میوه‌ای (Warm Citrus)',
    storeTypeTitle: 'پخش انواع ماءالشعیر میوه‌ای، آبمیوه پالپ‌دار و نوشابه‌های میوه‌ای',
    description: 'تم شاداب، جذاب و باطراوت با رنگ‌های پرتقالی کهربایی و طلایی خورشیدی؛ مناسب اقلام با طعم میوه‌های استوایی.',
    tagline: 'طعم واقعی میوه‌های تازه و عطر دلنشین مرکبات طبیعی',
    heroBadge: 'جشنواره تخفیف فصلی انواع نکتار، ماءالشعیر میوه‌ای و نوشیدنی‌های گازدار',
    heroTitle: 'سبد کامل نوشیدنی‌های میوه‌ای، پالپ‌دار و خنک‌کننده گوارانو',
    heroSubtitle: 'خرید مستقیم انواع نوشیدنی‌های ترش و شیرین میوه‌ای با باکس‌های ۶ و ۱۲ تایی همراه با استندهای رایگان فروشگاهی.',
    bannerGradient: 'from-amber-950 via-orange-900 to-stone-900',
    accentBg: 'bg-orange-500',
    accentHoverBg: 'hover:bg-orange-600',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-500',
    badgeClass: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    cardBorderHover: 'hover:border-orange-400',
    previewColors: ['#f97316', '#ea580c', '#451a03']
  }
};
