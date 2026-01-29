// src/lib/blog/imageFallback.ts
/**
 * Blog Image Fallback System
 *
 * Generates category-based SVG fallbacks for blog posts without images.
 * Works with Next.js Image component for optimized loading.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

import { BLOG_CATEGORIES, type CategoryKey } from '@/constants/blogCategories';

/**
 * Generate inline SVG data URL for use as placeholder/fallback
 * Creates a gradient background based on category color
 */
export function getCategoryFallbackSvg(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category] ?? BLOG_CATEGORIES['tax-basics'];
  const color = config.color;

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

  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/**
 * Generate blurDataURL for Next.js Image placeholder
 * Creates a tiny gradient for blur-up effect
 */
export function getCategoryBlurDataUrl(category: CategoryKey): string {
  const config = BLOG_CATEGORIES[category] ?? BLOG_CATEGORIES['tax-basics'];
  // Tiny 10x6 gradient for blur placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><rect fill="#0f172a" width="10" height="6"/><rect fill="${config.color}" opacity="0.2" width="10" height="6"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Get the appropriate image source for a blog post
 * Returns the post image if available, otherwise generates a category fallback
 */
export function getPostImageSrc(postImage: string | undefined, category: CategoryKey): string {
  if (postImage) {
    return postImage;
  }
  return getCategoryFallbackSvg(category);
}

/**
 * Get blur data URL for a blog post image
 */
export function getPostBlurDataUrl(postImage: string | undefined, category: CategoryKey): string {
  // For actual images, we don't have a blur URL (Next.js will generate)
  // For fallback SVGs, use the category blur
  if (postImage) {
    return getCategoryBlurDataUrl(category);
  }
  return getCategoryBlurDataUrl(category);
}

/**
 * Standard blur data URL for posts with real images
 * This is a generic dark placeholder
 */
export const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="6"%3E%3Crect fill="%230f172a" width="10" height="6"/%3E%3C/svg%3E';
