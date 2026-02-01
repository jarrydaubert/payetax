// src/lib/blog/imageFallback.ts
/**
 * Blog Image Fallback System
 *
 * Generates category-based SVG fallbacks for blog posts without images.
 * Works with Next.js Image component for optimized loading.
 *
 * Note: Next.js Image only auto-generates blurDataURL for statically imported images.
 * For dynamic URLs, we must provide our own blur placeholder.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';

/** Fallback color if category color is invalid */
const DEFAULT_COLOR = '#06b6d4';

/** Validate hex color format (cheap hardening for potential CMS scenarios) */
function getSafeColor(color: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : DEFAULT_COLOR;
}

/**
 * Standard blur data URL for posts with real images
 * This is a generic dark placeholder
 */
export const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="6"%3E%3Crect fill="%230f172a" width="10" height="6"/%3E%3C/svg%3E';

/**
 * Generate inline SVG data URL for use as placeholder/fallback
 * Creates a gradient background based on category color
 */
export function getCategoryFallbackSvg(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category] ?? BLOG_CATEGORIES['tax-basics'];
  const color = getSafeColor(config.color);

  // SVG with gradient background and centered circle placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.1"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="#0f172a"/>
      <rect width="800" height="450" fill="url(#bg)"/>
      <circle cx="400" cy="225" r="60" fill="${color}" opacity="0.3"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Generate blurDataURL for Next.js Image placeholder
 * Creates a tiny gradient for blur-up effect
 */
export function getCategoryBlurDataUrl(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category] ?? BLOG_CATEGORIES['tax-basics'];
  const color = getSafeColor(config.color);
  // Tiny 10x6 gradient for blur placeholder
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6">` +
    `<rect fill="#0f172a" width="10" height="6"/>` +
    `<rect fill="${color}" opacity="0.2" width="10" height="6"/>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Get the appropriate image source for a blog post
 * Returns the post image if available, otherwise generates a category fallback
 */
export function getPostImageSrc(postImage: string | undefined, category: CategoryKey): string {
  return postImage ?? getCategoryFallbackSvg(category);
}

/**
 * Get blur data URL for a blog post image
 *
 * - For posts WITH an image: returns generic dark blur (image provides visual interest)
 * - For posts WITHOUT an image: returns category-colored blur (matches fallback SVG)
 */
export function getPostBlurDataUrl(postImage: string | undefined, category: CategoryKey): string {
  return postImage ? DEFAULT_BLUR_DATA_URL : getCategoryBlurDataUrl(category);
}
