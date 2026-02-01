// src/components/organisms/StructuredData.tsx
/**
 * Type-safe structured data component for SEO
 * Adds JSON-LD schema markup to pages for search engines and AI crawlers
 *
 * IMPORTANT: Uses a regular <script> tag (not next/script) to ensure
 * structured data is present in the initial HTML for crawlers.
 *
 * @see https://schema.org/docs/schemas.html
 * @see https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data
 */

import type React from 'react';
import { TAX_RATES } from '@/constants/taxRates';
import { LOGO_URL, SITE_URL } from '@/lib/metadata';

/**
 * Format a number as GBP currency string for schema data
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "£12,570")
 */
function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}

// Define typed interfaces for each schema type
interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
    width: number;
    height: number;
  };
  description?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    email: string;
    contactType: string;
  };
  sameAs?: string[];
}

interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
}

interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  description?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    ratingCount: string;
    bestRating?: string;
    worstRating?: string;
  };
}

interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

/**
 * BlogPosting schema for blog articles
 * Note: Using BlogPosting instead of generic Article per Google's recommendation
 * articleBody intentionally omitted - bloats HTML and not needed for rich results
 */
interface BlogPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
      width?: number;
      height?: number;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  wordCount?: number;
  inLanguage?: string;
  articleSection?: string;
  isPartOf?: {
    '@type': 'Blog';
    name: string;
    url: string;
  };
}

interface FinancialServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'FinancialService';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  serviceType: string;
  areaServed: string | string[];
  hasOfferCatalog: {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Array<{
      '@type': 'Offer';
      itemOffered: {
        '@type': 'Service';
        name: string;
        description: string;
      };
      price: string;
      priceCurrency: string;
    }>;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    ratingCount: string;
    bestRating: string;
    worstRating: string;
  };
}

interface HowToSchema {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description: string;
  image?: string[];
  totalTime?: string;
  estimatedCost?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: string;
  };
  step: Array<{
    '@type': 'HowToStep';
    name: string;
    text: string;
    image?: string;
  }>;
}

interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  hasCredential?: Array<{
    '@type': 'EducationalOccupationalCredential';
    credentialCategory: string;
    recognizedBy: {
      '@type': 'Organization';
      name: string;
    };
  }>;
  knowsAbout?: string[];
  alumniOf?: Array<{
    '@type': 'Organization';
    name: string;
  }>;
}

interface ReviewSchema {
  '@context': 'https://schema.org';
  '@type': 'Review';
  itemReviewed: {
    '@type': 'SoftwareApplication';
    name: string;
  };
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewBody: string;
  datePublished: string;
}

interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  serviceType: string;
  areaServed: string | string[];
  hasOfferCatalog?: {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Array<{
      '@type': 'Offer';
      itemOffered: string;
      price: string;
      priceCurrency: string;
    }>;
  };
}

interface DatasetSchema {
  '@context': 'https://schema.org';
  '@type': 'Dataset';
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  license: string;
  creator: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  keywords: string[];
  includedInDataCatalog: {
    '@type': 'DataCatalog';
    name: string;
    description: string;
  };
  variableMeasured: Array<{
    '@type': 'PropertyValue';
    name: string;
    value: string;
    description: string;
  }>;
  distribution?: Array<{
    '@type': 'DataDownload';
    encodingFormat: string;
    contentUrl: string;
    description: string;
  }>;
  temporalCoverage?: string;
  spatialCoverage?: {
    '@type': 'Place';
    name: string;
    geo: {
      '@type': 'GeoShape';
      addressCountry: string;
    };
  };
}

/**
 * Salary Calculation schema - custom schema for programmatic salary pages
 * Uses MonetaryAmount and FinancialProduct patterns from schema.org
 */
interface SalaryCalculationSchema {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'FinancialProduct';
    name: string;
    description: string;
    provider: {
      '@type': 'Organization';
      name: string;
      url: string;
    };
    areaServed: string;
  };
  about: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: number;
    name: string;
  };
  mentions: Array<{
    '@type': 'MonetaryAmount';
    currency: string;
    value: number;
    name: string;
  }>;
}

// Union type for all schema types
export type SchemaType =
  | OrganizationSchema
  | WebsiteSchema
  | SoftwareApplicationSchema
  | BreadcrumbListSchema
  | FAQPageSchema
  | BlogPostingSchema
  | FinancialServiceSchema
  | HowToSchema
  | PersonSchema
  | ReviewSchema
  | ServiceSchema
  | DatasetSchema
  | SalaryCalculationSchema;

// Base organization details
const ORG_DATA: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PayeTax',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 192,
    height: 192,
  },
  description: 'Free UK PAYE tax calculator and financial tools for UK taxpayers.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@payetax.co.uk',
    contactType: 'customer support',
  },
  sameAs: ['https://twitter.com/PayeTaxUK'],
};

// Website data
const WEBSITE_DATA: WebsiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PayeTax',
  url: SITE_URL,
  description:
    'Free UK PAYE tax calculator with detailed breakdowns. Calculate your take-home pay after tax, National Insurance, student loans, and pension contributions.',
  // Note: SearchAction removed - /search route not implemented
};

// Software application data for the tax calculator
const CALCULATOR_DATA: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'UK PAYE Tax Calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
  },
  description:
    'Free UK PAYE tax calculator with detailed breakdowns. Calculate your take-home pay after tax, National Insurance, student loans, and pension contributions.',
};

// Financial service data for enhanced AI discovery
const FINANCIAL_SERVICE_DATA: FinancialServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'PayeTax UK Tax Calculator',
  description:
    'Free UK PAYE tax calculator with official HMRC rates for 2025-2026. Calculate income tax, National Insurance, student loan repayments, and pension contributions instantly.',
  provider: {
    '@type': 'Organization',
    name: 'PayeTax',
    url: SITE_URL,
  },
  serviceType: 'Tax Calculation Service',
  areaServed: ['United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'UK Tax Calculation Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'UK PAYE Tax Calculator',
          description: 'Calculate UK income tax, National Insurance, and take-home pay',
        },
        price: '0',
        priceCurrency: 'GBP',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Student Loan Calculator',
          description: 'Calculate student loan repayments for all UK plan types',
        },
        price: '0',
        priceCurrency: 'GBP',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pension Calculator',
          description: 'Calculate pension contributions and tax relief benefits',
        },
        price: '0',
        priceCurrency: 'GBP',
      },
    ],
  },
};

// HowTo schema for calculator usage
const HOW_TO_DATA: HowToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Your UK Take-Home Pay',
  description:
    'Step-by-step guide to calculate your UK take-home pay after tax, National Insurance, student loans, and pension contributions using our free PAYE calculator.',
  totalTime: 'PT2M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'GBP',
    value: '0',
  },
  step: [
    {
      '@type': 'HowToStep',
      name: 'Enter Your Annual Salary',
      text: 'Input your gross annual salary or hourly wage in the salary field. The calculator accepts any amount from £0 to £10 million.',
    },
    {
      '@type': 'HowToStep',
      name: 'Select Tax Year',
      text: 'Choose the appropriate tax year (2024-2025 or 2025-2026). Each tax year has different rates and thresholds.',
    },
    {
      '@type': 'HowToStep',
      name: 'Configure Tax Details',
      text: 'Enter your tax code (default 1257L), select if you pay Scottish tax rates, and choose your student loan plan if applicable.',
    },
    {
      '@type': 'HowToStep',
      name: 'Add Pension Contributions',
      text: 'Enter your pension contributions as either a percentage or fixed amount. Choose between salary sacrifice or relief at source.',
    },
    {
      '@type': 'HowToStep',
      name: 'Calculate Results',
      text: 'Click Calculate Tax to see your detailed breakdown including income tax, National Insurance, student loans, and net take-home pay across different periods.',
    },
    {
      '@type': 'HowToStep',
      name: 'Export or Print Results',
      text: 'Use the export options to download your calculations as CSV file or print a professional payslip summary.',
    },
  ],
};

/**
 * Generate Dataset schema with dynamic tax values from TAX_RATES
 * This ensures all tax values come from the single source of truth
 *
 * WARNING: Only use this schema if you have a real, publicly accessible dataset.
 * The distribution endpoint must exist and return the described data.
 *
 * TODO: Create /api/tax-rates endpoint before enabling distribution field
 */
function generateDatasetData(): DatasetSchema {
  const rates = TAX_RATES['2025-2026'];
  const niRates = rates.nationalInsurance.employee.A;
  const basicBand = rates.bands[0];
  const higherBand = rates.bands[1];
  const additionalBand = rates.bands[2];

  // Calculate thresholds for descriptions
  const basicRateMax = rates.personalAllowance + (basicBand?.threshold ?? 0);
  const higherRateMax = rates.personalAllowance + (higherBand?.threshold ?? 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'UK Tax Rates Dataset 2025-26',
    description:
      'Official HMRC tax bands, National Insurance rates, and salary calculation examples for England, Wales, Scotland, and Northern Ireland for the 2025-26 tax year',
    url: SITE_URL,
    // Note: Omitting datePublished/dateModified to avoid stale hardcoded values
    // Add these back when we have a versioning system for tax data
    datePublished: '2025-04-06', // Tax year start
    dateModified: '2025-04-06', // Update when rates change
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: {
      '@type': 'Organization',
      name: 'PayeTax',
      url: SITE_URL,
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
        value: formatCurrency(rates.personalAllowance),
        description: 'Tax-free income threshold for 2025-26',
      },
      {
        '@type': 'PropertyValue',
        name: 'Basic Rate Tax',
        value: `${basicBand?.rate ?? 20}%`,
        description: `Tax on income between ${formatCurrency(rates.personalAllowance + 1)} and ${formatCurrency(basicRateMax)}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Higher Rate Tax',
        value: `${higherBand?.rate ?? 40}%`,
        description: `Tax on income between ${formatCurrency(basicRateMax + 1)} and ${formatCurrency(higherRateMax)}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'Additional Rate Tax',
        value: `${additionalBand?.rate ?? 45}%`,
        description: `Tax on income above ${formatCurrency(higherRateMax)}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'National Insurance (Standard)',
        value: `${niRates.primary.rate}%`,
        description: `NI on income between ${formatCurrency(niRates.primary.threshold + 1)} and ${formatCurrency(niRates.upper.threshold)}`,
      },
      {
        '@type': 'PropertyValue',
        name: 'National Insurance (Higher)',
        value: `${niRates.upper.rate}%`,
        description: `NI on income above ${formatCurrency(niRates.upper.threshold)}`,
      },
    ],
    // IMPORTANT: distribution removed - /api/tax-rates endpoint does not exist
    // Re-add when endpoint is implemented to avoid schema spam
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
}

/**
 * Interface for FAQ item structure
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Props interface for StructuredData component
 */
export interface StructuredDataProps {
  /** Type of structured data to generate */
  type:
    | 'organization'
    | 'website'
    | 'calculator'
    | 'breadcrumb'
    | 'faq'
    | 'article'
    | 'financialservice'
    | 'howto'
    | 'person'
    | 'review'
    | 'service'
    | 'dataset'
    | 'salarycalculation';
  /** Optional custom schema data that overrides defaults */
  data?: SchemaType;
  /** Breadcrumb data for breadcrumb schema */
  breadcrumbs?: Array<{ name: string; url: string }>;
  /** FAQ data for FAQ schema */
  faqs?: FAQItem[];
  /** Article metadata for BlogPosting schema */
  articleData?: {
    /** Article title */
    title: string;
    /** Article description */
    description: string;
    /** Full URL to the article (must be absolute) */
    url: string;
    /** URL to the article's featured image (must be absolute) */
    imageUrl: string;
    /** ISO 8601 date string for when the article was published */
    publishDate: string;
    /** ISO 8601 date string for when the article was last modified */
    modifiedDate?: string;
    /** Name of the article's author (use "PayeTax Editorial Team" for org author) */
    authorName?: string;
    /** Word count of the article */
    wordCount?: number;
    /** Article section/category */
    articleSection?: string;
    // Note: articleBody intentionally omitted - bloats HTML, not needed for rich results
  };
  /** Expert person data */
  expert?: {
    name: string;
    jobTitle: string;
    description: string;
    organization?: string;
    credentials?: Array<{
      name: string;
      issuedBy: string;
    }>;
    expertise?: string[];
  };
  /** Review data */
  review?: {
    rating: number;
    author: string;
    content: string;
    datePublished: string;
  };
  /** Service data */
  service?: {
    name: string;
    description: string;
    serviceType: string;
    areaServed: string[];
  };
  /** Salary calculation data for programmatic salary pages */
  salaryData?: {
    salary: number;
    netPay: number;
    incomeTax: number;
    nationalInsurance: number;
    url: string;
  };
}

/**
 * Structured Data Component
 * Adds SEO-optimized schema.org markup for search engines and AI crawlers
 *
 * Uses a regular <script> tag to ensure structured data is in the initial HTML.
 * This is critical for SEO - crawlers need to see this data server-side.
 *
 * @param props - Component props with schema type and data
 * @returns Script element with JSON-LD structured data
 */
export function StructuredData({
  type,
  data,
  breadcrumbs,
  faqs,
  articleData,
  expert,
  review,
  service,
  salaryData,
}: StructuredDataProps): React.ReactNode {
  // Determine the data to include based on the type
  let schemaData: SchemaType | null = null;

  switch (type) {
    case 'organization':
      schemaData = (data as OrganizationSchema) || ORG_DATA;
      break;

    case 'website':
      schemaData = (data as WebsiteSchema) || WEBSITE_DATA;
      break;

    case 'calculator':
      schemaData = (data as SoftwareApplicationSchema) || CALCULATOR_DATA;
      break;

    case 'breadcrumb': {
      if (!breadcrumbs?.length) return null;

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      } as BreadcrumbListSchema;
      break;
    }

    case 'faq': {
      if (!faqs?.length) return null;

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      } as FAQPageSchema;
      break;
    }

    case 'article': {
      if (!articleData) return null;

      // Use BlogPosting for better SEO (more specific than generic Article)
      // Note: articleBody intentionally omitted - bloats HTML, not needed for rich results
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: articleData.title,
        description: articleData.description,
        image: articleData.imageUrl,
        datePublished: articleData.publishDate,
        dateModified: articleData.modifiedDate || articleData.publishDate,
        author: {
          // Use Organization for editorial team, Person for named authors
          '@type': articleData.authorName === 'PayeTax Editorial Team' ? 'Organization' : 'Person',
          name: articleData.authorName || 'PayeTax',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'PayeTax',
          logo: {
            '@type': 'ImageObject',
            url: LOGO_URL,
            width: 192,
            height: 192,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleData.url,
        },
        inLanguage: 'en-GB',
        isPartOf: {
          '@type': 'Blog',
          name: 'PayeTax Blog',
          url: `${SITE_URL}/blog`,
        },
        ...(articleData.wordCount && { wordCount: articleData.wordCount }),
        ...(articleData.articleSection && { articleSection: articleData.articleSection }),
      } as BlogPostingSchema;
      break;
    }

    case 'financialservice':
      schemaData = (data as FinancialServiceSchema) || FINANCIAL_SERVICE_DATA;
      break;

    case 'howto':
      schemaData = (data as HowToSchema) || HOW_TO_DATA;
      break;

    case 'person': {
      if (!expert) return null;

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: expert.name,
        jobTitle: expert.jobTitle,
        description: expert.description,
        ...(expert.organization && {
          worksFor: {
            '@type': 'Organization',
            name: expert.organization,
          },
        }),
        ...(expert.credentials && {
          hasCredential: expert.credentials.map((cred) => ({
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: cred.name,
            recognizedBy: {
              '@type': 'Organization',
              name: cred.issuedBy,
            },
          })),
        }),
        ...(expert.expertise && {
          knowsAbout: expert.expertise,
        }),
      } as PersonSchema;
      break;
    }

    case 'review': {
      if (!review) return null;

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
          '@type': 'SoftwareApplication',
          name: 'PayeTax UK Tax Calculator',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          '@type': 'Person',
          name: review.author,
        },
        reviewBody: review.content,
        datePublished: review.datePublished,
      } as ReviewSchema;
      break;
    }

    case 'service': {
      if (!service) return null;

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'Organization',
          name: 'PayeTax',
          url: SITE_URL,
        },
        serviceType: service.serviceType,
        areaServed: service.areaServed,
      } as ServiceSchema;
      break;
    }

    case 'dataset':
      schemaData = (data as DatasetSchema) || generateDatasetData();
      break;

    case 'salarycalculation': {
      if (!salaryData) return null;

      const formattedSalary = salaryData.salary.toLocaleString('en-GB');

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `£${formattedSalary} After Tax UK 2025-26`,
        description: `Calculate take-home pay from a £${formattedSalary} salary in the UK. Income tax: £${salaryData.incomeTax.toLocaleString('en-GB')}, NI: £${salaryData.nationalInsurance.toLocaleString('en-GB')}, Net pay: £${salaryData.netPay.toLocaleString('en-GB')} per year.`,
        url: salaryData.url,
        mainEntity: {
          '@type': 'FinancialProduct',
          name: 'UK PAYE Tax Calculator',
          description: `Tax calculation for £${formattedSalary} annual salary`,
          provider: {
            '@type': 'Organization',
            name: 'PayeTax',
            url: SITE_URL,
          },
          areaServed: 'United Kingdom',
        },
        about: {
          '@type': 'MonetaryAmount',
          currency: 'GBP',
          value: salaryData.salary,
          name: 'Gross Annual Salary',
        },
        mentions: [
          {
            '@type': 'MonetaryAmount',
            currency: 'GBP',
            value: salaryData.netPay,
            name: 'Annual Take-Home Pay',
          },
          {
            '@type': 'MonetaryAmount',
            currency: 'GBP',
            value: salaryData.incomeTax,
            name: 'Annual Income Tax',
          },
          {
            '@type': 'MonetaryAmount',
            currency: 'GBP',
            value: salaryData.nationalInsurance,
            name: 'Annual National Insurance',
          },
        ],
      } as SalaryCalculationSchema;
      break;
    }

    default:
      return null;
  }

  // If we couldn't build valid schema data, return null
  if (!schemaData) return null;

  // Escape </script> to prevent XSS if content-managed fields contain it
  // This is standard practice for JSON-LD even when we "control" the data
  const safeJson = JSON.stringify(schemaData).replace(/<\/script/gi, '<\\/script');

  // Render as regular script tag for SSR (critical for SEO)
  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON escaped, we control schema data
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

export default StructuredData;
