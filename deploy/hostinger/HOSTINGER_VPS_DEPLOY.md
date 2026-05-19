# Hostinger VPS Deployment (Backend + Frontend)

This guide deploys:
- Frontend (Next.js) at `https://elegantedgeunisexsalon.in`
- Backend (Express API) at `https://api.elegantedgeunisexsalon.in`

## 1) DNS Setup in Hostinger hPanel

Create/verify these DNS records:
- `@` A -> `YOUR_VPS_IP`
- `www` CNAME -> `elegantedgeunisexsalon.in`
- `api` A -> `YOUR_VPS_IP`

Wait until records propagate.

## 2) SSH Into VPS

```bash
ssh root@YOUR_VPS_IP
```

## 3) Install Runtime Packages

```bash
apt update
apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

## 4) Clone Project

```bash
cd /var/www
git clone https://github.com/mbilalahmed12/parlor-website-deploy.git parlor-website
cd parlor-website
```

## 5) Backend Environment

```bash
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=PASTE_YOUR_MONGODB_URI
JWT_SECRET=PASTE_STRONG_SECRET
JWT_EXPIRE=7d
CORS_ORIGIN=https://elegantedgeunisexsalon.in,https://www.elegantedgeunisexsalon.in
EOF
```

Generate strong JWT secret if needed:

```bash
openssl rand -base64 48
```

## 6) Frontend Environment

```bash
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api
NEXT_PUBLIC_ENABLE_LIVE_API=true
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EOF
```

## 7) Install Dependencies and Build Frontend

```bash
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend
```

One-command alternative (recommended for updates):

```bash
chmod +x deploy/hostinger/rebuild-frontend.sh
export NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api
export NEXT_PUBLIC_ENABLE_LIVE_API=true
export NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
./deploy/hostinger/rebuild-frontend.sh
```

## 8) Start Both Apps with PM2

```bash
pm2 start npm --name parlor-backend --cwd /var/www/parlor-website/backend -- start
pm2 start npm --name parlor-frontend --cwd /var/www/parlor-website/frontend -- start
pm2 save
pm2 startup systemd
```

Run the command printed by `pm2 startup systemd` once.

## 9) Nginx Reverse Proxy

Create `/etc/nginx/sites-available/parlor`:

```nginx
server {
    server_name api.elegantedgeunisexsalon.in;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name elegantedgeunisexsalon.in www.elegantedgeunisexsalon.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and reload nginx:

```bash
ln -s /etc/nginx/sites-available/parlor /etc/nginx/sites-enabled/parlor
nginx -t
systemctl reload nginx
```

## 10) SSL Certificates

```bash
certbot --nginx -d elegantedgeunisexsalon.in -d www.elegantedgeunisexsalon.in -d api.elegantedgeunisexsalon.in
```

## 11) Verify Deployment

```bash
curl -I https://elegantedgeunisexsalon.in
curl https://api.elegantedgeunisexsalon.in/health
pm2 status
```

## 12) Updates After New Git Push

```bash
cd /var/www/parlor-website
git pull
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend
pm2 restart parlor-backend
pm2 restart parlor-frontend
```

## Troubleshooting

- Backend logs: `pm2 logs parlor-backend`
- Frontend logs: `pm2 logs parlor-frontend`
- Nginx logs: `/var/log/nginx/error.log`
- If CORS fails, re-check `CORS_ORIGIN` in `backend/.env`
