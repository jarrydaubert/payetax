// src/constants/deepDives.ts
/**
 * Deep Dives Fallback Configuration
 *
 * Curated list of high-quality article slugs to use when there aren't enough
 * posts with `deepDive: true` in frontmatter.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

/**
 * Fallback slugs for the Deep Dives section
 * These are manually curated, high-quality articles that provide in-depth coverage
 * Used when fewer than 3 posts have `deepDive: true` frontmatter
 */
export const DEEP_DIVE_FALLBACK_SLUGS = [
  '100k-tax-trap-avoid-60-percent-tax-2025',
  'understanding-uk-tax-codes',
  'pension-tax-relief-uk-2025-guide',
  'student-loan-repayment-guide-2025',
  'marriage-allowance-guide-2025',
  'self-assessment-deadline-guide',
] as const;

/**
 * Maximum number of deep dive articles to display
 */
export const MAX_DEEP_DIVES = 6;

/**
 * Minimum deep dive articles before using fallback
 */
export const MIN_DEEP_DIVES = 3;
