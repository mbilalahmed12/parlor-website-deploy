# Elegant Edge Salon - Hostinger Deployment Script
# This script packages and prepares the website for upload to Hostinger

# Source and destination paths
$sourceDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out"
$deploymentDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\deployment-package"
$zipFileName = "elegant-edge-website.zip"
$zipPath = "$deploymentDir\$zipFileName"

# Create deployment directory
if (-not (Test-Path $deploymentDir)) {
    New-Item -ItemType Directory -Path $deploymentDir | Out-Null
    Write-Host "Created deployment directory: $deploymentDir"
}

# Check if source directory exists
if (-not (Test-Path $sourceDir)) {
    Write-Host "ERROR: Source directory not found: $sourceDir"
    exit 1
}

# Compress the website files
Write-Host "Packaging website files..."
$filesCount = @(Get-ChildItem -Path $sourceDir -Recurse -File).Count
Write-Host "Found $filesCount files to package"

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath
    Write-Host "Removed old package"
}

# Create zip archive
Compress-Archive -Path "$sourceDir\*" -DestinationPath $zipPath -Force
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "Successfully created deployment package: $zipPath"
Write-Host "Package size: $([Math]::Round($zipSize, 2)) MB"

# Create deployment instructions file
$instructionsPath = "$deploymentDir\DEPLOYMENT-INSTRUCTIONS.txt"
@"
=============================================================
ELEGANT EDGE SALON - DEPLOYMENT TO HOSTINGER
=============================================================

DOMAIN: elegantedgeunisexsalon.com
HOSTING ACCOUNT: elegantedgeladiessalon5@gmail.com

=============================================================
OPTION 1: UPLOAD VIA HPANEL FILE MANAGER (RECOMMENDED)
=============================================================

1. Go to: https://hpanel.hostinger.com/
2. Login with your email and password
3. Navigate to: Hosting > File Manager
4. Navigate to: public_html/ directory
5. Right-click in the empty space and select "Upload"
6. Extract the contents of "$zipFileName" to your local folder
7. Select all extracted files and upload them to public_html/
8. Wait for upload to complete (this may take a few minutes)
9. Visit elegantedgeunisexsalon.com in your browser

=============================================================
OPTION 2: UPLOAD VIA FTP CLIENT (FILEZILLA, WINSCP, ETC.)
=============================================================

1. Get FTP credentials from hPanel:
   - Go to: hPanel > Hosting > FTP Accounts
   - Create new FTP account or use existing one

2. FTP Connection Details:
   - Host: ftp.elegantedgeunisexsalon.com
   - Username: (from hPanel FTP Accounts)
   - Password: (from hPanel FTP Accounts)
   - Port: 21

3. Connect and Upload:
   - Open FTP client
   - Connect to the FTP server
   - Navigate to /public_html/ directory
   - Extract the zip file contents locally
   - Drag and drop all files to public_html/ on server

=============================================================
IMPORTANT STEPS AFTER UPLOAD
=============================================================

1. COMPLETE DOMAIN REGISTRATION
   - Go to: hPanel > Domains > Domain portfolio
   - Find elegantedgeunisexsalon.com
   - Complete the registration process
   - Point domain to your hosting account

2. VERIFY WEBSITE
   - Wait 5-10 minutes for DNS propagation
   - Visit: elegantedgeunisexsalon.com
   - Check that homepage loads correctly
   - Test services pages: elegantedgeunisexsalon.com/services/hair
   - Verify admin login: elegantedgeunisexsalon.com/login

3. TROUBLESHOOTING
   - If 404 errors appear: Check that index.html is in root of public_html/
   - If styling is broken: Clear browser cache (Ctrl+Shift+R)
   - If images won't load: Check that all files uploaded successfully

=============================================================
WEBSITE STRUCTURE
=============================================================

The uploaded files include:
- index.html - Homepage
- /admin/ - Admin dashboard
- /booking/ - Booking page
- /login/ - Login page
- /register/ - Registration page
- /services/ - Service category pages (hair, makeup, spa, nails)
- /_next/ - Next.js static assets and CSS/JS files
- 404.html - Error page

This is a completely static website (no database required).

=============================================================
SUPPORT & HELP
=============================================================

For Hostinger Support: https://support.hostinger.com/
For DNS/Domain Issues: Check hPanel > Domains > Manage Domain

=============================================================
"@ | Out-File -FilePath $instructionsPath -Encoding UTF8

Write-Host ""
Write-Host "Deployment package ready!"
Write-Host "Location: $zipPath"
Write-Host ""
Write-Host "Deployment instructions saved to: $instructionsPath"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Extract the contents of $zipFileName"
Write-Host "2. Upload all files to Hostinger public_html/ directory"
Write-Host "3. Complete domain registration"
Write-Host "4. Verify website is live"
Write-Host ""
Write-Host "For detailed instructions, see: $instructionsPath"

# Open File Explorer to show the deployment folder
Start-Process explorer $deploymentDir
