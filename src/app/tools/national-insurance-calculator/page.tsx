// src/app/tools/national-insurance-calculator/page.tsx
import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { NICalculatorClient } from './NICalculatorClient';

export const metadata = generateBaseMetadata({
  title: 'National Insurance Calculator 2025-26 | NI Rates & Thresholds',
  description:
    'Free UK National Insurance calculator for 2025-26. Calculate employee and employer NI contributions. See all NI categories (A, B, C, H, J, M, Z) and current rates.',
  keywords:
    'National Insurance calculator, NI calculator UK, NI contributions 2025, employee NI, employer NI, Class 1 NI, NI category A, NI thresholds',
  pathname: '/tools/national-insurance-calculator',
});

export default function NICalculatorPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Tools', url: `${SITE_URL}/tools` },
    {
      name: 'National Insurance Calculator',
      url: `${SITE_URL}/tools/national-insurance-calculator`,
    },
  ];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UK National Insurance Calculator',
    description:
      'Calculate employee and employer National Insurance contributions for 2025-26. Covers all NI categories and thresholds.',
    url: `${SITE_URL}/tools/national-insurance-calculator`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
    },
    // Note: aggregateRating removed - only add when backed by real, verifiable reviews
  } as const;

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='calculator' data={softwareSchema} />
      <StructuredData type='dataset' />
      <NICalculatorClient />
    </>
  );
}
