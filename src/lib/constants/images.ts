// src/lib/constants/images.ts

/**
 * Image responsive sizing constants for Next.js Image component
 * All breakpoints align with Tailwind's standard breakpoints
 * 
 * Tailwind Breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */

/**
 * Responsive image sizes for blog featured images (hero images)
 * Mobile: Full width
 * Tablet/Small Desktop (md-xl): 90% viewport width
 * Large Desktop: Fixed 1120px
 */
export const BLOG_HERO_IMAGE = '(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1120px';

/**
 * Responsive image sizes for blog post thumbnails in grid layouts
 * Mobile: Full width
 * Tablet/Small Desktop (md-xl): Half viewport width (2 columns)
 * Large Desktop: Third viewport width (3 columns)
 */
export const BLOG_THUMBNAIL_IMAGE = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw';

/**
 * Responsive image sizes for single blog post hero images
 * Mobile-Desktop: Full width
 * Large Desktop: Fixed 896px (content max-width)
 */
export const POST_HERO_IMAGE = '(max-width: 1024px) 100vw, 896px';

/**
 * Responsive image sizes for inline blog content images
 * Mobile: Full width
 * Desktop: 80% of content width for better readability
 */
export const BLOG_CONTENT_IMAGE = '(max-width: 768px) 100vw, 80vw';

/**
 * All image sizes as a constant object for easy access
 */
export const IMAGE_SIZES = {
  BLOG_HERO: BLOG_HERO_IMAGE,
  BLOG_THUMBNAIL: BLOG_THUMBNAIL_IMAGE,
  POST_HERO: POST_HERO_IMAGE,
  BLOG_CONTENT: BLOG_CONTENT_IMAGE,
} as const;

/**
 * Type for valid image size keys
 */
export type ImageSizeKey = keyof typeof IMAGE_SIZES;
