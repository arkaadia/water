# سیستم جامع و یکپارچه پخش مویرگی آب و نوشیدنی B2B گوارانو
# Gowarano B2B Water & Beverage Distribution Management Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Linux](https://img.shields.io/badge/Linux-Ubuntu%20%7C%20Debian%20%7C%20CentOS-FCC624.svg)](https://kernel.org/)
[![Systemd](https://img.shields.io/badge/Systemd-Service%20Ready-red.svg)](https://systemd.io/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## 🌐 زبان / Language Selection
- [🇮🇷 راهنمای فارسی و نحوه نصب در لینوکس](#فارسی-persian)
- [🇬🇧 English Documentation & Linux Installation](#english)

---

<a name="فارسی-persian"></a>
## 🇮🇷 راهنمای فارسی

### 📖 معرفی سامانه
**سامانه گوارانو (Gowarano)** یک پلتفرم جامع و مدرن اتوماسیون زنجیره تامین، پخش مویرگی، فروش عمده B2B و بازاریابی میدانی (ویزیتوری) ویژه بازار آب آشامیدنی، آب معدنی و انواع نوشیدنی‌های FMCG می‌باشد.

این پلتفرم بر اساس فرآیندهای واقعی صنعت توزیع نوشیدنی کشور طراحی گردیده و تمامی نقش‌های زنجیره (فروشگاه عمومی، مشتری، ویزیتور، انباردار، راننده، حسابدار و مدیر ارشد) را در یک ساختار یکپارچه متصل می‌نماید.

---

### ⚡ روش نصب و راه‌اندازی سریع در لینوکس (مشابه Net-Management)

#### روش ۱: نصب تک‌خطی خودکار (پیشنهادی 🚀)
کافیست در ترمینال سرور لینوکس خود (Ubuntu، Debian، CentOS، AlmaLinux، Fedora یا Arch) دستور زیر را وارد نمایید:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/arkaadia/water/main/install.sh)"
```

#### روش ۲: کلون مخزن و اجرای اسکریپت نصب

```bash
# ۱. کلون مخزن گیت‌هاب
git clone https://github.com/arkaadia/water.git
cd water

# ۲. دسترسی اجرا به اسکریپت
chmod +x install.sh

# ۳. اجرای اسکریپت با دسترسی روت
sudo ./install.sh
```

---

### ⚙️ قابلیت‌های سیستم نصب تعاملی WATER
1. **نمایش بنر اسکی اختصاصی WATER** در شروع فرآیند نصب.
2. **پرسش تعاملی مقادیر پیکربندی با مقادیر پیش‌فرض هوشمند (با زدن کلید ENTER)**:
   - مسیر نصب برنامه (پیش‌فرض: `/opt/water`)
   - پورت وب‌سرور (پیش‌فرض: `3000`)
   - هاست و آدرس شبکه (پیش‌فرض: `0.0.0.0`)
   - محیط اجرا (`production` یا `development`)
   - راه‌اندازی خودکار پس از پایان نصب (`Yes/No`)
3. **اعتبارسنجی دقیق پورت TCP و بررسی در حال استفاده بودن آن** (همراه با نمایش پردازش اشغال‌کننده).
4. **نمایش خلاصه تنظیمات (Installation Summary) و امکان تایید یا انصراف**.
5. **نصب وابستگی‌ها با `bun` و بیلد پروداکشن (`bun run build`) بدون دستکاری یا استفاده از `--force`**.
6. **پیکربندی سرویس سیستمی (`water.service`) یا مدیریت پردازش مستقیم در پس‌زمینه**.
7. **ایجاد اسکریپت‌های اختصاصی مدیریت استاندارد** (`start.sh`, `stop.sh`, `restart.sh`, `status.sh`, `uninstall.sh`).

---

### 🕹️ اسکریپت‌های مدیریت سریع سامانه

در داخل پوشه پروژه، اسکریپت‌های زیر برای کنترل راحت در دسترس شما هستند:

```bash
# مشاهده وضعیت زنده سرویس
./status.sh

# راه‌اندازی مجدد پنل
./restart.sh

# متوقف کردن پنل
./stop.sh

# روشن کردن مجدد پنل
./start.sh

# مشاهده لاگ‌های زنده
sudo journalctl -u water -f

# حذف ایمن سامانه
sudo ./uninstall.sh
```

همچنین در صورت استفاده از systemd:
```bash
sudo systemctl status water
sudo systemctl restart water
sudo systemctl stop water
```

---

### ✨ قابلیت‌ها و پنل‌های هفت‌گانه سیستم

1. **فروشگاه آنلاین عمده B2B (Storefront)**:
   - جستجوی سریع و فیلترهای هوشمند کالاها و برندها (گودیز، دماوند، واتا، زمزم، سن‌ایچ، عالیس، هایپ و...).
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
   - رابط کاربری بهینه‌سازی شده برای گوشی هوشمند ویزیتور در تردد شهری.

4. **سیستم مدیریت انبار هوشمند (Warehouse ERP)**:
   - فرمول کنترل زنده: `موجودی قابل فروش = موجودی کل - موجودی رزرو شده`.
   - ثبت اسناد ورود کالا، خروج و بارگیری، ضایعات و مرجوعی.
   - ابزار انبارگردانی و مغایرت‌گیری سیستمی با شمارش فیزیکی قفسه‌ها.

5. **ناوگان توزیع و لجستیک (Delivery Logistics)**:
   - مانیفست روزانه رانندگان (کامیونت مسقف، نیسان، وانت باربنددار).
   - جریان کار سه‌مرحله‌ای توزیع: `آماده ارسال` ➔ `تحویل راننده` ➔ `در مسیر` ➔ `تحویل مشتری`.
   - امکان تماس مستقیم با مشتری و چاپ برگه مانیفست بارگیری.

6. **حسابداری فروش و دفتر معین (Accounting & Ledger)**:
   - دفتر معین تفصیلی مشتریان (ثبت فاکتور، پرداخت نقدی، کارتخوان راننده، چک صیادی و حواله آنلاین).
   - پیگیری وضعیت سررسید چک‌های صیادی و سقف اعتبارات مالی.
   - صدور و چاپ پیش‌فاکتور و فاکتور رسمی استاندارد B2B با قابلیت پرینت و خروجی PDF.
   - خروجی اکسل (CSV با فرمت UTF-8).

7. **مدیریت ارشد و تصمیم‌گیری استراتژیک (Admin Portal)**:
   - موتور تنظیم نرخ‌ها و تخفیف‌های پلکانی بدون نیاز به کدنویسی.
   - افزودن پویای دسته‌بندی‌های جدید کالایی (تنقلات، کیک، انرژی‌زا و...).
   - مدیریت مناطق تحت پوشش ارسال (شهریار، شهرقدس، ملارد، سرآسیاب، مارلیک، تهرانسر، چیتگر و...).
   - ثبت لاگ کامل رویدادها و فعالیت‌های حساس (Audit Trail).

8. **سئو منطقه‌ای و فید موتورهای مقایسه قیمت**:
   - لندینگ‌پیج‌های اختصاصی سئو محلی همراه با استانداردهای ساختاریافته `Schema.org (LocalBusiness JSON-LD)`.
   - خروجی استاندارد فید زنده برای ترب (Torob API)، ایمالز (Emalls) و باسلام (Basalam).

---

<a name="english"></a>
## 🇬🇧 English Documentation & Linux Installation

### 📌 Overview
**Gowarano B2B Platform** is a full-featured, scalable enterprise resource planning (ERP) and distribution management solution dedicated to the wholesale, retail, and field-marketing distribution of drinking water, mineral water, carbonated soft drinks, juices, and FMCG beverages.

---

### ⚡ Quick Linux Installation

#### Option 1: Automated 1-Line Installer (Recommended)
Run directly in your Linux terminal:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/arkaadia/water/main/install.sh)"
```

#### Option 2: Clone & Install Manually

```bash
git clone https://github.com/arkaadia/water.git
cd water
chmod +x install.sh
sudo ./install.sh
```

During installation, the interactive installer wizard will:
- Display the clean **WATER ASCII Banner**.
- Prompt for configurable options with sensible defaults (press ENTER to accept):
  - **Installation directory** (default: `/opt/water`)
  - **Web port** (default: `3000`, with TCP validation & port availability checks)
  - **Host / bind address** (default: `0.0.0.0`)
  - **Environment** (default: `production`)
  - **Auto start** (default: `Yes`)
- Display an **Installation Summary** for confirmation before making changes.
- Automatically resolve dependencies using `bun` (with clean fallback to `npm` without `--force` or `--legacy-peer-deps`).
- Execute a production build (`bun run build` / `npm run build`).
- Set up process management (`water.service` via systemd or background daemon).

---

### 🕹️ Service Management Commands

```bash
# Check status
./status.sh
# or: sudo systemctl status water

# Restart server
./restart.sh
# or: sudo systemctl restart water

# Stop server
./stop.sh
# or: sudo systemctl stop water

# Start server
./start.sh
# or: sudo systemctl start water

# Live logs (systemd)
sudo journalctl -u water -f

# Complete uninstall wizard
sudo ./uninstall.sh
```

---

### 📁 Tech Stack
- **Frontend & Applet**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 6
- **Styling**: Tailwind CSS v4 (RTL-first)
- **Icons**: Lucide React
- **Production Server**: Node.js & Express / Vite Preview
- **Process Supervision**: Linux Systemd Daemon

---

### 📄 License
This project is licensed under the Apache 2.0 License.
