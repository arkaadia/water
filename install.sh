#!/usr/bin/env bash
# ==============================================================================
#  سامانه جامع پخش مویرگی و فروش عمده آب و نوشیدنی گوارانو (B2B)
#  Gowarano B2B Water & Beverage Distribution Management Platform
#  Automated Installation & Systemd Service Setup Script for Linux
# ==============================================================================

set -e

# ANSI Color Codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ------------------------------------------------------------------------------
# Helper Functions: TTY & Pipe Detection
# ------------------------------------------------------------------------------
has_usable_tty() {
  (exec < /dev/tty) 2>/dev/null && (exec > /dev/tty) 2>/dev/null
}

prompt_input() {
  local prompt_text="$1"
  local var_name="$2"
  local default_val="$3"
  local user_input=""

  if has_usable_tty; then
    printf "%b" "$prompt_text" > /dev/tty
    read -r user_input < /dev/tty
  elif [ -t 0 ]; then
    read -p "$prompt_text" user_input
  else
    printf "%b" "$prompt_text"
    user_input="$default_val"
    echo -e " [پیش‌فرض خودکار: ${default_val}]"
  fi

  user_input=$(echo "$user_input" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  eval "$var_name=\"\${user_input:-\$default_val}\""
}

# ------------------------------------------------------------------------------
# Package Manager Lock Handler (Debian/Ubuntu)
# ------------------------------------------------------------------------------
is_dpkg_locked() {
  if command -v fuser &>/dev/null; then
    if fuser /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock >/dev/null 2>&1; then
      return 0
    fi
  elif command -v lsof &>/dev/null; then
    if lsof /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || lsof /var/lib/dpkg/lock >/dev/null 2>&1; then
      return 0
    fi
  fi
  if pgrep -f "unattended-upgr" >/dev/null 2>&1 || \
     pgrep -f "apt.systemd.daily" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

wait_for_dpkg_lock() {
  local max_wait=120
  local waited=0
  local locked=false
  while is_dpkg_locked; do
    locked=true
    if [ $waited -eq 0 ]; then
      echo -e "${YELLOW}قفل پکیج‌منیجر (apt/dpkg) توسط پردازش‌های پس‌زمینه لینوکس در حال استفاده است.${NC}"
      echo -e "${YELLOW}در حال شکیبایی برای پایان آپدیت پس‌زمینه (حداکثر ${max_wait} ثانیه)...${NC}"
    fi
    sleep 3
    waited=$((waited + 3))
    if [ $waited -ge $max_wait ]; then
      echo -e "${YELLOW}توقف پردازش‌های آپدیت پس‌زمینه برای ادامه بدون اختلال...${NC}"
      systemctl stop unattended-upgrades 2>/dev/null || true
      systemctl stop apt-daily.service 2>/dev/null || true
      systemctl stop apt-daily-upgrade.service 2>/dev/null || true
      pkill -f "unattended-upgr" 2>/dev/null || true
      sleep 2
      break
    fi
  done
  [ "$locked" = true ] && echo -e "${GREEN}✓ قفل پکیج‌منیجر آزاد شد.${NC}"
  DEBIAN_FRONTEND=noninteractive dpkg --configure -a 2>/dev/null || true
}

# ------------------------------------------------------------------------------
# System Swap Check (Avoid Out-Of-Memory during build on small VPS)
# ------------------------------------------------------------------------------
ensure_system_swap() {
  local total_swap_mb=0
  if [ -f /proc/meminfo ]; then
    total_swap_mb=$(awk '/SwapTotal/ {printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)
  fi

  local total_ram_mb=0
  if [ -f /proc/meminfo ]; then
    total_ram_mb=$(awk '/MemTotal/ {printf "%d", $2/1024}' /proc/meminfo 2>/dev/null || echo 0)
  fi

  if [ "$total_swap_mb" -lt 512 ] && [ "$total_ram_mb" -lt 2500 ]; then
    echo -e "${CYAN}رم فیزیکی سرور محدود است (${total_ram_mb}MB). ایجاد ۱ گیگابایت فضای Swap موقت جهت جلوگیری از کرش بیلد...${NC}"
    if [ ! -f /swapfile_gowarano ]; then
      fallocate -l 1G /swapfile_gowarano 2>/dev/null || dd if=/dev/zero of=/swapfile_gowarano bs=1M count=1024 2>/dev/null || true
      if [ -f /swapfile_gowarano ]; then
        chmod 600 /swapfile_gowarano
        mkswap /swapfile_gowarano >/dev/null 2>&1 || true
        swapon /swapfile_gowarano >/dev/null 2>&1 || true
        echo -e "${GREEN}✓ حافظه کمکی Swap فعال شد.${NC}"
      fi
    fi
  fi
}

# ------------------------------------------------------------------------------
# Banner
# ------------------------------------------------------------------------------
clear 2>/dev/null || true
echo -e "${CYAN}══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}  💧 سامانه جامع پخش مویرگی و فروش عمده آب و انواع نوشیدنی گوارانو B2B${NC}"
echo -e "${BOLD}${GREEN}     Gowarano B2B Water & Beverage Distribution Management Platform${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  اسکریپت خودکار نصب، بیلد و راه‌اندازی دائمی روی سرور لینوکس${NC}"
echo ""

# ------------------------------------------------------------------------------
# 1. Root / Sudo Check
# ------------------------------------------------------------------------------
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[خطا] این اسکریپت نیازمند دسترسی ریشه (root) است.${NC}"
  echo -e "لطفاً با دستور زیر اجرا فرمایید:"
  echo -e "   ${BOLD}sudo bash install.sh${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 2. Working Directory & Repo Setup
# ------------------------------------------------------------------------------
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"
echo -e "${GREEN}✓ مسیر ریشه پروژه:${NC} $APP_DIR"

# ------------------------------------------------------------------------------
# 3. Detect Server IP & Port Prompt
# ------------------------------------------------------------------------------
LOCAL_IP=""
if command -v ip &>/dev/null; then
  LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || true)
fi
if [ -z "$LOCAL_IP" ] && command -v hostname &>/dev/null; then
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
fi
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

# Try getting public IP if available
PUBLIC_IP=$(curl -s --max-time 3 https://api.ipify.org 2>/dev/null || echo "$LOCAL_IP")

echo ""
echo -e "${CYAN}>>> مرحله ۱: تنظیمات پورت شبکه${NC}"
while true; do
  prompt_input "پورت دسترسی به پنل گوارانو [پیش‌فرض: 3000]: " PANEL_PORT "3000"
  if [[ "$PANEL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_PORT" -ge 1 ] && [ "$PANEL_PORT" -le 65535 ]; then
    break
  else
    echo -e "${RED}پورت نامعتبر است! عددی بین 1 تا 65535 وارد کنید.${NC}"
  fi
done

echo -e "${GREEN}✓ پورت انتخابی:${NC} ${BOLD}$PANEL_PORT${NC}"

# ------------------------------------------------------------------------------
# 4. OS Detection & Base Tools Installation
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[1/5]${NC} ${BOLD}بررسی سیستم‌عامل و نصب پیش‌نیازهای لینوکس...${NC}"
OS_FAMILY="unknown"

if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS_FAMILY=$ID
fi

echo -e "سیستم‌عامل شناسایی‌شده: ${BOLD}$OS_FAMILY${NC}"

ensure_system_swap

case "$OS_FAMILY" in
  ubuntu|debian|raspbian)
    wait_for_dpkg_lock
    DEBIAN_FRONTEND=noninteractive apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y curl git build-essential iproute2 < /dev/null
    ;;
  centos|rhel|rocky|almalinux|fedora)
    yum install -y curl git gcc-c++ make iproute || dnf install -y curl git gcc-c++ make iproute
    ;;
  arch|manjaro)
    pacman -Sy --noconfirm curl git base-devel iproute2
    ;;
  *)
    echo -e "${YELLOW}[هشدار] نوع سیستم‌عامل ناشناخته است؛ ادامه با فرض نصب بودن ابزارهای پایه...${NC}"
    ;;
esac

echo -e "${GREEN}✓ ابزارهای پایه تایید شدند.${NC}"

# ------------------------------------------------------------------------------
# 5. Node.js & npm Installation (Node.js 20 LTS)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[2/5]${NC} ${BOLD}بررسی و نصب Node.js v20 LTS...${NC}"
NODE_OK=false

if command -v node &>/dev/null; then
  NODE_VER=$(node -v | tr -d 'v' | cut -d'.' -f1)
  if [ "$NODE_VER" -ge 18 ]; then
    echo -e "${GREEN}✓ نسخه مناسب Node.js موجود است: $(node -v)${NC}"
    NODE_OK=true
  fi
fi

if [ "$NODE_OK" = false ]; then
  echo -e "${YELLOW}در حال نصب Node.js 20 LTS از مخزن رسمی NodeSource...${NC}"
  case "$OS_FAMILY" in
    ubuntu|debian|raspbian)
      wait_for_dpkg_lock
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      wait_for_dpkg_lock
      DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs < /dev/null
      ;;
    centos|rhel|rocky|almalinux|fedora)
      curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
      yum install -y nodejs || dnf install -y nodejs
      ;;
    arch|manjaro)
      pacman -Sy --noconfirm nodejs npm
      ;;
    *)
      echo -e "${RED}[خطا] امکان نصب خودکار Node.js روی این توزیع وجود ندارد.${NC}"
      exit 1
      ;;
  esac
  echo -e "${GREEN}✓ با موفقیت نصب شد: Node $(node -v) و npm $(npm -v)${NC}"
fi

# ------------------------------------------------------------------------------
# 6. Environment & Dependencies Setup
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[3/5]${NC} ${BOLD}نصب وابستگی‌های پروژه (Dependencies)...${NC}"

if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo -e "${GREEN}✓ فایل .env ایجاد شد.${NC}"
fi

# Set custom PORT in .env if needed
if [ -f "$APP_DIR/.env" ]; then
  if grep -q "PORT=" "$APP_DIR/.env"; then
    sed -i "s/PORT=.*/PORT=$PANEL_PORT/" "$APP_DIR/.env"
  else
    echo "PORT=$PANEL_PORT" >> "$APP_DIR/.env"
  fi
fi

cd "$APP_DIR"
if ! npm install; then
  echo -e "${YELLOW}[!] تلاش مجدد با آرگومان --legacy-peer-deps...${NC}"
  npm install --legacy-peer-deps
fi
echo -e "${GREEN}✓ تمامی کتابخانه‌ها نصب شدند.${NC}"

# ------------------------------------------------------------------------------
# 7. Production Build
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[4/5]${NC} ${BOLD}کامپایل و ساخت نسخه نهایی پروداکشن (Build)...${NC}"
NODE_OPTIONS="--max-old-space-size=2048" npm run build
echo -e "${GREEN}✓ بیلد پروداکشن با موفقیت در پوشه dist ایجاد شد.${NC}"

# ------------------------------------------------------------------------------
# 8. Create Management Scripts (start / stop / restart / status / uninstall)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[5/5]${NC} ${BOLD}ایجاد اسکریپت‌های مدیریت و سرویس لینوکس (Systemd)...${NC}"

# start.sh
cat << 'EOF' > "$APP_DIR/start.sh"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;32mروشن کردن سرویس water-b2b از طریق systemd...\033[0m"
  sudo systemctl start water-b2b
  sudo systemctl status water-b2b --no-pager
else
  echo -e "\033[0;36mاجرای مستقیم پنل گوارانو...\033[0m"
  npm start
fi
EOF
chmod +x "$APP_DIR/start.sh"

# stop.sh
cat << 'EOF' > "$APP_DIR/stop.sh"
#!/usr/bin/env bash
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;33mمتوقف کردن سرویس water-b2b...\033[0m"
  sudo systemctl stop water-b2b
  echo -e "\033[0;32mسرویس متوقف شد.\033[0m"
else
  echo -e "\033[0;33mبستن پردازش‌های در حال اجرای پنل...\033[0m"
  pkill -f "node server.js" || true
  pkill -f "vite preview" || true
  echo -e "\033[0;32mپردازش‌ها بسته شدند.\033[0m"
fi
EOF
chmod +x "$APP_DIR/stop.sh"

# restart.sh
cat << 'EOF' > "$APP_DIR/restart.sh"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;33mراه‌اندازی مجدد سرویس water-b2b...\033[0m"
  sudo systemctl restart water-b2b
  sudo systemctl status water-b2b --no-pager
else
  "$DIR/stop.sh"
  sleep 1
  "$DIR/start.sh"
fi
EOF
chmod +x "$APP_DIR/restart.sh"

# status.sh
cat << 'EOF' > "$APP_DIR/status.sh"
#!/usr/bin/env bash
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  sudo systemctl status water-b2b --no-pager
else
  ps aux | grep -E "node server.js|vite preview" | grep -v grep || echo "پنل در حال اجرا نیست."
fi
EOF
chmod +x "$APP_DIR/status.sh"

# uninstall.sh
cat << 'EOF' > "$APP_DIR/uninstall.sh"
#!/usr/bin/env bash
# ==============================================================================
# اسکریپت حذف سامانه پخش مویرگی گوارانو B2B
# ==============================================================================
if [ "$EUID" -ne 0 ]; then
  echo "لطفاً با دسترسی root یا sudo اجرا نمایید: sudo bash uninstall.sh"
  exit 1
fi

echo -e "\033[0;33mدر حال متوقف‌سازی و غیرفعال‌کردن سرویس water-b2b...\033[0m"
systemctl stop water-b2b.service 2>/dev/null || true
systemctl disable water-b2b.service 2>/dev/null || true
rm -f /etc/systemd/system/water-b2b.service
systemctl daemon-reload

pkill -f "node server.js" || true
pkill -f "vite preview" || true

echo -e "\033[0;32m✓ سرویس water-b2b با موفقیت از سیستم‌عامل لینوکس حذف گردید.\033[0m"
EOF
chmod +x "$APP_DIR/uninstall.sh"

# ------------------------------------------------------------------------------
# 9. Configure & Start Systemd Daemon Service
# ------------------------------------------------------------------------------
SERVICE_FILE="/etc/systemd/system/water-b2b.service"
RUN_USER=${SUDO_USER:-$(whoami)}
NODE_BIN=$(command -v node)

# Stop previous instances if running
systemctl stop water-b2b.service 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
sleep 1

cat << EOF > "$SERVICE_FILE"
[Unit]
Description=Gowarano B2B Water & Beverage Distribution Management Platform
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=-$APP_DIR/.env
Environment=PORT=$PANEL_PORT
Environment=HOST=0.0.0.0
Environment=NODE_ENV=production
ExecStart=$NODE_BIN $APP_DIR/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable water-b2b.service
systemctl restart water-b2b.service

sleep 2

# Check health
if ! systemctl is-active --quiet water-b2b.service; then
  echo -e "${YELLOW}[هشدار] سرویس با وضعیت فعال گزارش نشد؛ لاگ‌های زیر را بررسی کنید:${NC}"
  journalctl -u water-b2b.service -n 20 --no-pager || true
else
  echo -e "${GREEN}✓ سرویس لینوکسی water-b2b با موفقیت فعال شد و در حال اجراست.${NC}"
fi

# ------------------------------------------------------------------------------
# 10. Firewall Configuration (UFW / Firewalld)
# ------------------------------------------------------------------------------
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow "$PANEL_PORT/tcp" comment 'Gowarano B2B Distribution Platform' 2>/dev/null || true
  echo -e "${GREEN}✓ پورت $PANEL_PORT در فایروال UFW باز شد.${NC}"
fi

if command -v firewall-cmd &>/dev/null && systemctl is-active --quiet firewalld; then
  firewall-cmd --zone=public --add-port="$PANEL_PORT/tcp" --permanent >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
  echo -e "${GREEN}✓ پورت $PANEL_PORT در فایروال Firewalld باز شد.${NC}"
fi

# ------------------------------------------------------------------------------
# Success Output
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD} 🎉  نصب و راه‌اندازی سامانه گوارانو B2B با موفقیت به پایان رسید!      ${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "🌐 ${BOLD}آدرس‌های دسترسی به سامانه در مرورگر:${NC}"
echo -e "   • آدرس سرور (Public IP):  ${CYAN}${BOLD}http://${PUBLIC_IP}:${PANEL_PORT}${NC}"
echo -e "   • آدرس شبکه داخلی (Local): ${BLUE}${BOLD}http://${LOCAL_IP}:${PANEL_PORT}${NC}"
echo ""
echo -e "⚙️  ${BOLD}وضعیت سرویس سیستمی:${NC}"
echo -e "   • نام سرویس لینوکس:       ${PURPLE}${BOLD}water-b2b.service${NC}"
echo -e "   • شروع خودکار بعد از بوت: ${GREEN}فعال (Enabled)${NC}"
echo -e "   • پورت فعال سرویس:        ${YELLOW}${PANEL_PORT}${NC}"
echo ""
echo -e "🛠️  ${BOLD}اسکریپت‌های مدیریت سریع (در پوشه پروژه):${NC}"
echo -e "   • وضعیت سرویس:          ${YELLOW}./status.sh${NC}      (یا sudo systemctl status water-b2b)"
echo -e "   • راه‌اندازی مجدد:       ${YELLOW}./restart.sh${NC}     (یا sudo systemctl restart water-b2b)"
echo -e "   • متوقف کردن سرویس:     ${YELLOW}./stop.sh${NC}        (یا sudo systemctl stop water-b2b)"
echo -e "   • روشن کردن سرویس:      ${YELLOW}./start.sh${NC}       (یا sudo systemctl start water-b2b)"
echo -e "   • مشاهده لاگ‌های زنده:    ${YELLOW}sudo journalctl -u water-b2b -f${NC}"
echo -e "   • حذف کامل سرویس:       ${YELLOW}sudo ./uninstall.sh${NC}"
echo ""
echo -e "${PURPLE}${BOLD}از کاربری سامانه یکپارچه پخش مویرگی گوارانو لذت ببرید! 🚀${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════════════${NC}"
