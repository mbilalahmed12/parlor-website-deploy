# Create deployment using .NET WebClient
param(
    [string]$FtpHost = "ftp.elegantedgeunisexsalon.com",
    [string]$FtpUser = "elegantedge",
    [string]$FtpPass = "Karanbabu@2102"
)

$sourceDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out"

Write-Host "Starting FTP Upload..."
Write-Host "FTP Host: $FtpHost"
Write-Host "User: $FtpUser"
Write-Host ""

# Create WebClient
$client = New-Object System.Net.WebClient
$client.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)

# Get all files
$files = Get-ChildItem -Path $sourceDir -Recurse -File

$count = 0
$success = 0
$failed = 0

foreach ($file in $files) {
    $count++
    $relativePath = $file.FullName.Substring($sourceDir.Length).Replace('\', '/')
    $remoteUri = "ftp://$FtpHost/public_html$relativePath"
    
    try {
        Write-Host "[$count/$($files.Count)] Uploading: $relativePath" -ForegroundColor Gray
        $client.UploadFile($remoteUri, $file.FullName) | Out-Null
        Write-Host "  [OK]" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host "  [FAILED] $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Upload Complete!"
Write-Host "Uploaded: $success / $count"
if ($failed -gt 0) {
    Write-Host "Failed: $failed" -ForegroundColor Red
}
Write-Host "=========================================="
