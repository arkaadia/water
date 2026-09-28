#!/usr/bin/env bash
# ==============================================================================
# اسکریپت راه‌اندازی مجدد سامانه گوارانو B2B
# ==============================================================================
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;33mراه‌اندازی مجدد سرویس water-b2b...\033[0m"
  sudo systemctl restart water-b2b
  sudo systemctl status water-b2b --no-pager
else
  "$DIR/stop.sh"
  sleep 1
  "$DIR/start.sh"
fi
