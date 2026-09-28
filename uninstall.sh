#!/usr/bin/env bash
# ==============================================================================
# اسکریپت حذف سامانه پخش مویرگی گوارانو B2B
# ==============================================================================
if [ "$EUID" -ne 0 ]; then
  echo "لطفاً با دسترسی root یا sudo اجرا نمایید: sudo bash uninstall.sh"
  exit 1
fi

echo -e "\033[0;33mدر حال متوقف‌سازی و غیرفعال‌کردن سرویس water-b2b...\033[0m"
systemctl stop water-b2b.service 2>/dev/null || true
systemctl disable water-b2b.service 2>/dev/null || true
rm -f /etc/systemd/system/water-b2b.service
systemctl daemon-reload

pkill -f "node server.js" || true
pkill -f "vite preview" || true

echo -e "\033[0;32m✓ سرویس water-b2b با موفقیت از سیستم‌عامل لینوکس حذف گردید.\033[0m"
