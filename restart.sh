#!/usr/bin/env bash
# ==============================================================================
# WATER — Restart Script
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water.service"; then
  echo -e "\033[0;33mRestarting WATER service...\033[0m"
  sudo systemctl restart water.service
  sleep 1
  bash "$DIR/status.sh"
else
  bash "$DIR/stop.sh"
  sleep 1
  bash "$DIR/start.sh"
fi
