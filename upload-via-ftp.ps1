# Upload Elegant Edge Website to Hostinger via FTP
# This script uploads all website files to Hostinger

param(
    [string]$FtpHost = "ftp.elegantedgeunisexsalon.com",
    [string]$FtpUser = "elegantedge",
    [string]$FtpPass = "",
    [string]$SourceDir = "C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out",
    [string]$RemoteDir = "/public_html/"
)

# Ask for FTP password if not provided
if ([string]::IsNullOrEmpty($FtpPass)) {
    $secPass = Read-Host "Enter Hostinger FTP Password" -AsSecureString
    $FtpPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secPass))
}

Write-Host "Starting FTP upload to Hostinger..."
Write-Host "FTP Host: $FtpHost"
Write-Host "Source Directory: $SourceDir"
Write-Host "Remote Directory: $RemoteDir"
Write-Host ""

# Create FTP credential
$Credential = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)

# Function to upload a single file
function Upload-FileToFtp {
    param(
        [string]$LocalFile,
        [string]$RemotePath,
        [string]$FtpHost,
        [object]$Credential
    )
    
    try {
        $FtpUri = "ftp://$FtpHost$RemotePath"
        $FtpRequest = [System.Net.FtpWebRequest]::Create($FtpUri)
        $FtpRequest.Credentials = $Credential
        $FtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $FtpRequest.UseBinary = $true
        $FtpRequest.KeepAlive = $true
        
        $FileStream = [System.IO.File]::OpenRead($LocalFile)
        $RequestStream = $FtpRequest.GetRequestStream()
        $FileStream.CopyTo($RequestStream)
        $RequestStream.Close()
        $FileStream.Close()
        
        $Response = $FtpRequest.GetResponse()
        Write-Host "OK Uploaded: $RemotePath"
        $Response.Close()
        return $true
    }
    catch {
        Write-Host "ERROR
    }
}

# Function to create a directory on FTP
function Create-FtpDirectory {
    param(
        [string]$DirectoryPath,
        [string]$FtpHost,
        [object]$Credential
    )
    
    try {
        $FtpUri = "ftp://$FtpHost$DirectoryPath"
        $FtpRequest = [System.Net.FtpWebRequest]::Create($FtpUri)
        $FtpRequest.Credentials = $Credential
        $FtpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        
        $Response = $FtpRequest.GetResponse()
        $Response.Close()
        return $true
    }
    catch {
        # Directory might already exist, so don't fail
        return $true
    }
}

# Get all files to upload
$FilesToUpload = Get-ChildItem -Path $SourceDir -Recurse -File

$TotalFiles = $FilesToUpload.Count
$UploadedFiles = 0
$FailedFiles = 0

Write-Host "Found $TotalFiles files to upload..."
Write-Host ""

# Upload each file
foreach ($File in $FilesToUpload) {
    $RelativePath = $File.FullName.Substring($SourceDir.Length).Replace('\', '/')
    $RemotePath = "$RemoteDir$RelativePath"
    
    # Create directory structure if needed
    $RemoteParentDir = Split-Path $RemotePath -Parent
    Create-FtpDirectory $RemoteParentDir $FtpHost $Credential
    
    # Upload the file
    if (Upload-FileToFtp $File.FullName $RemotePath $FtpHost $Credential) {
        $UploadedFiles++
    }
    else {
        $FailedFiles++
    }
    
    # Show progress
    $Progress = [Math]::Round(($UploadedFiles + $FailedFiles) / $TotalFiles * 100, 0)
    Write-Progress -Activity "Uploading files to Hostinger" -Status "Progress: $Progress%" -PercentComplete $Progress
}

Write-Host ""
Write-Host "Upload Complete!"
Write-Host "✓ Successfully uploaded: $UploadedFiles files"
Write-Host "✗ Failed uploads: $FailedFiles files"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Wait 5-10 minutes for DNS propagation"
Write-Host "2. Visit elegantedgeunisexsalon.com in your browser"
Write-Host "3. Verify the website is live!"
