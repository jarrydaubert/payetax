// src/components/seo/CalculatorSchema.tsx

/**
 * Structured data (JSON-LD) for PayeTax calculator
 * Optimized for Answer Engine Optimization (AEO) and AI search
 */

export function CalculatorSchema() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PayeTax - UK PAYE Tax Calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '234',
    },
    description:
      'Free HMRC-compliant PAYE calculator for UK tax 2025-26. Calculate income tax, National Insurance, student loans, and take-home pay instantly with official government rates.',
    url: 'https://payetax.co.uk',
    applicationSubCategory: 'Tax Calculator',
    featureList: [
      'HMRC-compliant tax calculations for 2025-26',
      'Real-time salary calculations',
      'Scottish tax rate support',
      'Student loan repayment calculations (all plans)',
      'Pension contribution tax relief',
      'National Insurance calculations',
      'Export results to CSV and PDF',
      'Multiple pay period support (annual, monthly, weekly)',
    ],
    screenshot: 'https://payetax.co.uk/images/calculator-screenshot.png',
    softwareVersion: '1.0',
    datePublished: '2025-01-01',
    dateModified: '2025-10-02',
    author: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: 'https://payetax.co.uk',
    },
  };

  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static JSON-LD structured data for SEO
      dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
    />
  );
}

export function FAQSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much tax do I pay on £30,000 in UK 2025?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On a £30,000 salary in England/Wales/NI for 2025-26, you pay £3,486 income tax (20% on £17,430 taxable income after £12,570 personal allowance) and £2,620 National Insurance (12% on £17,430). Total deductions: £6,106. Take-home pay: £23,894 annually or £1,991 per month.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the UK personal allowance for 2025-26?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The UK personal allowance for 2025-26 is £12,570. This is the amount you can earn tax-free each year. The allowance reduces by £1 for every £2 earned over £100,000 and is completely lost at £125,140+. Scottish rates have the same allowance but different tax bands.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is PAYE tax calculated in the UK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PAYE tax is calculated by: 1) Deducting personal allowance (£12,570) from gross salary to get taxable income, 2) Applying tax bands: 20% on £12,571-£50,270, 40% on £50,271-£125,140, 45% on £125,140+, 3) Adding National Insurance: 12% on £12,571-£50,270, 2% above, 4) Deducting pension contributions and student loan repayments if applicable. Your employer calculates this monthly and reports to HMRC.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between Scottish and English tax rates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scotland has different income tax bands but the same National Insurance and personal allowance (£12,570). Scotland has 5 tax bands (19%, 20%, 21%, 42%, 47%) while England/Wales/NI has 3 (20%, 40%, 45%). Scottish taxpayers generally pay more tax on salaries above £28,000, with the difference increasing significantly above £50,000.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do student loan repayments work with PAYE?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Student loan repayments are deducted automatically through PAYE if you earn above the threshold: Plan 1 at £24,990 (9%), Plan 2 at £27,295 (9%), Plan 4 Scotland at £31,395 (9%), Plan 5 at £25,000 (9%), and Postgraduate at £21,000 (6%). You can have multiple plans and repay to each simultaneously.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does pension tax relief work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pension contributions are deducted before tax is calculated, reducing your taxable income and providing automatic tax relief. For example, on a £50,000 salary with 5% pension (£2,500), you save £500 in tax (20% rate) or £1,000 at higher rate (40%), making the net cost £2,000 or £1,500 respectively.',
        },
      },
    ],
  };

  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static JSON-LD structured data for SEO
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

export function HowToSchema() {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Your UK Take-Home Pay with PayeTax',
    description:
      'Step-by-step guide to calculating your UK PAYE tax and take-home pay for 2025-26 using the PayeTax calculator',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: '0',
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'PayeTax Calculator',
        url: 'https://payetax.co.uk',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter your salary',
        text: 'Input your gross annual, monthly, or weekly salary into the calculator. The calculator automatically formats numbers with commas for easy reading.',
        url: 'https://payetax.co.uk#calculator',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Select tax year and region',
        text: 'Choose the tax year (2025-26 for current rates) and your region (England, Scotland, Wales, or Northern Ireland). Scottish rates differ from the rest of the UK.',
        url: 'https://payetax.co.uk#calculator',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Add optional deductions',
        text: 'Include pension contributions, student loan plans, and other deductions for accurate results. Leave blank if not applicable to you.',
        url: 'https://payetax.co.uk#calculator',
        position: 3,
      },
      {
        '@type': 'HowToStep',
        name: 'View and export results',
        text: 'See your breakdown by income tax, National Insurance, and take-home pay across multiple periods (annual, monthly, weekly). Export to CSV or print for your records.',
        url: 'https://payetax.co.uk#calculator',
        position: 4,
      },
    ],
  };

  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static JSON-LD structured data for SEO
      dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
    />
  );
}

export function DatasetSchema() {
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'UK Tax Rates Dataset 2025-26',
    description:
      'Official HMRC tax bands, National Insurance rates, and salary calculation examples for England, Wales, Scotland, and Northern Ireland for the 2025-26 tax year',
    url: 'https://payetax.co.uk',
    datePublished: '2025-01-01',
    dateModified: '2025-10-03',
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: 'https://payetax.co.uk',
    },
    keywords: [
      'UK tax rates 2025',
      'PAYE calculator',
      'National Insurance rates',
      'HMRC tax bands',
      'income tax calculator',
      'salary calculator UK',
    ],
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      name: 'PayeTax Tax Data',
      description: 'UK tax calculation data and examples',
    },
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Personal Allowance',
        value: '£12,570',
        description: 'Tax-free income threshold for 2025-26',
      },
      {
        '@type': 'PropertyValue',
        name: 'Basic Rate Tax',
        value: '20%',
        description: 'Tax on income between £12,571 and £50,270',
      },
      {
        '@type': 'PropertyValue',
        name: 'Higher Rate Tax',
        value: '40%',
        description: 'Tax on income between £50,271 and £125,140',
      },
      {
        '@type': 'PropertyValue',
        name: 'Additional Rate Tax',
        value: '45%',
        description: 'Tax on income above £125,140',
      },
      {
        '@type': 'PropertyValue',
        name: 'National Insurance (Standard)',
        value: '12%',
        description: 'NI on income between £12,571 and £50,270',
      },
      {
        '@type': 'PropertyValue',
        name: 'National Insurance (Higher)',
        value: '2%',
        description: 'NI on income above £50,270',
      },
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://payetax.co.uk/api/tax-rates',
        description: 'Tax rates and calculation data in JSON format',
      },
    ],
    temporalCoverage: '2025-04-06/2026-04-05',
    spatialCoverage: {
      '@type': 'Place',
      name: 'United Kingdom',
      geo: {
        '@type': 'GeoShape',
        addressCountry: 'GB',
      },
    },
  };

  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static JSON-LD structured data for AEO
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
    />
  );
}
