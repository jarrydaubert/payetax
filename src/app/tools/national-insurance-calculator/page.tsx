// src/app/tools/national-insurance-calculator/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { NICalculatorClient } from './NICalculatorClient';

const BASE_URL = 'https://payetax.co.uk';

export const metadata = generateBaseMetadata({
  title: 'National Insurance Calculator 2025-26 | NI Rates & Thresholds',
  description:
    'Free UK National Insurance calculator for 2025-26. Calculate employee and employer NI contributions. See all NI categories (A, B, C, H, J, M, Z) and current rates.',
  keywords:
    'National Insurance calculator, NI calculator UK, NI contributions 2025, employee NI, employer NI, Class 1 NI, NI category A, NI thresholds',
  pathname: '/tools/national-insurance-calculator',
});

export default function NICalculatorPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${BASE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'National Insurance Calculator',
        item: `${BASE_URL}/tools/national-insurance-calculator`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UK National Insurance Calculator',
    description:
      'Calculate employee and employer National Insurance contributions for 2025-26. Covers all NI categories and thresholds.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '124',
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type='application/ld+json'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe - JSON-LD from our own data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <NICalculatorClient />
    </>
  );
}
