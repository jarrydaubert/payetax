/**
 * Enhanced SEO metadata generation module
 *
 * Provides comprehensive, type-safe functions for generating optimal SEO metadata for pages.
 * Supports OpenGraph, Twitter Cards, and structured metadata for search engines.
 *
 * @module metadata
 */

import type { Metadata, Viewport } from 'next';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';

// Base domain for absolute URLs - exported for use in structured data
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payetax.co.uk';

// Logo URL for structured data
export const LOGO_URL = `${SITE_URL}/logo.png`;

// Default metadata values
const DEFAULT_TITLE = `Free UK PAYE Tax Calculator ${CURRENT_TAX_YEAR} | Salary & Take-Home Pay`;
const DEFAULT_DESCRIPTION = `Free UK PAYE tax calculator with official HMRC rates ${CURRENT_TAX_YEAR}. Calculate income tax, National Insurance, student loans, and take-home pay from your salary instantly. No registration required.`;
const DEFAULT_OG_TITLE = 'See Your Take-Home Pay';
const DEFAULT_OG_DESCRIPTION = `Free UK PAYE calculator with official HMRC rates ${CURRENT_TAX_YEAR}.`;

/**
 * Options for generating SEO metadata
 */
interface GenerateMetadataProps {
  /** Page title (will be formatted with site name) */
  title?: string;
  /** Page description */
  description?: string;
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

export function createHeroOgImagePath(
  title: string = DEFAULT_OG_TITLE,
  description: string = DEFAULT_OG_DESCRIPTION,
): string {
  const params = new URLSearchParams({ title, description });
  return `/api/og?${params.toString()}`;
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
  ogImage,
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
  const fallbackOgImage = createHeroOgImagePath(
    title === DEFAULT_TITLE ? DEFAULT_OG_TITLE : title,
    title === DEFAULT_TITLE ? DEFAULT_OG_DESCRIPTION : description,
  );
  const resolvedOgImage = ogImage ?? fallbackOgImage;
  const imageUrl = resolvedOgImage.startsWith('http')
    ? resolvedOgImage
    : `${SITE_URL}${resolvedOgImage}`;

  // Full URL for canonical and OG links
  const url = `${SITE_URL}${pathname}`;

  // Format title with site name if not already included
  const hasPayeTax = title.includes('PayeTax');
  const formattedTitle = hasPayeTax ? title : `${title} | PayeTax`;

  // Generate article-specific metadata if applicable
  const articleMetadata =
    type === 'article'
      ? {
          publishedTime,
          modifiedTime: modifiedTime || publishedTime,
          authors: authors?.map((name) => ({ name })) || [{ name: 'PayeTax' }],
          section,
          tags,
        }
      : undefined;

  // Generate base metadata
  // If title already has PayeTax, use string to avoid template duplication
  // If not, use object with template for child pages
  return {
    // Basic metadata
    title: hasPayeTax
      ? formattedTitle
      : {
          default: formattedTitle,
          template: '%s | PayeTax',
        },
    description,
    // Authorship and publishing information
    authors: authors?.map((name) => ({ name })) || [{ name: 'PayeTax' }],
    creator: 'PayeTax',
    publisher: 'PayeTax',

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
      // Note: languages removed as we're monolingual (en-GB only)
      // Having only one language in hreflang creates SEO conflicts
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
      siteName: 'PayeTax',
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
      creator: '@PayeTaxUK',
      site: '@PayeTaxUK',
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

    // Verification codes for search engines
    verification: {
      google: 'EPjH4MjD1wobgTVgXC61zwcyeGjT5M_gWL2OI8Vu08c',
    },

    // Other metadata
    other: {
      'msapplication-TileColor': '#f8f5ed',
      'theme-color': '#f8f5ed',
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
    themeColor: '#f8f5ed',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // WCAG 2.2 AA - Allow 500% zoom
    userScalable: true,
    colorScheme: 'light dark',
    viewportFit: 'cover', // For notched devices like iPhone X and newer
  };
}
