/**
 * Generate optimized placeholder OG images for SEO
 * Run with: bun run scripts/optimize-placeholder-images.ts
 *
 * Creates optimized images (<150KB each):
 * - /public/images/og-image.png (1200x630)
 * - /public/images/blog/taxinsights-og.jpg (1200x630)
 * - /public/logo.png (192x192)
 */

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

// PayeTax brand colors
const BRAND_BLUE = { r: 29, g: 78, b: 216 };
const DARK_BG = { r: 13, g: 13, b: 13 };
const ACCENT = { r: 37, g: 99, b: 235 };

const publicDir = join(process.cwd(), 'public');
const imagesDir = join(publicDir, 'images');
const blogImagesDir = join(imagesDir, 'blog');

// Ensure directories exist
if (!existsSync(blogImagesDir)) {
  mkdirSync(blogImagesDir, { recursive: true });
}

async function generateImages() {
  // Generate OG image (1200x630) - Dark background with brand accent bar
  console.log('Generating /public/images/og-image.png...');
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: DARK_BG,
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 1200,
            height: 4,
            channels: 3,
            background: BRAND_BLUE,
          },
        })
          .png()
          .toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(imagesDir, 'og-image.png'));

  // Generate blog OG image (1200x630)
  console.log('Generating /public/images/blog/taxinsights-og.jpg...');
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: DARK_BG,
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 1200,
            height: 4,
            channels: 3,
            background: ACCENT,
          },
        })
          .jpeg()
          .toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(blogImagesDir, 'taxinsights-og.jpg'));

  // Generate logo (192x192) - Brand blue square
  console.log('Generating /public/logo.png...');
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 3,
      background: BRAND_BLUE,
    },
  })
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(publicDir, 'logo.png'));

  // Report file sizes
  const ogSize = statSync(join(imagesDir, 'og-image.png')).size;
  const blogOgSize = statSync(join(blogImagesDir, 'taxinsights-og.jpg')).size;
  const logoSize = statSync(join(publicDir, 'logo.png')).size;

  console.log('');
  console.log('Done! Optimized placeholder images created:');
  console.log(`  og-image.png: ${(ogSize / 1024).toFixed(1)}KB`);
  console.log(`  taxinsights-og.jpg: ${(blogOgSize / 1024).toFixed(1)}KB`);
  console.log(`  logo.png: ${(logoSize / 1024).toFixed(1)}KB`);
  console.log('');
  console.log('NOTE: These are simple placeholders.');
  console.log('Replace with properly designed branded images for production.');
}

generateImages().catch(console.error);
