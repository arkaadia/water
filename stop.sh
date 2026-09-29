#!/usr/bin/env bash
# ==============================================================================
# WATER Business Management Platform - Stop Script
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

PID_FILE="$APP_DIR/water.pid"

# Check if running under systemd
if [ -d /run/systemd/system ] && command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  echo -e "${YELLOW}Stopping WATER service via systemd...${NC}"
  if [ "$EUID" -ne 0 ] && command -v sudo >/dev/null 2>&1; then
    sudo systemctl stop water.service
  else
    systemctl stop water.service
  fi
  echo -e "${GREEN}✓ WATER systemd service stopped.${NC}"
  exit 0
fi

# Standalone process mode
STOPPED=false

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo -e "${YELLOW}Stopping WATER process (PID: $PID)...${NC}"
    kill -TERM "$PID" 2>/dev/null || true

    WAITED=0
    while kill -0 "$PID" 2>/dev/null && [ "$WAITED" -lt 5 ]; do
      sleep 1
      WAITED=$((WAITED + 1))
    done

    if kill -0 "$PID" 2>/dev/null; then
      echo -e "${YELLOW}Process did not terminate gracefully, sending SIGKILL...${NC}"
      kill -KILL "$PID" 2>/dev/null || true
    fi
    STOPPED=true
  fi
  rm -f "$PID_FILE"
fi

# Also check for any process running $APP_DIR/server.js
ORPHAN_PIDS=$(pgrep -f "$APP_DIR/server.js" 2>/dev/null || true)
if [ -n "$ORPHAN_PIDS" ]; then
  echo -e "${YELLOW}Terminating server process(es): $ORPHAN_PIDS...${NC}"
  for p in $ORPHAN_PIDS; do
    kill -TERM "$p" 2>/dev/null || true
  done
  sleep 1
  for p in $ORPHAN_PIDS; do
    kill -9 "$p" 2>/dev/null || true
  done
  STOPPED=true
fi

if [ "$STOPPED" = true ]; then
  echo -e "${GREEN}✓ WATER has been stopped successfully.${NC}"
else
  echo -e "${CYAN}WATER is not currently running.${NC}"
fi
