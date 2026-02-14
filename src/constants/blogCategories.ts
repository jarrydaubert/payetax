// src/constants/blogCategories.ts
/**
 * Blog Category Taxonomy - Single Source of Truth
 *
 * Defines all blog categories with their display properties and colors.
 * Used by the blog redesign for consistent category styling.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

/**
 * Blog categories with styling and metadata
 * Keys MUST match the category values in MDX frontmatter
 */
// Brand color for all category badges
const BRAND_COLOR = '#06b6d4'; // Cyan-500
const BRAND_TEXT = '#020617'; // Slate-950 (dark)

export const BLOG_CATEGORIES = {
  // Tax Guides group
  'salary-guides': {
    key: 'salary-guides',
    label: 'Salary Guides',
    slug: 'salary-guides',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-basics': {
    key: 'tax-basics',
    label: 'Tax Basics',
    slug: 'tax-basics',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-planning': {
    key: 'tax-planning',
    label: 'Tax Planning',
    slug: 'tax-planning',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-tips': {
    key: 'tax-tips',
    label: 'Tax Tips',
    slug: 'tax-tips',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-comparison': {
    key: 'tax-comparison',
    label: 'Tax Comparison',
    slug: 'tax-comparison',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-tools': {
    key: 'tax-tools',
    label: 'Tax Tools',
    slug: 'tax-tools',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  // Student Loans
  'student-loans': {
    key: 'student-loans',
    label: 'Student Loans',
    slug: 'student-loans',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  // News group
  'tax-changes': {
    key: 'tax-changes',
    label: 'Tax Changes',
    slug: 'tax-changes',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
  'tax-deadlines': {
    key: 'tax-deadlines',
    label: 'Tax Deadlines',
    slug: 'tax-deadlines',
    color: BRAND_COLOR,
    textColor: BRAND_TEXT,
  },
} as const;

/**
 * Category key type derived from the constant
 */
export type CategoryKey = keyof typeof BLOG_CATEGORIES;

/**
 * Type for individual category config
 */
export type CategoryConfig = (typeof BLOG_CATEGORIES)[CategoryKey];

/**
 * Get category config by URL slug (not by key)
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return Object.values(BLOG_CATEGORIES).find((c) => c.slug === slug);
}

/**
 * Get category config by key
 */
export function getCategoryByKey(key: string): CategoryConfig | undefined {
  return BLOG_CATEGORIES[key as CategoryKey];
}

/**
 * Posts per page constant
 */
export const POSTS_PER_PAGE = 12;

/**
 * All category keys as array (for Zod enum validation)
 */
export const CATEGORY_KEYS = Object.keys(BLOG_CATEGORIES) as [CategoryKey, ...CategoryKey[]];
