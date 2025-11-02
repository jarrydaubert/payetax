#!/usr/bin/env node
/**
 * Convert PWA screenshots from PNG to WebP for better performance
 * Uses sharp for high-quality compression
 */

const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public', 'images');

const images = [
  {
    input: path.join(publicDir, 'pwa-screenshot-narrow.png'),
    output: path.join(publicDir, 'pwa-screenshot-narrow.webp'),
    name: 'PWA Screenshot (Narrow/Mobile)',
  },
  {
    input: path.join(publicDir, 'pwa-screenshot-wide.png'),
    output: path.join(publicDir, 'pwa-screenshot-wide.webp'),
    name: 'PWA Screenshot (Wide/Desktop)',
  },
];

async function convertToWebP() {
  console.log('🖼️  Converting PWA screenshots to WebP...\n');

  for (const image of images) {
    try {
      // Check if input file exists
      if (!fs.existsSync(image.input)) {
        console.error(`❌ ${image.name}: Input file not found at ${image.input}`);
        continue;
      }

      // Get original file size
      const originalStats = fs.statSync(image.input);
      const originalSize = (originalStats.size / 1024).toFixed(2);

      // Convert to WebP with high quality
      await sharp(image.input)
        .webp({
          quality: 85, // High quality for screenshots
          effort: 6, // Maximum compression effort
        })
        .toFile(image.output);

      // Get new file size
      const newStats = fs.statSync(image.output);
      const newSize = (newStats.size / 1024).toFixed(2);
      const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

      console.log(`✅ ${image.name}`);
      console.log(`   Original (PNG): ${originalSize} KB`);
      console.log(`   WebP: ${newSize} KB`);
      console.log(`   Savings: ${savings}% reduction\n`);
    } catch (error) {
      console.error(`❌ ${image.name}: Conversion failed`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('✨ Conversion complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update public/manifest.json to use .webp files');
  console.log('   2. Keep original .png files as fallback for older browsers');
  console.log('   3. Test PWA installation on mobile devices\n');
}

// Run conversion
convertToWebP().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
