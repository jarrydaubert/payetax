// src/app/robots.ts

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';

/**
 * Generates robots.txt via Next.js App Router metadata route
 *
 * AEO (Answer Engine Optimization) strategy:
 * - ALLOW search crawlers: OAI-SearchBot, Claude-SearchBot, PerplexityBot
 * - BLOCK training crawlers: GPTBot, ClaudeBot, CCBot, Google-Extended
 *
 * Bot documentation:
 * - OpenAI: https://platform.openai.com/docs/bots
 * - Anthropic: https://privacy.claude.com/en/articles/8896518
 * - Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
 * - Google: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 * - Apple: https://support.apple.com/en-gb/119829
 */

// Shared disallow list for all allowed crawlers
const DISALLOW_PATHS = ['/api/', '/admin/', '/_next/data/', '/_vercel/', '/private/', '/offline'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rules for all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },

      // Core search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },

      // OpenAI crawlers (per platform.openai.com/docs/bots)
      // OAI-SearchBot = ChatGPT search indexing (ALLOW)
      // GPTBot = model training (BLOCK)
      // ChatGPT-User = user-triggered fetch (robots.txt may not apply)
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },

      // Anthropic crawlers (per privacy.claude.com)
      // Claude-SearchBot = search indexing (ALLOW)
      // ClaudeBot = model training (BLOCK)
      // Claude-User = user-triggered fetch (robots.txt may not apply)
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: 'ClaudeBot',
        disallow: '/',
      },

      // Perplexity crawlers (per docs.perplexity.ai)
      // PerplexityBot = search results (ALLOW)
      // Perplexity-User = user-triggered fetch (ignores robots.txt per their docs)
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },

      // Google AI usage control (per developers.google.com)
      // Google-Extended = controls AI data usage, not search indexing
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },

      // Apple crawlers (per support.apple.com/119829)
      // Applebot = Apple Search (handled by default rules)
      // Applebot-Extended = Apple Intelligence features (BLOCK training)
      {
        userAgent: 'Applebot-Extended',
        disallow: '/',
      },

      // Training-only crawlers (BLOCK)
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
