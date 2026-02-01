// src/config/blog.config.ts
/**
 * Blog configuration file
 * Defines categories, settings, and other blog-related configuration
 *
 * Uses Zod for runtime validation to ensure configuration integrity (PAYTAX-128)
 * Constants use `satisfies z.infer<...>` for compile-time type checking
 */

import { z } from 'zod';

/**
 * Zod Schema for Blog Brand
 * Validates the blog identity configuration
 */
export const BlogBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  fullName: z.string().min(1, 'Full brand name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  url: z.string().url('Must be a valid URL'),
  logo: z.string().min(1, 'Logo path is required'),
  socialImage: z.string().min(1, 'Social image path is required'),
});

/**
 * Zod Schema for Blog Category
 * Validates category structure and slug format
 *
 * Note: `count` field exists on BlogCategory in types/blog.ts but is populated
 * at runtime when querying posts, not stored in config.
 */
export const BlogCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
});

/**
 * Zod Schema for Blog Configuration
 * Validates the main blog config structure with uniqueness constraints
 */
export const BlogConfigSchema = z
  .object({
    postsPerPage: z.number().int().min(1).max(50, 'Posts per page must be between 1 and 50'),
    featuredPostsCount: z.number().int().min(1).max(10, 'Featured posts must be between 1 and 10'),
    relatedPostsCount: z.number().int().min(1).max(10, 'Related posts must be between 1 and 10'),
    categories: z.array(BlogCategorySchema).min(1, 'At least one category is required'),
  })
  .superRefine((val, ctx) => {
    // Validate unique category slugs
    const slugs = val.categories.map((c) => c.slug);
    const duplicateSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (duplicateSlugs.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categories'],
        message: `Duplicate category slugs: ${[...new Set(duplicateSlugs)].join(', ')}`,
      });
    }

    // Validate unique category names
    const names = val.categories.map((c) => c.name);
    const duplicateNames = names.filter((n, i) => names.indexOf(n) !== i);
    if (duplicateNames.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['categories'],
        message: `Duplicate category names: ${[...new Set(duplicateNames)].join(', ')}`,
      });
    }
  });

// Infer types from Zod schemas for single source of truth
export type BlogBrand = z.infer<typeof BlogBrandSchema>;
export type BlogCategory = z.infer<typeof BlogCategorySchema>;
export type BlogConfig = z.infer<typeof BlogConfigSchema>;

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
  logo: '/logo.png',
  socialImage: '/images/blog/taxinsights-og.jpg',
} satisfies BlogBrand;

/**
 * Available blog categories
 * These replace the categories that were previously managed in Strapi
 */
export const BLOG_CATEGORIES = [
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
    name: 'Tax Planning',
    slug: 'tax-planning',
    description: 'Strategic guides for reducing tax and maximising allowances',
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
  {
    name: 'Salary Guides',
    slug: 'salary-guides',
    description: 'Practical salary breakdowns showing take-home pay and lifestyle implications',
  },
  {
    name: 'Tax Deadlines',
    slug: 'tax-deadlines',
    description: 'Important UK tax deadlines and what you need to do before them',
  },
] satisfies BlogCategory[];

/** Category slug union type for type-safe lookups */
export type CategorySlug = (typeof BLOG_CATEGORIES)[number]['slug'];

/** Pre-built map for O(1) category lookups by slug */
const CATEGORY_BY_SLUG = new Map(BLOG_CATEGORIES.map((c) => [c.slug, c] as const));

/**
 * Main blog configuration
 */
export const BLOG_CONFIG = {
  postsPerPage: 12,
  featuredPostsCount: 3,
  relatedPostsCount: 3,
  categories: BLOG_CATEGORIES,
} satisfies BlogConfig;

/**
 * Helper function to get a category by slug (O(1) Map lookup)
 * @overload When slug is a known CategorySlug, returns BlogCategory
 * @overload When slug is an unknown string, returns BlogCategory | undefined
 */
export function getCategoryBySlug(slug: CategorySlug): BlogCategory;
export function getCategoryBySlug(slug: string): BlogCategory | undefined;
export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

/**
 * Helper function to validate if a category slug exists (O(1) Map lookup)
 */
export function isValidCategory(slug: string): slug is CategorySlug {
  return CATEGORY_BY_SLUG.has(slug);
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
  image: '/images/blog/placeholder.jpg',
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

/**
 * Runtime Validation (PAYTAX-128)
 * Validates configuration on module load to catch errors early
 *
 * - Runs in development and production builds
 * - Skip with SKIP_CONFIG_VALIDATION=true (e.g., for edge runtime testing)
 * - Detailed logging only in development
 */
const shouldValidate =
  process.env.NODE_ENV !== 'test' && process.env.SKIP_CONFIG_VALIDATION !== 'true';

if (shouldValidate) {
  const isDev = process.env.NODE_ENV === 'development';

  // Validate blog brand
  const brandResult = BlogBrandSchema.safeParse(BLOG_BRAND);
  if (!brandResult.success) {
    if (isDev) console.error('❌ Blog brand configuration is invalid:', brandResult.error.issues);
    throw new Error('Invalid blog brand configuration');
  }

  // Validate blog config (includes category uniqueness checks via superRefine)
  const configResult = BlogConfigSchema.safeParse(BLOG_CONFIG);
  if (!configResult.success) {
    if (isDev) console.error('❌ Blog configuration is invalid:', configResult.error.issues);
    throw new Error('Invalid blog configuration');
  }
}
