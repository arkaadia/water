# سیستم جامع و یکپارچه پخش مویرگی آب و نوشیدنی B2B گوارانو
# Gowarano B2B Water & Beverage Distribution Management Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## 🌐 زبان / Language Selection
- [فارسی (Persian)](#فارسی-persian)
- [English](#english)

---

<a name="فارسی-persian"></a>
## 🇮🇷 راهنمای فارسی

### 📖 معرفی پروژه
**سامانه گوارانو (Gowarano)** یک راهکار یکپارچه و مقیاس‌پذیر برای اتوماسیون زنجیره تامین، پخش مویرگی، فروش عمده و بازاریابی میدانی (ویزیتوری) ویژه بازار آب آشامیدنی، آب معدنی و انواع نوشیدنی‌های FMCG می‌باشد.

این پلتفرم علاوه بر فروشگاه اینترنتی مشابه ساختار دیجی‌کالا، دارای زیرسیستم‌های تخصصی متصل به دیتابیس مشترک برای کلیه نقش‌های زنجیره توزیع است.

---

### ✨ قابلیت‌ها و پنل‌های هفت‌گانه سیستم

1. **فروشگاه آنلاین B2B (Storefront)**:
   - جستجوی سریع و فیلترهای هوشمند کالاها و برندها (گودیز، دماوند، واتا، زمزم، سن‌ایچ، عالیس و...).
   - جدول تخفیف‌های پلکانی حجمی (۳۰ باکس، ۶۰ باکس، ۱۰۰ باکس) روی هر محصول.
   - سبد خرید عمده با محاسبه آنی کرایه حمل و تخفیف تناژ.

2. **پنل اختصاصی مشتریان (Customer Portal)**:
   - شناسه اختصاصی برای هر مشتری (مانند `CUS-000125`).
   - صفحه سفارش مستقیم و ایجاد بارکد QR اختصاصی برای پیشخوان مغازه‌دار (`site.ir/order/CUS-000125`).
   - رهگیری لحظه‌ای در ۱۱ مرحله از ثبت سفارش تا تحویل و تسویه.
   - امکان تکرار آخرین سفارش قبلی با یک کلیک (Re-order).

3. **پنل ویزیتورها و بازاریابی میدانی (Visitor Portal)**:
   - محاسبه خودکار پورسانت به ازای هر باکس (حتی در صورت ثبت آنلاین توسط خود مشتری).
   - ردیابی تارگت ماهانه، درصد تحقق هدف و درآمد پورسانتی.
   - هشدار مشتریان نیازمند پیگیری و ثبت مشتری جدید با اختصاص کد یکتا.
   - بهینه‌سازی کامل جهت کاربری آسان روی گوشی‌های هوشمند (موبایل ویزیتور).

4. **سیستم مدیریت انبار هوشمند (Warehouse ERP)**:
   - فرمول کنترل زنده: `موجودی قابل فروش = موجودی کل - موجودی رزرو شده`.
   - ثبت اسناد ورود کالا، خروج و بارگیری، ضایعات و مرجوعی.
   - ابزار انبارگردانی و مغایرت‌گیری سیستمی با شمارش فیزیکی قفسه‌ها.

5. **ناوگان توزیع و لجستیک (Delivery Logistics)**:
   - مانیفست روزانه رانندگان (کامیونت مسقف، نیسان، وانت باربنددار).
   - جریان کار سه‌مرحله‌ای توزیع: `آماده ارسال` ➔ `تحویل راننده` ➔ `در مسیر` ➔ `تحویل مشتری`.
   - امکان تماس مستقیم با مشتری و چاپ برگه مانیفست بارگیری.

6. **حسابداری فروش و دفتر معین (Accounting & Ledger)**:
   - دفتر معین تفصیلی مشتریان (ثبت فاکتور، پرداخت نقدی، پوز راننده، چک صیادی و حواله آنلاین).
   - پیگیری وضعیت سررسید چک‌های صیادی و سقف اعتبارات مالی.
   - صدور و چاپ پیش‌فاکتور و فاکتور رسمی استاندارد با استایل بهینه چاپی (PDF).
   - خروجی اکسل (CSV با فرمت UTF-8).

7. **مدیریت ارشد و تصمیم‌گیری استراتژیک (Admin Portal)**:
   - موتور تنظیم نرخ‌ها و تخفیف‌های پلکانی بدون نیاز به برنامه‌نویسی.
   - افزودن پویای دسته‌بندی‌های جدید کالایی (تنقلات، کیک، نوشیدنی‌های انرژی‌زا و...).
   - مدیریت مناطق ارسال (شهریار، شهرقدس، ملارد، سرآسیاب، مارلیک، رباط‌کریم، تهرانسر، چیتگر، آزادی).
   - ثبت لاگ کامل رویدادها و فعالیت‌های حساس (Audit Trail).

8. **سئو منطقه‌ای و فید مقایسه قیمت**:
   - لندینگ‌پیج‌های اختصاصی سئو محلی همراه با استانداردهای ساختاریافته `Schema.org (LocalBusiness JSON-LD)`.
   - خروجی استاندارد فید زنده برای ترب (Torob API)، ایمالز (Emalls) و باسلام (Basalam).

---

### 🚀 نحوه نصب و راه‌اندازی سریع

#### پیش‌نیازها:
- نصب بودن **Node.js** (نسخه ۱۸ به بالا) یا **Bun**
- نصب بودن ابزار مدیریت پکیج **npm** یا **pnpm** یا **yarn**

#### مراحل اجرا:

```bash
# ۱. کلون کردن مخزن گیت‌هاب
git clone https://github.com/arkaadia/water.git

# ۲. ورود به دایرکتوری پروژه
cd water

# ۳. نصب وابستگی‌ها
npm install
# یا در صورت استفاده از bun:
# bun install

# ۴. اجرای سرور توسعه محلی
npm run dev

# ۵. باز کردن مرورگر و مشاهده پروژه
# http://localhost:3000 یا آدرس مشخص شده در ترمینال
```

#### ایجاد نسخه نهایی جهت استقرار (Production Build):
```bash
npm run build
npm run preview
```

---

<a name="english"></a>
## 🇬🇧 English Documentation

### 📌 Overview
**Gowarano B2B Platform** is a full-featured, scalable enterprise resource planning (ERP) and distribution management solution dedicated to the wholesale, retail, and field-marketing distribution of drinking water, mineral water, carbonated soft drinks, juices, and FMCG beverages.

### 🌟 Key Modules

- **Digikala-Inspired B2B Storefront**: Product catalogs, tiered quantity-based pricing brackets (e.g., 30, 60, 100 boxes), search, and cart checkout.
- **Customer Portal & Dedicated QR Codes**: Personalized customer profiles (e.g., `CUS-000125`) with direct order links, printable storefront QR tags, and one-click past-order replication.
- **Sales Visitor & Field Agent Hub**: Real-time sales commission calculation (even for orders self-placed by the client online), target tracking, follow-up alerts, and mobile-responsive dispatch.
- **Smart Warehouse Management**: Live formula: `Available For Sale = Total Stock - Reserved Stock`, batch inbound/outbound logging, and physical stock reconciliation.
- **Fleet & Dispatch Logistics**: Delivery route manifests, driver assignments, and stepwise delivery status updates.
- **Comprehensive Sales Accounting**: Customer debit/credit subsidiary ledgers, bounced check & term alerts, POS records, and official printable tax invoices (PDF).
- **Executive Administration (Super Admin)**: Dynamic FMCG category additions, tier-pricing rule configuration, delivery zone adjustments, and secure user audit trails.
- **Price Engine & Market Feed Integrations**: Ready-to-use API feeds tailored for Torob, Emalls, and Basalam search crawlers.

---

### 🛠️ Installation & Setup Guide

#### Prerequisites:
- **Node.js** (v18.0.0 or higher) or **Bun**
- **npm**, **yarn**, or **pnpm**

#### Quickstart:

```bash
# 1. Clone repository
git clone https://github.com/arkaadia/water.git

# 2. Navigate to project root
cd water

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Access the app
# Open your browser at http://localhost:3000
```

#### Production Build:
```bash
# Build optimized static assets
npm run build

# Preview build locally
npm run preview
```

---

### 📁 Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4 (RTL-first)
- **Icons**: Lucide React
- **Typography**: Google Vazirmatn (فونت استاندارد فارسی)

---

### 📄 License
This project is licensed under the Apache 2.0 License.
