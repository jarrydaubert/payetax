// src/app/tools/marriage-allowance-calculator/page.tsx
import { StructuredData } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { MarriageAllowanceClient } from './MarriageAllowanceClient';

export const metadata = generateBaseMetadata({
  title: `Marriage Allowance Calculator ${CURRENT_TAX_YEAR_DISPLAY_SHORT} | Save Up to £252`,
  description: `Free Marriage Allowance calculator for ${CURRENT_TAX_YEAR_DISPLAY_SHORT}. Check if you qualify and calculate your £252 annual tax saving. Transfer 10% of your Personal Allowance to your spouse.`,
  keywords: `Marriage Allowance calculator, marriage tax allowance UK, marriage allowance ${CURRENT_TAX_YEAR_DISPLAY_SHORT}, £252 tax saving, transfer personal allowance, marriage allowance eligibility`,
  pathname: '/tools/marriage-allowance-calculator',
});

export default function MarriageAllowanceCalculatorPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Tools', url: `${SITE_URL}/tools` },
    {
      name: 'Marriage Allowance Calculator',
      url: `${SITE_URL}/tools/marriage-allowance-calculator`,
    },
  ];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Marriage Allowance Calculator',
    description: `Check eligibility and calculate your Marriage Allowance tax saving of up to £252 per year for ${CURRENT_TAX_YEAR_DISPLAY_SHORT}.`,
    url: `${SITE_URL}/tools/marriage-allowance-calculator`,
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
      <MarriageAllowanceClient />
    </>
  );
}
