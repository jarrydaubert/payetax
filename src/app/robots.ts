// src/app/robots.ts

import type { MetadataRoute } from 'next';

/**
 * Generates robots.txt directives for the site via Next.js App Router
 *
 * Includes Answer Engine Optimization (AEO) - Explicitly allows AI search crawlers:
 * - GPTBot, ChatGPT-User (ChatGPT search)
 * - PerplexityBot (Perplexity AI search)
 * - ClaudeBot, anthropic-ai (Claude AI search)
 * - Applebot-Extended (Apple Intelligence)
 *
 * While blocking AI training-only bots:
 * - CCBot (Common Crawl training)
 * - Google-Extended (Bard training)
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
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
          '/_next/data/', // Block Next.js data files but allow static assets
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
        disallow: ['/api/', '/_next/data/', '/_vercel/', '/offline'],
      },
      {
        // Bingbot-specific rules
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/data/', '/_vercel/', '/offline'],
      },
      // AI Search Engine Crawlers - AEO (Answer Engine Optimization)
      {
        userAgent: 'GPTBot', // ChatGPT search
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT web browsing
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot', // Claude AI
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Claude indexing
        allow: '/',
      },
      {
        userAgent: 'Applebot-Extended', // Apple Intelligence
        allow: '/',
      },
      // Block AI training bots (but allow search)
      {
        userAgent: 'CCBot', // Common Crawl (training only)
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended', // Bard training (Google Search still allowed)
        disallow: '/',
      },
    ],
    // Path to sitemap - important for search engines to find all pages
    sitemap: 'https://payetax.co.uk/sitemap.xml',
  };
}
