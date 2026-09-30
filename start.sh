#!/usr/bin/env bash
# ==============================================================================
# WATER — Start Script
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Load environment configuration
if [ -f "$DIR/.env" ]; then
  set -a
  source "$DIR/.env"
  set +a
fi

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water.service"; then
  echo -e "\033[0;32mStarting WATER via systemd service...\033[0m"
  sudo systemctl start water.service
  sleep 1
  bash "$DIR/status.sh"
else
  echo -e "\033[0;36mStarting WATER production server...\033[0m"
  if [ -f "$DIR/bun.lock" ] && command -v bun &>/dev/null; then
    bun run start
  else
    npm start
  fi
fi
