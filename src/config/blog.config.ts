// src/config/blog.config.ts
/**
 * Blog configuration file
 * Defines categories, settings, and other blog-related configuration
 */

import type { BlogCategory, BlogConfig } from '@/types/blog';

/**
 * Blog brand identity
 * Defines the blog as a distinct publication within PayeTax
 */
export const BLOG_BRAND = {
  name: 'TaxInsights',
  fullName: 'TaxInsights by PayeTax',
  tagline: 'Expert UK Tax Guidance & Financial Insights',
  description: 'Clear, actionable UK tax advice from qualified experts. No jargon, just insights.',
  author: 'TaxInsights Editorial Team',
  publisher: 'PayeTax',
  url: 'https://payetax.co.uk/blog',
  logo: '/images/blog/taxinsights-logo.svg',
  socialImage: '/images/blog/taxinsights-og.jpg',
};

/**
 * Available blog categories
 * These replace the categories that were previously managed in Strapi
 */
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    name: 'Tax Basics',
    slug: 'tax-basics',
    description: 'Fundamental concepts and guides about UK taxation',
  },
  {
    name: 'Tax Tips',
    slug: 'tax-tips',
    description: 'Practical advice to optimize your tax situation',
  },
  {
    name: 'Tax Changes',
    slug: 'tax-changes',
    description: 'Latest updates and changes in UK tax legislation',
  },
  {
    name: 'Tax Tools',
    slug: 'tax-tools',
    description: 'Calculators and tools for UK tax planning',
  },
  {
    name: 'Tax Comparison',
    slug: 'tax-comparison',
    description: 'Compare tax rates and systems across UK regions',
  },
  {
    name: 'Student Loans',
    slug: 'student-loans',
    description: 'Student loan repayment and tax implications',
  },
  {
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Broader financial planning and money management topics',
  },
  {
    name: 'Self Assessment',
    slug: 'self-assessment',
    description: 'Guides and tips for completing your self assessment tax return',
  },
  {
    name: 'Company Tax',
    slug: 'company-tax',
    description: 'Information about corporation tax and business taxation',
  },
];

/**
 * Main blog configuration
 */
export const BLOG_CONFIG: BlogConfig = {
  postsPerPage: 12,
  featuredPostsCount: 3,
  relatedPostsCount: 3,
  categories: BLOG_CATEGORIES,
};

/**
 * Helper function to get a category by slug
 */
export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug);
}

/**
 * Helper function to validate if a category slug exists
 */
export function isValidCategory(slug: string): boolean {
  return BLOG_CATEGORIES.some((category) => category.slug === slug);
}

/**
 * Blog content directory path (relative to project root)
 */
export const BLOG_CONTENT_DIR = 'content/blog';

/**
 * Public images directory for blog posts
 */
export const BLOG_IMAGES_DIR = '/images/blog';

/**
 * Default metadata for blog posts (used as fallbacks)
 */
export const DEFAULT_BLOG_METADATA = {
  author: 'TaxInsights Editorial Team',
  readTime: '5 min read',
  image: '/images/blog/default-blog-image.jpg',
  imageAlt: 'TaxInsights by PayeTax',
};

/**
 * SEO defaults for blog pages
 */
export const BLOG_SEO_DEFAULTS = {
  titleTemplate: '%s | TaxInsights by PayeTax',
  descriptionTemplate:
    'Read our latest article on %s. Expert UK tax advice and financial guidance from TaxInsights.',
  keywords: ['UK tax', 'PAYE', 'tax calculator', 'financial advice', 'tax tips', 'TaxInsights'],
};
