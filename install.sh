#!/usr/bin/env bash
# ==============================================================================
#  WATER Business Management Platform — Interactive Installation Wizard
# ==============================================================================

set -eo pipefail

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Check for non-interactive / automated flag
AUTO_YES=false
for arg in "$@"; do
  case "$arg" in
    -y|--yes|--defaults|-q|--quiet)
      AUTO_YES=true
      ;;
  esac
done

# Helper: Read input with default value
prompt_with_default() {
  local prompt_text="$1"
  local default_val="$2"
  local var_name="$3"
  local user_val=""

  if [ "$AUTO_YES" = true ]; then
    user_val="$default_val"
    echo -e "${prompt_text} [${default_val}]: ${default_val}"
  elif (exec < /dev/tty) 2>/dev/null && (exec > /dev/tty) 2>/dev/null; then
    printf "%b" "${prompt_text} [${default_val}]: " > /dev/tty
    read -r user_val < /dev/tty
  elif [ -t 0 ]; then
    read -p "$(printf "%b" "${prompt_text} [${default_val}]: ")" user_val
  else
    user_val="$default_val"
    echo -e "${prompt_text} [${default_val}]: ${default_val}"
  fi

  user_val=$(echo "$user_val" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  eval "$var_name=\"\${user_val:-\$default_val}\""
}

# ------------------------------------------------------------------------------
# 1. WATER ASCII BANNER
# ------------------------------------------------------------------------------
clear 2>/dev/null || true
echo -e "${CYAN}"
cat << "EOF"
██╗    ██╗ █████╗ ████████╗███████╗██████╗ 
██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝
██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
EOF
echo -e "${NC}"
echo -e "${BOLD}${BLUE}WATER Business Management Platform${NC}"
echo -e "${YELLOW}Interactive Installation Wizard${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo ""

# Sudo / Root Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Root privileges required.${NC}"
  echo -e "Please re-run this installer with sudo:"
  echo -e "   ${BOLD}sudo bash install.sh${NC}"
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect local IP
LOCAL_IP="127.0.0.1"
if command -v ip &>/dev/null; then
  LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || echo "127.0.0.1")
elif command -v hostname &>/dev/null; then
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
fi

# ------------------------------------------------------------------------------
# 2 & 3. CONFIGURATION QUESTIONS
# ------------------------------------------------------------------------------
echo -e "${BOLD}Please configure the installation settings below:${NC}"
echo -e "${CYAN}(Press ENTER to accept the sensible default in brackets)${NC}"
echo ""

# Question 1: Installation Directory
DEFAULT_INSTALL_DIR="/opt/water"
if [ "$SOURCE_DIR" = "/opt/water" ]; then
  DEFAULT_INSTALL_DIR="/opt/water"
elif [ -d "$SOURCE_DIR/src" ]; then
  DEFAULT_INSTALL_DIR="$SOURCE_DIR"
fi
prompt_with_default "Installation directory" "$DEFAULT_INSTALL_DIR" INSTALL_DIR

# Question 2: Host / Bind address
prompt_with_default "Host / bind address" "0.0.0.0" APP_HOST

# Question 3: Web Port with validation & availability check
check_port_occupied() {
  local p="$1"
  if command -v ss &>/dev/null; then
    ss -tulpn 2>/dev/null | grep -E ":${p}[[:space:]]" || return 1
  elif command -v lsof &>/dev/null; then
    lsof -i ":${p}" 2>/dev/null || return 1
  elif command -v netstat &>/dev/null; then
    netstat -tulpn 2>/dev/null | grep -E ":${p}[[:space:]]" || return 1
  elif command -v fuser &>/dev/null; then
    fuser "${p}/tcp" >/dev/null 2>&1 || return 1
  fi
  return 0
}

get_occupying_process() {
  local p="$1"
  if command -v lsof &>/dev/null; then
    lsof -i ":${p}" 2>/dev/null | tail -n +2 | awk '{print $1 " (PID: " $2 ")"}' | head -n 1
  elif command -v ss &>/dev/null; then
    ss -tulpn 2>/dev/null | grep -E ":${p}[[:space:]]" | awk '{print $NF}' | head -n 1
  else
    echo "Unknown process"
  fi
}

DEFAULT_PORT="3000"
while true; do
  prompt_with_default "Web server port" "$DEFAULT_PORT" APP_PORT

  # Port Validation (1-65535, numeric)
  if ! [[ "$APP_PORT" =~ ^[0-9]+$ ]] || [ "$APP_PORT" -lt 1 ] || [ "$APP_PORT" -gt 65535 ]; then
    echo -e "${RED}Invalid port. Please enter a valid TCP port (1-65535):${NC}"
    continue
  fi

  # Port Availability Check
  if check_port_occupied "$APP_PORT"; then
    OCC_PROC=$(get_occupying_process "$APP_PORT")
    echo -e "${YELLOW}Port ${APP_PORT} is already in use by: ${OCC_PROC}${NC}"
    echo -e "${YELLOW}Please choose another port or press ENTER to retry with default.${NC}"
    DEFAULT_PORT="3001"
    continue
  fi

  break
done

# Question 4: Environment
prompt_with_default "Environment (production/development)" "production" APP_ENV

# Question 5: Auto-start
prompt_with_default "Start application after installation? [Y/n]" "Y" START_AFTER_INPUT
START_AFTER="Yes"
case "$START_AFTER_INPUT" in
  [nN][oO]|[nN]) START_AFTER="No" ;;
  *) START_AFTER="Yes" ;;
esac

# ------------------------------------------------------------------------------
# 6. INSTALLATION SUMMARY & CONFIRMATION
# ------------------------------------------------------------------------------
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${BOLD}WATER INSTALLATION SUMMARY${NC}"
echo -e "${CYAN}==========================${NC}"
echo -e "Installation path : ${BOLD}${INSTALL_DIR}${NC}"
echo -e "Host              : ${BOLD}${APP_HOST}${NC}"
echo -e "Web port          : ${BOLD}${APP_PORT}${NC}"
echo -e "Environment       : ${BOLD}${APP_ENV}${NC}"
echo -e "Auto start        : ${BOLD}${START_AFTER}${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

prompt_with_default "Continue installation? [Y/n]" "Y" CONFIRM_INPUT
case "$CONFIRM_INPUT" in
  [nN][oO]|[nN])
    echo -e "${YELLOW}Installation cancelled by user.${NC}"
    exit 0
    ;;
esac

echo ""
echo -e "${GREEN}>>> Starting installation process...${NC}"

# ------------------------------------------------------------------------------
# 7. LINUX SYSTEM PREREQUISITES & NODE.JS / NPM AUTO-INSTALLER
# ------------------------------------------------------------------------------
echo -e "${BLUE}• Checking Linux system prerequisites and runtimes...${NC}"

# Detect Linux package manager
LINUX_PM=""
if command -v apt-get &>/dev/null; then
  LINUX_PM="apt"
elif command -v dnf &>/dev/null; then
  LINUX_PM="dnf"
elif command -v yum &>/dev/null; then
  LINUX_PM="yum"
elif command -v pacman &>/dev/null; then
  LINUX_PM="pacman"
elif command -v apk &>/dev/null; then
  LINUX_PM="apk"
elif command -v zypper &>/dev/null; then
  LINUX_PM="zypper"
fi

# 1. Install missing core CLI utilities (curl, rsync, git)
MISSING_UTILS=()
for util in curl rsync git; do
  if ! command -v "$util" &>/dev/null; then
    MISSING_UTILS+=("$util")
  fi
done

if [ ${#MISSING_UTILS[@]} -gt 0 ]; then
  echo -e "${YELLOW}• Auto-installing missing system utilities: ${MISSING_UTILS[*]}...${NC}"
  case "$LINUX_PM" in
    apt)
      apt-get update -y && apt-get install -y "${MISSING_UTILS[@]}"
      ;;
    dnf)
      dnf install -y "${MISSING_UTILS[@]}"
      ;;
    yum)
      yum install -y "${MISSING_UTILS[@]}"
      ;;
    pacman)
      pacman -Sy --noconfirm "${MISSING_UTILS[@]}"
      ;;
    apk)
      apk add --no-cache "${MISSING_UTILS[@]}"
      ;;
    zypper)
      zypper install -y "${MISSING_UTILS[@]}"
      ;;
    *)
      echo -e "${YELLOW}Please install ${MISSING_UTILS[*]} manually using your package manager.${NC}"
      ;;
  esac
fi

# 2. Check Node.js and npm runtime (auto-install Node.js 20 LTS if missing or old)
INSTALL_NODE=false
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  INSTALL_NODE=true
else
  CURRENT_NODE_VER=$(node -v 2>/dev/null | sed -E 's/^v([0-9]+).*/\1/')
  if [ -n "$CURRENT_NODE_VER" ] && [ "$CURRENT_NODE_VER" -lt 18 ]; then
    echo -e "${YELLOW}• Installed Node.js (v${CURRENT_NODE_VER}) is older than required LTS (v18+). Upgrading...${NC}"
    INSTALL_NODE=true
  fi
fi

if [ "$INSTALL_NODE" = true ]; then
  echo -e "${CYAN}• Auto-installing Node.js LTS (v20.x) and npm for Linux...${NC}"
  case "$LINUX_PM" in
    apt)
      curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
      apt-get update -y && apt-get install -y nodejs
      ;;
    dnf)
      curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
      dnf install -y nodejs
      ;;
    yum)
      curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
      yum install -y nodejs
      ;;
    pacman)
      pacman -Sy --noconfirm nodejs npm
      ;;
    apk)
      apk add --no-cache nodejs npm
      ;;
    zypper)
      zypper install -y nodejs20 npm20 || zypper install -y nodejs npm
      ;;
    *)
      echo -e "${YELLOW}[WARNING] Could not auto-install Node.js. Please ensure Node.js v20+ and npm are installed.${NC}"
      ;;
  esac
fi

if command -v node &>/dev/null; then
  echo -e "${GREEN}✓ Node.js detected: $(node -v)${NC}"
else
  echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js v20+ and npm.${NC}"
  exit 1
fi

if command -v npm &>/dev/null; then
  echo -e "${GREEN}✓ npm detected    : $(npm -v)${NC}"
else
  echo -e "${RED}[ERROR] npm is not installed. Please install npm.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# Directory Setup & Copy (Idempotent)
# ------------------------------------------------------------------------------
if [ "$SOURCE_DIR" != "$INSTALL_DIR" ]; then
  echo -e "${BLUE}• Preparing destination directory: ${INSTALL_DIR}...${NC}"
  mkdir -p "$INSTALL_DIR"
  
  # Copy source files excluding build artifacts and node_modules
  rsync -a --exclude="node_modules" --exclude="dist" --exclude=".git" "$SOURCE_DIR/" "$INSTALL_DIR/" || cp -r "$SOURCE_DIR/"* "$INSTALL_DIR/"
fi

cd "$INSTALL_DIR"

# ------------------------------------------------------------------------------
# 8. DEPENDENCY INSTALLATION (Smart Check & Incremental Cache)
# ------------------------------------------------------------------------------
echo -e "${BLUE}• Checking project dependencies and node_modules...${NC}"

# Check if node_modules exists and core packages are present
if [ -d "node_modules" ] && [ -d "node_modules/react" ] && [ -d "node_modules/express" ] && [ -d "node_modules/vite" ] && [ -d "node_modules/sms-typescript" ]; then
  # Check if all top-level dependencies are satisfied
  if npm ls --depth=0 &>/dev/null; then
    echo -e "${GREEN}✓ All npm packages are already installed and satisfied. Skipping redundant reinstallation.${NC}"
  else
    echo -e "${YELLOW}• Some packages are missing. Installing only missing packages (preserving existing ones)...${NC}"
    npm install --prefer-offline --no-audit --no-fund
    echo -e "${GREEN}✓ Missing dependencies installed successfully.${NC}"
  fi
else
  echo -e "${BLUE}• Installing project dependencies (npm install with offline cache preference)...${NC}"
  if npm install --prefer-offline --no-audit --no-fund; then
    echo -e "${GREEN}✓ npm dependencies installed successfully.${NC}"
  else
    echo -e "${YELLOW}• Retrying npm install with --legacy-peer-deps...${NC}"
    npm install --legacy-peer-deps --prefer-offline --no-audit --no-fund
    echo -e "${GREEN}✓ Dependencies installed successfully with legacy peer deps.${NC}"
  fi
fi

# ------------------------------------------------------------------------------
# 8. BUILD
# ------------------------------------------------------------------------------
echo -e "${BLUE}• Building production frontend assets...${NC}"
BUILD_SUCCESS=false

if npm run build; then
  BUILD_SUCCESS=true
fi

if [ "$BUILD_SUCCESS" = false ]; then
  echo ""
  echo -e "${RED}[ERROR] Build failed!${NC}"
  echo -e "${RED}The application build process returned a non-zero exit code.${NC}"
  echo -e "${RED}Please resolve any compilation issues and re-run install.sh.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build succeeded.${NC}"

# ------------------------------------------------------------------------------
# 10. GENERATE ENVIRONMENT FILE
# ------------------------------------------------------------------------------
echo -e "${BLUE}• Generating environment configuration (.env)...${NC}"
cat > "$INSTALL_DIR/.env" << EOF
HOST="${APP_HOST}"
PORT="${APP_PORT}"
NODE_ENV="${APP_ENV}"
SMS_API_KEY="cqusH7jQYJDfj6VLPJk6hcJTdYbmNMsx70X6iTTEezjAe8Ea"
EOF
chmod 600 "$INSTALL_DIR/.env"

# ------------------------------------------------------------------------------
# 11 & 12. SYSTEMD SERVICE CREATION (water.service)
# ------------------------------------------------------------------------------
echo -e "${BLUE}• Setting up systemd service (water.service)...${NC}"
NODE_BIN=$(command -v node || echo "/usr/bin/node")

cat > /etc/systemd/system/water.service << EOF
[Unit]
Description=WATER B2B Business Management Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=${NODE_BIN} ${INSTALL_DIR}/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

if command -v systemctl &>/dev/null && [ -d /run/systemd/system ]; then
  systemctl daemon-reload 2>/dev/null || true
  systemctl enable water.service 2>/dev/null || true
fi

# Make management scripts executable
chmod +x "$INSTALL_DIR"/*.sh 2>/dev/null || true

# ------------------------------------------------------------------------------
# 9. START IF REQUESTED
# ------------------------------------------------------------------------------
if [ "$START_AFTER" = "Yes" ]; then
  if command -v systemctl &>/dev/null && [ -d /run/systemd/system ]; then
    echo -e "${BLUE}• Starting WATER service via systemd...${NC}"
    systemctl restart water.service 2>/dev/null || true
    sleep 2
  else
    echo -e "${BLUE}• Starting WATER service in background...${NC}"
    nohup bash "$INSTALL_DIR/start.sh" > /tmp/water.log 2>&1 &
    sleep 2
  fi
fi

# ------------------------------------------------------------------------------
# 13. FINAL STATUS & COMPLETION
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}======================================================================${NC}"
echo -e "${BOLD}${GREEN}✓ WATER Business Management Platform installed successfully!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo ""

# Call status.sh to show the clean banner
bash "$INSTALL_DIR/status.sh"

echo ""
echo -e "${BOLD}Management Commands:${NC}"
echo -e "  Start service   : ${CYAN}bash ${INSTALL_DIR}/start.sh${NC}   (or sudo systemctl start water)"
echo -e "  Stop service    : ${CYAN}bash ${INSTALL_DIR}/stop.sh${NC}    (or sudo systemctl stop water)"
echo -e "  Restart service : ${CYAN}bash ${INSTALL_DIR}/restart.sh${NC} (or sudo systemctl restart water)"
echo -e "  Check status    : ${CYAN}bash ${INSTALL_DIR}/status.sh${NC}  (or sudo systemctl status water)"
echo -e "  View live logs  : ${CYAN}sudo journalctl -u water -f${NC}"
echo -e "  Uninstall       : ${CYAN}bash ${INSTALL_DIR}/uninstall.sh${NC}"
echo ""
