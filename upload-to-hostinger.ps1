#Requires -Version 5.0

param(
    [string]$FtpHost = "ftp.elegantedgeunisexsalon.com",
    [string]$FtpUser = "elegantedge",
    [string]$FtpPass = "Karanbabu@2102",
    [string]$SourceDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out",
    [string]$RemoteDir = "/public_html/"
)

Write-Host "=================================="
Write-Host "Elegant Edge - Hostinger Upload"
Write-Host "=================================="
Write-Host ""
Write-Host "FTP Host: $FtpHost"
Write-Host "Source:  $SourceDir"
Write-Host "Remote:  $RemoteDir"
Write-Host ""

$credential = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
$files = Get-ChildItem -Path $SourceDir -Recurse -File
$total = $files.Count
$uploaded = 0
$failed = 0

Write-Host "Uploading $total files..."
Write-Host ""

foreach ($file in $files) {
    $relative = $file.FullName.Substring($SourceDir.Length).Replace('\', '/')
    $remotePath = "$RemoteDir$relative"
    $remoteDir = Split-Path $remotePath -Parent
    $ftpUri = "ftp://$FtpHost$remotePath"
    
    try {
        Write-Host "Uploading: $relative" -ForegroundColor Gray
        $request = [System.Net.FtpWebRequest]::Create($ftpUri)
        $request.Credentials = $credential
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.UseBinary = $true
        
        $fileStream = [System.IO.File]::OpenRead($file.FullName)
        $reqStream = $request.GetRequestStream()
        $fileStream.CopyTo($reqStream)
        $fileStream.Close()
        $reqStream.Close()
        
        $response = $request.GetResponse()
        $response.Close()
        
        Write-Host "  [OK]" -ForegroundColor Green
        $uploaded++
    }
    catch {
        Write-Host "  [FAILED] $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    $pct = [Math]::Round(($uploaded + $failed) / $total * 100)
    Write-Progress -Activity "Uploading" -Status "$pct% complete" -PercentComplete $pct
}

Write-Host ""
Write-Host "=================================="
Write-Host "Upload Complete!"
Write-Host "Uploaded: $uploaded / $total"
if ($failed -gt 0) {
    Write-Host "Failed:   $failed" -ForegroundColor Red
}
Write-Host "=================================="
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Visit: https://elegantedgeunisexsalon.com"
Write-Host "2. Complete domain registration in hPanel"
Write-Host "3. Wait 5-10 minutes for DNS propagation"
Write-Host "4. Refresh your browser"
