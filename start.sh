#!/usr/bin/env bash
# ==============================================================================
# WATER Business Management Platform - Start Script
# ==============================================================================

set -eo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# ANSI Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Load configuration if available
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

# Fallback default if not set by config or if inheriting container proxy port 8080 without config
if [ -z "$WATER_PORT" ] && { [ -z "$PORT" ] || [ "$PORT" = "${NGINX_PORT:-8080}" ]; }; then
  PORT="3000"
fi
[ -z "$HOST" ] && HOST="0.0.0.0"
NODE_ENV="${NODE_ENV:-production}"

PID_FILE="$APP_DIR/water.pid"
LOG_FILE="$APP_DIR/water.log"

# Check if running under systemd
if [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  echo -e "${CYAN}Starting WATER service via systemd...${NC}"
  if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
    sudo systemctl start water.service
  else
    systemctl start water.service
  fi
  sleep 1
  "$APP_DIR/status.sh"
  exit 0
fi

# Standalone process mode
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}WATER is already running with PID $PID.${NC}"
    "$APP_DIR/status.sh"
    exit 0
  else
    rm -f "$PID_FILE"
  fi
fi

if [ ! -d "$APP_DIR/dist" ]; then
  echo -e "${YELLOW}Build directory not found. Building application first...${NC}"
  if command -v bun >/dev/null 2>&1; then
    bun run build
  else
    npm run build
  fi
fi

NODE_EXEC="$(command -v node 2>/dev/null || true)"
[ -z "$NODE_EXEC" ] && NODE_EXEC="$(command -v bun 2>/dev/null || echo "node")"

echo -e "${CYAN}Starting WATER in background on http://${HOST}:${PORT}...${NC}"
export PORT="$PORT"
export HOST="$HOST"
export NODE_ENV="$NODE_ENV"

nohup "$NODE_EXEC" "$APP_DIR/server.js" > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"

sleep 1

if kill -0 "$NEW_PID" 2>/dev/null; then
  echo -e "${GREEN}✓ WATER started successfully with PID: ${BOLD}$NEW_PID${NC}"
  "$APP_DIR/status.sh"
else
  echo -e "${RED}[ERROR] Failed to start WATER. Inspect logs at $LOG_FILE:${NC}"
  tail -n 20 "$LOG_FILE" 2>/dev/null || true
  exit 1
fi
