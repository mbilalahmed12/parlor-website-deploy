#!/usr/bin/env node
/**
 * Download and save professional portrait image
 * Uses a background-optimized professional portrait or processes with background removal API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete on error
      reject(err);
    });
  });
}

async function savePortrait() {
  const publicDir = path.join(__dirname, 'frontend', 'public');
  const portraitPath = path.join(publicDir, 'portrait.jpg');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Use a professional portrait image optimized for salons/beauty services
  // This is a high-quality professional portrait with excellent lighting and composition
  const imageUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80';
  
  try {
    console.log('Downloading portrait image...');
    await downloadImage(imageUrl, portraitPath);
    console.log(`✅ Portrait saved to ${portraitPath}`);
  } catch (err) {
    console.error('Error downloading portrait:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  savePortrait().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { downloadImage, savePortrait };
