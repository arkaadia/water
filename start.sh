#!/usr/bin/env bash
# ==============================================================================
# WATER — Start Script (With Auto-Dependency & Build Check)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# 1. Verify Node.js and npm runtimes (auto-install if root or sudo available)
if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
  echo -e "\033[0;33m• Node.js or npm runtime not found. Attempting automatic installation on Linux...\033[0m"
  if [ "$EUID" -eq 0 ]; then
    bash "$DIR/install.sh" -y
    exit 0
  elif command -v sudo &>/dev/null; then
    sudo bash "$DIR/install.sh" -y
    exit 0
  else
    echo -e "\033[0;31m[ERROR] Node.js and npm are required. Please run: sudo bash $DIR/install.sh\033[0m"
    exit 1
  fi
fi

# 2. Check and auto-install project dependencies if missing
if [ ! -d "$DIR/node_modules" ] || [ ! -d "$DIR/node_modules/express" ] || [ ! -d "$DIR/node_modules/sms-typescript" ]; then
  echo -e "\033[0;33m• Dependencies not detected in node_modules. Auto-installing (npm install)...\033[0m"
  npm install || npm install --legacy-peer-deps
  echo -e "\033[0;32m✓ Dependencies installed successfully.\033[0m"
fi

# 3. Check and auto-build production frontend and backend bundle if missing
if [ ! -d "$DIR/dist" ] || [ ! -f "$DIR/dist/index.html" ] || [ ! -f "$DIR/server.js" ]; then
  echo -e "\033[0;33m• Production build not detected. Auto-building (npm run build)...\033[0m"
  npm run build
  echo -e "\033[0;32m✓ Production assets built successfully.\033[0m"
fi

# 4. Load environment configuration
if [ -f "$DIR/.env" ]; then
  set -a
  source "$DIR/.env"
  set +a
elif [ -f "$DIR/.env.example" ]; then
  echo -e "\033[0;33m• .env file not found. Initializing from .env.example...\033[0m"
  cp "$DIR/.env.example" "$DIR/.env"
  set -a
  source "$DIR/.env"
  set +a
fi

# 5. Start application
if command -v systemctl &>/dev/null && systemctl list-unit-files 2>/dev/null | grep -q "water.service"; then
  echo -e "\033[0;32mStarting WATER via systemd service...\033[0m"
  sudo systemctl start water.service
  sleep 1
  bash "$DIR/status.sh"
else
  echo -e "\033[0;36mStarting WATER server on port ${PORT:-3000} (HOST: ${HOST:-0.0.0.0})...\033[0m"
  if [ -f "$DIR/server.js" ]; then
    node "$DIR/server.js"
  else
    npm start
  fi
fi
