// src/constants/pullQuotes.ts
/**
 * Pull Quotes for Blog Page
 *
 * Monthly rotating inspirational/educational quotes displayed on the blog page.
 * Quotes rotate based on date range, with fallback to most recent.
 *
 * @see docs/planning/BLOG_PAGE_BUILD.md
 */

export interface PullQuote {
  text: string;
  attribution: string;
  validFrom: string; // ISO date - quote active from this date
  validUntil: string; // ISO date - quote active until this date
}

/**
 * Monthly rotating quotes
 * Add new quotes here with appropriate date ranges
 */
export const PULL_QUOTES: PullQuote[] = [
  {
    text: 'Understanding your tax code is the first step to taking control of your finances.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-01-01',
    validUntil: '2026-01-31',
  },
  {
    text: 'The best time to plan for tax efficiency was yesterday. The second best time is today.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-02-01',
    validUntil: '2026-02-28',
  },
  {
    text: 'Knowledge of tax thresholds can save you thousands. Ignorance of them costs you thousands.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-03-01',
    validUntil: '2026-03-31',
  },
  {
    text: 'Every pound saved in tax is a pound you can invest in your future.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-04-01',
    validUntil: '2026-04-30',
  },
  {
    text: 'Tax planning is not about avoiding your obligations, but understanding your allowances.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-05-01',
    validUntil: '2026-05-31',
  },
  {
    text: 'The UK tax system rewards those who take the time to understand it.',
    attribution: 'PayeTax Mission',
    validFrom: '2026-06-01',
    validUntil: '2026-06-30',
  },
];

/**
 * Get the current quote based on today's date
 * Falls back to the most recent quote if none match
 */
export function getCurrentQuote(): PullQuote {
  const now = new Date().toISOString().split('T')[0] ?? '';

  // Find a quote valid for today
  const currentQuote = PULL_QUOTES.find((q) => q.validFrom <= now && q.validUntil >= now);

  if (currentQuote) {
    return currentQuote;
  }

  // Fallback: sort by validUntil descending and return most recent
  const sorted = [...PULL_QUOTES].sort((a, b) => b.validUntil.localeCompare(a.validUntil));
  return (
    sorted[0] ??
    PULL_QUOTES[0] ?? {
      text: 'Tax knowledge is financial freedom.',
      attribution: 'PayeTax Mission',
      validFrom: '2020-01-01',
      validUntil: '2099-12-31',
    }
  );
}
