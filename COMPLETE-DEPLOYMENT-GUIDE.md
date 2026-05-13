# Elegant Edge Salon - Complete Deployment Guide

**Domain:** elegantedgeunisexsalon.com  
**Built:** May 13, 2026  
**Status:** ✅ Ready for Deployment

---

## 📦 What's Been Prepared

### Website Files (Static Export)
- **Location:** `frontend/out/` (40 files, 0.34 MB)
- **Format:** Pre-built HTML, CSS, JavaScript (no build needed on server)
- **Features:**
  - ✅ Cinematic hero with background video
  - ✅ Admin-customizable "Why Us" section
  - ✅ Service categories (Her/Him services)
  - ✅ Responsive design (mobile-friendly)
  - ✅ Booking, login, admin pages
  - ✅ Works on shared hosting (no backend required)

### Deployment Package
- **Location:** `deployment-package/elegant-edge-website.zip` (0.34 MB)
- **Contains:** All 40 files pre-compressed for quick upload

### GitHub Repositories
- **Main:** github.com/mbilalahmed12/Parlor-
- **Deploy:** github.com/mbilalahmed12/parlor-website-deploy
- **Commit:** 165d4be and 5ace6dc (latest deployment commits pushed)

### GitHub Actions Workflows
1. **deploy-hostinger.yml** - VPS deployment via SSH (for backend apps)
2. **deploy-static-hostinger.yml** - Static website to public_html via FTP

---

## 🚀 Deployment Options (Choose One)

### ⭐ OPTION 1: Manual Upload via hPanel (Easiest)

**Best for:** Quick deployment, no technical setup needed

**Steps:**
1. Log in to hPanel: https://hpanel.hostinger.com
   - Email: elegantedgeladiessalon5@gmail.com
   - Password: Karanbabu@2102

2. Go to **Hosting → File Manager**

3. Navigate to **public_html** folder

4. Click **Upload** button

5. Select and upload: `deployment-package/elegant-edge-website.zip`
   - **File location:** `c:\Users\Muhammad BIlal Ahmed\parlor-website\deployment-package\elegant-edge-website.zip`

6. Right-click the zip file → **Extract**

7. After extraction, delete the `.zip` file

8. Visit: https://elegantedgeunisexsalon.com

**Time to deploy:** 2-5 minutes  
**Difficulty:** ⭐ (Very Easy)

---

### 🤖 OPTION 2: GitHub Actions Automated Deployment

**Best for:** Continuous deployment, automatic updates

**Setup Required (One-time):**

1. **Add FTP Secrets to GitHub:**
   - Go to: https://github.com/mbilalahmed12/parlor-website-deploy/settings/secrets/actions
   - Click **New repository secret**
   - Add these secrets:
     - `FTP_HOST` = FTP hostname (ask Hostinger support or check hPanel FTP settings)
     - `FTP_USERNAME` = `elegantedge`
     - `FTP_PASSWORD` = `Karanbabu@2102`

2. **Trigger Deployment:**
   - Any push to `main` branch in `parlor-website-deploy` repository will automatically:
     - Build the website
     - Upload to `public_html/` via FTP
     - Make site live

**How it works:**
```
git push → GitHub Actions Triggers → Website Built → FTP Upload → Live!
```

**Time to deploy:** Automatic (3-5 minutes after push)  
**Difficulty:** ⭐⭐ (Requires GitHub secret setup once)

---

### 🛠️ OPTION 3: Manual FTP Upload via Script

**Best for:** Technical users who prefer command line

**Prerequisites:**
- Correct FTP hostname from Hostinger
- PowerShell (Windows) or Python environment

**Using PowerShell:**
```powershell
cd 'c:\Users\Muhammad BIlal Ahmed\parlor-website'
.\upload-to-hostinger.ps1 -FtpHost "<FTP_HOST>" -FtpUser "elegantedge" -FtpPass "Karanbabu@2102"
```

**Using Python:**
```bash
cd c:\Users\Muhammad BIlal Ahmed\parlor-website
python upload_via_sftp.py
```

**Note:** FTP/SFTP host must be confirmed with Hostinger

**Time to deploy:** 5-10 minutes  
**Difficulty:** ⭐⭐ (Requires FTP credentials)

---

### 📋 OPTION 4: Direct File Copy (For Advanced Users)

**If you have SSH access to Hostinger VPS:**
```bash
scp -r frontend/out/* user@host:/var/www/public_html/
```

**Time to deploy:** 1-2 minutes  
**Difficulty:** ⭐⭐⭐ (Requires SSH knowledge)

---

## 🔑 Required Information for All Methods

### Hostinger Account
```
Email: elegantedgeladiessalon5@gmail.com
Password: Karanbabu@2102
Domain: elegantedgeunisexsalon.com
Plan: Premium Web Hosting
```

### FTP Details (For Options 2 & 3)
```
Username: elegantedge
Password: Karanbabu@2102
Host: [To be found in hPanel → FTP Accounts]
Remote Directory: /public_html/
```

---

## ⚙️ Post-Deployment Verification

**After uploading, verify:**

1. **Website loads:**
   - https://elegantedgeunisexsalon.com

2. **Check all pages:**
   - Homepage: ✓ Hero, Why Us, Services visible
   - Services: ✓ Hair, Makeup, Nails, Spa pages load
   - Booking: ✓ Booking form accessible
   - Admin: ✓ Admin dashboard loads
   - Login/Register: ✓ Auth pages present

3. **Check assets:**
   - Hero video plays
   - Images display correctly
   - CSS/styling applied
   - JavaScript functions work

4. **Mobile test:**
   - Open on mobile device
   - Layout responsive
   - Touch interactions work

---

## 🆘 Troubleshooting

### "Website not loading after upload"
1. Clear browser cache (Ctrl+Shift+Del)
2. Wait 5-10 minutes for DNS propagation
3. Check that index.html exists in public_html/
4. Verify all folders were extracted (not just .zip)

### "404 errors on pages"
1. Verify folder structure in public_html/:
   - `index.html` ✓
   - `404.html` ✓
   - `admin/` ✓
   - `booking/` ✓
   - `services/` ✓
   - `_next/` ✓

2. Check file permissions (should be 644 for files, 755 for folders)

### "Videos/Images not loading"
1. Check browser console for 404 errors
2. Verify _next/ folder uploaded completely
3. Check file paths are relative (not absolute)

### "FTP Connection Error"
1. Confirm FTP hostname with Hostinger support
2. Verify credentials (check Hostinger hPanel)
3. Ensure firewall allows FTP port (usually 21)

### "Domain not pointing to site"
1. Check nameservers in hPanel
2. Verify domain registration is active
3. Wait 24 hours for full DNS propagation
4. Contact Hostinger support for domain setup

---

## 📁 File Structure After Upload

```
public_html/
├── index.html                          # Homepage
├── 404.html                            # Error page
├── admin/
│   ├── index.html                      # Admin dashboard
│   └── ...
├── booking/
│   ├── index.html                      # Booking page
│   └── ...
├── services/
│   ├── hair/index.html
│   ├── makeup/index.html
│   ├── nails/index.html
│   ├── spa/index.html
│   └── ...
├── login/
│   ├── index.html
│   └── ...
├── register/
│   ├── index.html
│   └── ...
├── _next/
│   ├── static/css/                    # Stylesheets
│   ├── static/chunks/                 # JavaScript bundles
│   └── data/                          # Next.js data files
└── portrait-cutout.png                # Images

Total: 40 files, ~340 KB
```

---

## 🔄 Updating the Website

### Method 1: Via hPanel (Manual)
1. Log in to hPanel
2. Delete old files from public_html/
3. Upload new files

### Method 2: Via GitHub Actions (Automatic)
1. Update code locally
2. `git push origin main`
3. Workflow automatically deploys
4. Website updates live!

### Method 3: Via Git Pull on Server
```bash
cd /var/www/elegantedgeunisexsalon.com
git pull origin main
npm run build --prefix frontend
# Copy frontend/out/* to public_html/
```

---

## 📞 Support Resources

**Hostinger Support:**
- Chat: Available in hPanel
- Email: support@hostinger.com
- Knowledge Base: hostinger.com/help

**GitHub Issues:**
- Repository: github.com/mbilalahmed12/parlor-website-deploy/issues
- Report bugs or deployment issues

**FTP Troubleshooting:**
- Most common: Wrong hostname
- Solution: Check hPanel → FTP Accounts section
- Alternative: Use hPanel File Manager (no FTP needed)

---

## ✅ Deployment Checklist

- [ ] Website files uploaded to public_html/
- [ ] All 40 files successfully transferred
- [ ] index.html present in root directory
- [ ] _next/ folder uploaded with assets
- [ ] Website loads at domain URL
- [ ] All pages (services, booking, admin) accessible
- [ ] Hero video plays
- [ ] Images display correctly
- [ ] Mobile responsive design works
- [ ] SSL certificate active (should be automatic)
- [ ] DNS points to Hostinger nameservers

---

## 🎉 Congratulations!

Your website is ready to deploy! Choose your preferred deployment method above and get your salon website live.

**Questions?** Refer to the troubleshooting section or contact Hostinger support.

**Status:** ✅ **DEPLOYMENT READY**

---

*Generated: May 13, 2026*  
*Website: Elegant Edge Unisex Salon*  
*Domain: elegantedgeunisexsalon.com*  
*Build Version: Static Export (Next.js 14)*  
