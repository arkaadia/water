#!/usr/bin/env bash
# ==============================================================================
# WATER — Stop Script
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water.service"; then
  echo -e "\033[0;33mStopping WATER systemd service...\033[0m"
  sudo systemctl stop water.service
  echo -e "\033[0;32m✓ Service stopped.\033[0m"
else
  echo -e "\033[0;33mStopping WATER server processes...\033[0m"
  pkill -f "node.*server.js" || true
  pkill -f "bun.*server.js" || true
  echo -e "\033[0;32m✓ Processes stopped.\033[0m"
fi

bash "$DIR/status.sh"
