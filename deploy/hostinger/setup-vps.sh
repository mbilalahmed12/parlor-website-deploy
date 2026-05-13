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

if [ ! -f backend/.env ]; then
  cat > backend/.env <<'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=PASTE_YOUR_MONGODB_URI
JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET
JWT_EXPIRE=7d
CORS_ORIGIN=https://elegantedgeunisexsalon.in,https://www.elegantedgeunisexsalon.in
EOF
fi

if [ ! -f frontend/.env.local ]; then
  cat > frontend/.env.local <<'EOF'
NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api
EOF
fi

npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend

pm2 start deploy/hostinger/ecosystem.config.cjs --only parlor-backend --update-env || true
pm2 start deploy/hostinger/ecosystem.config.cjs --only parlor-frontend --update-env || true
pm2 save

systemctl enable nginx