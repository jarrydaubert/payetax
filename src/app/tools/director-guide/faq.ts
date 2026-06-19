import type { FAQItem } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';

// Shared by visible HTML and FAQ JSON-LD so structured data never drifts into
// schema-only content.
export const directorGuideFaqItems: FAQItem[] = [
  {
    question: `How do salary and dividends compare for company directors in ${CURRENT_TAX_YEAR_DISPLAY_SHORT}?`,
    answer:
      'Salary uses your Personal Allowance and can help build State Pension credits, while dividends are often taxed at different rates. The right mix depends on profits, Employment Allowance eligibility, and your wider income.',
  },
  {
    question: 'Are dividends better than salary for directors?',
    answer:
      'Dividends can be more tax-efficient than additional salary because they avoid National Insurance. However, dividends must be paid from profits, and salary can help build State Pension credits. The mix depends on your total income and circumstances.',
  },
  {
    question: 'How is Employer NI calculated on director salary?',
    answer:
      'Employer NI is charged on salary above the Secondary Threshold. Directors use an annual earnings period, so NI is calculated on total annual salary rather than per pay period. Companies eligible for Employment Allowance may offset some or all of this cost.',
  },
];
