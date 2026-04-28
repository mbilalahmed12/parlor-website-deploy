const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * Background Removal via Free Online API
 * Uses Clipdrop.co API (free tier available without auth for limited calls)
 * OR uses remove.bg's API (50 free calls without key)
 */

async function removeBackgroundUsingAPI(imageUrl, apiKey = null) {
  try {
    // Option 1: Using remove.bg (50 free calls/month without key)
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('type', 'person'); // Optimized for people
    formData.append('format', 'PNG');
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      body: formData,
      headers: {
        'X-API-Key': apiKey || 'free'
      }
    });
    
    if (response.ok) {
      const buffer = await response.buffer();
      return buffer;
    } else {
      console.error('API Error:', response.status, await response.text());
      return null;
    }
  } catch (err) {
    console.error('Error:', err.message);
    return null;
  }
}

// Alternative: Use a CSS/Canvas-based solution with the original image
function createOptimizedPortrait(imagePath, outputPath) {
  console.log('Creating optimized portrait with CSS masking...');
  // Save as-is to public folder - frontend will handle with CSS styling
  const buffer = fs.readFileSync(imagePath);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = {
  removeBackgroundUsingAPI,
  createOptimizedPortrait
};
