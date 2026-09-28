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

### ⚙️ اسکریپت نصب چه کارهایی انجام می‌دهد؟
1. **بررسی پکیج‌منیجر و قفل نبودن apt/dpkg** و رفع خودکار تداخل‌ها.
2. **بررسی و نصب خودکار Node.js 20 LTS** از مخزن رسمی NodeSource در صورت نیاز.
3. **بررسی رم سرور و ایجاد خودکار Swap** برای جلوگیری از کمبود حافظه در سرورهای با رم ۱ یا ۲ گیگابایت.
4. **پرسش پورت دلخواه** برای پنل (پیش‌فرض: `3000`).
5. **نصب وابستگی‌ها (`npm install`) و بیلد کامل پروداکشن (`npm run build`)**.
6. **پیکربندی و فعال‌سازی سرویس دائمی لینوکس (`water-b2b.service`)** با امکان راه‌اندازی خودکار پس از ریبوت سرور.
7. **ایجاد اسکریپت‌های اختصاصی مدیریت سریع** (`start.sh`, `stop.sh`, `restart.sh`, `status.sh`, `uninstall.sh`).
8. **تنظیم خودکار فایروال (UFW / Firewalld)** جهت باز کردن پورت انتخابی.

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
sudo journalctl -u water-b2b -f

# حذف کامل سرویس از سیستم‌عامل
sudo ./uninstall.sh
```

همچنین می‌توانید مستقیماً از دستورات استاندارد لینوکس استفاده فرمایید:
```bash
sudo systemctl status water-b2b
sudo systemctl restart water-b2b
sudo systemctl stop water-b2b
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

During installation, the script will:
- Check root permissions and unlock `dpkg`/`apt` if needed.
- Install Node.js 20 LTS automatically.
- Allocate swap memory if running on a low-RAM VPS.
- Prompt for the desired port (default: `3000`).
- Install dependencies and build production assets.
- Create and enable the systemd daemon (`water-b2b.service`).
- Open the port in your Linux firewall (UFW / Firewalld).

---

### 🕹️ Service Management Commands

```bash
# Check status
./status.sh
# or: sudo systemctl status water-b2b

# Restart server
./restart.sh
# or: sudo systemctl restart water-b2b

# Stop server
./stop.sh
# or: sudo systemctl stop water-b2b

# Start server
./start.sh
# or: sudo systemctl start water-b2b

# Live logs
sudo journalctl -u water-b2b -f

# Complete uninstall
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
