// src/app/tools/scottish-tax-calculator/page.tsx
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { ScottishTaxCalculatorClient } from './ScottishTaxCalculatorClient';

export const metadata = generateBaseMetadata({
  title: 'Scottish Tax Calculator 2025-26 | Compare Scottish vs English Tax',
  description:
    'Free Scottish income tax calculator for 2025-26. Compare the 6 Scottish tax bands with English rates. See how much more (or less) you pay in Scotland.',
  keywords:
    'Scottish tax calculator, Scottish income tax, Scottish tax bands 2025, Scotland vs England tax, S tax code, Scottish tax rates, higher rate tax Scotland',
  pathname: '/tools/scottish-tax-calculator',
});

export default function ScottishTaxCalculatorPage() {
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
        name: 'Scottish Tax Calculator',
        item: `${SITE_URL}/tools/scottish-tax-calculator`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Scottish Tax Calculator',
    description:
      'Compare Scottish income tax with English rates for 2025-26. See the 6 Scottish tax bands and calculate the difference.',
    url: `${SITE_URL}/tools/scottish-tax-calculator`,
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
      <ScottishTaxCalculatorClient />
    </>
  );
}
