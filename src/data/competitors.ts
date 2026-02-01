/**
 * Competitor Data
 *
 * Central data source for competitor comparison pages.
 * Used by /best-uk-tax-calculators, /alternatives/*, and /vs/* pages.
 *
 * @module data/competitors
 */

/**
 * Feature availability flags for comparison tables
 */
export interface CompetitorFeatures {
  takeHomePay: boolean;
  scottishRates: boolean;
  studentLoans: boolean;
  pension: boolean;
  whatIf: boolean;
  mobileFirst: boolean;
  adFree: boolean;
  historicYears: boolean;
}

/**
 * Competitor category for grouping on hub pages
 */
export type CompetitorCategory =
  | 'standalone'
  | 'consumer-finance'
  | 'accounting-software'
  | 'big-four'
  | 'specialist';

/**
 * Competitor information for comparison pages
 */
export interface Competitor {
  /** URL slug for the competitor page */
  slug: string;
  /** Display name */
  name: string;
  /** Short name for tables */
  shortName: string;
  /** Competitor's website URL */
  url: string;
  /** Affiliate URL if available (for monetization) */
  affiliateUrl?: string;
  /** Affiliate program name for tracking */
  affiliateProgram?: string;
  /** Brief description of the competitor */
  description: string;
  /** What they do well */
  strengths: string[];
  /** Areas where they fall short */
  weaknesses: string[];
  /** Feature availability */
  features: CompetitorFeatures;
  /** Why PayeTax is better */
  payeTaxAdvantages: string[];
  /** Who this calculator is best for */
  bestFor: string[];
  /** Category for grouping */
  category?: CompetitorCategory;
  /** Target SEO keywords */
  targetKeywords?: string[];
}

/**
 * PayeTax features for comparison (always first in tables)
 */
export const PAYETAX_FEATURES: CompetitorFeatures = {
  takeHomePay: true,
  scottishRates: true,
  studentLoans: true,
  pension: true,
  whatIf: true,
  mobileFirst: true,
  adFree: true,
  historicYears: true,
};

/**
 * PayeTax info for comparison tables
 */
export const PAYETAX_INFO = {
  name: 'PayeTax',
  shortName: 'PayeTax',
  url: 'https://payetax.co.uk',
  description: 'Modern, privacy-first UK tax calculator with What-If scenarios',
  strengths: [
    'Modern, mobile-first design',
    'What-If salary comparison',
    'Complete privacy (client-side)',
    '100% ad-free',
    '3 historic tax years',
    'Instant real-time results',
  ],
  bestFor: [
    'Privacy-conscious users',
    'Mobile users',
    'Salary comparison scenarios',
    'Quick, clean calculations',
  ],
};

/**
 * Category metadata for display
 */
export interface CompetitorCategoryInfo {
  slug: CompetitorCategory;
  name: string;
  description: string;
}

export const COMPETITOR_CATEGORIES: CompetitorCategoryInfo[] = [
  {
    slug: 'standalone',
    name: 'Standalone Calculators',
    description: 'Dedicated tax calculator websites with no other services',
  },
  {
    slug: 'consumer-finance',
    name: 'Consumer Finance',
    description: 'Calculators from financial advice and comparison sites',
  },
  {
    slug: 'accounting-software',
    name: 'Accounting Software',
    description: 'Calculators from payroll and accounting software providers',
  },
  {
    slug: 'big-four',
    name: 'Big Four & Accounting Firms',
    description: 'Tools from major accounting and professional services firms',
  },
  {
    slug: 'specialist',
    name: 'Specialist Calculators',
    description: 'Tools focused on specific user groups like contractors or freelancers',
  },
];

/**
 * Competitor data for all comparison pages
 */
export const COMPETITORS: Competitor[] = [
  // ============================================================================
  // STANDALONE CALCULATORS
  // ============================================================================
  {
    slug: 'gov-uk-calculator',
    name: 'GOV.UK HMRC Calculator',
    shortName: 'GOV.UK',
    url: 'https://www.gov.uk/estimate-income-tax',
    // Verified 2025-01: GOV.UK "Estimate your Income Tax" includes NI, pension, and student loans
    description:
      'The official government calculator for estimating Income Tax, National Insurance, and take-home pay.',
    strengths: [
      'Official government source',
      'Authoritative HMRC data',
      'Free to use',
      'Includes pension and student loan deductions',
    ],
    weaknesses: [
      'Dated, cluttered interface',
      'Poor mobile experience',
      'Limited scenario options',
      'No real-time calculations',
      'No What-If comparisons',
      'Requires multiple page loads',
    ],
    features: {
      takeHomePay: true,
      scottishRates: false,
      studentLoans: true, // Verified: supports student loan repayment estimates
      pension: true, // Verified: supports pension contribution deductions
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Modern mobile-first design',
      'What-If salary scenarios',
      'Instant real-time results',
      'Scottish rates support',
      'Multiple student loan plans',
      'Advanced pension options',
    ],
    bestFor: [
      'Official HMRC estimates',
      'Basic take-home calculations',
      'Government documentation needs',
    ],
    category: 'standalone',
    targetKeywords: ['gov.uk tax calculator alternative', 'hmrc calculator alternative'],
  },
  {
    slug: 'salary-calculator',
    name: 'The Salary Calculator',
    shortName: 'Salary Calc',
    url: 'https://www.thesalarycalculator.co.uk/',
    // Verified 2025-01: Has tax year selector and 2025/2024 comparison calculator
    description: 'Long-established, feature-rich UK salary calculator with extensive options.',
    strengths: [
      'Comprehensive feature set',
      'Salary comparison tools',
      'Maternity/paternity pay',
      'Detailed breakdown options',
      'Long track record',
      'Year-on-year comparison tool',
    ],
    weaknesses: [
      'Dated visual design',
      'Complex, overwhelming interface',
      'Poor mobile experience',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false, // Year comparison exists but not scenario-based What-If
      mobileFirst: false,
      adFree: true,
      historicYears: true, // Verified: has tax year selector
    },
    payeTaxAdvantages: [
      'Modern, clean design',
      'Simpler, intuitive UX',
      'Real scenario What-If comparisons',
      'Mobile-first responsive',
      'Real-time calculations',
      'Verified HMRC accuracy',
    ],
    bestFor: [
      'Users needing maternity pay calculations',
      'Complex employment scenarios',
      'Those who prefer more options',
    ],
    category: 'standalone',
    targetKeywords: ['thesalarycalculator alternative', 'salary calculator uk alternative'],
  },
  {
    slug: 'listentotaxman',
    name: 'ListenToTaxman',
    shortName: 'LTTM',
    url: 'https://listentotaxman.com/',
    // Verified 2025-01: Supports historic years back to 1999
    description:
      'Popular UK tax calculator known for its straightforward approach and detailed breakdowns.',
    strengths: [
      'High search visibility',
      'Simple interface',
      'Quick calculations',
      'Established brand (15+ years)',
      'Historic years back to 1999',
    ],
    weaknesses: [
      'Outdated design',
      'Ad-supported experience',
      'No What-If comparisons',
      'Limited mobile optimization',
      'Basic feature set',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: true, // Verified: supports back to 1999
    },
    payeTaxAdvantages: [
      '100% ad-free experience',
      'What-If salary scenarios',
      'Modern, responsive design',
      'Faster calculations',
      'Privacy-first approach',
      'Better mobile experience',
    ],
    bestFor: ['Users familiar with the brand', 'Quick tax estimates', 'Basic PAYE calculations'],
    category: 'standalone',
    targetKeywords: [
      'listentotaxman alternative',
      'listen to taxman alternative',
      'payetax vs listentotaxman',
    ],
  },
  {
    slug: 'salarybot',
    name: 'SalaryBot',
    shortName: 'SalaryBot',
    url: 'https://salarybot.co.uk/',
    // Verified 2025-01: Has tax year selector with multiple years
    description:
      'Clean UK salary calculator with a focus on simplicity and take-home pay estimates.',
    strengths: [
      'Clean, modern interface',
      'Quick results',
      'Simple to use',
      'Mobile-friendly design',
      'Multiple tax years',
    ],
    weaknesses: [
      'Limited features',
      'Basic pension options only',
      'No What-If comparisons',
      'Fewer detailed breakdowns',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: true,
      adFree: true,
      historicYears: true, // Verified: has tax year selector
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'More detailed breakdowns',
      'Pension optimization tools',
      'Tax trap calculations',
      'Privacy-first design',
    ],
    bestFor: ['Quick calculations', 'Mobile users', 'Simple salary estimates'],
    category: 'standalone',
    targetKeywords: ['salarybot alternative', 'salary bot uk alternative'],
  },
  {
    slug: 'icalculator',
    name: 'iCalculator',
    shortName: 'iCalc',
    url: 'https://www.icalculator.info/',
    description:
      'Global calculator platform with UK-specific tax tools covering income tax and NI.',
    strengths: [
      'Multiple country support',
      'Detailed tax information',
      'Regular updates',
      'Comprehensive guides',
    ],
    weaknesses: [
      'Ad-heavy experience',
      'Cluttered interface',
      'Slow page loads',
      'Overwhelming options',
      'Poor mobile experience',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: true,
    },
    payeTaxAdvantages: [
      '100% ad-free experience',
      'What-If salary scenarios',
      'Faster, cleaner interface',
      'Better mobile experience',
      'UK-focused accuracy',
      'Privacy-first design',
    ],
    bestFor: ['Multi-country tax needs', 'Detailed tax research', 'Historic calculations'],
    category: 'standalone',
    targetKeywords: ['icalculator alternative', 'icalculator uk alternative'],
  },
  {
    slug: 'uktaxcalculators',
    name: 'UK Tax Calculators',
    shortName: 'UKTC',
    url: 'https://www.uktaxcalculators.co.uk/',
    description: 'Comprehensive UK tax calculation site with multiple specialized calculators.',
    strengths: [
      'Multiple calculator types',
      'Self-employed options',
      'Dividend calculations',
      'Detailed explanations',
    ],
    weaknesses: [
      'Dated interface',
      'Ad placements',
      'Slow navigation',
      'Complex menu structure',
      'No real-time updates',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: true,
    },
    payeTaxAdvantages: [
      'Modern, clean interface',
      'What-If salary scenarios',
      'Real-time calculations',
      'Mobile-first design',
      'Ad-free experience',
      'Faster results',
    ],
    bestFor: ['Self-employed calculations', 'Dividend tax planning', 'Multiple tax scenarios'],
    category: 'standalone',
    targetKeywords: ['uk tax calculators alternative', 'uktaxcalculators alternative'],
  },
  {
    slug: 'salaryaftertax',
    name: 'SalaryAfterTax',
    shortName: 'SAT',
    url: 'https://www.salaryaftertax.com/uk/',
    description:
      'International salary calculator with UK support, showing take-home pay across countries.',
    strengths: [
      'Multi-country support',
      'Clean design',
      'Cost of living data',
      'Relocation comparisons',
    ],
    weaknesses: [
      'Generic approach',
      'Less UK-specific detail',
      'Limited student loan options',
      'No What-If comparisons',
      'Basic pension handling',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: true,
      whatIf: false,
      mobileFirst: true,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'UK-focused accuracy',
      'All student loan plans',
      'What-If salary scenarios',
      'Detailed pension options',
      'Historic tax years',
      'Privacy-first design',
    ],
    bestFor: [
      'International salary comparisons',
      'Relocation planning',
      'Quick cross-country estimates',
    ],
    category: 'standalone',
    targetKeywords: ['salaryaftertax alternative', 'salary after tax uk alternative'],
  },
  {
    slug: 'netsalary',
    name: 'NetSalary.co.uk',
    shortName: 'NetSalary',
    url: 'https://www.netsalary.co.uk/',
    description: 'Simple UK take-home pay calculator focused on quick net salary estimates.',
    strengths: ['Quick estimates', 'Simple interface', 'Easy to use', 'No registration required'],
    weaknesses: [
      'Very basic features',
      'Limited options',
      'No student loan details',
      'No pension optimization',
      'Outdated design',
    ],
    features: {
      takeHomePay: true,
      scottishRates: false,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Full feature set',
      'Scottish tax support',
      'Student loan calculations',
      'What-If scenarios',
      'Pension contributions',
      'Modern mobile design',
    ],
    bestFor: ['Very quick estimates', 'Simple salary queries', 'Basic PAYE lookups'],
    category: 'standalone',
    targetKeywords: ['netsalary alternative', 'net salary calculator alternative'],
  },

  // ============================================================================
  // CONSUMER FINANCE
  // ============================================================================
  {
    slug: 'moneysavingexpert',
    name: 'MoneySavingExpert Tax Calculator',
    shortName: 'MSE',
    url: 'https://www.moneysavingexpert.com/tax-calculator/',
    description:
      "Popular consumer finance calculator from Martin Lewis's MoneySavingExpert website.",
    strengths: [
      'High brand trust',
      'Martin Lewis reputation',
      'Comprehensive guides alongside',
      'Mobile app available',
    ],
    weaknesses: [
      'Ad-heavy experience',
      'Cluttered interface',
      'Standard assumptions only',
      'No What-If comparisons',
      'Slower load times',
      'Distracting sidebar content',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      '100% ad-free experience',
      'Cleaner, focused interface',
      'What-If salary scenarios',
      'Faster results',
      'No distractions',
      'Privacy-first approach',
    ],
    bestFor: [
      'Users who want editorial content',
      'Those who trust the MSE brand',
      'General financial advice seekers',
    ],
    category: 'consumer-finance',
    targetKeywords: [
      'moneysavingexpert calculator alternative',
      'mse tax calculator alternative',
      'martin lewis calculator alternative',
    ],
  },
  {
    slug: 'which-calculator',
    name: 'Which? Tax Calculator',
    shortName: 'Which?',
    url: 'https://www.which.co.uk/money/tax/income-tax/income-tax-calculator',
    description:
      'Tax calculator from the trusted consumer rights organization Which?, known for impartial advice.',
    strengths: [
      'Trusted consumer brand',
      'Impartial guidance',
      'Quality editorial content',
      'Regular updates',
    ],
    weaknesses: [
      'Requires subscription for full access',
      'Limited calculator features',
      'No What-If comparisons',
      'Part of larger site (navigation)',
      'Basic functionality only',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'No subscription required',
      'What-If salary scenarios',
      'More calculation options',
      'Completely free access',
      'Privacy-first approach',
      'Faster, cleaner interface',
    ],
    bestFor: ['Which? subscribers', 'Consumer advice seekers', 'Those researching tax topics'],
    category: 'consumer-finance',
    targetKeywords: ['which tax calculator alternative', 'which? calculator alternative'],
  },
  {
    slug: 'reed-calculator',
    name: 'Reed Salary Calculator',
    shortName: 'Reed',
    url: 'https://www.reed.co.uk/tax-calculator',
    description:
      'Tax calculator from Reed, one of the UK largest recruitment agencies, popular with job seekers.',
    strengths: [
      'Integration with job listings',
      'Salary benchmarking data',
      'Trusted recruitment brand',
      'Clean interface',
    ],
    weaknesses: [
      'Job-seeker focused',
      'Limited advanced options',
      'No What-If comparisons',
      'Basic pension handling',
      'Less detailed breakdowns',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: true,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Detailed tax breakdowns',
      'Historic tax years',
      'Pension optimization tools',
      '100% ad-free',
      'Privacy-first design',
    ],
    bestFor: ['Job seekers', 'Salary negotiation research', 'Quick take-home estimates'],
    category: 'consumer-finance',
    targetKeywords: ['reed salary calculator alternative', 'reed tax calculator alternative'],
  },

  // ============================================================================
  // ACCOUNTING SOFTWARE
  // ============================================================================
  {
    slug: 'sage-calculator',
    name: 'Sage Payroll Calculator',
    shortName: 'Sage',
    url: 'https://www.sage.com/en-gb/payroll-calculator/',
    description:
      'Take-home pay calculator from Sage, a leading accounting and payroll software provider.',
    strengths: [
      'Trusted accounting brand',
      'Payroll expertise',
      'Regular HMRC updates',
      'Professional credibility',
    ],
    weaknesses: [
      'Limited free functionality',
      'Upsells to paid software',
      'No What-If comparisons',
      'Basic calculator only',
      'Focused on business users',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'No software upsells',
      'Individual-focused design',
      'More detailed options',
      'Historic tax years',
      'Mobile-first experience',
    ],
    bestFor: ['Sage software users', 'Business payroll checks', 'Quick professional estimates'],
    category: 'accounting-software',
    targetKeywords: ['sage payroll calculator alternative', 'sage tax calculator alternative'],
  },
  {
    slug: 'xero-calculator',
    name: 'Xero UK Tax Calculator',
    shortName: 'Xero',
    url: 'https://www.xero.com/uk/tools/payroll-calculator/',
    description:
      'Payroll calculator from Xero, a popular cloud accounting platform for small businesses.',
    strengths: [
      'Modern cloud platform',
      'Clean design',
      'Trusted by small businesses',
      'Regular updates',
    ],
    weaknesses: [
      'Primarily for Xero customers',
      'Limited standalone features',
      'No What-If comparisons',
      'Business-focused',
      'Upsells to Xero payroll',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: true,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Individual-focused',
      'No software upsells',
      'Historic tax years',
      'More detailed breakdowns',
      'Privacy-first approach',
    ],
    bestFor: ['Xero users', 'Small business owners', 'Quick payroll estimates'],
    category: 'accounting-software',
    targetKeywords: ['xero tax calculator alternative', 'xero payroll calculator alternative'],
  },
  {
    slug: 'quickbooks-calculator',
    name: 'QuickBooks Salary Calculator',
    shortName: 'QuickBooks',
    url: 'https://quickbooks.intuit.com/uk/resources/calculators/salary-calculator/',
    description: 'Take-home pay calculator from QuickBooks, part of Intuit accounting ecosystem.',
    strengths: [
      'Trusted accounting brand',
      'Part of Intuit ecosystem',
      'Regular updates',
      'Professional appearance',
    ],
    weaknesses: [
      'Upsells to QuickBooks',
      'Business-focused design',
      'Limited individual features',
      'No What-If comparisons',
      'Basic calculator only',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Student loan calculations',
      'Individual-focused design',
      'No product upsells',
      'Historic tax years',
      'Privacy-first approach',
    ],
    bestFor: ['QuickBooks users', 'Small business owners', 'Quick estimates'],
    category: 'accounting-software',
    targetKeywords: ['quickbooks calculator alternative', 'intuit tax calculator alternative'],
  },
  {
    slug: 'brightpay',
    name: 'BrightPay Tax Calculator',
    shortName: 'BrightPay',
    url: 'https://www.brightpay.co.uk/resources/free-paye-tax-calculator/',
    description: 'Free PAYE calculator from BrightPay, a UK payroll software provider.',
    strengths: [
      'Payroll-specific expertise',
      'Accurate PAYE calculations',
      'UK-focused',
      'Regular HMRC updates',
    ],
    weaknesses: [
      'Limited features',
      'Basic interface',
      'No What-If comparisons',
      'Payroll professional focus',
      'Less consumer-friendly',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: true,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Consumer-friendly design',
      'Mobile-first experience',
      'More intuitive interface',
      'Historic tax years',
      'Better UX for individuals',
    ],
    bestFor: ['Payroll professionals', 'HR departments', 'Quick PAYE checks'],
    category: 'accounting-software',
    targetKeywords: ['brightpay calculator alternative', 'brightpay tax calculator alternative'],
  },

  // ============================================================================
  // BIG FOUR & ACCOUNTING FIRMS
  // ============================================================================
  {
    slug: 'kpmg-calculator',
    name: 'KPMG Tax Calculator',
    shortName: 'KPMG',
    url: 'https://home.kpmg/uk/en/home/insights/2015/05/income-tax-calculator.html',
    description: 'Income tax calculator from KPMG, one of the Big Four accounting firms.',
    strengths: [
      'Big Four credibility',
      'Professional accuracy',
      'Trusted by businesses',
      'Authoritative source',
    ],
    weaknesses: [
      'Very basic functionality',
      'Corporate-focused',
      'No student loans',
      'Limited pension options',
      'Dated interface',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Full feature set',
      'Student loan support',
      'Pension calculations',
      'What-If scenarios',
      'Modern interface',
      'Mobile-first design',
    ],
    bestFor: ['Corporate executives', 'High earners', 'Professional estimates'],
    category: 'big-four',
    targetKeywords: ['kpmg tax calculator alternative', 'kpmg income calculator alternative'],
  },
  {
    slug: 'deloitte-calculator',
    name: 'Deloitte Tax Calculator',
    shortName: 'Deloitte',
    url: 'https://www2.deloitte.com/uk/en/pages/tax/articles/tax-calculator.html',
    description: 'Tax calculation tools from Deloitte, global professional services leader.',
    strengths: [
      'Big Four authority',
      'Professional credibility',
      'Global expertise',
      'Regular updates',
    ],
    weaknesses: [
      'Limited free tools',
      'Corporate-focused',
      'Complex navigation',
      'Basic calculator features',
      'Lead generation focused',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Student loan support',
      'No lead forms required',
      'Individual-focused',
      'Better mobile experience',
      'More detailed options',
    ],
    bestFor: ['Corporate professionals', 'High-net-worth individuals', 'Tax research'],
    category: 'big-four',
    targetKeywords: ['deloitte tax calculator alternative', 'deloitte salary calculator'],
  },
  {
    slug: 'pwc-calculator',
    name: 'PwC Tax Calculator',
    shortName: 'PwC',
    url: 'https://www.pwc.co.uk/services/tax/insights/income-tax-calculator.html',
    description:
      'Tax tools from PricewaterhouseCoopers, one of the largest professional services firms.',
    strengths: [
      'Big Four reputation',
      'Professional accuracy',
      'Trusted by executives',
      'Quality research',
    ],
    weaknesses: [
      'Very basic calculator',
      'Corporate audience',
      'Limited features',
      'Consulting-focused',
      'Dated design',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Full calculation features',
      'Student loan plans',
      'Pension options',
      'What-If scenarios',
      'Modern design',
      'Individual-focused',
    ],
    bestFor: ['Senior executives', 'Professional tax planning', 'Corporate users'],
    category: 'big-four',
    targetKeywords: ['pwc tax calculator alternative', 'pwc income calculator alternative'],
  },
  {
    slug: 'ey-calculator',
    name: 'EY Tax Calculator',
    shortName: 'EY',
    url: 'https://www.ey.com/en_uk/tax/tax-calculators',
    description: 'Tax calculation resources from Ernst & Young, global professional services firm.',
    strengths: [
      'Big Four credibility',
      'Global tax expertise',
      'Professional standards',
      'Authoritative guidance',
    ],
    weaknesses: [
      'Limited free tools',
      'Corporate-focused',
      'Consultation-driven',
      'Complex site navigation',
      'Basic functionality',
    ],
    features: {
      takeHomePay: true,
      scottishRates: false,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Scottish tax support',
      'Student loan calculations',
      'Pension options',
      'Modern, clean interface',
      'No consultation required',
    ],
    bestFor: ['Corporate tax planning', 'High earners', 'Executive estimates'],
    category: 'big-four',
    targetKeywords: ['ey tax calculator alternative', 'ernst young calculator alternative'],
  },
  {
    slug: 'rsm-calculator',
    name: 'RSM Tax Calculator',
    shortName: 'RSM',
    url: 'https://www.rsmuk.com/insights/tax-tools/income-tax-calculator',
    description: 'Income tax calculator from RSM, a leading mid-tier accounting firm in the UK.',
    strengths: [
      'Professional accuracy',
      'Mid-market expertise',
      'UK-focused firm',
      'Regular updates',
    ],
    weaknesses: [
      'Basic functionality',
      'Business client focused',
      'Limited individual features',
      'No What-If comparisons',
      'Consultation-oriented',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: true,
      whatIf: false,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'What-If salary scenarios',
      'Student loan support',
      'Individual-focused design',
      'Mobile-first experience',
      'No consultation needed',
      'More detailed options',
    ],
    bestFor: ['SME owners', 'Professional estimates', 'Business tax planning'],
    category: 'big-four',
    targetKeywords: ['rsm tax calculator alternative', 'rsm income calculator alternative'],
  },

  // ============================================================================
  // SPECIALIST CALCULATORS
  // ============================================================================
  {
    slug: 'contractor-calculator',
    name: 'ContractorCalculator',
    shortName: 'ContractorCalc',
    url: 'https://www.contractorcalculator.co.uk/',
    description:
      'Specialist calculator for UK contractors, including IR35, umbrella, and limited company comparisons.',
    strengths: [
      'Contractor-specific features',
      'IR35 calculations',
      'Umbrella vs Ltd comparison',
      'Industry expertise',
    ],
    weaknesses: [
      'Complex for employees',
      'Overwhelming options',
      'Ad placements',
      'Contractor-only focus',
      'Not for PAYE employees',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: true,
      whatIf: true,
      mobileFirst: false,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Simple PAYE calculations',
      'Clean, ad-free interface',
      'Student loan support',
      'Better for employees',
      'Faster, simpler results',
      'Privacy-first design',
    ],
    bestFor: ['IT contractors', 'Umbrella company users', 'IR35 assessments'],
    category: 'specialist',
    targetKeywords: [
      'contractor calculator alternative',
      'contractorcalculator alternative',
      'ir35 calculator alternative',
    ],
  },
  {
    slug: 'taxscouts',
    name: 'TaxScouts Calculator',
    shortName: 'TaxScouts',
    url: 'https://taxscouts.com/tax-calculators/',
    description:
      'Tax calculators from TaxScouts, an online self-assessment service for freelancers and self-employed.',
    strengths: [
      'Modern design',
      'Self-employed focus',
      'Simple interface',
      'Expert support available',
    ],
    weaknesses: [
      'Limited free features',
      'Self-assessment focused',
      'Upsells to paid service',
      'Not for PAYE employees',
      'Basic calculator only',
    ],
    features: {
      takeHomePay: true,
      scottishRates: true,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: true,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Full PAYE support',
      'Student loan calculations',
      'Pension options',
      'What-If scenarios',
      'No upsells',
      'Completely free',
    ],
    bestFor: ['Freelancers', 'Self-employed individuals', 'Self-assessment preparation'],
    category: 'specialist',
    targetKeywords: ['taxscouts calculator alternative', 'taxscouts tax calculator alternative'],
  },
  {
    slug: 'limited-company-calculator',
    name: 'Limited Company Tax Calculator',
    shortName: 'Ltd Calc',
    url: 'https://www.limitedcompanyhelp.com/limited-company-tax-calculator/',
    description:
      'Specialist calculator for limited company directors, covering dividends, salary, and corporation tax.',
    strengths: [
      'Ltd company expertise',
      'Dividend vs salary comparison',
      'Corporation tax included',
      'Director-focused',
    ],
    weaknesses: [
      'Not for employees',
      'Complex interface',
      'Limited PAYE focus',
      'Specialist only',
      'Overwhelming for simple needs',
    ],
    features: {
      takeHomePay: true,
      scottishRates: false,
      studentLoans: false,
      pension: false,
      whatIf: true,
      mobileFirst: false,
      adFree: true,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Simple PAYE focus',
      'Student loan support',
      'Scottish tax rates',
      'Pension calculations',
      'Clean interface',
      'Better for employees',
    ],
    bestFor: ['Ltd company directors', 'Dividend planning', 'Salary vs dividend decisions'],
    category: 'specialist',
    targetKeywords: [
      'limited company calculator alternative',
      'ltd company tax calculator alternative',
    ],
  },
  {
    slug: 'freelancer-calculator',
    name: 'Freelancer Tax Calculator',
    shortName: 'Freelance',
    url: 'https://www.freelancerclub.net/tax-calculator/',
    description:
      'Tax calculator designed for freelancers, focusing on self-employed income and expenses.',
    strengths: [
      'Freelancer-focused',
      'Expense deductions',
      'Self-employed friendly',
      'Community resources',
    ],
    weaknesses: [
      'Basic features',
      'Not for employees',
      'Limited PAYE support',
      'Simple estimates only',
      'Less accurate for complex scenarios',
    ],
    features: {
      takeHomePay: true,
      scottishRates: false,
      studentLoans: false,
      pension: false,
      whatIf: false,
      mobileFirst: false,
      adFree: false,
      historicYears: false,
    },
    payeTaxAdvantages: [
      'Full PAYE support',
      'Scottish tax rates',
      'Student loan calculations',
      'Pension options',
      'What-If scenarios',
      'Ad-free experience',
    ],
    bestFor: ['New freelancers', 'Self-employed estimates', 'Basic tax planning'],
    category: 'specialist',
    targetKeywords: [
      'freelancer tax calculator alternative',
      'self employed calculator alternative',
    ],
  },
];

/**
 * Feature labels for comparison tables
 */
export const FEATURE_LABELS: Record<keyof CompetitorFeatures, string> = {
  takeHomePay: 'Take-Home Pay',
  scottishRates: 'Scottish Tax Rates',
  studentLoans: 'Student Loan Plans',
  pension: 'Pension Contributions',
  whatIf: 'What-If Scenarios',
  mobileFirst: 'Mobile-First Design',
  adFree: 'Ad-Free',
  historicYears: 'Historic Tax Years',
};

/**
 * Get competitor by slug
 */
export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

/**
 * Get all competitor slugs for static generation
 */
export function getAllCompetitorSlugs(): string[] {
  return COMPETITORS.map((c) => c.slug);
}

/**
 * Get competitors by category
 */
export function getCompetitorsByCategory(category: CompetitorCategory): Competitor[] {
  return COMPETITORS.filter((c) => c.category === category);
}

/**
 * Get category info by slug
 */
export function getCompetitorCategoryInfo(
  category: CompetitorCategory,
): CompetitorCategoryInfo | undefined {
  return COMPETITOR_CATEGORIES.find((c) => c.slug === category);
}

/**
 * Get the appropriate URL for a competitor (affiliate or regular)
 * Returns affiliate URL if available, otherwise regular URL
 */
export function getCompetitorUrl(competitor: Competitor): string {
  return competitor.affiliateUrl ?? competitor.url;
}

/**
 * Check if a competitor has an affiliate program
 */
export function hasAffiliateProgram(competitor: Competitor): boolean {
  return !!competitor.affiliateUrl && !!competitor.affiliateProgram;
}

/**
 * Get competitors with affiliate programs (for revenue tracking)
 */
export function getAffiliateCompetitors(): Competitor[] {
  return COMPETITORS.filter(hasAffiliateProgram);
}
