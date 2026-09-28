#!/usr/bin/env bash
# ==============================================================================
# اسکریپت روشن کردن سامانه گوارانو B2B
# ==============================================================================
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;32mروشن کردن سرویس water-b2b از طریق systemd...\033[0m"
  sudo systemctl start water-b2b
  sudo systemctl status water-b2b --no-pager
else
  echo -e "\033[0;36mاجرای مستقیم پنل گوارانو...\033[0m"
  npm start
fi
