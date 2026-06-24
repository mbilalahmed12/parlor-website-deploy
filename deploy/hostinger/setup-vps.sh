#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/parlor-website"
REPO_URL="https://github.com/mbilalahmed12/parlor-website-deploy.git"
BRANCH="main"

apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx build-essential

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

if [ ! -d "$APP_DIR" ]; then
  mkdir -p /var/www
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

cd "$APP_DIR"

export NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api

if [ ! -f backend/.env ]; then
  cat > backend/.env <<'EOF'
NODE_ENV=production
PORT=5000
SUPABASE_URL=PASTE_YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=user-uploads
JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET
JWT_EXPIRE=7d
CORS_ORIGIN=https://elegantedgeunisexsalon.in,https://www.elegantedgeunisexsalon.in
EOF
fi

if [ ! -f frontend/.env.local ]; then
  cat > frontend/.env.local <<'EOF'
NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api
NEXT_PUBLIC_ENABLE_LIVE_API=true
NEXT_PUBLIC_SUPABASE_URL=PASTE_YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_SUPABASE_ANON_KEY
EOF
fi

npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend

pm2 start deploy/hostinger/ecosystem.config.cjs --only parlor-backend --update-env || true
pm2 start deploy/hostinger/ecosystem.config.cjs --only parlor-frontend --update-env || true
pm2 save

systemctl enable nginx