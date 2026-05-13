import os
import sys
from pathlib import Path

# Attempt SFTP upload to Hostinger
try:
    import paramiko
except ImportError:
    print("Installing paramiko for SFTP support...")
    os.system("pip install paramiko")
    import paramiko

def upload_via_sftp():
    """Upload website files to Hostinger via SFTP"""
    
    # Configuration
    HOST = "elegantedgeunisexsalon.com"
    PORT = 22
    USERNAME = "elegantedge"
    PASSWORD = "Karanbabu@2102"
    REMOTE_DIR = "/public_html/"
    LOCAL_DIR = r"C:\Users\Muhammad BIlal Ahmed\parlor-website\frontend\out"
    
    print("=" * 50)
    print("Elegant Edge - Hostinger SFTP Upload")
    print("=" * 50)
    print(f"Host: {HOST}")
    print(f"User: {USERNAME}")
    print(f"Local: {LOCAL_DIR}")
    print(f"Remote: {REMOTE_DIR}")
    print()
    
    try:
        # Create SFTP connection
        print("Connecting to Hostinger via SFTP...")
        transport = paramiko.Transport((HOST, PORT))
        transport.connect(username=USERNAME, password=PASSWORD)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        # Get all files
        local_path = Path(LOCAL_DIR)
        files = list(local_path.rglob("*"))
        files = [f for f in files if f.is_file()]
        
        print(f"Found {len(files)} files to upload")
        print()
        
        uploaded = 0
        failed = 0
        
        # Upload files
        for i, file in enumerate(files, 1):
            relative = file.relative_to(local_path).as_posix()
            remote_path = f"{REMOTE_DIR}{relative}"
            remote_dir = "/".join(remote_path.split("/")[:-1])
            
            try:
                # Create remote directory if needed
                try:
                    sftp.stat(remote_dir)
                except IOError:
                    sftp.mkdir(remote_dir, mode=0o755)
                
                # Upload file
                print(f"[{i}/{len(files)}] Uploading: {relative}...", end=" ")
                sftp.put(str(file), remote_path)
                print("[OK]")
                uploaded += 1
            except Exception as e:
                print(f"[FAILED] {str(e)}")
                failed += 1
        
        sftp.close()
        transport.close()
        
        print()
        print("=" * 50)
        print("Upload Complete!")
        print(f"Uploaded: {uploaded} / {len(files)}")
        if failed > 0:
            print(f"Failed: {failed}")
        print("=" * 50)
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Check if SFTP is enabled on your Hostinger account")
        print("2. Verify username and password")
        print("3. Try alternative host: ftp.hostinger.com")
        return False
    
    return True

if __name__ == "__main__":
    upload_via_sftp()
