// src/app/robots.ts

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';

/**
 * Generates robots.txt via Next.js App Router metadata route
 *
 * AEO (Answer Engine Optimization) strategy:
 * - ALLOW search and answer-engine crawlers that can cite the site
 * - DISALLOW broad AI training/reuse crawlers where a vendor-specific control exists
 * - Keep operational/private paths out of crawler access
 *
 * Bot documentation:
 * - OpenAI: https://platform.openai.com/docs/bots
 * - Anthropic: https://privacy.claude.com/en/articles/8896518
 * - Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
 * - Google: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 * - Apple: https://support.apple.com/en-gb/119829
 * - Common Crawl: https://commoncrawl.org/ccbot
 */

// Public API resources used by crawlers for social previews and Dataset schema.
const ALLOW_PATHS = ['/', '/api/og', '/api/tax-rates'];

// Shared disallow list for all allowed crawlers.
const DISALLOW_PATHS = [
  '/api/',
  '/admin/',
  '/_next/data/',
  '/_vercel/',
  '/private/',
  '/offline',
  '/monitoring',
];

// Training/reuse controls: keep the site citable by search/answer bots without
// implicitly opting unrelated public content into model training datasets.
const AI_TRAINING_USER_AGENTS = ['GPTBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: '*',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },

      // Core search engines
      {
        userAgent: 'Googlebot',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },

      // OpenAI crawlers (per platform.openai.com/docs/bots)
      // OAI-SearchBot = ChatGPT search indexing
      // ChatGPT-User = user-triggered fetch (robots.txt may not apply)
      {
        userAgent: 'OAI-SearchBot',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },

      // Anthropic crawlers (per privacy.claude.com)
      // Claude-SearchBot = search indexing
      // Claude-User = user-triggered fetch (robots.txt may not apply)
      {
        userAgent: 'Claude-SearchBot',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },

      // Perplexity crawlers (per docs.perplexity.ai)
      // PerplexityBot = search results
      // Perplexity-User = user-triggered fetch (ignores robots.txt per their docs)
      {
        userAgent: 'PerplexityBot',
        allow: ALLOW_PATHS,
        disallow: DISALLOW_PATHS,
      },

      ...AI_TRAINING_USER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: ['/'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
