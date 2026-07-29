export const CURRENT_TAX_GUIDANCE = [
  { slug: 'beginners-guide-to-uk-taxation', reviewedAt: '2026-07-29' },
  { slug: 'how-much-tax-will-i-pay-uk-2025', reviewedAt: '2026-07-29' },
  { slug: 'uk-tax-calculator-2025-complete-guide', reviewedAt: '2026-07-29' },
  { slug: 'what-50k-salary-actually-looks-like-uk-2025', reviewedAt: '2026-07-29' },
  { slug: 'what-70k-salary-actually-looks-like-uk-2025', reviewedAt: '2026-07-29' },
] as const;

export const CURRENT_TAX_GUIDANCE_SLUGS = CURRENT_TAX_GUIDANCE.map(({ slug }) => slug);

export const CURRENT_TAX_GUIDANCE_PATHS = CURRENT_TAX_GUIDANCE_SLUGS.map(
  (slug) => `content/blog/${slug}.mdx`,
);
