// src/app/tools/marriage-allowance-calculator/page.tsx
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { MarriageAllowanceClient } from './MarriageAllowanceClient';

export const metadata = generateBaseMetadata({
  title: 'Marriage Allowance Calculator 2025-26 | Save Up to £252',
  description:
    'Free Marriage Allowance calculator for 2025-26. Check if you qualify and calculate your £252 annual tax saving. Transfer 10% of your Personal Allowance to your spouse.',
  keywords:
    'Marriage Allowance calculator, marriage tax allowance UK, marriage allowance 2025, £252 tax saving, transfer personal allowance, marriage allowance eligibility',
  pathname: '/tools/marriage-allowance-calculator',
});

export default function MarriageAllowanceCalculatorPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Marriage Allowance Calculator',
        item: `${SITE_URL}/tools/marriage-allowance-calculator`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Marriage Allowance Calculator',
    description:
      'Check eligibility and calculate your Marriage Allowance tax saving of up to £252 per year for 2025-26.',
    url: `${SITE_URL}/tools/marriage-allowance-calculator`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    // Note: aggregateRating removed - only add when backed by real, verifiable reviews
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
      <MarriageAllowanceClient />
    </>
  );
}
