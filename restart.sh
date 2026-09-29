#!/usr/bin/env bash
# ==============================================================================
# WATER Business Management Platform - Restart Script
# ==============================================================================

set -eo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Restarting WATER...${NC}"

if [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
    sudo systemctl restart water.service
  else
    systemctl restart water.service
  fi
  sleep 1
  "$APP_DIR/status.sh"
else
  "$APP_DIR/stop.sh"
  sleep 1
  "$APP_DIR/start.sh"
fi
