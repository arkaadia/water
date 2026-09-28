#!/usr/bin/env bash
# ==============================================================================
# اسکریپت بررسی وضعیت اجرای سامانه گوارانو B2B
# ==============================================================================
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q "water-b2b.service"; then
  sudo systemctl status water-b2b --no-pager
else
  ps aux | grep -E "node server.js|vite" | grep -v grep || echo "پنل در حال اجرا نیست."
fi
