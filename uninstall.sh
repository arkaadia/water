#!/usr/bin/env bash
# ==============================================================================
# WATER — Safe Uninstallation Script
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Root privileges required to uninstall WATER service.${NC}"
  echo -e "Please run: ${BOLD}sudo bash uninstall.sh${NC}"
  exit 1
fi

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${RED}======================================================================${NC}"
echo -e "${BOLD}${RED}WARNING: WATER Uninstallation${NC}"
echo -e "${RED}======================================================================${NC}"
echo -e "This script will perform the following actions:"
echo -e "  1. Stop and disable the systemd service: ${BOLD}water.service${NC}"
echo -e "  2. Remove /etc/systemd/system/water.service"
echo -e "  3. Terminate any running server processes"
echo -e "  4. Optionally remove application files in: ${BOLD}${INSTALL_DIR}${NC}"
echo ""

prompt_confirm() {
  local prompt_text="$1"
  local var_name="$2"
  local user_input=""

  if (exec < /dev/tty) 2>/dev/null && (exec > /dev/tty) 2>/dev/null; then
    printf "%b" "$prompt_text" > /dev/tty
    read -r user_input < /dev/tty
  elif [ -t 0 ]; then
    read -p "$prompt_text" user_input
  else
    user_input="N"
  fi
  eval "$var_name=\"$user_input\""
}

prompt_confirm "Are you sure you want to stop and remove the WATER service? [y/N]: " CONFIRM_SERVICE
case "$CONFIRM_SERVICE" in
  [yY][eE][sS]|[yY]) ;;
  *)
    echo -e "${YELLOW}Uninstallation aborted.${NC}"
    exit 0
    ;;
esac

echo -e "${YELLOW}• Stopping and disabling systemd service...${NC}"
systemctl stop water.service 2>/dev/null || true
systemctl disable water.service 2>/dev/null || true
rm -f /etc/systemd/system/water.service
systemctl daemon-reload

echo -e "${YELLOW}• Terminating running processes...${NC}"
pkill -f "node.*${INSTALL_DIR}/server.js" 2>/dev/null || true

echo -e "${GREEN}✓ Systemd service water.service removed.${NC}"

# Optional file deletion check
prompt_confirm "Do you also want to remove all files in ${INSTALL_DIR}? [y/N]: " CONFIRM_FILES
case "$CONFIRM_FILES" in
  [yY][eE][sS]|[yY])
    if [ "$INSTALL_DIR" != "/" ] && [ "$INSTALL_DIR" != "/root" ] && [ "$INSTALL_DIR" != "/home" ]; then
      echo -e "${YELLOW}• Removing directory ${INSTALL_DIR}...${NC}"
      rm -rf "$INSTALL_DIR"
      echo -e "${GREEN}✓ Application files removed.${NC}"
    else
      echo -e "${RED}[SAFETY] Refusing to delete protected system root directory: ${INSTALL_DIR}${NC}"
    fi
    ;;
  *)
    echo -e "${CYAN}• Application files were preserved in ${INSTALL_DIR}.${NC}"
    ;;
esac

echo ""
echo -e "${GREEN}✓ WATER has been successfully uninstalled.${NC}"
