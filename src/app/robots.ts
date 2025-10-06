// src/app/robots.ts
import type { MetadataRoute } from 'next';

/**
 * Enhanced robots.txt configuration
 * Provides detailed crawling instructions for search engines
 * Optimized for PayeTax and TaxInsights blog
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
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/_vercel/',
          '/private/',
          '/offline', // Don't index offline page
        ],
        crawlDelay: 1, // Respectful crawling - 1 second between requests
      },
      {
        // Googlebot-specific rules (allow faster crawling for Google)
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/', '/offline'],
      },
      {
        // Bingbot-specific rules
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/_vercel/', '/offline'],
      },
    ],
    // Path to sitemap - important for search engines to find all pages
    sitemap: 'https://payetax.co.uk/sitemap.xml',
  };
}
