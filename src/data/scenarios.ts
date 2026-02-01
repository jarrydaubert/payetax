/**
 * Scenario Data
 *
 * Central data source for tax scenario pages.
 * Used by /scenarios hub and /scenarios/[slug] dynamic pages.
 *
 * Each scenario answers a specific tax question with real, calculated numbers.
 *
 * @module data/scenarios
 */

import type { StudentLoanPlan } from '@/constants/taxRates';

/**
 * FAQ item for scenario pages
 */
export interface ScenarioFAQ {
  question: string;
  answer: string;
}

/**
 * Scenario categories for organizing content
 */
export type ScenarioCategory = 'tax-trap' | 'student-loan' | 'life-stage' | 'scottish';

/**
 * Pre-filled calculator defaults for each scenario
 */
export interface ScenarioDefaults {
  salary: number;
  pensionPercent?: number;
  studentLoan?: StudentLoanPlan;
  scottish?: boolean;
}

/**
 * Complete scenario data model
 */
export interface Scenario {
  /** URL slug for the scenario page */
  slug: string;
  /** Page title */
  title: string;
  /** Scenario category for grouping */
  category: ScenarioCategory;
  /** Primary salary for this scenario */
  salary: number;
  /** Short description for listings */
  description: string;
  /** Search intent keywords this page targets */
  searchIntent: string[];
  /** Pre-filled calculator parameters */
  defaults: ScenarioDefaults;
  /** Main explanation content (what this scenario means) */
  explanation: string;
  /** Optimization guidance (how to reduce tax) */
  optimization?: string;
  /** Related blog post slugs for cross-linking */
  relatedBlogSlugs: string[];
  /** FAQ items for the page (also used for FAQ schema) */
  faqs: ScenarioFAQ[];
  /** Hero stat label (e.g., "Potential Savings") */
  heroStatLabel?: string;
  /** Whether this is a high-priority scenario (enhanced content) */
  highPriority?: boolean;
}

/**
 * Category metadata for display
 */
export interface ScenarioCategoryInfo {
  slug: ScenarioCategory;
  name: string;
  description: string;
  icon: string;
}

/**
 * Category display information
 */
export const SCENARIO_CATEGORIES: ScenarioCategoryInfo[] = [
  {
    slug: 'tax-trap',
    name: 'Tax Trap Avoidance',
    description: 'Strategies for high earners hitting the 60% effective rate between £100k-£125k',
    icon: '🎯',
  },
  {
    slug: 'student-loan',
    name: 'Student Loan Scenarios',
    description: 'Understand how student loan repayments affect your take-home pay',
    icon: '🎓',
  },
  {
    slug: 'scottish',
    name: 'Scottish Tax',
    description: 'Compare Scottish vs rest-of-UK tax rates and understand the difference',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  },
  {
    slug: 'life-stage',
    name: 'Life Stage Planning',
    description: 'Tax calculations for career milestones like first jobs and pay rises',
    icon: '📈',
  },
];

/**
 * All scenario data
 */
export const SCENARIOS: Scenario[] = [
  // ============================================================================
  // TAX TRAP SCENARIOS (£100k-£125k)
  // ============================================================================
  {
    slug: '100k-pension-sacrifice',
    title: '£100k Salary: Avoid the Tax Trap with Pension Sacrifice',
    category: 'tax-trap',
    salary: 100000,
    description:
      "At exactly £100k, you're on the edge of the 60% tax trap. Here's how pension contributions can protect your income.",
    searchIntent: [
      '100k tax trap',
      '100k salary pension',
      'avoid tax trap 100k',
      '100k take home pay',
    ],
    defaults: {
      salary: 100000,
      pensionPercent: 0,
    },
    explanation: `At £100,000, you're at the threshold of the UK's most punishing tax zone. For every £2 you earn above this point, you lose £1 of your personal allowance (£12,570). This creates an effective 60% income tax rate on income between £100,001 and £125,140 (40% tax + 20% from lost allowance). Including 2% employee NI, your effective marginal rate is approximately 62%.

At exactly £100k, you still have your full personal allowance. But even a small pay rise could push you into the trap, making pension contributions a powerful tool for staying below the threshold.`,
    optimization: `**Strategy: Salary Sacrifice to Pension**

If your income is just above £100k, consider contributing the excess to your pension via salary sacrifice:
- Each £1 contributed avoids 60% effective tax
- Your pension gets the full contribution (no tax deducted)
- You also save 2% NI on the sacrificed amount

Example: If you earn £100,500, sacrificing £500 to pension saves you £300 in tax and keeps you below the trap.`,
    relatedBlogSlugs: [
      '100k-tax-trap-avoid-60-percent-tax-2025',
      'pension-tax-relief-uk-2025-guide',
      'salary-sacrifice-explained-2025-26',
      'what-100k-salary-actually-looks-like-uk-2025',
    ],
    faqs: [
      {
        question: 'What is the £100k tax trap?',
        answer:
          'The £100k tax trap refers to the effective 60% tax rate you pay on income between £100,001 and £125,140. This happens because your personal allowance (£12,570) is reduced by £1 for every £2 you earn above £100k, on top of 40% income tax and 2% NI.',
      },
      {
        question: 'Does the tax trap start exactly at £100k?',
        answer:
          "Yes. Once your adjusted net income exceeds £100,000, the personal allowance taper begins. At exactly £100k, you still have your full £12,570 allowance. At £125,140, it's completely gone.",
      },
      {
        question: 'How can pension contributions help?',
        answer:
          'Pension contributions via salary sacrifice reduce your taxable income. If you earn £105k and contribute £5k to your pension, your taxable income drops to £100k, avoiding the trap entirely. Each £1 contributed saves 60p in tax.',
      },
    ],
    heroStatLabel: 'Potential Savings',
    highPriority: true,
  },
  {
    slug: '110k-pension-optimization',
    title: '£110k Salary: Optimal Pension Contribution to Avoid 60% Tax',
    category: 'tax-trap',
    salary: 110000,
    description:
      "At £110k, you're losing £5,000 of personal allowance. See the exact pension contribution needed to escape the trap.",
    searchIntent: ['110k salary pension', '110k tax trap', '110k take home pay', '110k salary tax'],
    defaults: {
      salary: 110000,
      pensionPercent: 10, // £11k to get below £100k
    },
    explanation: `At £110,000, you're £10,000 into the tax trap zone. Your personal allowance has been reduced by £5,000 (£1 lost for every £2 over £100k), leaving you with just £7,570 tax-free.

This means you're paying 60% effective tax on that £10,000 excess - losing £6,000 that could have been in your pocket or pension.`,
    optimization: `**Optimal Strategy: £10,000 Pension Contribution**

To fully escape the tax trap, you need to reduce your taxable income to £100,000:
- Contribute £10,000 via salary sacrifice (or 10% of salary)
- This restores your full £12,570 personal allowance
- You save approximately £6,000 in tax
- Your pension receives the full £10,000

**The Math:**
- Without optimization: ~£69,500 take-home + £0 pension
- With optimization: ~£63,500 take-home + £10,000 pension = £73,500 total value`,
    relatedBlogSlugs: [
      '100k-tax-trap-avoid-60-percent-tax-2025',
      'pension-tax-relief-uk-2025-guide',
      'higher-rate-taxpayer-guide-uk-2025',
      'salary-sacrifice-explained-2025-26',
    ],
    faqs: [
      {
        question: 'How much personal allowance do I lose at £110k?',
        answer:
          'At £110k, you lose £5,000 of your personal allowance (£10k excess ÷ 2). This leaves you with £7,570 tax-free instead of the full £12,570.',
      },
      {
        question: "What's the optimal pension contribution at £110k?",
        answer:
          'To fully avoid the tax trap, contribute at least £10,000 to your pension (reducing taxable income to £100k). This can save you approximately £6,000 in tax while building your retirement pot.',
      },
      {
        question: 'Is salary sacrifice better than personal pension contributions?',
        answer:
          'For high earners in the tax trap, salary sacrifice is usually better. It reduces your taxable income before NI is calculated, saving you an additional 2% compared to personal contributions.',
      },
    ],
    heroStatLabel: 'Annual Tax Savings',
    highPriority: true,
  },
  {
    slug: '120k-tax-planning',
    title: '£120k Salary Tax Planning: Maximize Take-Home Pay',
    category: 'tax-trap',
    salary: 120000,
    description:
      'At £120k, you have almost no personal allowance. See how pension contributions can save you £12,000+ in tax.',
    searchIntent: [
      '120k salary tax',
      '120k take home pay',
      '120k pension contribution',
      '120k salary uk',
    ],
    defaults: {
      salary: 120000,
      pensionPercent: 17, // ~£20k to get below £100k
    },
    explanation: `At £120,000, the tax trap has erased almost all of your personal allowance. With £20,000 over the £100k threshold, you've lost £10,000 of allowance (leaving just £2,570).

You're paying 60% effective tax on that entire £20,000 - that's £12,000 in extra tax compared to someone who kept their income at or below £100k.`,
    optimization: `**Strategy: Significant Pension Contribution**

At this income level, pension contributions become extremely tax-efficient:
- Contribute £20,000 via salary sacrifice to drop below £100k
- Restore your full £12,570 personal allowance
- Tax saving: approximately £12,000
- Plus 2% NI saving on the full amount

Even a partial contribution helps. Each £2 contributed restores £1 of personal allowance.

**Consider:**
- Annual allowance for pension is £60,000 (2025-26)
- If you can't contribute £20k, even £10k saves £6,000`,
    relatedBlogSlugs: [
      '100k-tax-trap-avoid-60-percent-tax-2025',
      'pension-tax-relief-uk-2025-guide',
      'higher-rate-taxpayer-guide-uk-2025',
      'year-end-tax-planning-2025-26-complete-checklist',
    ],
    faqs: [
      {
        question: "What's my effective tax rate at £120k?",
        answer:
          'Your marginal rate on income between £100k-£125k is effectively 60% (40% income tax + loss of personal allowance worth 20%). Above £125,140, it drops to 47% (45% + 2% NI).',
      },
      {
        question: 'How much should I contribute to my pension at £120k?',
        answer:
          'To fully escape the tax trap, contribute £20,000 (reducing taxable income to £100k). This saves approximately £12,000 in tax. Even partial contributions are highly tax-efficient.',
      },
      {
        question: 'What if I already contribute to a workplace pension?',
        answer:
          "Your workplace contributions count toward reducing taxable income. If you're already contributing 5%, that's £6,000 at £120k salary, leaving £14,000 more needed to reach £100k taxable income.",
      },
    ],
    heroStatLabel: 'Potential Tax Savings',
    highPriority: true,
  },

  // ============================================================================
  // STUDENT LOAN SCENARIOS
  // ============================================================================
  {
    slug: 'student-loan-plan-2-30k',
    title: 'Plan 2 Student Loan at £30k Salary: Repayment Calculator',
    category: 'student-loan',
    salary: 30000,
    description:
      "See exactly how much you'll repay on a Plan 2 student loan at a £30k salary - and how long until it's paid off.",
    searchIntent: [
      'plan 2 student loan 30k',
      'student loan repayment 30k salary',
      '30k salary student loan',
      'plan 2 repayment calculator',
    ],
    defaults: {
      salary: 30000,
      studentLoan: 'plan2',
    },
    explanation: `With a £30,000 salary and a Plan 2 student loan, you'll repay 9% of everything you earn above the threshold of £28,470 (2025-26).

**Your Annual Repayment:**
- Income above threshold: £30,000 - £28,470 = £1,530
- Annual repayment: £1,530 × 9% = £137.70
- Monthly repayment: £11.48

At this repayment rate, with typical loan balances (£40k-£50k), you're unlikely to fully repay before the 30-year write-off. But that's not necessarily bad - Plan 2 loans don't affect your credit score and are written off after 30 years.`,
    optimization: `**Understanding Your Options**

At £30k with a Plan 2 loan, voluntary overpayments rarely make financial sense:
- Interest accrues faster than your repayments
- You'd need to significantly increase income to make a dent
- The loan is written off after 30 years regardless

**Better strategies:**
1. Focus on career progression to higher salaries
2. Use spare cash for ISAs or pension (better returns)
3. Accept the repayment as a "graduate tax"`,
    relatedBlogSlugs: [
      'student-loan-repayment-changes-2025-26',
      'beginners-guide-to-uk-taxation',
      'what-40k-salary-actually-looks-like-uk-2025',
    ],
    faqs: [
      {
        question: 'How much will I repay on a Plan 2 loan at £30k salary?',
        answer:
          "At £30k, you'll repay approximately £138 per year (£11.50/month). This is 9% of your income above the £28,470 threshold.",
      },
      {
        question: 'Will I ever pay off my Plan 2 loan at £30k?',
        answer:
          "At this income level and typical loan balances (£40k-£50k), you likely won't fully repay before the 30-year write-off. Plan 2 loans are written off 30 years after you were first due to repay.",
      },
      {
        question: 'Should I make voluntary overpayments?',
        answer:
          "Generally no. At £30k with a large loan balance, the interest typically exceeds your repayments. You're usually better off using spare cash for savings or pensions unless you expect to earn significantly more soon.",
      },
    ],
    heroStatLabel: 'Annual Repayment',
    highPriority: true,
  },
  {
    slug: 'student-loan-plan-2-40k',
    title: 'Plan 2 Student Loan at £40k Salary: Full Breakdown',
    category: 'student-loan',
    salary: 40000,
    description:
      'At £40k, your Plan 2 repayments increase significantly. See the exact monthly deduction and what it means for your take-home.',
    searchIntent: [
      'plan 2 student loan 40k',
      'student loan 40k salary',
      '40k salary student loan deduction',
      'plan 2 repayment 40000',
    ],
    defaults: {
      salary: 40000,
      studentLoan: 'plan2',
    },
    explanation: `At £40,000, your Plan 2 student loan repayments become more substantial. You repay 9% of income above the £28,470 threshold.

**Your Annual Repayment:**
- Income above threshold: £40,000 - £28,470 = £11,530
- Annual repayment: £11,530 × 9% = £1,037.70
- Monthly repayment: £86.48

This represents about 2.6% of your gross salary going to loan repayments. Combined with tax and NI, your total deductions are significant - but your take-home is still comfortable at this level.`,
    optimization: `**At £40k, consider your loan balance**

If your loan balance is under £30,000:
- You might actually repay it within 30 years
- Higher voluntary contributions could make sense
- But run the numbers first - interest rates matter

If your balance is £40k+:
- Repayment likely won't exceed interest for years
- Focus on other financial goals first
- Treat it as a graduate tax until income rises significantly`,
    relatedBlogSlugs: [
      'student-loan-repayment-changes-2025-26',
      'what-40k-salary-actually-looks-like-uk-2025',
      'how-much-tax-will-i-pay-uk-2025',
    ],
    faqs: [
      {
        question: 'How much is my monthly student loan payment at £40k?',
        answer:
          "On a Plan 2 loan at £40k salary, you'll pay approximately £86 per month, or £1,038 per year. This is 9% of your income above the £28,470 threshold.",
      },
      {
        question: 'What percentage of my salary goes to student loan at £40k?',
        answer:
          'Approximately 2.6% of your gross salary (£1,038 of £40,000). This is in addition to income tax (~15%) and NI (~6%), bringing total deductions to roughly 24%.',
      },
      {
        question: 'At what salary do Plan 2 repayments become significant?',
        answer:
          "Repayments scale linearly above £28,470. At £50k you'd pay ~£1,938/year. At £60k, ~£2,838/year. The more you earn, the faster you'll repay - but also the more you'll repay in total.",
      },
    ],
    heroStatLabel: 'Monthly Repayment',
    highPriority: true,
  },

  // ============================================================================
  // SCOTTISH TAX SCENARIOS
  // ============================================================================
  {
    slug: 'scotland-vs-england-50k',
    title: 'Scottish vs English Tax at £50k: Side-by-Side Comparison',
    category: 'scottish',
    salary: 50000,
    description:
      'See exactly how much more (or less) you pay in Scotland vs England at a £50k salary. Includes full breakdown.',
    searchIntent: [
      'scottish tax vs english',
      'scotland tax difference',
      '50k salary scotland',
      'scottish income tax calculator',
    ],
    defaults: {
      salary: 50000,
      scottish: true,
    },
    explanation: `At £50,000, Scottish taxpayers pay more income tax than their counterparts in England, Wales, and Northern Ireland. Scotland's six-band system means you hit the 42% higher rate earlier.

**The Key Difference:**
Scotland's higher rate (42%) starts at £43,663 vs the UK's 40% at £50,271.

**At £50k, the Difference:**
- Scottish income tax: ~£8,076
- Rest of UK income tax: ~£7,486
- Annual difference: ~£590 more in Scotland

However, Scottish taxpayers benefit from marginally lower rates on the first £27,491 of taxable income.`,
    optimization: `**What You Can Control**

The tax difference is unavoidable based on where you live on 6 April. However:

1. **Pension contributions** reduce your taxable income in both systems
2. **Marriage allowance** works the same in Scotland
3. **Charitable donations** via Gift Aid provide tax relief at your highest rate

Moving specifically to avoid Scottish tax rarely makes financial sense unless you're in the £50k-£125k range and considering a move anyway.`,
    relatedBlogSlugs: [
      'scottish-vs-english-tax-rates-2026-comparison',
      'what-50k-salary-actually-looks-like-uk-2025',
      'higher-rate-taxpayer-guide-uk-2025',
    ],
    faqs: [
      {
        question: 'How much more tax do I pay in Scotland at £50k?',
        answer:
          'Approximately £590 more per year in income tax. Scottish higher rate (42%) kicks in at £43,663, earlier than the UK higher rate (40%) at £50,271.',
      },
      {
        question: 'Why does Scotland have different tax rates?',
        answer:
          "Since 2017, the Scottish Parliament has had the power to set income tax rates and bands for Scottish taxpayers. They've chosen a more progressive system with six bands instead of three.",
      },
      {
        question: "How do I know if I'm a Scottish taxpayer?",
        answer:
          "You're a Scottish taxpayer if Scotland is where you live (or spend the most time). HMRC determines this, and your tax code will start with 'S' (e.g., S1257L).",
      },
    ],
    heroStatLabel: 'Annual Difference',
    highPriority: true,
  },
  {
    slug: 'scotland-vs-england-60k',
    title: '£60k Salary: Scottish vs English Tax Comparison',
    category: 'scottish',
    salary: 60000,
    description:
      'At £60k, the Scottish tax premium becomes more noticeable. See the exact difference and what it means for your finances.',
    searchIntent: [
      'scottish tax 60k',
      '60k salary scotland vs england',
      'scottish higher rate tax',
      '60000 salary scotland',
    ],
    defaults: {
      salary: 60000,
      scottish: true,
    },
    explanation: `At £60,000, the gap between Scottish and rest-of-UK tax widens. You're firmly in higher-rate territory in both systems, but Scotland's 42% rate on more of your income makes a bigger impact.

**The Numbers:**
- Scottish income tax: ~£12,276
- Rest of UK income tax: ~£11,486
- Annual difference: ~£790 more in Scotland

At this level, you're paying 42% on income from £43,663 upward in Scotland, while in rUK you'd only hit 40% above £50,271.`,
    optimization: `**Tax-Efficient Strategies at £60k**

1. **Pension contributions**: Each £1,000 contributed saves £420 (Scottish higher rate)
2. **Salary sacrifice**: Additional 2% NI saving on top of income tax relief
3. **Charitable giving**: Gift Aid reclaims tax at your 42% marginal rate

At £60k, you're not yet in the personal allowance taper, so the focus is on maximizing relief on higher-rate income.`,
    relatedBlogSlugs: [
      'scottish-vs-english-tax-rates-2026-comparison',
      'what-60k-salary-actually-looks-like-uk-2025',
      'higher-rate-taxpayer-guide-uk-2025',
      'pension-tax-relief-uk-2025-guide',
    ],
    faqs: [
      {
        question: 'How much extra tax do Scottish taxpayers pay at £60k?',
        answer:
          "Approximately £790 more per year compared to England, Wales, or Northern Ireland. This is due to Scotland's 42% higher rate applying from £43,663.",
      },
      {
        question: 'Is there any Scottish tax advantage?',
        answer:
          'At lower incomes (under £28k), Scottish taxpayers actually pay slightly less due to the 19% starter rate. The crossover point where Scotland becomes more expensive is around £28,000.',
      },
      {
        question: "What's the Scottish higher rate for 2025-26?",
        answer:
          "Scotland's higher rate is 42% (vs 40% in rUK), applying to income between £43,663 and £75,000. Above £75,000, there's an additional 'advanced rate' of 45% before reaching the top rate of 48%.",
      },
    ],
    heroStatLabel: 'Tax Difference',
    highPriority: true,
  },

  // ============================================================================
  // LIFE STAGE SCENARIOS
  // ============================================================================
  {
    slug: 'first-job-25k',
    title: 'First Job at £25k: Complete Take-Home Pay Guide',
    category: 'life-stage',
    salary: 25000,
    description:
      'Starting your first job? See exactly what £25k means for your monthly take-home pay, tax, and what to expect on your payslip.',
    searchIntent: [
      'first job take home pay',
      '25k salary take home',
      'first job tax uk',
      '25000 salary after tax',
    ],
    defaults: {
      salary: 25000,
    },
    explanation: `Congratulations on your first job! At £25,000, here's what to expect:

**Your Take-Home Pay:**
- Annual: ~£21,520
- Monthly: ~£1,793
- Weekly: ~£414

**What Gets Deducted:**
- Income tax: ~£2,486/year (basic rate 20% on earnings above £12,570)
- National Insurance: ~£994/year (8% on earnings above £12,570)
- Total deductions: ~£3,480 (13.9% of gross)

You'll receive your first payslip showing gross pay, tax, NI, and net pay. Your tax code will likely be 1257L - this means you have the standard £12,570 personal allowance.`,
    optimization: `**First Job Financial Priorities**

1. **Understand your payslip**: Check tax code is 1257L (not BR or emergency code)
2. **Workplace pension**: You'll be auto-enrolled - this is usually worth keeping
3. **Student loan**: If you have one, it won't come out until you earn above the threshold
4. **Emergency fund**: Aim for 3 months expenses before other saving

At £25k, focus on building good financial habits rather than complex tax optimization.`,
    relatedBlogSlugs: [
      'beginners-guide-to-uk-taxation',
      'understanding-uk-tax-codes',
      'how-much-tax-will-i-pay-uk-2025',
      'how-national-insurance-works-uk-2025',
    ],
    faqs: [
      {
        question: 'What is take-home pay on a £25k salary?',
        answer:
          "After tax and NI, you'll take home approximately £21,520 per year, or £1,793 per month. This is about 86.1% of your gross salary.",
      },
      {
        question: 'Why is my tax code 1257L?',
        answer:
          "1257L is the standard tax code for 2025-26, meaning you have the full £12,570 personal allowance (1257 × 10). You won't pay tax on this amount.",
      },
      {
        question: 'Do I need to file a tax return?',
        answer:
          "Usually no. If you're employed with a simple tax situation (one job, no other income), PAYE handles everything. Your employer deducts tax automatically.",
      },
    ],
    heroStatLabel: 'Monthly Take-Home',
    highPriority: true,
  },
];

/**
 * Get all scenario slugs for static generation
 */
export function getAllScenarioSlugs(): string[] {
  return SCENARIOS.map((s) => s.slug);
}

/**
 * Get scenario by slug
 */
export function getScenarioBySlug(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(category: ScenarioCategory): Scenario[] {
  return SCENARIOS.filter((s) => s.category === category);
}

/**
 * Get category info by slug
 */
export function getCategoryInfo(category: ScenarioCategory): ScenarioCategoryInfo | undefined {
  return SCENARIO_CATEGORIES.find((c) => c.slug === category);
}

/**
 * Get all high-priority scenarios (for featured display)
 */
export function getHighPriorityScenarios(): Scenario[] {
  return SCENARIOS.filter((s) => s.highPriority);
}
