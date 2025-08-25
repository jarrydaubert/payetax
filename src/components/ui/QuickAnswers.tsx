// src/components/ui/QuickAnswers.tsx
/**
 * AI-optimized quick answers component for voice search and AI Overviews
 * Provides concise, structured answers that are perfect for featured snippets
 */

import type React from 'react';

interface QuickAnswer {
  question: string;
  answer: string;
  directAnswer?: string; // Concise answer for voice search
  calculation?: string; // Quick calculation for AI
}

// Voice search and AI Overview optimized answers
export const QUICK_ANSWERS: QuickAnswer[] = [
  {
    question: 'How much tax will I pay on £30,000 salary UK?',
    directAnswer: '£5,578 total tax (£3,486 income tax + £2,092 National Insurance)',
    answer:
      'On a £30,000 salary in the UK for 2025-26, you will pay £3,486 in income tax (20% on £17,430 after personal allowance) and £2,092 in National Insurance (12% on earnings above £12,570), totaling £5,578 in tax. Your take-home pay would be £24,422.',
    calculation:
      '£30,000 - £12,570 = £17,430 taxable × 20% = £3,486 income tax + £2,092 NI = £5,578 total tax',
  },
  {
    question: 'What is the UK personal allowance for 2025?',
    directAnswer: '£12,570 for 2025-2026 tax year',
    answer:
      'The UK personal allowance for the 2025-2026 tax year is £12,570. This means you can earn up to £12,570 per year without paying any income tax. The personal allowance has been frozen at this level since 2021 and will remain frozen until April 2028.',
    calculation: 'First £12,570 of income = 0% tax rate',
  },
  {
    question: 'How much National Insurance do I pay UK 2025?',
    directAnswer: '12% on earnings between £12,570-£50,270, then 2%',
    answer:
      "For 2025-2026, you pay National Insurance at 12% on weekly earnings between £242-£967 (£12,570-£50,270 annually), then 2% on earnings above £967 weekly (£50,270 annually). You don't pay National Insurance below £12,570 or after reaching State Pension age.",
    calculation: 'Earnings £12,570-£50,270 × 12% + earnings above £50,270 × 2%',
  },
  {
    question: 'What are Scottish tax rates 2025?',
    directAnswer: '19%, 20%, 21%, 42%, 45%, 48% - higher than England above £26,562',
    answer:
      'Scottish tax rates for 2025-26: 19% starter rate (£12,571-£14,876), 20% basic rate (£14,877-£26,561), 21% intermediate rate (£26,562-£43,662), 42% higher rate (£43,663-£75,000), 45% advanced rate (£75,001-£125,140), 48% top rate (over £125,140). Scottish taxpayers pay more than English taxpayers on incomes above £26,562.',
    calculation: 'Above £26,562 = Scottish rates higher than English 20%/40%/45% rates',
  },
  {
    question: 'How much is marriage allowance UK 2025?',
    directAnswer: '£1,260 transferable allowance = up to £252 tax saving',
    answer:
      'Marriage allowance for 2025-26 allows you to transfer £1,260 (10% of the personal allowance) to your spouse or civil partner if you earn less than £12,570 and they are a basic rate taxpayer. This saves up to £252 per year (£1,260 × 20%). You can backdate claims for up to 4 tax years.',
    calculation: '£1,260 transfer × 20% basic rate = £252 maximum annual saving',
  },
  {
    question: 'When do I pay student loan repayments UK?',
    directAnswer: 'When income exceeds threshold: Plan 1 £22,015, Plan 2 £27,295',
    answer:
      'Student loan repayments start when your income exceeds the threshold for your plan type. Plan 1: £22,015, Plan 2: £27,295, Plan 4 (Scotland): £27,660, Plan 5: £25,000. You pay 9% of income above the threshold (6% for postgraduate loans above £21,000). Repayments are automatic through payroll.',
    calculation: 'Income above threshold × 9% = monthly student loan repayment',
  },
  {
    question: 'How much pension can I contribute tax free UK 2025?',
    directAnswer: '£60,000 annual allowance for 2025-26 (increased from £40,000)',
    answer:
      'The pension annual allowance for 2025-26 is £60,000, increased from £40,000. You get tax relief on contributions up to this limit or 100% of your earnings, whichever is lower. High earners (threshold income over £200,000) may have a reduced allowance down to a minimum of £10,000.',
    calculation: 'Up to £60,000 × your tax rate = maximum tax relief available',
  },
  {
    question: 'What tax do I pay on £50000 salary UK?',
    directAnswer: '£10,480 total tax (£7,486 income tax + £2,994 National Insurance)',
    answer:
      'On a £50,000 salary in the UK for 2025-26, you pay £7,486 in income tax (20% on £37,430 after personal allowance) and £2,994 in National Insurance (12% on £37,430), totaling £10,480 in tax. Your take-home pay would be £39,520.',
    calculation: '£50,000 - £12,570 = £37,430 × 20% = £7,486 + £2,994 NI = £10,480',
  },
];

interface QuickAnswersProps {
  /** Show only specific number of answers (for homepage) */
  limit?: number;
  /** Filter by search query */
  searchQuery?: string;
}

/**
 * Quick Answers component optimized for AI search results
 * Provides structured, concise answers perfect for voice search and AI Overviews
 */
export function QuickAnswers({ limit, searchQuery }: QuickAnswersProps): React.ReactNode {
  let filteredAnswers = QUICK_ANSWERS;

  // Filter by search query if provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredAnswers = QUICK_ANSWERS.filter(
      (qa) =>
        qa.question.toLowerCase().includes(query) ||
        qa.answer.toLowerCase().includes(query) ||
        qa.directAnswer?.toLowerCase().includes(query)
    );
  }

  // Apply limit if provided
  if (limit) {
    filteredAnswers = filteredAnswers.slice(0, limit);
  }

  if (filteredAnswers.length === 0) {
    return null;
  }

  return (
    <section className='space-y-8' itemScope itemType='https://schema.org/FAQPage'>
      <div className='text-center'>
        <h2 className='mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text font-bold text-3xl text-transparent text-white'>
          Quick Tax Answers
        </h2>
        <p className='mx-auto max-w-2xl text-gray-300 text-lg'>
          Instant answers to common UK tax questions - perfect for voice search and quick reference
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredAnswers.map((qa) => (
          <div
            key={qa.question}
            className='glass-card group p-6 transition-colors hover:bg-gray-800/30'
            itemScope
            itemProp='mainEntity'
            itemType='https://schema.org/Question'
          >
            <h3
              className='mb-4 font-semibold text-base text-white transition-colors group-hover:text-purple-200'
              itemProp='name'
            >
              {qa.question}
            </h3>

            <div itemScope itemProp='acceptedAnswer' itemType='https://schema.org/Answer'>
              {/* Direct answer for AI/voice search - highlighted */}
              {qa.directAnswer && (
                <div className='mb-4 rounded-lg border border-green-400/30 bg-green-500/10 p-3'>
                  <p className='font-medium text-green-200 text-sm' itemProp='text'>
                    <strong className='text-green-300'>Quick Answer:</strong> {qa.directAnswer}
                  </p>
                </div>
              )}

              {/* Full answer for detailed understanding */}
              <p className='mb-4 text-gray-300 text-sm leading-relaxed' itemProp='text'>
                {qa.answer}
              </p>

              {/* Calculation example for AI understanding */}
              {qa.calculation && (
                <div className='rounded-lg border border-gray-600/50 bg-gray-800/80 p-3 font-mono text-gray-400 text-xs'>
                  <strong className='text-blue-300'>Calculation:</strong> {qa.calculation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schema.org structured data for AI discovery */}
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Schema markup requires JSON-LD injection
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: filteredAnswers.map((qa) => ({
              '@type': 'Question',
              name: qa.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: qa.directAnswer || qa.answer,
                ...(qa.calculation && {
                  additionalProperty: {
                    '@type': 'PropertyValue',
                    name: 'calculation',
                    value: qa.calculation,
                  },
                }),
              },
            })),
          }),
        }}
      />
    </section>
  );
}

export default QuickAnswers;
