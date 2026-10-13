#!/usr/bin/env bash
# ==============================================================================
# WATER — Restart Script
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Auto-check dependencies before restart
if [ ! -d "$DIR/node_modules" ] || [ ! -d "$DIR/node_modules/express" ] || [ ! -d "$DIR/node_modules/sms-typescript" ]; then
  echo -e "\033[0;33m• Missing node_modules. Running npm install...\033[0m"
  npm install || npm install --legacy-peer-deps
fi

if [ ! -d "$DIR/dist" ] || [ ! -f "$DIR/dist/index.html" ] || [ ! -f "$DIR/server.js" ]; then
  echo -e "\033[0;33m• Missing production build. Running npm run build...\033[0m"
  npm run build
fi

if command -v systemctl &>/dev/null && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  echo -e "\033[0;33mRestarting WATER service...\033[0m"
  sudo systemctl restart water.service
  sleep 1
  bash "$DIR/status.sh"
else
  bash "$DIR/stop.sh"
  sleep 1
  bash "$DIR/start.sh"
fi
