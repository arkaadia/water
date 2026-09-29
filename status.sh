#!/usr/bin/env bash
# ==============================================================================
# WATER Business Management Platform - Status Script
# ==============================================================================

set -eo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# ANSI Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Source configuration if available
if [ -f "$APP_DIR/.water.conf" ]; then
  # shellcheck source=/dev/null
  source "$APP_DIR/.water.conf" 2>/dev/null || true
elif [ -f "$APP_DIR/.env" ]; then
  ENV_PORT=$(grep -E '^PORT=' "$APP_DIR/.env" | cut -d= -f2 | tr -d '"\r ' || true)
  ENV_HOST=$(grep -E '^HOST=' "$APP_DIR/.env" | cut -d= -f2 | tr -d '"\r ' || true)
  [ -n "$ENV_PORT" ] && WATER_PORT="$ENV_PORT"
  [ -n "$ENV_HOST" ] && WATER_HOST="$ENV_HOST"
fi

PORT="${WATER_PORT:-$PORT}"
HOST="${WATER_HOST:-$HOST}"

if [ -z "$WATER_PORT" ] && { [ -z "$PORT" ] || [ "$PORT" = "${NGINX_PORT:-8080}" ]; }; then
  PORT="3000"
fi
[ -z "$HOST" ] && HOST="0.0.0.0"

PID_FILE="$APP_DIR/water.pid"

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

RUNNING=false
SERVICE_STATUS="standalone"
PID=""

# Check systemd first if available
if [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  if systemctl is-active --quiet water.service 2>/dev/null; then
    RUNNING=true
    SERVICE_STATUS="water.service (active)"
    PID=$(systemctl show -p MainPID water.service 2>/dev/null | cut -d= -f2 || true)
  else
    SERVICE_STATUS="water.service (inactive)"
  fi
fi

# If not running under systemd, check PID file or running process
if [ "$RUNNING" = false ]; then
  if [ -f "$PID_FILE" ]; then
    POTENTIAL_PID=$(cat "$PID_FILE" 2>/dev/null || true)
    if [ -n "$POTENTIAL_PID" ] && kill -0 "$POTENTIAL_PID" 2>/dev/null; then
      RUNNING=true
      PID="$POTENTIAL_PID"
      SERVICE_STATUS="background process"
    fi
  fi
fi

# Fallback: check if process matching server.js in APP_DIR is running
if [ "$RUNNING" = false ]; then
  FOUND_PID=$(pgrep -f "$APP_DIR/server.js" 2>/dev/null | head -n 1 || true)
  if [ -n "$FOUND_PID" ]; then
    RUNNING=true
    PID="$FOUND_PID"
    SERVICE_STATUS="active process"
  fi
fi

SERVER_IP=$(get_local_ip)

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${BOLD}WATER STATUS${NC}"
echo -e "${CYAN}============${NC}"
echo ""

if [ "$RUNNING" = true ]; then
  echo -e "Status       : ${BOLD}${GREEN}RUNNING${NC}"
  [ -n "$PID" ] && [ "$PID" != "0" ] && echo -e "PID          : ${BOLD}$PID${NC}"
  echo -e "Host         : $HOST"
  echo -e "Port         : $PORT"
  echo -e "URL          : http://${SERVER_IP}:${PORT}"
  echo -e "Install Path : $APP_DIR"
  echo -e "Service      : $SERVICE_STATUS"
else
  echo -e "Status       : ${BOLD}${RED}STOPPED${NC}"
  echo -e "Host         : $HOST"
  echo -e "Port         : $PORT"
  echo -e "Install Path : $APP_DIR"
  [ -n "$SERVICE_STATUS" ] && [ "$SERVICE_STATUS" != "standalone" ] && echo -e "Service      : $SERVICE_STATUS"
fi

echo -e "${CYAN}========================================${NC}"
echo ""
