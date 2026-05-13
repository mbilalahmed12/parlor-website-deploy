# WordPress Parlor Website - Hostinger Deployment Guide

## Overview
This guide walks through deploying the fully-tested WordPress Parlor website to Hostinger shared hosting.

**Status**: Local testing complete ✅  
**Ready for production**: YES ✅

---

## Pre-Deployment Checklist

- [ ] Hostinger account created and active
- [ ] Domain purchased and pointing to Hostinger
- [ ] SSL certificate provisioned (auto-provisioned by Hostinger)
- [ ] Database credentials noted
- [ ] FTP/SFTP credentials obtained
- [ ] Backup of local WordPress created

---

## Step 1: Prepare WordPress for Hostinger

### 1.1 Export Local Database

```powershell
# Using local WordPress installation
# Via WordPress Admin > Tools > Export
# OR via phpMyAdmin on Local WP
```

**Steps:**
1. Open WordPress Admin at `http://elegant-saloon.local/wp-admin/`
2. Navigate to **Tools > Export**
3. Select "All content"
4. Click "Download Export File"
5. Save as `wordpress-export.xml`

**Alternative (Database Dump):**
```sql
-- Export via Local WP database
-- File will be in Local WP backup folder
```

### 1.2 Prepare File Package

Create a package with:
```
parlor-website/
├── wp-content/themes/elegant-parlor/    # Custom theme
├── wp-content/plugins/parlor-*/         # 4 plugins
├── DEPLOYMENT.md                         # Deployment guide
├── TESTING-REPORT.md                     # Test results
└── DATABASE-EXPORT.xml                   # Database export
```

---

## Step 2: Set Up Hostinger WordPress

### 2.1 Create WordPress Installation via Hostinger

1. Log in to **Hostinger hPanel**
2. Navigate to **Auto Installer**
3. Click **Install WordPress**
4. Configure:
   - **Domain**: Your domain name
   - **Admin Email**: admin@yourdomain.com
   - **Admin Username**: admin
   - **Admin Password**: [Generate strong password]
   - **WordPress Version**: Latest
5. Click **Install**
6. Wait for installation to complete (5-10 minutes)

### 2.2 Access WordPress Admin

1. Navigate to: `https://yourdomain.com/wp-admin/`
2. Login with credentials from Step 2.1
3. Verify WordPress installed successfully

---

## Step 3: Upload Theme & Plugins

### 3.1 via FTP/SFTP (Recommended)

**Using FileZilla or similar FTP client:**

1. **Connect to Hostinger SFTP:**
   - Host: sftp.your-domain.com (or from hPanel)
   - Username: FTP username (from hPanel)
   - Password: FTP password (from hPanel)
   - Port: 22 (SFTP)

2. **Upload Theme:**
   ```
   Navigate to: /public_html/wp-content/themes/
   Upload folder: elegant-parlor/
   ```

3. **Upload Plugins:**
   ```
   Navigate to: /public_html/wp-content/plugins/
   Upload folders:
   - parlor-bookings/
   - parlor-reviews/
   - parlor-services/
   - parlor-settings/
   ```

4. **Verify Upload:**
   - All files should be in correct directories
   - File permissions should be 755 (directories) and 644 (files)

### 3.2 via WordPress Admin (Alternative)

1. WordPress Admin > **Appearance > Themes**
2. Click **Add New > Upload Theme**
3. Select `elegant-parlor.zip` (if packaged as .zip)
4. Click **Install Now**

Same process for **Plugins > Add New > Upload Plugin**

---

## Step 4: Activate Theme & Plugins

### 4.1 via WordPress Admin

1. **Activate Theme:**
   - Go to **Appearance > Themes**
   - Find "Elegant Parlor"
   - Click **Activate**

2. **Activate Plugins:**
   - Go to **Plugins**
   - Activate in this order:
     1. Parlor Settings
     2. Parlor Services
     3. Parlor Bookings
     4. Parlor Reviews

---

## Step 5: Configure Parlor Settings

### 5.1 Import Database Data (RECOMMENDED)

This is the fastest way to get all content and settings:

1. **Via WordPress Import Tool:**
   - Admin > **Tools > Import**
   - Select **WordPress**
   - Click "Install Now" (if not installed)
   - Choose your exported `wordpress-export.xml`
   - Click **Upload file and import**
   - Assign posts to admin user
   - Click **Submit**

2. **Wait for import** (2-5 minutes)

3. **Verify:**
   - Check homepage displays correctly
   - Verify services show up
   - Check admin page for Parlor Settings

### 5.2 Manual Configuration (If not importing)

**Admin > Parlor Settings**

1. **Business Information:**
   - Title: Elegant Edge Unisex Salon
   - Description: Premium salon services for everyone
   - Email: admin@elegantedge.com
   - Phone: +92-300-1234567
   - Address: 123 Main Street, Karachi, Pakistan

2. **Hero Video URL:**
   - https://www.youtube.com/watch?v=dQw4w9WgXcQ

3. **Working Hours:**
   - Mon-Fri: 10:00 - 18:00
   - Sat: 10:00 - 20:00
   - Sun: 11:00 - 18:00

4. **Social Media:**
   - Facebook: https://facebook.com/elegantedge
   - Instagram: https://instagram.com/elegantedge
   - WhatsApp: https://wa.me/923001234567
   - Twitter: https://twitter.com/elegantedge

5. **Email Settings:**
   - ✅ Enable notifications
   - ✅ Auto-approve reviews

### 5.3 Create Content (If not importing)

**Services** (5 total):
```
1. Hair Cut
   - Price: 500
   - Duration: 30 min
   - Category: Hair

2. Hair Styling
   - Price: 800
   - Duration: 45 min
   - Category: Hair

3. Full Makeup
   - Price: 2000
   - Duration: 60 min
   - Category: Makeup

4. Spa Massage
   - Price: 1500
   - Duration: 60 min
   - Category: Spa

5. Nail Art
   - Price: 1000
   - Duration: 45 min
   - Category: Nails
```

**Homepage:**
- Title: Home
- Content:
  ```
  [parlor_services_grid columns=3]
  [parlor_booking_form]
  [parlor_testimonials_slider]
  ```

---

## Step 6: Configure Email (CRITICAL)

### 6.1 Set Up SMTP (Recommended)

**Via WordPress plugin (WP Mail SMTP):**

1. Install plugin: **WP Mail SMTP**
2. Configure:
   - **Mailer**: Use Hostinger SMTP
   - **From Email**: admin@yourdomain.com
   - **Host**: smtp.hostinger.com
   - **Port**: 465 (SSL) or 587 (TLS)
   - **Username**: Your email
   - **Password**: Email password (from Hostinger)
3. Send test email

**Alternative: Via wp-config.php**

```php
// Add to wp-config.php
define('WP_MAIL_FROM_ADDRESS', 'admin@yourdomain.com');
define('WP_MAIL_FROM_NAME', 'Elegant Edge Salon');
```

### 6.2 Create Email Accounts (Hostinger)

1. Hostinger hPanel > **Email**
2. Create email: `admin@yourdomain.com`
3. Create email: `support@yourdomain.com` (optional)
4. Note credentials for SMTP setup

---

## Step 7: Update WordPress Settings

### 7.1 General Settings

1. **Admin > Settings > General**
   - Site Title: Elegant Edge Unisex Salon
   - Tagline: Premium Salon Services
   - WordPress Address (URL): https://yourdomain.com
   - Site Address (URL): https://yourdomain.com

2. **Admin > Settings > Permalink**
   - Select: **Post name** (for SEO)

### 7.2 Reading Settings

1. **Admin > Settings > Reading**
   - Your homepage displays: **A static page**
   - Homepage: Select "Home" page
   - Posts page: Select "Blog" (or leave default)

---

## Step 8: SSL & Security

### 8.1 SSL Certificate (Auto-provisioned by Hostinger)

- Should be automatically enabled
- Verify by visiting: https://yourdomain.com
- Should show padlock 🔒

### 8.2 WordPress Security Hardening

1. **Install Security Plugin** (optional):
   - Wordfence Security
   - All in One WP Security

2. **Update wp-config.php:**
   ```php
   define('WP_DEBUG', false);
   define('SCRIPT_DEBUG', false);
   ```

3. **Disable File Editing:**
   ```php
   define('DISALLOW_FILE_EDIT', true);
   ```

---

## Step 9: Performance Optimization

### 9.1 Enable Caching

1. **Install Plugin:**
   - **WP Super Cache** (free) or **W3 Total Cache**

2. **Configure:**
   - Enable page caching
   - Enable browser caching
   - Enable minification (if available)

### 9.2 Optimize Database

1. **Admin > Tools > Database Optimization**
   - Or use **WP-Optimize** plugin
   - Clean up revisions, spam, etc.

### 9.3 Image Optimization

1. **Install Plugin:**
   - **Smush** (free) or **Imagify**

2. **Run optimization** on all media

---

## Step 10: Test Everything

### 10.1 Functionality Tests

- [ ] Homepage loads
- [ ] Services grid displays all 5 services
- [ ] Booking form visible and interactive
- [ ] "Book Now" button works
- [ ] Contact information correct
- [ ] Working hours display
- [ ] Social links functional
- [ ] Footer displays correctly

### 10.2 Mobile Tests

Test on real mobile devices or via browser DevTools:
- [ ] Homepage responsive
- [ ] Services mobile-friendly
- [ ] Booking form mobile-friendly
- [ ] Footer responsive

### 10.3 Email Tests

- [ ] Send test booking to verify emails work
- [ ] Check spam folder
- [ ] Verify email formatting

### 10.4 Performance Tests

1. **Google PageSpeed Insights:**
   - https://pagespeed.web.dev/
   - Target: 80+ score

2. **GTmetrix:**
   - https://gtmetrix.com/
   - Target: < 2 second load time

---

## Step 11: Final Checklist Before Going Live

- [ ] Domain is pointing to Hostinger
- [ ] SSL certificate active (https://)
- [ ] Homepage loads at domain
- [ ] All pages accessible
- [ ] Forms functional
- [ ] Email notifications working
- [ ] Mobile responsive
- [ ] All plugins active
- [ ] Theme activated
- [ ] Admin login works
- [ ] Database migrated
- [ ] Performance acceptable
- [ ] Backup created
- [ ] Monitoring enabled

---

## Troubleshooting

### Common Issues

**1. White Screen of Death (WSOD)**
```
Solution:
1. Enable WP_DEBUG in wp-config.php
2. Check error_log in /public_html/
3. Increase PHP memory limit (ask Hostinger)
```

**2. Database Connection Error**
```
Solution:
1. Verify credentials in wp-config.php
2. Ensure database user has correct permissions
3. Check MySQL connection from Hostinger hPanel
```

**3. Plugins not activating**
```
Solution:
1. Check file permissions (755 for dirs, 644 for files)
2. Verify PHP version compatibility
3. Check error_log for specific errors
```

**4. Emails not sending**
```
Solution:
1. Configure SMTP settings
2. Verify email account credentials
3. Check Hostinger email logs
```

**5. Slow performance**
```
Solution:
1. Enable caching
2. Optimize images
3. Clean database
4. Enable gzip compression
5. Contact Hostinger support for server optimization
```

---

## Hostinger Support Contacts

- **Live Chat**: Available 24/7 via hPanel
- **Email Support**: support@hostinger.com
- **Knowledge Base**: https://www.hostinger.com/help/

---

## Rollback Plan (If Issues Arise)

1. **Take Database Backup:**
   - hPanel > Database > Create Backup

2. **Create File Backup:**
   - FTP: Download entire /public_html/ folder

3. **If deployment fails:**
   - Restore from backup in hPanel
   - Re-upload theme and plugins
   - Reactivate and reconfigure

---

## Post-Deployment Tasks

1. **Monitor website:**
   - Check error logs daily for first week
   - Monitor uptime (use Uptime Robot)
   - Track performance metrics

2. **Regular backups:**
   - Enable daily automatic backups (via Hostinger)
   - Keep local backup copies

3. **Updates:**
   - Update WordPress monthly
   - Update plugins monthly
   - Update theme when major updates available

4. **User training:**
   - Train admin user on:
     - How to add services
     - How to manage bookings
     - How to respond to reviews
     - How to update settings

---

## Success Criteria

Website is successfully deployed when:
- ✅ All pages load via HTTPS
- ✅ No console errors
- ✅ Booking form works end-to-end
- ✅ Emails sending/receiving
- ✅ Mobile responsive
- ✅ Performance acceptable (< 3s load)
- ✅ Backups working
- ✅ Admin can manage content

---

**Deployment Guide Created**: 2026-05-11  
**Status**: Ready for production deployment  
**Last Tested**: Local environment  
**Next Step**: Execute Hostinger deployment

For questions or issues, consult Hostinger documentation or contact support.
