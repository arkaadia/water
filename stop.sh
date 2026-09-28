#!/usr/bin/env bash
# ==============================================================================
# اسکریپت متوقف‌سازی سامانه گوارانو B2B
# ==============================================================================
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  echo -e "\033[0;33mمتوقف کردن سرویس water-b2b...\033[0m"
  sudo systemctl stop water-b2b
  echo -e "\033[0;32mسرویس متوقف شد.\033[0m"
else
  echo -e "\033[0;33mبستن پردازش‌های در حال اجرای پنل...\033[0m"
  pkill -f "node server.js" || true
  pkill -f "vite preview" || true
  echo -e "\033[0;32mپردازش‌ها بسته شدند.\033[0m"
fi
