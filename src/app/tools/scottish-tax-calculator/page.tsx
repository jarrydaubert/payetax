// src/app/tools/scottish-tax-calculator/page.tsx
import { StructuredData } from '@/components/organisms/StructuredData';
import { CURRENT_TAX_YEAR_DISPLAY_SHORT } from '@/constants/freshness';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { CURRENT_TAX_YEAR, SCOTTISH_TAX_RATES } from '@/lib/tax';
import { ScottishTaxCalculatorClient } from './ScottishTaxCalculatorClient';

const currentScottishBandCount = SCOTTISH_TAX_RATES[CURRENT_TAX_YEAR].bands.length;

export const metadata = generateBaseMetadata({
  title: `Scottish Tax Calculator ${CURRENT_TAX_YEAR_DISPLAY_SHORT} | Compare Scottish vs English Tax`,
  description: `Free Scottish income tax calculator for ${CURRENT_TAX_YEAR_DISPLAY_SHORT}. Compare the ${currentScottishBandCount} Scottish tax bands with English rates. See how much more (or less) annual Income Tax you pay in Scotland.`,
  pathname: '/tools/scottish-tax-calculator',
});

export default function ScottishTaxCalculatorPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Tools', url: `${SITE_URL}/tools` },
    { name: 'Scottish Tax Calculator', url: `${SITE_URL}/tools/scottish-tax-calculator` },
  ];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Scottish Tax Calculator',
    description: `Compare annual Scottish Income Tax with English rates for ${CURRENT_TAX_YEAR_DISPLAY_SHORT}. See the ${currentScottishBandCount} Scottish tax bands and calculate the difference.`,
    url: `${SITE_URL}/tools/scottish-tax-calculator`,
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
      <ScottishTaxCalculatorClient />
    </>
  );
}
