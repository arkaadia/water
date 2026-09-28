#!/usr/bin/env bash
# ==============================================================================
# اسکریپت نصب و راه‌اندازی خودکار سامانه پخش مویرگی آب و نوشیدنی گوارانو روی لینوکس
# Gowarano B2B Platform - Linux Auto Installer & Runner
# ==============================================================================

set -e

# رنگ‌ها برای خروجی زیباتر در ترمینال
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}====================================================================${NC}"
echo -e "${BOLD}${BLUE}  💧 سامانه جامع پخش مویرگی و فروش عمده آب و نوشیدنی (گوارانو B2B)${NC}"
echo -e "${BOLD}${GREEN}     Gowarano B2B Water & Beverage Distribution System${NC}"
echo -e "${CYAN}====================================================================${NC}"
echo -e "${YELLOW}  در حال آماده‌سازی و بررسی پیش‌نیازهای سیستم لینوکس...${NC}\n"

# تابع بررسی دسترسی روت (sudo)
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        if command -v sudo >/dev/null 2>&1; then
            SUDO="sudo"
        else
            echo -e "${RED}[خطا] لطفا این اسکریپت را با دسترسی root یا کاربر دارای sudo اجرا فرمایید.${NC}"
            exit 1
        fi
    else
        SUDO=""
    fi
}

# تشخیص توزیع لینوکس
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        OS=$(uname -s)
    fi
    echo -e "${BLUE}[اطلاعات]${NC} سیستم‌عامل شناسایی‌شده: ${BOLD}$OS${NC}"
}

# بررسی و نصب پیش‌نیازهای اولیه (curl, git)
install_base_tools() {
    echo -e "\n${CYAN}>>> مرحله ۱: بررسی ابزارهای اولیه (curl, git, build-essential)...${NC}"
    check_sudo

    if ! command -v curl >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
        echo -e "${YELLOW}در حال نصب ابزارهای پیش‌نیاز (curl, git)...${NC}"
        case "$OS" in
            ubuntu|debian|raspbian)
                $SUDO apt-get update -y
                $SUDO apt-get install -y curl git build-essential
                ;;
            centos|rhel|rocky|almalinux|fedora)
                $SUDO yum install -y curl git make gcc-c++ || $SUDO dnf install -y curl git make gcc-c++
                ;;
            arch|manjaro)
                $SUDO pacman -Sy --noconfirm curl git base-devel
                ;;
            *)
                echo -e "${YELLOW}[هشدار] نوع پکیج منیجر توزیع شناسایی نشد؛ لطفا curl و git را دستی نصب فرمایید.${NC}"
                ;;
        esac
    else
        echo -e "${GREEN}[✔] ابزارهای اولیه نصب هستند.${NC}"
    fi
}

# بررسی و نصب Node.js و npm
install_nodejs() {
    echo -e "\n${CYAN}>>> مرحله ۲: بررسی نسخه Node.js و npm...${NC}"
    NODE_INSTALLED=false

    if command -v node >/dev/null 2>&1; then
        NODE_VER=$(node -v | tr -d 'v' | cut -d'.' -f1)
        if [ "$NODE_VER" -ge 18 ]; then
            echo -e "${GREEN}[✔] نسخه مناسب Node.js شناسایی شد: $(node -v)${NC}"
            NODE_INSTALLED=true
        else
            echo -e "${YELLOW}[!] نسخه فعلی Node.js ($(node -v)) قدیمی‌تر از نسخه ۱۸ است.${NC}"
        fi
    fi

    if [ "$NODE_INSTALLED" = false ]; then
        echo -e "${YELLOW}در حال نصب Node.js v20 LTS از مخزن رسمی NodeSource...${NC}"
        check_sudo
        case "$OS" in
            ubuntu|debian|raspbian)
                curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
                $SUDO apt-get install -y nodejs
                ;;
            centos|rhel|rocky|almalinux|fedora)
                curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO bash -
                $SUDO yum install -y nodejs || $SUDO dnf install -y nodejs
                ;;
            arch|manjaro)
                $SUDO pacman -Sy --noconfirm nodejs npm
                ;;
            *)
                echo -e "${RED}[خطا] امکان نصب خودکار Node.js روی این توزیع وجود ندارد.${NC}"
                echo -e "لطفاً Node.js نسخه 18 یا بالاتر را به شکل دستی نصب کنید."
                exit 1
                ;;
        esac
        echo -e "${GREEN}[✔] با موفقیت نصب شد: Node $(node -v) و npm $(npm -v)${NC}"
    fi
}

# تنظیم فایل محیطی .env
setup_env() {
    echo -e "\n${CYAN}>>> مرحله ۳: بررسی تنظیمات محیطی (.env)...${NC}"
    if [ ! -f .env ] && [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}[✔] فایل .env از روی .env.example ایجاد شد.${NC}"
    elif [ -f .env ]; then
        echo -e "${GREEN}[✔] فایل تنظیمات .env موجود است.${NC}"
    fi
}

# نصب پکیج‌های پروژه
install_dependencies() {
    echo -e "\n${CYAN}>>> مرحله ۴: نصب پکیج‌ها و کتابخانه‌های پروژه (npm install)...${NC}"
    if npm install; then
        echo -e "${GREEN}[✔] تمامی وابستگی‌ها با موفقیت نصب شدند.${NC}"
    else
        echo -e "${YELLOW}[!] تلاش مجدد با آرگومان --legacy-peer-deps...${NC}"
        npm install --legacy-peer-deps
    fi
}

# ساخت بیلد نهایی پروژه
build_project() {
    echo -e "\n${CYAN}>>> مرحله ۵: کامپایل و ساخت نسخه نهایی (npm run build)...${NC}"
    npm run build
    echo -e "${GREEN}[✔] بیلد پروداکشن در پوشه dist ایجاد گردید.${NC}"
}

# منوی اجرای سیستم
choose_run_mode() {
    echo -e "\n${BOLD}${CYAN}====================================================================${NC}"
    echo -e "${BOLD}${GREEN}  آماده‌سازی با موفقیت پایان یافت! نحوه اجرای سامانه را انتخاب کنید:${NC}"
    echo -e "${BOLD}${CYAN}====================================================================${NC}"
    echo -e " 1) ${BOLD}اجرای در محیط توسعه (Local Development)${NC} -> npm run dev"
    echo -e " 2) ${BOLD}اجرای دائم در پس‌زمینه با PM2 (پیشنهادی برای سرور)${NC} -> Background Daemon"
    echo -e " 3) ${BOLD}اجرا به عنوان سرویس سیستمی Systemd${NC} -> Linux System Service (Auto-Start on Boot)"
    echo -e " 4) ${BOLD}اجرای نسخه پروداکشن محلی (Preview Server)${NC} -> Port 3000"
    echo -e " 5) ${BOLD}خروج از اسکریپت${NC}"
    echo -e "${CYAN}--------------------------------------------------------------------${NC}"
    read -p "لطفاً عدد گزینه مورد نظر را وارد نمایید [۱-۵]: " choice

    case "$choice" in
        1)
            echo -e "\n${GREEN}در حال اجرای سرور توسعه روی پورت 3000...${NC}"
            echo -e "${YELLOW}برای توقف کلید‌های Ctrl + C را فشار دهید.${NC}\n"
            npm run dev
            ;;
        2)
            echo -e "\n${CYAN}در حال راه‌اندازی با PM2...${NC}"
            if ! command -v pm2 >/dev/null 2>&1; then
                check_sudo
                echo -e "${YELLOW}نصب سراسری pm2...${NC}"
                $SUDO npm install -g pm2
            fi
            pm2 delete water-b2b >/dev/null 2>&1 || true
            pm2 start npm --name "water-b2b" -- run preview -- --port 3000 --host 0.0.0.0
            pm2 save
            echo -e "\n${GREEN}====================================================================${NC}"
            echo -e "${GREEN}[✔] سامانه با موفقیت در پس‌زمینه توسط PM2 اجرا شد!${NC}"
            echo -e "آدرس دسترسی: ${BOLD}http://<IP-SERVER>:3000${NC}"
            echo -e "دستورات کاربردی مدیریت:"
            echo -e "  - مشاهده لاگ‌ها: ${CYAN}pm2 logs water-b2b${NC}"
            echo -e "  - وضعیت فرآیند: ${CYAN}pm2 status${NC}"
            echo -e "  - ریستارت:      ${CYAN}pm2 restart water-b2b${NC}"
            echo -e "  - توقف:         ${CYAN}pm2 stop water-b2b${NC}"
            echo -e "${GREEN}====================================================================${NC}"
            ;;
        3)
            echo -e "\n${CYAN}در حال پیکربندی و نصب سرویس Systemd...${NC}"
            check_sudo
            APP_DIR=$(pwd)
            USER_NAME=$(whoami)
            NODE_PATH=$(which node)
            NPM_PATH=$(which npm)

            SERVICE_FILE="/etc/systemd/system/gowarano.service"
            cat <<EOF | $SUDO tee $SERVICE_FILE > /dev/null
[Unit]
Description=Gowarano B2B Water & Beverage Distribution Platform
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP_DIR
ExecStart=$NPM_PATH run preview -- --port 3000 --host 0.0.0.0
Restart=always
RestartSec=5
Environment=PATH=$PATH
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

            $SUDO systemctl daemon-reload
            $SUDO systemctl enable gowarano.service
            $SUDO systemctl restart gowarano.service

            echo -e "\n${GREEN}====================================================================${NC}"
            echo -e "${GREEN}[✔] سرویس gowarano با موفقیت در لینوکس فعال شد و بعد از ریبوت سرور خودکار روشن می‌شود!${NC}"
            echo -e "آدرس دسترسی: ${BOLD}http://<IP-SERVER>:3000${NC}"
            echo -e "دستورات کاربردی سرویس:"
            echo -e "  - مشاهده وضعیت: ${CYAN}sudo systemctl status gowarano${NC}"
            echo -e "  - ریستارت:      ${CYAN}sudo systemctl restart gowarano${NC}"
            echo -e "  - مشاهده لاگ‌ها: ${CYAN}sudo journalctl -u gowarano -f${NC}"
            echo -e "${GREEN}====================================================================${NC}"
            ;;
        4)
            echo -e "\n${GREEN}در حال اجرای سرور نهایی (Preview) روی پورت 3000...${NC}"
            echo -e "${YELLOW}برای توقف کلید‌های Ctrl + C را فشار دهید.${NC}\n"
            npm run preview -- --port 3000 --host 0.0.0.0
            ;;
        5)
            echo -e "\n${GREEN}نصب و بیلد به پایان رسید. جهت اجرای بعدی می‌توانید از دستور زیر استفاده کنید:${NC}"
            echo -e "${CYAN}npm run dev${NC}  یا  ${CYAN}npm start${NC}\n"
            ;;
        *)
            echo -e "${YELLOW}گزینه انتخابی نامعتبر بود. برنامه با 'npm start' آماده اجراست.${NC}"
            ;;
    esac
}

# اجرای مراحل
main() {
    detect_os
    install_base_tools
    install_nodejs
    setup_env
    install_dependencies
    build_project
    choose_run_mode
}

main
