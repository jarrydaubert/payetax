// src/components/ui/StructuredData.tsx
/**
 * Type-safe structured data component for SEO
 * Adds JSON-LD schema markup to pages using next/script
 *
 * This component improves SEO by providing search engines with structured data
 * about the website content, enabling rich snippets and enhanced search results.
 *
 * @see https://schema.org/docs/schemas.html
 * @see https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data
 */

import Script from 'next/script';
import type React from 'react';

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
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
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

interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
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

// Union type for all schema types
export type SchemaType =
  | OrganizationSchema
  | WebsiteSchema
  | SoftwareApplicationSchema
  | BreadcrumbListSchema
  | FAQPageSchema
  | ArticleSchema
  | FinancialServiceSchema
  | HowToSchema
  | PersonSchema
  | ReviewSchema
  | ServiceSchema
  | DatasetSchema;

// Base organization details
const ORG_DATA: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PayeTax',
  url: 'https://payetax.co.uk',
  logo: {
    '@type': 'ImageObject',
    url: 'https://payetax.co.uk/logo.png',
    width: 192,
    height: 192,
  },
  description: 'Free UK PAYE tax calculator and financial tools for UK taxpayers.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@payetax.co.uk',
    contactType: 'customer support',
  },
  sameAs: [],
};

// Website data
const WEBSITE_DATA: WebsiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PayeTax',
  url: 'https://payetax.co.uk',
  description:
    'Free UK PAYE tax calculator with detailed breakdowns. Calculate your take-home pay after tax, National Insurance, student loans, and pension contributions.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://payetax.co.uk/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '156',
    bestRating: '5',
    worstRating: '1',
  },
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
    url: 'https://payetax.co.uk',
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '156',
    bestRating: '5',
    worstRating: '1',
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
      text: 'Use the export options to download your calculations as Excel spreadsheet or print a professional payslip summary.',
    },
  ],
};

// Dataset schema for UK tax rates data
const DATASET_DATA: DatasetSchema = {
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
    | 'dataset';
  /** Optional custom schema data that overrides defaults */
  data?: SchemaType;
  /** Breadcrumb data for breadcrumb schema */
  breadcrumbs?: Array<{ name: string; url: string }>;
  /** FAQ data for FAQ schema */
  faqs?: FAQItem[];
  /** Article metadata for article schema */
  articleData?: {
    /** Article title */
    title: string;
    /** Article description */
    description: string;
    /** Full URL to the article */
    url: string;
    /** URL to the article's featured image */
    imageUrl: string;
    /** ISO date string for when the article was published */
    publishDate: string;
    /** ISO date string for when the article was last modified */
    modifiedDate?: string;
    /** Name of the article's author */
    authorName?: string;
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
}

/**
 * Structured Data Component
 * Adds SEO-optimized schema.org markup using next/script
 * Uses next/script to avoid dangerouslySetInnerHTML and XSS risks
 *
 * @param props - Component props with schema type and data
 * @returns Script component with JSON-LD structured data
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
}: StructuredDataProps): React.ReactNode {
  // Return null during SSR
  if (typeof window === 'undefined') return null;

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

      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: articleData.title,
        description: articleData.description,
        image: articleData.imageUrl,
        datePublished: articleData.publishDate,
        dateModified: articleData.modifiedDate || articleData.publishDate,
        author: {
          '@type': 'Person',
          name: articleData.authorName || 'PayeTax',
        },
        publisher: {
          '@type': 'Organization',
          name: 'PayeTax',
          logo: {
            '@type': 'ImageObject',
            url: 'https://payetax.co.uk/logo.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleData.url,
        },
      } as ArticleSchema;
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
          url: 'https://payetax.co.uk',
        },
        serviceType: service.serviceType,
        areaServed: service.areaServed,
      } as ServiceSchema;
      break;
    }

    case 'dataset':
      schemaData = (data as DatasetSchema) || DATASET_DATA;
      break;

    default:
      return null;
  }

  // If we couldn't build valid schema data, return null
  if (!schemaData) return null;

  // Convert schema to JSON string
  const schemaString = JSON.stringify(schemaData);

  // Generate unique ID for the script
  const scriptId = `structured-data-${type}-${Math.random().toString(36).substring(2, 9)}`;

  // Use Next.js Script component for proper script loading
  return (
    <Script id={scriptId} type='application/ld+json' strategy='afterInteractive'>
      {schemaString}
    </Script>
  );
}

export default StructuredData;
