#!/usr/bin/env bash
# ==============================================================================
# WATER Business Management Platform - Uninstall Script
# ==============================================================================

set -eo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# ANSI Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Source configuration if available
INSTALL_PATH="$APP_DIR"
if [ -f "$APP_DIR/.water.conf" ]; then
  # shellcheck source=/dev/null
  source "$APP_DIR/.water.conf" 2>/dev/null || true
  [ -n "$INSTALL_DIR" ] && INSTALL_PATH="$INSTALL_DIR"
fi

echo ""
echo -e "${RED}========================================${NC}"
echo -e "${BOLD}${RED}WATER UNINSTALL WIZARD${NC}"
echo -e "${RED}======================${NC}"
echo ""
echo -e "This wizard will safely remove WATER from your system:"
echo -e "  • Stop any running WATER processes or services"
if [ -f "/etc/systemd/system/water.service" ]; then
  echo -e "  • Remove systemd service: ${BOLD}/etc/systemd/system/water.service${NC}"
fi
echo -e "  • Remove runtime PID and log files"
echo -e "  • Installation directory: ${BOLD}$INSTALL_PATH${NC}"
echo ""
echo -e "${RED}========================================${NC}"
echo ""

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

CONFIRM=$(prompt_input "Are you sure you want to proceed with uninstallation? [y/N]: " "N")
case "$CONFIRM" in
  [yY]|[yY][eE][sS])
    ;;
  *)
    echo -e "\n${YELLOW}Uninstallation cancelled.${NC}"
    exit 0
    ;;
esac

echo ""
echo -e "${YELLOW}[1/3] Stopping WATER service and processes...${NC}"

# Stop systemd service if exists
if [ -f "/etc/systemd/system/water.service" ]; then
  if command -v systemctl >/dev/null 2>&1; then
    systemctl stop water.service 2>/dev/null || true
    systemctl disable water.service 2>/dev/null || true
    rm -f "/etc/systemd/system/water.service"
    systemctl daemon-reload 2>/dev/null || true
    echo -e "${GREEN}✓ Systemd service water.service removed.${NC}"
  fi
fi

# Stop standalone process
"$APP_DIR/stop.sh" >/dev/null 2>&1 || true
rm -f "$APP_DIR/water.pid" "$APP_DIR/water.log"

echo -e "${GREEN}✓ Processes stopped and runtime files cleaned.${NC}"

echo ""
echo -e "${YELLOW}[2/3] Cleaning configuration files...${NC}"
rm -f "$APP_DIR/.water.conf"

echo ""
echo -e "${YELLOW}[3/3] Application Directory Cleanup${NC}"
# Safety guard against removing root or standard system paths
CAN_REMOVE_DIR=false
if [ -n "$INSTALL_PATH" ] && [ "$INSTALL_PATH" != "/" ] && [ "$INSTALL_PATH" != "/root" ] && [ "$INSTALL_PATH" != "/home" ] && [ "$INSTALL_PATH" != "/usr" ] && [ "$INSTALL_PATH" != "/var" ] && [ "$INSTALL_PATH" != "/app/applet" ]; then
  CAN_REMOVE_DIR=true
fi

if [ "$CAN_REMOVE_DIR" = true ]; then
  REMOVE_DIR_RESP=$(prompt_input "Do you also want to permanently delete application files in '$INSTALL_PATH'? [y/N]: " "N")
  case "$REMOVE_DIR_RESP" in
    [yY]|[yY][eE][sS])
      echo -e "${YELLOW}Removing $INSTALL_PATH...${NC}"
      rm -rf "$INSTALL_PATH"
      echo -e "${GREEN}✓ Directory $INSTALL_PATH removed.${NC}"
      ;;
    *)
      echo -e "Application directory '$INSTALL_PATH' preserved."
      ;;
  esac
else
  echo -e "Application directory is preserved (path: $INSTALL_PATH)."
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${BOLD}${GREEN}WATER has been successfully uninstalled.${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
