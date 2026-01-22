#!/usr/bin/env bun

/**
 * Generate brand images for SEO
 * - OG Image: 1200x630 for social sharing
 * - Logo: 192x192 for PWA/favicon
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../public');
const IMAGES_DIR = join(PUBLIC_DIR, 'images');

// Brand colors
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const BG_DEEP = '#020617';

async function generateOGImage() {
  // Create 1200x630 OG image with gradient background and text
  const width = 1200;
  const height = 630;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BG_DEEP};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${CYAN};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${EMERALD};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="600" y="250" font-family="system-ui, sans-serif" font-size="72" font-weight="700" fill="#f8fafc" text-anchor="middle">
        UK PAYE Tax Calculator
      </text>
      <text x="600" y="350" font-family="system-ui, sans-serif" font-size="48" font-weight="600" fill="url(#brand)" text-anchor="middle">
        payetax.co.uk
      </text>
      <text x="600" y="450" font-family="system-ui, sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">
        Free • Accurate • Private • HMRC 2025-26 Rates
      </text>
      <rect x="50" y="580" width="1100" height="4" fill="url(#brand)" rx="2"/>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(join(IMAGES_DIR, 'og-image.png'));

  console.log('✅ Generated OG image: public/images/og-image.png (1200x630)');
}

async function generateLogo() {
  // Create 192x192 logo with gradient background
  const size = 192;

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${CYAN};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${EMERALD};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="32" fill="url(#logoBg)"/>
      <text x="96" y="115" font-family="system-ui, sans-serif" font-size="64" font-weight="700" fill="${BG_DEEP}" text-anchor="middle">
        PT
      </text>
      <text x="96" y="155" font-family="system-ui, sans-serif" font-size="24" font-weight="500" fill="${BG_DEEP}" text-anchor="middle">
        payetax
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(join(PUBLIC_DIR, 'logo.png'));

  console.log('✅ Generated logo: public/logo.png (192x192)');
}

async function main() {
  console.log('🎨 Generating brand images...\n');

  await generateOGImage();
  await generateLogo();

  console.log('\n✨ Done!');
}

main().catch(console.error);
