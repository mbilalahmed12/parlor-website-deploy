#Requires -Version 5.0

param(
    [Parameter(Mandatory = $true)]
    [string]$FtpHost,
    [Parameter(Mandatory = $true)]
    [string]$FtpUser,
    [string]$FtpPass = "",
    [string]$SourceDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out",
        [string]$RemoteDir = "/public_html/",
    [switch]$SkipHostCheck
)

function Resolve-HostOrFail {
    param([string]$HostName)

    try {
        $null = [System.Net.Dns]::GetHostAddresses($HostName)
        return $true
    }
    catch {
        throw "Could not resolve host '$HostName'. Verify FTP host in Hostinger hPanel."
    }
}

function Ensure-RemoteDirectory {
    param(
        [string]$FtpHost,
        [System.Net.NetworkCredential]$Credential,
        [string]$DirectoryPath
    )

    $segments = $DirectoryPath.Trim('/').Split('/') | Where-Object { $_ -and $_.Trim().Length -gt 0 }
    if ($segments.Count -eq 0) { return }

    $current = ""
    foreach ($segment in $segments) {
        $current = if ([string]::IsNullOrWhiteSpace($current)) { "/$segment" } else { "$current/$segment" }
        $uri = "ftp://$FtpHost$current"

        try {
            $mk = [System.Net.FtpWebRequest]::Create($uri)
            $mk.Credentials = $Credential
            $mk.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
            $mk.UseBinary = $true
            $mk.KeepAlive = $false
            $res = $mk.GetResponse()
            $res.Close()
        }
        catch {
            # Ignore "already exists" style FTP errors and continue.
        }
    }
}

if (-not (Test-Path -Path $SourceDir -PathType Container)) {
    throw "Source directory not found: $SourceDir"
}

if ([string]::IsNullOrWhiteSpace($FtpPass)) {
    $securePass = Read-Host "Enter FTP password" -AsSecureString
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    try {
        $FtpPass = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

if (-not $SkipHostCheck) {
    Resolve-HostOrFail -HostName $FtpHost | Out-Null
}

Write-Host "=================================="
Write-Host "Elegant Edge - Hostinger Upload"
Write-Host "=================================="
Write-Host ""
Write-Host "FTP Host: $FtpHost"
Write-Host "Source:  $SourceDir"
if ([string]::IsNullOrWhiteSpace($RemoteDir)) {
    Write-Host "Remote:  /"
} else {
    Write-Host "Remote:  $RemoteDir"
}
Write-Host ""

$credential = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
$normalizedRemoteRoot = $RemoteDir.Trim('/').Replace('\\', '/')

$files = Get-ChildItem -Path $SourceDir -Recurse -File
$total = $files.Count

if ($total -eq 0) {
    throw "No files found in source directory: $SourceDir"
}

if ([string]::IsNullOrWhiteSpace($normalizedRemoteRoot)) {
    Write-Host "Ensuring remote root exists: /"
} else {
    Write-Host "Ensuring remote root exists: /$normalizedRemoteRoot"
    Ensure-RemoteDirectory -FtpHost $FtpHost -Credential $credential -DirectoryPath "/$normalizedRemoteRoot"
}

$files = Get-ChildItem -Path $SourceDir -Recurse -File
$uploaded = 0
$failed = 0

Write-Host "Uploading $total files..."
Write-Host ""

foreach ($file in $files) {
    $relative = $file.FullName.Substring($SourceDir.Length).TrimStart('\', '/').Replace('\', '/')
        $remotePath = if ([string]::IsNullOrWhiteSpace($normalizedRemoteRoot)) { "/$relative" } else { "/$normalizedRemoteRoot/$relative" }
    $remoteDir = Split-Path $remotePath -Parent
    $ftpUri = "ftp://$FtpHost$remotePath"
    
    try {
        Ensure-RemoteDirectory -FtpHost $FtpHost -Credential $credential -DirectoryPath $remoteDir

        Write-Host "Uploading: $relative" -ForegroundColor Gray
        $request = [System.Net.FtpWebRequest]::Create($ftpUri)
        $request.Credentials = $credential
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.UseBinary = $true
        $request.KeepAlive = $false
        
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
