#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/parlor-website}"
FRONTEND_DIR="$APP_DIR/frontend"

required_vars=(
  NEXT_PUBLIC_API_URL
  NEXT_PUBLIC_ENABLE_LIVE_API
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)

missing=()
for var_name in "${required_vars[@]}"; do
  if [ -z "${!var_name:-}" ]; then
    missing+=("$var_name")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "Missing required environment variables: ${missing[*]}"
  echo "Export them before running this script."
  exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Frontend directory not found: $FRONTEND_DIR"
  exit 1
fi

cd "$APP_DIR"

cat > "$FRONTEND_DIR/.env.local" <<EOF
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_ENABLE_LIVE_API=${NEXT_PUBLIC_ENABLE_LIVE_API}
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
EOF

echo "Wrote $FRONTEND_DIR/.env.local"

echo "Installing frontend dependencies"
npm install --prefix frontend

echo "Building frontend"
npm run build --prefix frontend

if pm2 describe parlor-frontend >/dev/null 2>&1; then
  echo "Restarting existing parlor-frontend process"
  pm2 restart parlor-frontend --update-env
else
  echo "Starting parlor-frontend process"
  pm2 start deploy/hostinger/ecosystem.config.cjs --only parlor-frontend --update-env
fi

pm2 save
echo "Frontend rebuild completed successfully."
