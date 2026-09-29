#!/usr/bin/env bash
# ==============================================================================
#  ██╗    ██╗ █████╗ ████████╗███████╗██████╗ 
#  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗
#  ██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝
#  ██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗
#  ╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║
#   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
#
#  WATER Business Management Platform
#  Interactive Installation Wizard
# ==============================================================================

set -eo pipefail

# ANSI Color Codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ------------------------------------------------------------------------------
# Helpers: Terminal Input & Printing
# ------------------------------------------------------------------------------
print_banner() {
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
  echo -e "${BOLD}WATER Business Management Platform${NC}"
  echo -e "${BLUE}Interactive Installation Wizard${NC}"
  echo -e "${CYAN}------------------------------------------------------------${NC}"
}

prompt_input() {
  local prompt_text="$1"
  local default_val="$2"
  local user_input=""

  printf "%b" "$prompt_text" >&2
  if read -r user_input; then
    user_input=$(echo "$user_input" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  fi
  if [ -z "$user_input" ]; then
    user_input="$default_val"
  fi
  echo "$user_input"
}

is_valid_port() {
  local p="$1"
  if [[ "$p" =~ ^[0-9]+$ ]] && [ "$p" -ge 1 ] && [ "$p" -le 65535 ]; then
    return 0
  fi
  return 1
}

# Check if port is listening
is_port_in_use() {
  local p="$1"
  if command -v node >/dev/null 2>&1; then
    node -e '
      const net = require("net");
      const s = net.createServer();
      s.once("error", err => {
        if (err.code === "EADDRINUSE") { process.exit(0); }
        process.exit(1);
      });
      s.once("listening", () => {
        s.close();
        process.exit(1);
      });
      s.listen('"$p"', "0.0.0.0");
    ' 2>/dev/null && return 0 || return 1
  elif command -v ss >/dev/null 2>&1; then
    if ss -ltn "sport = :$p" 2>/dev/null | grep -q ":$p "; then
      return 0
    fi
  elif command -v lsof >/dev/null 2>&1; then
    if lsof -i ":$p" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

get_port_process_info() {
  local p="$1"
  local info=""
  if command -v ss >/dev/null 2>&1; then
    info=$(ss -lptn "sport = :$p" 2>/dev/null | grep -o 'users:(.*)' || true)
  fi
  if [ -z "$info" ] && command -v lsof >/dev/null 2>&1; then
    info=$(lsof -i ":$p" -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $1 " (PID: " $2 ")"}' | head -n 1 || true)
  fi
  if [ -z "$info" ] && command -v fuser >/dev/null 2>&1; then
    info=$(fuser "$p/tcp" 2>/dev/null || true)
    [ -n "$info" ] && info="PID: $info"
  fi
  echo "${info:-Unknown process}"
}

# Detect local IP
get_local_ip() {
  local ip=""
  if command -v ip >/dev/null 2>&1; then
    ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || true)
  fi
  if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
    ip=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
  fi
  echo "${ip:-127.0.0.1}"
}

# ------------------------------------------------------------------------------
# Start Wizard
# ------------------------------------------------------------------------------
print_banner

# Detect Existing Installation
PREV_INSTALL_DIR="/opt/water"
PREV_PORT="3000"
PREV_HOST="0.0.0.0"
PREV_ENV="production"
PREV_AUTO="Yes"
EXISTING_FOUND=false

if [ -f "$SOURCE_DIR/.water.conf" ]; then
  # shellcheck source=/dev/null
  source "$SOURCE_DIR/.water.conf" 2>/dev/null || true
  EXISTING_FOUND=true
elif [ -f "/opt/water/.water.conf" ]; then
  # shellcheck source=/dev/null
  source "/opt/water/.water.conf" 2>/dev/null || true
  EXISTING_FOUND=true
fi

if [ "$EXISTING_FOUND" = true ]; then
  [ -n "$INSTALL_DIR" ] && PREV_INSTALL_DIR="$INSTALL_DIR"
  [ -n "$PORT" ] && PREV_PORT="$PORT"
  [ -n "$HOST" ] && PREV_HOST="$HOST"
  [ -n "$NODE_ENV" ] && PREV_ENV="$NODE_ENV"
  [ -n "$AUTO_START" ] && PREV_AUTO="$AUTO_START"

  echo -e "${YELLOW}========================================${NC}"
  echo -e "${BOLD}${YELLOW}EXISTING INSTALLATION DETECTED${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo -e "An existing WATER configuration was found:"
  echo -e "  Installation path : ${BOLD}$PREV_INSTALL_DIR${NC}"
  echo -e "  Host              : ${BOLD}$PREV_HOST${NC}"
  echo -e "  Web port          : ${BOLD}$PREV_PORT${NC}"
  echo -e "  Environment       : ${BOLD}$PREV_ENV${NC}"
  echo -e "  Auto start        : ${BOLD}$PREV_AUTO${NC}"
  echo ""
  echo -e "Options:"
  echo -e "  1) Keep existing configuration and update/rebuild"
  echo -e "  2) Reconfigure settings"
  echo -e "  3) Cancel installation"
  EXIST_CHOICE=$(prompt_input "Choose an option [1]: " "1")

  case "$EXIST_CHOICE" in
    1)
      CFG_INSTALL_DIR="$PREV_INSTALL_DIR"
      CFG_PORT="$PREV_PORT"
      CFG_HOST="$PREV_HOST"
      CFG_ENV="$PREV_ENV"
      CFG_AUTO_START="$PREV_AUTO"
      SKIP_QUESTIONS=true
      ;;
    2)
      SKIP_QUESTIONS=false
      ;;
    3|*)
      if [ "$EXIST_CHOICE" = "3" ]; then
        echo -e "\n${YELLOW}Installation cancelled by user.${NC}"
        exit 0
      else
        SKIP_QUESTIONS=false
      fi
      ;;
  esac
fi

# ------------------------------------------------------------------------------
# Configuration Questions
# ------------------------------------------------------------------------------
if [ "${SKIP_QUESTIONS:-false}" != true ]; then
  echo -e "${BLUE}Please configure the installation settings below.${NC}"
  echo -e "${BLUE}Press ENTER to accept the default value in brackets [ ].${NC}\n"

  # 1. Installation Directory
  DEFAULT_DIR="/opt/water"
  [ -n "$PREV_INSTALL_DIR" ] && DEFAULT_DIR="$PREV_INSTALL_DIR"
  # If currently running in /opt/water, keep it
  CFG_INSTALL_DIR=$(prompt_input "Installation directory [$DEFAULT_DIR]: " "$DEFAULT_DIR")
  # Strip trailing slash
  CFG_INSTALL_DIR="${CFG_INSTALL_DIR%/}"

  # 2. Web Port (with validation & availability check)
  DEFAULT_PORT="3000"
  [ -n "$PREV_PORT" ] && DEFAULT_PORT="$PREV_PORT"

  while true; do
    CFG_PORT=$(prompt_input "Web port [$DEFAULT_PORT]: " "$DEFAULT_PORT")

    if ! is_valid_port "$CFG_PORT"; then
      echo -e "${RED}Invalid port. Please enter a valid TCP port (1-65535).${NC}"
      continue
    fi

    # Check port availability
    if is_port_in_use "$CFG_PORT"; then
      PROC_INFO=$(get_port_process_info "$CFG_PORT")
      echo ""
      echo -e "${YELLOW}Port $CFG_PORT is already in use.${NC}"
      echo -e "${YELLOW}Process using this port: ${BOLD}$PROC_INFO${NC}"
      echo -e "${YELLOW}Please choose another port or press ENTER to return to the default configuration.${NC}"
      DEFAULT_PORT="3000"
      continue
    fi

    break
  done

  # 3. Host / Bind address
  DEFAULT_HOST="0.0.0.0"
  [ -n "$PREV_HOST" ] && DEFAULT_HOST="$PREV_HOST"
  CFG_HOST=$(prompt_input "Host [$DEFAULT_HOST]: " "$DEFAULT_HOST")

  # 4. Environment
  DEFAULT_ENV="production"
  [ -n "$PREV_ENV" ] && DEFAULT_ENV="$PREV_ENV"
  while true; do
    CFG_ENV=$(prompt_input "Environment (production/development) [$DEFAULT_ENV]: " "$DEFAULT_ENV")
    CFG_ENV=$(echo "$CFG_ENV" | tr '[:upper:]' '[:lower:]')
    if [ "$CFG_ENV" = "production" ] || [ "$CFG_ENV" = "development" ] || [ "$CFG_ENV" = "prod" ] || [ "$CFG_ENV" = "dev" ]; then
      [ "$CFG_ENV" = "prod" ] && CFG_ENV="production"
      [ "$CFG_ENV" = "dev" ] && CFG_ENV="development"
      break
    else
      echo -e "${RED}Invalid environment. Please enter 'production' or 'development'.${NC}"
    fi
  done

  # 5. Auto Start
  DEFAULT_AUTO="Y"
  CFG_AUTO_RESP=$(prompt_input "Start application after installation? [Y/n]: " "$DEFAULT_AUTO")
  case "$CFG_AUTO_RESP" in
    [nN]|[nN][oO])
      CFG_AUTO_START="No"
      ;;
    *)
      CFG_AUTO_START="Yes"
      ;;
  esac
fi

# ------------------------------------------------------------------------------
# Installation Summary
# ------------------------------------------------------------------------------
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${BOLD}WATER INSTALLATION SUMMARY${NC}"
echo -e "${CYAN}==========================${NC}"
echo ""
echo -e "Installation path : ${BOLD}$CFG_INSTALL_DIR${NC}"
echo -e "Host              : ${BOLD}$CFG_HOST${NC}"
echo -e "Web port          : ${BOLD}$CFG_PORT${NC}"
echo -e "Environment       : ${BOLD}$CFG_ENV${NC}"
echo -e "Auto start        : ${BOLD}$CFG_AUTO_START${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo ""

CONFIRM_INSTALL=$(prompt_input "Continue installation? [Y/n]: " "Y")
case "$CONFIRM_INSTALL" in
  [nN]|[nN][oO])
    echo -e "\n${YELLOW}Installation cancelled by user.${NC}"
    exit 0
    ;;
  *)
    ;;
esac

echo ""
echo -e "${GREEN}[1/5] Setting up installation directory...${NC}"

# Check write permissions on target dir
if [ ! -d "$CFG_INSTALL_DIR" ]; then
  mkdir -p "$CFG_INSTALL_DIR" 2>/dev/null || {
    echo -e "${RED}[ERROR] Cannot create directory $CFG_INSTALL_DIR. Please run with sudo / root.${NC}"
    exit 1
  }
fi

# Sync or copy files if source differs from install dir
if [ "$SOURCE_DIR" != "$CFG_INSTALL_DIR" ]; then
  echo -e "Copying project files from $SOURCE_DIR to $CFG_INSTALL_DIR..."
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude=".git" \
      --exclude="node_modules" \
      --exclude="water.pid" \
      --exclude="water.log" \
      "$SOURCE_DIR/" "$CFG_INSTALL_DIR/"
  else
    tar --exclude=".git" --exclude="node_modules" --exclude="water.pid" --exclude="water.log" -cf - -C "$SOURCE_DIR" . | tar -xf - -C "$CFG_INSTALL_DIR"
  fi
fi

cd "$CFG_INSTALL_DIR"

# ------------------------------------------------------------------------------
# Package Manager Detection & Dependency Installation
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}[2/5] Detecting package manager and installing dependencies...${NC}"

PKG_MGR="bun"
if command -v bun >/dev/null 2>&1; then
  PKG_MGR="bun"
  BUN_BIN="$(command -v bun)"
elif [ -x "/usr/local/bin/bun" ]; then
  PKG_MGR="bun"
  BUN_BIN="/usr/local/bin/bun"
  export PATH="/usr/local/bin:$PATH"
elif [ -x "$HOME/.bun/bin/bun" ]; then
  PKG_MGR="bun"
  BUN_BIN="$HOME/.bun/bin/bun"
  export PATH="$HOME/.bun/bin:$PATH"
else
  # If bun is not found, install it or fall back to npm
  if command -v curl >/dev/null 2>&1; then
    echo -e "${BLUE}bun.lock detected. Installing Bun for optimal compatibility...${NC}"
    if curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1; then
      export PATH="$HOME/.bun/bin:/usr/local/bin:$PATH"
      if command -v bun >/dev/null 2>&1; then
        PKG_MGR="bun"
        BUN_BIN="$(command -v bun)"
      fi
    fi
  fi
  if ! command -v bun >/dev/null 2>&1; then
    PKG_MGR="npm"
    echo -e "${YELLOW}Bun not available; using npm.${NC}"
  fi
fi

echo -e "Using package manager: ${BOLD}$PKG_MGR${NC}"

# Execute clean install (NO --force, NO --legacy-peer-deps)
if [ "$PKG_MGR" = "bun" ]; then
  if ! bun install; then
    echo -e "${RED}[ERROR] Dependency installation with bun failed.${NC}"
    exit 1
  fi
else
  if ! npm install; then
    echo -e "${RED}[ERROR] Dependency installation with npm failed.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"

# ------------------------------------------------------------------------------
# Build Application
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}[3/5] Building application for production...${NC}"

if [ "$PKG_MGR" = "bun" ]; then
  BUILD_CMD="bun run build"
else
  BUILD_CMD="npm run build"
fi

echo -e "Running: ${BOLD}$BUILD_CMD${NC}"
if ! $BUILD_CMD; then
  echo ""
  echo -e "${RED}========================================${NC}"
  echo -e "${BOLD}${RED}[ERROR] Application build failed!${NC}"
  echo -e "${RED}Please resolve the errors above before installing.${NC}"
  echo -e "${RED}Installation stopped.${NC}"
  echo -e "${RED}========================================${NC}"
  exit 1
fi

if [ ! -d "$CFG_INSTALL_DIR/dist" ] || [ ! -f "$CFG_INSTALL_DIR/dist/index.html" ]; then
  echo -e "${RED}[ERROR] Build output directory ($CFG_INSTALL_DIR/dist) not found or incomplete.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Production build completed successfully in ./dist${NC}"

# ------------------------------------------------------------------------------
# Generate Environment & Configuration Files
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}[4/5] Writing environment and configuration files...${NC}"

# Generate .env
cat << EOF > "$CFG_INSTALL_DIR/.env"
# WATER Environment Configuration
HOST=$CFG_HOST
PORT=$CFG_PORT
NODE_ENV=$CFG_ENV
EOF

# Generate .water.conf
cat << EOF > "$CFG_INSTALL_DIR/.water.conf"
# WATER System Configuration
INSTALL_DIR="$CFG_INSTALL_DIR"
HOST="$CFG_HOST"
PORT="$CFG_PORT"
WATER_HOST="$CFG_HOST"
WATER_PORT="$CFG_PORT"
NODE_ENV="$CFG_ENV"
AUTO_START="$CFG_AUTO_START"
SERVICE_NAME="water"
PKG_MGR="$PKG_MGR"
EOF

# Ensure management scripts are executable
chmod +x "$CFG_INSTALL_DIR"/*.sh 2>/dev/null || true

echo -e "${GREEN}✓ Configuration files generated.${NC}"

# ------------------------------------------------------------------------------
# Service & Process Management (Systemd / Direct)
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}[5/5] Configuring process management...${NC}"

RUN_USER="${SUDO_USER:-$(whoami)}"
NODE_EXEC="$(command -v node 2>/dev/null || true)"
[ -z "$NODE_EXEC" ] && NODE_EXEC="$(command -v bun 2>/dev/null || echo "node")"

HAS_SYSTEMD=false
if [ "$EUID" -eq 0 ] && [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1; then
  HAS_SYSTEMD=true
fi

if [ "$HAS_SYSTEMD" = true ]; then
  echo -e "Configuring systemd service ${BOLD}water.service${NC}..."
  SERVICE_FILE="/etc/systemd/system/water.service"

  # Stop prior instance if active
  systemctl stop water.service 2>/dev/null || true

  cat << EOF > "$SERVICE_FILE"
[Unit]
Description=WATER Business Management Platform
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$CFG_INSTALL_DIR
EnvironmentFile=-$CFG_INSTALL_DIR/.env
Environment=PORT=$CFG_PORT
Environment=HOST=$CFG_HOST
Environment=NODE_ENV=$CFG_ENV
ExecStart=$NODE_EXEC $CFG_INSTALL_DIR/server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable water.service 2>/dev/null || true

  if [ "$CFG_AUTO_START" = "Yes" ]; then
    echo -e "Starting water.service..."
    systemctl start water.service
    sleep 2
    if systemctl is-active --quiet water.service; then
      echo -e "${GREEN}✓ water.service is active and running.${NC}"
    else
      echo -e "${YELLOW}[Warning] Service started but status is not active. Check: journalctl -u water -n 20${NC}"
    fi
  fi
else
  echo -e "Running in standalone / container mode (Systemd not active)."
  if [ "$CFG_AUTO_START" = "Yes" ]; then
    "$CFG_INSTALL_DIR/stop.sh" >/dev/null 2>&1 || true
    sleep 1
    "$CFG_INSTALL_DIR/start.sh"
  fi
fi

# Optional firewall notification
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  ufw allow "$CFG_PORT/tcp" comment 'WATER Platform' 2>/dev/null || true
  echo -e "${GREEN}✓ Port $CFG_PORT opened in UFW firewall.${NC}"
fi

# ------------------------------------------------------------------------------
# Final Installation Message
# ------------------------------------------------------------------------------
LOCAL_IP=$(get_local_ip)

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${BOLD}${GREEN}WATER INSTALLATION COMPLETE${NC}"
echo -e "${CYAN}===========================${NC}"
echo ""
echo -e "WATER has been installed successfully."
echo ""
echo -e "Installation Path : ${BOLD}$CFG_INSTALL_DIR${NC}"
echo -e "Host              : ${BOLD}$CFG_HOST${NC}"
echo -e "Port              : ${BOLD}$CFG_PORT${NC}"
echo ""
echo -e "Local URL:"
echo -e "${CYAN}http://localhost:${CFG_PORT}${NC}"
if [ "$LOCAL_IP" != "127.0.0.1" ]; then
  echo -e "Network URL:"
  echo -e "${CYAN}http://${LOCAL_IP}:${CFG_PORT}${NC}"
fi
echo ""
echo -e "${BOLD}Useful commands:${NC}"
echo ""
echo -e "Start:"
echo -e "  ${YELLOW}./start.sh${NC}"
if [ "$HAS_SYSTEMD" = true ]; then
  echo -e "  (or: ${YELLOW}sudo systemctl start water${NC})"
fi
echo ""
echo -e "Stop:"
echo -e "  ${YELLOW}./stop.sh${NC}"
if [ "$HAS_SYSTEMD" = true ]; then
  echo -e "  (or: ${YELLOW}sudo systemctl stop water${NC})"
fi
echo ""
echo -e "Restart:"
echo -e "  ${YELLOW}./restart.sh${NC}"
if [ "$HAS_SYSTEMD" = true ]; then
  echo -e "  (or: ${YELLOW}sudo systemctl restart water${NC})"
fi
echo ""
echo -e "Status:"
echo -e "  ${YELLOW}./status.sh${NC}"
if [ "$HAS_SYSTEMD" = true ]; then
  echo -e "  (or: ${YELLOW}sudo systemctl status water${NC})"
fi
echo ""
echo -e "Uninstall:"
echo -e "  ${YELLOW}./uninstall.sh${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
