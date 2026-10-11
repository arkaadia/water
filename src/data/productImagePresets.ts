export interface ProductImagePreset {
  id: string;
  title: string;
  category: string;
  volume: string;
  url: string;
}

export const PRODUCT_IMAGE_PRESETS: ProductImagePreset[] = [
  {
    id: 'img-mineral-1500',
    title: 'آب معدنی بطری ۱.۵ لیتری خانواده',
    category: 'water',
    volume: '۱.۵ لیتر',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-mineral-500',
    title: 'آب معدنی ۵۰۰ سی‌سی کتابی / تک‌نفره',
    category: 'water',
    volume: '۵۰۰ سی‌سی',
    url: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-mineral-gallon',
    title: 'آب معدنی گالنی ۱۹ لیتری دستگاه دیسپنسر',
    category: 'gallon',
    volume: '۱۹ لیتر',
    url: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-sparkling-glass',
    title: 'آب گازدار سودا در بطری شیشه‌ای لوکس',
    category: 'sparkling',
    volume: '۳۳۰ سی‌سی',
    url: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-energy-can',
    title: 'نوشیدنی انرژی‌زا قوطی متالیک',
    category: 'energy',
    volume: '۲۵۰ سی‌سی',
    url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-orange-juice',
    title: 'آب پرتقال طبیعی و نکتار پالپ‌دار',
    category: 'juice',
    volume: '۱ لیتر',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-malt-lemon',
    title: 'ماءالشعیر کلاسیک و لیمویی گازدار',
    category: 'malt',
    volume: '۳۲۰ سی‌سی',
    url: 'https://images.unsplash.com/photo-1608270546127-5599529b4e3c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'img-glass-horeca',
    title: 'بطری شیشه‌ای تشریفاتی HoReCa رستوران',
    category: 'water',
    volume: '۷۵۰ سی‌سی',
    url: 'https://images.unsplash.com/photo-1559839914-1b3ac9203a9f?auto=format&fit=crop&w=800&q=80'
  }
];
