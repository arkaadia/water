#!/usr/bin/env bash
# ==============================================================================
# WATER Status Check
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read environment configuration if available
HOST="0.0.0.0"
PORT="3000"
if [ -f "$DIR/.env" ]; then
  eval "$(grep -E '^(HOST|PORT)=' "$DIR/.env")"
fi

# Detect Local / Public IP
SERVER_IP="127.0.0.1"
if command -v ip &>/dev/null; then
  SERVER_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || echo "127.0.0.1")
elif command -v hostname &>/dev/null; then
  SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
fi

STATUS="STOPPED"
PID="-"

# Check systemd service status
if command -v systemctl &>/dev/null && systemctl is-active --quiet water.service 2>/dev/null; then
  STATUS="RUNNING (systemd)"
  PID=$(systemctl show --property MainPID --value water.service 2>/dev/null || echo "-")
else
  # Check manual node/server process
  MANUAL_PID=$(pgrep -f "node.*server.js" | head -n 1 || true)
  if [ -n "$MANUAL_PID" ]; then
    STATUS="RUNNING (process)"
    PID="$MANUAL_PID"
  fi
fi

# Formatting colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${BOLD}WATER STATUS${NC}"
echo -e "${CYAN}============${NC}"

if [[ "$STATUS" == *"RUNNING"* ]]; then
  echo -e "Status       : ${GREEN}${BOLD}${STATUS}${NC}"
else
  echo -e "Status       : ${RED}${BOLD}${STATUS}${NC}"
fi

echo -e "PID          : ${PID}"
echo -e "Host         : ${HOST}"
echo -e "Port         : ${PORT}"
echo -e "URL          : http://${SERVER_IP}:${PORT}"
echo -e "Install Path : ${DIR}"
echo -e "${CYAN}========================================${NC}"
