/**
 * Use Case Data
 *
 * Central data source for use case landing pages.
 * Used by /best-for/[use-case] dynamic pages.
 *
 * Each use case targets specific user segments searching for tax calculators.
 *
 * @module data/useCases
 */

import type { StudentLoanPlan } from '@/constants/taxRates';

/**
 * FAQ item for use case pages
 */
export interface UseCaseFAQ {
  question: string;
  answer: string;
}

/**
 * Pre-filled calculator defaults for each use case
 */
export interface UseCaseDefaults {
  salary: number;
  pensionPercent?: number;
  studentLoan?: StudentLoanPlan;
  scottish?: boolean;
}

/**
 * Feature highlight for use case pages
 */
export interface UseCaseFeature {
  title: string;
  description: string;
  icon: 'calculator' | 'shield' | 'chart' | 'clock' | 'target' | 'users' | 'piggy' | 'trending';
}

/**
 * Complete use case data model
 */
export interface UseCase {
  /** URL slug for the use case page */
  slug: string;
  /** Page title */
  title: string;
  /** Target audience name */
  audience: string;
  /** Typical salary range for this audience */
  salaryRange: { min: number; max: number };
  /** Short description for listings */
  description: string;
  /** Search intent keywords this page targets */
  searchIntent: string[];
  /** Pre-filled calculator parameters */
  defaults: UseCaseDefaults;
  /** Why PayeTax is great for this audience */
  whyPayeTax: string[];
  /** Key features to highlight */
  features: UseCaseFeature[];
  /** Main explanation content */
  explanation: string;
  /** Tips specific to this audience */
  tips: string[];
  /** Related blog post slugs for cross-linking */
  relatedBlogSlugs: string[];
  /** FAQ items for the page */
  faqs: UseCaseFAQ[];
  /** Whether this is a high-priority use case */
  highPriority?: boolean;
}

/**
 * All use case data
 */
export const USE_CASES: UseCase[] = [
  // ============================================================================
  // FREELANCERS
  // ============================================================================
  {
    slug: 'freelancers',
    title: 'Tax Calculator for Freelancers UK 2026',
    audience: 'Freelancers',
    salaryRange: { min: 20000, max: 80000 },
    description:
      'Calculate your take-home pay as a UK freelancer. Understand how PAYE works when you have a side gig or move between employment and freelancing.',
    searchIntent: [
      'tax calculator for freelancers uk',
      'freelance tax calculator',
      'freelancer take home pay',
      'uk freelance tax',
    ],
    defaults: {
      salary: 35000,
    },
    whyPayeTax: [
      'Instant PAYE calculations for employed income',
      'What-If scenarios for income changes',
      'Privacy-first - no data stored',
      'Student loan support for all plans',
    ],
    features: [
      {
        title: 'Real-Time Results',
        description: 'See your take-home pay update instantly as you adjust figures',
        icon: 'clock',
      },
      {
        title: 'What-If Scenarios',
        description: 'Compare different income levels side-by-side',
        icon: 'chart',
      },
      {
        title: 'Privacy First',
        description: 'All calculations happen in your browser - nothing stored',
        icon: 'shield',
      },
    ],
    explanation: `As a freelancer in the UK, understanding your tax situation is essential for financial planning. Whether you're fully self-employed, have a mix of employed and freelance income, or are transitioning between the two, knowing how PAYE affects your employed earnings helps you manage your overall tax position.

**What PayeTax Calculates:**
- Income Tax on employed earnings
- National Insurance contributions
- Student loan repayments (all plans)
- Pension contribution effects
- Take-home pay after all deductions

**For Self-Employed Income:**
If you also have self-employed income, you'll need to file a Self Assessment tax return. PayeTax helps you understand the PAYE portion of your income, making your overall tax planning easier.`,
    tips: [
      'Use the pension contribution feature to see how salary sacrifice affects your take-home',
      "Set aside 25-30% of freelance income for tax if you're also self-employed",
      'Check if you need to register for Self Assessment (most freelancers do)',
      'Consider the threshold where higher-rate tax kicks in (£50,271)',
    ],
    relatedBlogSlugs: [
      'beginners-guide-to-uk-taxation',
      'how-much-tax-will-i-pay-uk-2025',
      'understanding-uk-tax-codes',
    ],
    faqs: [
      {
        question: 'Can I use PayeTax for freelance income?',
        answer:
          "PayeTax calculates PAYE tax on employed income. If you have freelance/self-employed income, you'll need to file a Self Assessment. However, PayeTax is perfect for calculating the tax on any employed portion of your income.",
      },
      {
        question: 'How do I calculate tax on mixed income?',
        answer:
          'For employed income, use PayeTax. Your self-employed income is added on top for Self Assessment. The personal allowance (£12,570) applies to your total income, and you pay the same rates - just through different mechanisms.',
      },
      {
        question: 'Should I pay pension contributions as a freelancer?',
        answer:
          "Yes! Pension contributions reduce your taxable income and provide tax relief. Use PayeTax's pension feature to see how contributions affect your employed take-home pay. Self-employed pension contributions work similarly.",
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // CONTRACTORS
  // ============================================================================
  {
    slug: 'contractors',
    title: 'Tax Calculator for UK Contractors 2026',
    audience: 'Contractors',
    salaryRange: { min: 40000, max: 150000 },
    description:
      'Calculate your take-home pay as a UK contractor. Whether umbrella or limited company, understand your PAYE deductions.',
    searchIntent: [
      'contractor tax calculator uk',
      'umbrella company tax calculator',
      'contractor take home pay',
      'it contractor tax uk',
    ],
    defaults: {
      salary: 75000,
      pensionPercent: 5,
    },
    whyPayeTax: [
      'Accurate PAYE calculations for umbrella income',
      'What-If to compare different day rates',
      'Pension contribution modelling',
      'Historic years for IR35 comparisons',
    ],
    features: [
      {
        title: 'Day Rate Comparison',
        description: 'Use What-If to compare different contract rates',
        icon: 'chart',
      },
      {
        title: 'Pension Planning',
        description: 'Model salary sacrifice for tax efficiency',
        icon: 'piggy',
      },
      {
        title: 'Quick Calculations',
        description: 'Fast, ad-free results for busy professionals',
        icon: 'clock',
      },
    ],
    explanation: `As a UK contractor, your tax situation depends on your working arrangement. If you're inside IR35 (umbrella or deemed employment), PayeTax calculates your exact take-home pay after PAYE deductions.

**For Umbrella Company Contractors:**
PayeTax shows precisely what you'll receive after Income Tax, NI, student loans, and pension contributions. Enter your gross umbrella salary to see your net pay.

**For Limited Company Directors:**
Your salary component is calculated exactly as PAYE. For dividends and corporation tax, you'll need additional planning - but PayeTax handles the salary portion accurately.

**IR35 Considerations:**
If you're caught by IR35 (inside), your income is treated as employment for tax purposes. PayeTax gives you the exact PAYE calculation for this scenario.`,
    tips: [
      'Compare different annual salaries using What-If to model rate changes',
      'Consider pension contributions to reduce tax - especially above £50,270',
      'If over £100k, pension sacrifice is extremely tax-efficient (60% effective rate)',
      'Check if you have student loans - they apply to all earnings over threshold',
    ],
    relatedBlogSlugs: [
      'higher-rate-taxpayer-guide-uk-2025',
      '100k-tax-trap-avoid-60-percent-tax-2025',
      'pension-tax-relief-uk-2025-guide',
      'salary-sacrifice-explained-2025-26',
    ],
    faqs: [
      {
        question: 'How do I calculate my umbrella company take-home pay?',
        answer:
          'Enter your gross annual salary (what the umbrella company pays you before deductions) into PayeTax. The result shows your take-home after Income Tax, NI, and any pension/student loan deductions. Your umbrella margin is usually deducted before this.',
      },
      {
        question: 'Does PayeTax handle IR35?',
        answer:
          "PayeTax calculates PAYE tax, which is what applies when you're inside IR35. Whether you're umbrella or deemed employed, your take-home calculation is the same as any employed person. For outside IR35 Ltd company scenarios, you'd also need dividend calculations.",
      },
      {
        question: 'How can I reduce my tax as a contractor?',
        answer:
          "Pension contributions are the most powerful tool for contractors. If you're over £50,270, you save 40% on contributions. Over £100k, salary sacrifice can save 60%+ due to the personal allowance taper. Use PayeTax's pension feature to model this.",
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // HIGH EARNERS
  // ============================================================================
  {
    slug: 'high-earners',
    title: 'Tax Calculator for High Earners UK 2026',
    audience: 'High Earners',
    salaryRange: { min: 80000, max: 300000 },
    description:
      'Calculate your take-home pay over £100k. Understand the 60% tax trap and how pension contributions can save you thousands.',
    searchIntent: [
      'tax calculator over 100k',
      'high earner tax calculator uk',
      '100k salary tax',
      'tax trap calculator',
      '125k salary after tax',
    ],
    defaults: {
      salary: 110000,
      pensionPercent: 10,
    },
    whyPayeTax: [
      'Clear visualization of the 60% tax trap',
      'What-If to model pension optimization',
      'Historic years for year-on-year comparison',
      'Instant calculations for complex scenarios',
    ],
    features: [
      {
        title: 'Tax Trap Calculator',
        description: 'See exactly how the £100k-£125k trap affects you',
        icon: 'target',
      },
      {
        title: 'Pension Optimization',
        description: 'Calculate optimal pension contributions',
        icon: 'piggy',
      },
      {
        title: 'What-If Scenarios',
        description: 'Compare pre and post pension sacrifice',
        icon: 'chart',
      },
    ],
    explanation: `Earning over £100,000 puts you in one of the UK's most punishing tax zones. Between £100,001 and £125,140, you face an effective 60% tax rate due to the personal allowance taper.

**The Tax Trap Explained:**
- For every £2 earned over £100k, you lose £1 of personal allowance
- This loss is worth 40% (your marginal rate)
- Combined with 40% Income Tax + 2% NI = 60% effective rate
- At £125,140, your personal allowance is completely gone

**How PayeTax Helps:**
Use the What-If feature to compare:
1. Your current take-home with no pension
2. Take-home after pension contribution
3. Total value (take-home + pension pot)

Often, contributing to your pension to stay below £100k gives you MORE total wealth.`,
    tips: [
      'Every £1 in pension between £100k-£125k saves 60p in tax',
      'Salary sacrifice also saves 2% NI on top of income tax savings',
      'Annual pension allowance is £60,000 (2025-26) - use it!',
      'Consider charitable giving via Gift Aid for additional relief',
    ],
    relatedBlogSlugs: [
      '100k-tax-trap-avoid-60-percent-tax-2025',
      'pension-tax-relief-uk-2025-guide',
      'salary-sacrifice-explained-2025-26',
      'higher-rate-taxpayer-guide-uk-2025',
      'what-100k-salary-actually-looks-like-uk-2025',
    ],
    faqs: [
      {
        question: 'What is the 60% tax trap?',
        answer:
          "Between £100,001 and £125,140, you lose £1 of personal allowance for every £2 earned. This loss is worth 40% tax (since you'd have paid 20% on that £12,570). Combined with 40% Income Tax and 2% NI, the effective rate is 60-62%.",
      },
      {
        question: 'How much pension should I contribute at £110k?',
        answer:
          'To fully escape the trap, contribute £10,000 via salary sacrifice (reducing taxable income to £100k). This saves approximately £6,000 in tax while your pension grows by £10,000. Even partial contributions are highly efficient.',
      },
      {
        question: 'Is there any point earning over £100k?',
        answer:
          'Yes! After £125,140, the effective rate drops to 47% (45% + 2% NI). The trap only applies to the £25,140 window. Also, not everyone can or wants to sacrifice all excess to pension. But understanding the trap helps you make informed decisions.',
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // SCOTTISH TAXPAYERS
  // ============================================================================
  {
    slug: 'scottish',
    title: 'Scottish Tax Calculator 2026',
    audience: 'Scottish Taxpayers',
    salaryRange: { min: 15000, max: 200000 },
    description:
      'Calculate your Scottish income tax with all 6 bands. See how Scottish rates compare to the rest of the UK.',
    searchIntent: [
      'scottish tax calculator',
      'scotland income tax calculator',
      'scottish tax rates 2026',
      'scottish paye calculator',
    ],
    defaults: {
      salary: 45000,
      scottish: true,
    },
    whyPayeTax: [
      'Full Scottish 6-band tax support',
      'Compare Scottish vs rUK rates instantly',
      'What-If for salary comparisons',
      'Historic Scottish rates available',
    ],
    features: [
      {
        title: 'All 6 Scottish Bands',
        description: 'Starter, Basic, Intermediate, Higher, Advanced, Top',
        icon: 'chart',
      },
      {
        title: 'Scotland vs rUK',
        description: 'Toggle to compare your tax in both systems',
        icon: 'users',
      },
      {
        title: 'What-If Scenarios',
        description: 'Compare different salary levels',
        icon: 'trending',
      },
    ],
    explanation: `Scotland has its own income tax rates and bands, set by the Scottish Parliament. The Scottish system has 6 bands compared to 3 in the rest of the UK, with different thresholds and rates.

**Scottish Tax Bands 2025-26:**
- Starter Rate (19%): £12,571 - £15,397
- Basic Rate (20%): £15,398 - £27,491
- Intermediate Rate (21%): £27,492 - £43,662
- Higher Rate (42%): £43,663 - £75,000
- Advanced Rate (45%): £75,001 - £125,140
- Top Rate (48%): Over £125,140

**Key Differences:**
- Scottish higher rate (42%) starts earlier than rUK (40% at £50,271)
- Low earners (under £28k) pay slightly less in Scotland
- Higher earners pay more in Scotland at most income levels`,
    tips: [
      'Check your tax code - it should start with "S" for Scottish taxpayers',
      "You're Scottish if you live in Scotland on 6 April (start of tax year)",
      'National Insurance is the same UK-wide - only income tax differs',
      "Use What-If to compare if you're considering relocation",
    ],
    relatedBlogSlugs: [
      'scottish-vs-english-tax-rates-2026-comparison',
      'understanding-uk-tax-codes',
      'beginners-guide-to-uk-taxation',
    ],
    faqs: [
      {
        question: "How do I know if I'm a Scottish taxpayer?",
        answer:
          'You\'re a Scottish taxpayer if Scotland is where you live (your main residence). HMRC determines this, and your tax code will start with "S" (e.g., S1257L). If you move during the year, it\'s based on where you live on 6 April.',
      },
      {
        question: 'Do Scottish taxpayers pay more tax?',
        answer:
          'It depends on your income. Below about £28,000, Scottish taxpayers pay slightly less. Above that, they generally pay more due to higher rates (42% vs 40%) kicking in earlier. The difference is most significant between £50k-£125k.',
      },
      {
        question: 'Is National Insurance different in Scotland?',
        answer:
          'No. National Insurance is set UK-wide by Westminster, not the Scottish Parliament. Only income tax rates and bands differ. NI rates and thresholds are identical across the UK.',
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // STUDENTS / RECENT GRADS
  // ============================================================================
  {
    slug: 'students',
    title: 'Student Loan Tax Calculator UK 2026',
    audience: 'Students & Graduates',
    salaryRange: { min: 20000, max: 50000 },
    description:
      'Calculate your take-home pay with student loan repayments. Covers Plan 1, Plan 2, Plan 4, Plan 5, and Postgraduate loans.',
    searchIntent: [
      'student loan tax calculator',
      'plan 2 student loan calculator',
      'student loan repayment calculator uk',
      'graduate tax calculator',
    ],
    defaults: {
      salary: 32000,
      studentLoan: 'plan2',
    },
    whyPayeTax: [
      'All student loan plans supported',
      'Shows exact monthly repayments',
      'What-If for salary negotiations',
      'Understand total deductions clearly',
    ],
    features: [
      {
        title: 'All Loan Plans',
        description: 'Plan 1, 2, 4, 5 and Postgraduate supported',
        icon: 'users',
      },
      {
        title: 'Clear Breakdown',
        description: 'See exactly how much goes to each deduction',
        icon: 'chart',
      },
      {
        title: 'Salary Comparison',
        description: 'Compare offers with What-If scenarios',
        icon: 'trending',
      },
    ],
    explanation: `If you have a student loan, repayments are deducted from your salary alongside Income Tax and National Insurance. The amount depends on your loan plan and how much you earn above the threshold.

**Repayment Thresholds (2025-26):**
- Plan 1 (pre-2012): £24,990/year - 9% of income above
- Plan 2 (post-2012 England/Wales): £28,470/year - 9% above
- Plan 4 (Scotland): £31,395/year - 9% above
- Plan 5 (post-2023): £25,000/year - 9% above
- Postgraduate Loan: £21,000/year - 6% above

**Important to Know:**
- Repayments only apply to income ABOVE the threshold
- Loans don't affect your credit score
- Plan 2 is written off after 30 years
- You can have both undergraduate AND postgraduate loans`,
    tips: [
      'Use PayeTax to see your true take-home after loan deductions',
      "Consider if voluntary overpayments make sense (often they don't for Plan 2)",
      "Student loans don't appear on credit reports",
      "Check which plan you're on via the Student Loans Company",
    ],
    relatedBlogSlugs: [
      'student-loan-repayment-changes-2025-26',
      'beginners-guide-to-uk-taxation',
      'what-40k-salary-actually-looks-like-uk-2025',
    ],
    faqs: [
      {
        question: 'When do I start repaying my student loan?',
        answer:
          "Repayments begin in the April after you leave your course, but only if you earn above your plan's threshold. For Plan 2, that's £28,470/year (2025-26). Below this, you pay nothing.",
      },
      {
        question: 'How much will I repay each month?',
        answer:
          "You repay 9% of everything you earn above the threshold (6% for Postgraduate loans). At £35,000 on Plan 2, that's 9% of £6,530 = £587.70/year or £49/month.",
      },
      {
        question: 'Should I overpay my student loan?',
        answer:
          "Usually no for Plan 2 (post-2012). Most graduates won't repay in full before the 30-year write-off. Voluntary overpayments make sense only if you expect very high lifetime earnings or have a small balance.",
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // FIRST JOB
  // ============================================================================
  {
    slug: 'first-job',
    title: 'First Job Tax Calculator UK 2026',
    audience: 'First Time Workers',
    salaryRange: { min: 18000, max: 35000 },
    description:
      "Starting your first job? Calculate your take-home pay and understand what's on your payslip.",
    searchIntent: [
      'first job tax calculator uk',
      'first job take home pay',
      'new job tax calculator',
      'entry level salary after tax',
    ],
    defaults: {
      salary: 25000,
    },
    whyPayeTax: [
      'Simple, clear interface for beginners',
      'No account or sign-up required',
      'Explains tax codes and deductions',
      'What-If for comparing job offers',
    ],
    features: [
      {
        title: 'Beginner Friendly',
        description: 'Clean design with no overwhelming options',
        icon: 'users',
      },
      {
        title: 'Compare Job Offers',
        description: 'Use What-If to compare different salaries',
        icon: 'chart',
      },
      {
        title: 'Instant Results',
        description: 'No sign-up, no ads, just answers',
        icon: 'clock',
      },
    ],
    explanation: `Starting your first job is exciting - but understanding your payslip can be confusing. Here's what you need to know about UK tax.

**Your First Payslip:**
- **Gross Pay**: Your salary before any deductions
- **Income Tax**: Usually 20% on earnings above £12,570
- **National Insurance**: 8% on earnings above £12,570
- **Net Pay**: What actually hits your bank account

**Your Tax Code:**
You'll likely have tax code 1257L, meaning you have the standard £12,570 personal allowance. This is the amount you can earn tax-free.

**Emergency Tax:**
If your tax code shows BR or a month number (like 1257L M1), you're on emergency tax. This usually corrects itself, or contact HMRC if it doesn't.`,
    tips: [
      'Check your tax code on your payslip - it should be 1257L for most people',
      "Emergency tax (BR code) means you'll be refunded once it's corrected",
      'Workplace pension auto-enrolment starts at age 22 if you earn £10,000+',
      'Keep your first payslips - they help if you need to query anything',
    ],
    relatedBlogSlugs: [
      'beginners-guide-to-uk-taxation',
      'understanding-uk-tax-codes',
      'how-much-tax-will-i-pay-uk-2025',
      'how-national-insurance-works-uk-2025',
    ],
    faqs: [
      {
        question: 'Why is my first paycheck less than expected?',
        answer:
          'Your gross salary is reduced by Income Tax (20% above £12,570), National Insurance (8% above £12,570), and possibly pension contributions. At £25,000, expect around £1,744/month take-home.',
      },
      {
        question: 'What is my tax code and why does it matter?',
        answer:
          "1257L is the standard code, meaning you have a £12,570 personal allowance. The number (1257) x 10 = your tax-free amount. If your code is wrong (like BR), you'll pay too much tax initially.",
      },
      {
        question: 'Do I need to do a tax return?',
        answer:
          "Usually no. If you're employed with one job and no other income, PAYE handles everything automatically. You only need a Self Assessment if you have additional income, are self-employed, or earn over £150,000.",
      },
    ],
    highPriority: true,
  },

  // ============================================================================
  // PART-TIME WORKERS
  // ============================================================================
  {
    slug: 'part-time',
    title: 'Part-Time Tax Calculator UK 2026',
    audience: 'Part-Time Workers',
    salaryRange: { min: 5000, max: 25000 },
    description:
      'Calculate your take-home pay for part-time work. Understand tax on lower earnings and multiple jobs.',
    searchIntent: [
      'part time tax calculator uk',
      'part time job tax',
      'tax on second job uk',
      'part time salary after tax',
    ],
    defaults: {
      salary: 15000,
    },
    whyPayeTax: [
      'Accurate for all income levels',
      'Shows when tax/NI thresholds kick in',
      'What-If for extra hours scenarios',
      'No minimum salary required',
    ],
    features: [
      {
        title: 'Low Income Support',
        description: 'Accurate even for earnings below thresholds',
        icon: 'calculator',
      },
      {
        title: 'Multiple Jobs',
        description: 'Understand how tax works across jobs',
        icon: 'users',
      },
      {
        title: 'What-If Scenarios',
        description: 'See impact of extra hours',
        icon: 'trending',
      },
    ],
    explanation: `Part-time workers have the same tax rules as full-time - but you might not pay any tax if you earn below certain thresholds.

**Key Thresholds (2025-26):**
- **Personal Allowance (£12,570)**: Earn less than this = no income tax
- **NI Threshold (£12,570)**: Earn less than this = no National Insurance
- **Lower Earnings Limit (£6,396)**: Below this, no NI paid but no NI credits either

**Multiple Jobs:**
If you have two jobs, your personal allowance is usually applied to your main job. Your second job is often taxed at 20% from the first pound (tax code BR). This can feel harsh, but you'll get a refund if you've overpaid.

**Students & Parents:**
Many part-time workers are students or parents. The same rules apply - earnings under £12,570 are tax-free.`,
    tips: [
      "Earning under £12,570? You shouldn't pay any Income Tax",
      'If you have two jobs, check both tax codes are correct',
      'Use What-If to see how extra hours affect your take-home',
      'Consider if tax-free childcare or benefits might be affected',
    ],
    relatedBlogSlugs: [
      'beginners-guide-to-uk-taxation',
      'understanding-uk-tax-codes',
      'how-national-insurance-works-uk-2025',
    ],
    faqs: [
      {
        question: 'Do I pay tax on part-time earnings?',
        answer:
          "Only if you earn over £12,570 per year (the personal allowance). Below this, you pay no income tax. National Insurance also has a threshold - you don't pay until you earn £12,570.",
      },
      {
        question: 'Why am I taxed on my second job from the first pound?',
        answer:
          'Your personal allowance (£12,570) is usually applied to your main job. HMRC gives your second job a BR code (Basic Rate), meaning 20% tax from £1. If your total earnings are under £12,570, you can claim a refund.',
      },
      {
        question: 'How can I split my personal allowance between jobs?',
        answer:
          'Contact HMRC to split your allowance using a "tax code adjustment". They\'ll give each job a different code. This is useful if both jobs have similar hours. Your total allowance stays the same - it\'s just divided.',
      },
    ],
    highPriority: false,
  },

  // ============================================================================
  // PENSIONERS
  // ============================================================================
  {
    slug: 'pensioners',
    title: 'Pension Income Tax Calculator UK 2026',
    audience: 'Pensioners',
    salaryRange: { min: 10000, max: 50000 },
    description:
      'Calculate tax on your pension income. Understand how state pension, private pension, and other income are taxed.',
    searchIntent: [
      'pension tax calculator uk',
      'tax on pension income',
      'pensioner tax calculator',
      'state pension tax calculator',
    ],
    defaults: {
      salary: 25000,
    },
    whyPayeTax: [
      'Calculate tax on pension income',
      'Understand combined income taxation',
      'What-If for withdrawal scenarios',
      'Historic years for comparison',
    ],
    features: [
      {
        title: 'Pension Income',
        description: 'Calculate tax on private and state pension',
        icon: 'piggy',
      },
      {
        title: 'Combined Income',
        description: 'Model total income from all sources',
        icon: 'chart',
      },
      {
        title: 'What-If Scenarios',
        description: 'Compare different withdrawal amounts',
        icon: 'trending',
      },
    ],
    explanation: `Pension income is taxed like any other income in the UK. Your personal allowance (£12,570) applies to your total income from all sources - including state pension.

**State Pension (2025-26):**
- Full new state pension: £11,975/year
- This is below the personal allowance, so no tax if it's your only income
- But if you have other income, state pension uses up part of your allowance

**Private Pensions:**
- Workplace and personal pensions are taxable
- Tax is deducted via PAYE (using a tax code)
- 25% can usually be taken tax-free as a lump sum

**Combined Income:**
Your total income from all sources is added together, then taxed:
- First £12,570 = tax-free (personal allowance)
- £12,571 to £50,270 = 20% (basic rate)
- Above £50,270 = 40% (higher rate)`,
    tips: [
      'State pension alone is below the personal allowance (tax-free)',
      'Private pension + state pension may push you into taxable territory',
      'Consider the order of income for tax efficiency',
      'Marriage Allowance can save £252/year if one spouse is a non-taxpayer',
    ],
    relatedBlogSlugs: [
      'beginners-guide-to-uk-taxation',
      'pension-tax-relief-uk-2025-guide',
      'understanding-uk-tax-codes',
    ],
    faqs: [
      {
        question: 'Is my state pension taxable?',
        answer:
          "Yes, state pension is taxable income, but it's paid gross (without tax deducted). If your total income is under £12,570, you won't pay tax. If you have other income, the state pension uses up part of your personal allowance.",
      },
      {
        question: 'How is tax collected on pension income?',
        answer:
          "For workplace/private pensions, tax is deducted via PAYE before you receive it. Your pension provider uses a tax code from HMRC. For state pension, tax is usually collected by adjusting your other pension's tax code.",
      },
      {
        question: 'Can I get Marriage Allowance as a pensioner?',
        answer:
          'Yes! If one spouse earns under £12,570 and the other is a basic rate taxpayer, you can transfer £1,260 of allowance. This saves the higher earner £252/year. Apply on GOV.UK.',
      },
    ],
    highPriority: false,
  },
];

/**
 * Get all use case slugs for static generation
 */
export function getAllUseCaseSlugs(): string[] {
  return USE_CASES.map((u) => u.slug);
}

/**
 * Get use case by slug
 */
export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}

/**
 * Get high-priority use cases
 */
export function getHighPriorityUseCases(): UseCase[] {
  return USE_CASES.filter((u) => u.highPriority);
}
