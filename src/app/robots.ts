// src/app/robots.ts
import type { MetadataRoute } from 'next';

/**
 * Enhanced robots.txt configuration
 * Provides detailed crawling instructions for search engines
 *
 * @returns Next.js MetadataRoute.Robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // Rules for specific crawlers
    rules: [
      {
        // Default rules for all crawlers
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/_vercel/', '/private/'],
      },
      {
        // Googlebot-specific rules
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/'],
      },
      {
        // Bingbot-specific rules
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/'],
      },
    ],
    // Path to sitemap - important for search engines to find all pages
    sitemap: 'https://payetax.co.uk/sitemap.xml',
  };
}
