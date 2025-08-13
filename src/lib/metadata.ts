/**
 * Enhanced SEO metadata generation module
 *
 * Provides comprehensive, type-safe functions for generating optimal SEO metadata for pages.
 * Supports OpenGraph, Twitter Cards, and structured metadata for search engines.
 *
 * @module metadata
 */

import type { Metadata, Viewport } from 'next';

// Base domain for absolute URLs
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolhubx.uk';

// Default metadata values
const DEFAULT_TITLE = 'UK PAYE Tax Calculator';
const DEFAULT_DESCRIPTION =
  'Free UK PAYE tax calculator with detailed breakdowns. Calculate your take-home pay after tax, National Insurance, student loans, and pension contributions.';
const DEFAULT_KEYWORDS =
  'UK tax calculator, PAYE calculator, income tax, national insurance, take home pay, salary calculator, tax calculator UK, 2024-2025 tax';
const DEFAULT_OG_IMAGE = '/images/og-image.png';

/**
 * Options for generating SEO metadata
 */
interface GenerateMetadataProps {
  /** Page title (will be formatted with site name) */
  title?: string;
  /** Page description */
  description?: string;
  /** Comma-separated keywords */
  keywords?: string;
  /** Path to OpenGraph image (absolute URL or relative path) */
  ogImage?: string;
  /** Whether to no-index the page */
  noIndex?: boolean;
  /** Page pathname (for canonical URLs) */
  pathname?: string;
  /** Page locale */
  locale?: string;
  /** OpenGraph content type */
  type?: 'website' | 'article';
  /** Article published date (ISO string) */
  publishedTime?: string;
  /** Article modified date (ISO string) */
  modifiedTime?: string;
  /** Article authors */
  authors?: string[];
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image';
  /** Article category */
  category?: string;
  /** Article section */
  section?: string;
  /** Article tags */
  tags?: string[];
}

/**
 * Generates comprehensive metadata for SEO
 *
 * Creates a complete set of metadata tags for search engines and social media,
 * including OpenGraph, Twitter Cards, and structured data.
 *
 * @param options - Metadata generation options
 * @returns Next.js Metadata object
 *
 * @example
 * // Basic usage in a page.tsx file
 * export const metadata = generateMetadata({
 *   title: 'Tax Calculator',
 *   description: 'Calculate your UK taxes easily',
 *   pathname: '/calculator'
 * });
 */
export function generateMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  pathname = '',
  locale = 'en_GB',
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  twitterCard = 'summary_large_image',
  category,
  section,
  tags,
}: GenerateMetadataProps): Metadata {
  // Make sure image URL is absolute
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  // Full URL for canonical and OG links
  const url = `${SITE_URL}${pathname}`;

  // Format title with site name if not already included
  const formattedTitle = title.includes('ToolHubX') ? title : `${title} | ToolHubX`;

  // Generate article-specific metadata if applicable
  const articleMetadata =
    type === 'article'
      ? {
          publishedTime,
          modifiedTime: modifiedTime || publishedTime,
          authors: authors?.map((name) => ({ name })) || [{ name: 'ToolHubX' }],
          section,
          tags,
        }
      : undefined;

  // Generate base metadata
  return {
    // Basic metadata
    title: {
      default: formattedTitle,
      template: '%s | ToolHubX',
    },
    description,
    keywords: keywords.split(',').map((keyword) => keyword.trim()),

    // Authorship and publishing information
    authors: authors?.map((name) => ({ name })) || [{ name: 'ToolHubX' }],
    creator: 'ToolHubX',
    publisher: 'ToolHubX',

    // Mobile optimization
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    // Base URL for relative links
    metadataBase: new URL(SITE_URL),

    // Language and canonical URLs
    alternates: {
      canonical: url,
      languages: {
        'en-GB': `${SITE_URL}${pathname}`,
      },
    },

    // Robots directives
    robots: {
      index: !noIndex,
      follow: !noIndex,
      nocache: noIndex,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    // Open Graph metadata for social sharing
    openGraph: {
      title: formattedTitle,
      description,
      url,
      siteName: 'ToolHubX',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
      ...(type === 'article' && { article: articleMetadata }),
    },

    // Twitter Card metadata
    twitter: {
      card: twitterCard,
      title: formattedTitle,
      description,
      images: [imageUrl],
      creator: '@toolhubx',
      site: '@toolhubx',
    },

    // Application icons
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png' }],
      shortcut: ['/favicon-32x32.png'],
    },

    // Web app manifest
    manifest: '/manifest.json',

    // Topic and category metadata
    category,

    // Verification codes for search engines - using only supported properties
    verification: {
      google: 'google-site-verification=EPjH4MjD1wobgTVgXC61zwcyeGjT5M_gWL2OI8Vu08c',
      other: {
        'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE',
        'yandex-verification': 'YOUR_YANDEX_VERIFICATION_CODE',
        'baidu-site-verification': 'YOUR_BAIDU_VERIFICATION_CODE',
      },
    },

    // Other metadata
    other: {
      'msapplication-TileColor': '#1D4ED8',
      'theme-color': '#1D4ED8',
      // Schema.org JSON-LD markup is handled separately via the StructuredData component
    },
  };
}

/**
 * Generates viewport metadata with optimal mobile settings
 *
 * Configures viewport settings for responsive design and optimal mobile experience.
 *
 * @returns Next.js Viewport configuration
 *
 * @example
 * // In layout.tsx or page.tsx
 * export const viewport = generateViewport();
 */
export function generateViewport(): Viewport {
  return {
    themeColor: '#1D4ED8',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 2,
    userScalable: true,
    colorScheme: 'dark light',
    viewportFit: 'cover', // For notched devices like iPhone X and newer
  };
}
