# Hostinger Deployment Guide

## Domain Information
- **Domain:** elegantedgeunisexsalon.com
- **Hosting Plan:** Premium Web Hosting
- **Account Email:** elegantedgeladiessalon5@gmail.com

## Deployment Method: File Upload via hPanel File Manager

### Quick Steps:

0. **Set frontend environment before building**
   - Create/update `frontend/.env.local` with:
     - `NEXT_PUBLIC_API_URL=https://api.elegantedgeunisexsalon.in/api`
     - `NEXT_PUBLIC_ENABLE_LIVE_API=true`
     - `NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`
   - Then run: `npm run build --prefix frontend`

1. **Login to hPanel**
   - URL: https://hpanel.hostinger.com/
   - Email: elegantedgeladiessalon5@gmail.com
   - Password: (use your account password)

2. **Access File Manager**
   - Go to: hPanel → Hosting → File Manager
   - Navigate to: `public_html/`

3. **Upload Built Files**
   - The static build is located at: `c:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out\`
   - Select all files from the `out/` folder
   - Upload them to the `public_html/` directory on Hostinger

### Files to Upload:
- `index.html` - Homepage
- `404.html` - 404 error page
- `admin/` - Admin dashboard pages
- `booking/` - Booking page
- `login/` - Login page
- `register/` - Registration page
- `services/` - Service category pages
- `_next/` - Next.js assets and static chunks

### Important Notes:

1. **Static Export Format**
   - The site is exported as a completely static website
   - No backend server required
   - All pages are pre-rendered HTML

2. **Domain Registration**
   - Complete the domain registration for `elegantedgeunisexsalon.com` in hPanel
   - Once registered, point it to your hosting account

3. **Homepage Defaults**
   - The site uses built-in default content for:
     - Hero section
     - Why Us section
     - Services (Her/Him categories)
   - No database or backend API is required for the public pages

4. **Admin Features**
   - Admin dashboard is included but requires backend API for persistence
   - For demo purposes, the admin UI is available but changes won't persist without a backend
   - Backend setup would require additional configuration

## Alternative: FTP Upload

If the hPanel File Manager is unavailable:

### Using FTP Client (FileZilla, WinSCP, etc.):

1. **FTP Credentials** (available in hPanel → Hosting → FTP Accounts)
   - Host: ftp.elegantedgeunisexsalon.com (or your FTP host)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

2. **Upload Process**
   - Connect to FTP server
   - Navigate to `public_html/` directory
   - Drag and drop all files from `frontend/out/` to the server

## Verification Checklist:

- [ ] Domain registration completed
- [ ] All files uploaded to public_html/
- [ ] Homepage accessible at elegantedgeunisexsalon.com
- [ ] Services pages load correctly (e.g., elegantedgeunisexsalon.com/services/hair)
- [ ] Admin login accessible at elegantedgeunisexsalon.com/login
- [ ] Mobile responsiveness verified

## Troubleshooting:

### If pages show 404:
- Ensure `public_html/` is the root directory
- Check that `index.html` is in the `public_html/` root
- Verify `.htaccess` file (if present) doesn't interfere with routing

### If styling is broken:
- Wait a few minutes for browser cache to clear
- Check that the `_next/` folder was uploaded completely
- Hard refresh browser (Ctrl+Shift+R on Windows)

### If images/videos don't load:
- Check that media paths are correct in the uploaded files
- Verify that media assets are referenced with correct relative paths

## Next Steps:

1. Upload all files to Hostinger public_html/
2. Complete domain registration
3. Point domain to hosting account
4. Verify site is live
5. (Optional) Set up backend API for admin persistence
