# سیستم جامع و یکپارچه پخش مویرگی آب و نوشیدنی B2B گوارانو
# Gowarano B2B Water & Beverage Distribution Management Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Linux](https://img.shields.io/badge/Linux-Ubuntu%20%7C%20Debian%20%7C%20CentOS-FCC624.svg)](https://kernel.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## 🌐 زبان / Language Selection
- [🇮🇷 راهنمای فارسی و آموزش نصب لینوکس](#فارسی-persian)
- [🇬🇧 English Documentation & Linux Setup](#english)

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

### 🐧 راهنمای جامع نصب و اجرای پروژه روی لینوکس (Ubuntu / Debian / CentOS / VPS)

شما می‌توانید به چندین روش ساده سامانه را روی سرور لینوکس خود بالا بیاورید:

#### روش اول: نصب خودکار با اسکریپت هوشمند لینوکس (پیشنهادی ⚡)

یک اسکریپت خودکار برای لینوکس آماده شده که تمام پیش‌نیازها (Node.js 20 LTS، ابزارهای build، پکیج‌ها) را بررسی و نصب می‌کند و منوی اجرای فوری در اختیارتان می‌گذارد:

```bash
# ۱. کلون مخزن در لینوکس
git clone https://github.com/arkaadia/water.git
cd water

# ۲. دادن دسترسی اجرایی به اسکریپت
chmod +x install-linux.sh

# ۳. اجرای اسکریپت نصب
./install-linux.sh
```

اسکریپت پس از نصب به شما گزینه‌های زیر را ارائه می‌دهد:
1. اجرای فوری در محیط توسعه (`npm run dev`)
2. اجرای ۲۴ ساعته در پس‌زمینه با **PM2** (مناسب سرور)
3. راه‌اندازی به عنوان **سرویس سیستمی Systemd** (شروع خودکار پس از ریبوت سرور)
4. اجرای سرور پروداکشن محلی (`npm start`)

---

#### روش دوم: نصب دستی گام‌به‌گام در لینوکس

در صورتی که مایلید مراحل را دستی انجام دهید:

##### ۱. نصب Node.js v20 در اوبونتو یا دبیان:
```bash
# به‌روزرسانی مخازن
sudo apt update && sudo apt install -y curl git build-essential

# نصب Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# بررسی نسخه
node -v   # باید نسخه 18 یا 20 به بالا باشد
npm -v
```

*(برای سرورهای CentOS / RHEL / AlmaLinux: از `curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -` و `sudo yum install -y nodejs` استفاده کنید)*

##### ۲. دانلود و آماده‌سازی پروژه:
```bash
git clone https://github.com/arkaadia/water.git
cd water

# کپی تنظیمات محیطی
cp .env.example .env

# نصب پکیج‌ها
npm install

# ساخت بیلد نهایی
npm run build
```

##### ۳. اجرای برنامه:
```bash
# اجرای نسخه توسعه (پورت 3000):
npm run dev

# یا اجرای نسخه پروداکشن:
npm start
```
برنامه بر روی تمام کارت‌های شبکه سرور با آدرس `http://<IP-SERVER>:3000` در دسترس خواهد بود.

---

#### روش سوم: اجرای دائمی در پس‌زمینه با PM2 (مناسب سرورهای واقعی)

برای اینکه برنامه با بسته شدن ترمینال یا خروج از SSH متوقف نشود:

```bash
# نصب سراسری PM2
sudo npm install -g pm2

# ساخت بیلد پروداکشن (اگر قبلاً انجام نداده‌اید)
npm run build

# اجرای برنامه تحت نام water-b2b
pm2 start npm --name "water-b2b" -- run preview -- --port 3000 --host 0.0.0.0

# ذخیره لیست پردازه‌ها و فعال‌سازی اجرای خودکار هنگام بوت لینوکس
pm2 save
pm2 startup
```

**دستورات کاربردی مدیریت PM2:**
```bash
pm2 status                  # مشاهده وضعیت زنده برنامه
pm2 logs water-b2b          # مشاهده لاگ‌ها
pm2 restart water-b2b       # ریستارت برنامه
pm2 stop water-b2b          # متوقف کردن برنامه
```

---

#### روش چهارم: راه‌اندازی با سرویس لینوکس (Systemd Service)

فایل سرویس آماده `gowarano.service` در ریشه پروژه قرار دارد:

```bash
# کپی فایل سرویس به مسیر سرویس‌های لینوکس
sudo cp gowarano.service /etc/systemd/system/

# بازخوانی سیستم‌دی و فعال‌سازی سرویس
sudo systemctl daemon-reload
sudo systemctl enable gowarano
sudo systemctl start gowarano

# بررسی وضعیت اجرا:
sudo systemctl status gowarano
```

---

#### روش پنجم: اجرای آسان با Docker & Docker Compose 🐳

اگر روی لینوکس خود داکر نصب دارید، بدون نیاز به نصب Node.js می‌توانید با یک دستور پروژه را کانتینری کنید:

```bash
# اجرای کانتینر در پس‌زمینه
docker compose up -d --build

# مشاهده لاگ‌ها
docker compose logs -f

# متوقف کردن
docker compose down
```
برنامه روی پورت `3000` سرور قرار می‌گیرد: `http://<IP-SERVER>:3000`

---

#### روش ششم: اتصال به دامنه با وب‌سرور Nginx و SSL رایگان (Let's Encrypt)

اگر دامنه‌ای دارید (مثلاً `water.yourdomain.ir`) و می‌خواهید روی پورت ۸۰/۴۴۳ بیاید:

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/water
```

محتوای زیر را قرار دهید:
```nginx
server {
    listen 80;
    server_name water.yourdomain.ir;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

سپس فعال‌سازی و دریافت گواهی رایگان SSL:
```bash
sudo ln -s /etc/nginx/sites-available/water /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# دریافت SSL رایگان:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d water.yourdomain.ir
```

#### باز کردن پورت‌ها در فایروال لینوکس (UFW):
در صورتی که فایروال سرور روشن است:
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

<a name="english"></a>
## 🇬🇧 English Documentation & Linux Setup

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

### 🐧 Linux Installation & Server Deployment Guide

#### Method 1: Automated 1-Click Linux Installer (Recommended ⚡)

```bash
git clone https://github.com/arkaadia/water.git
cd water
chmod +x install-linux.sh
./install-linux.sh
```
The script will auto-detect your Linux distro (Ubuntu, Debian, CentOS, AlmaLinux, Arch), install Node.js 20 LTS if missing, resolve dependencies, build production assets, and provide an interactive launcher (PM2, Systemd service, dev, or preview server).

---

#### Method 2: Manual Linux Setup

```bash
# 1. Install Node.js 20 LTS (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs git build-essential

# 2. Clone repository & enter directory
git clone https://github.com/arkaadia/water.git
cd water

# 3. Setup environment and install dependencies
cp .env.example .env
npm install

# 4. Build production bundle
npm run build

# 5. Start server (accessible on http://<YOUR-SERVER-IP>:3000)
npm start
```

---

#### Method 3: 24/7 Production with PM2
```bash
sudo npm install -g pm2
npm run build
pm2 start npm --name "water-b2b" -- run preview -- --port 3000 --host 0.0.0.0
pm2 save
pm2 startup
```

---

#### Method 4: Docker & Docker Compose 🐳
```bash
docker compose up -d --build
```
The app will run in a container mapped to port `3000`.

---

#### Method 5: Linux Systemd Daemon Service
```bash
sudo cp gowarano.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now gowarano
sudo systemctl status gowarano
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
