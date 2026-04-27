// src/app/tools/tax-code-decoder/page.tsx

import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { TaxCodeDecoderClient } from './TaxCodeDecoderClient';

export const metadata = generateBaseMetadata({
  title: 'UK Tax Code Decoder | What Does My Tax Code Mean?',
  description:
    'Free UK tax code decoder. Understand what your tax code means, including 1257L, BR, D0, K codes, and Scottish/Welsh variations. Instant explanation with no signup required.',
  pathname: '/tools/tax-code-decoder',
});

export default function TaxCodeDecoderPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Tools', url: `${SITE_URL}/tools` },
    { name: 'Tax Code Decoder', url: `${SITE_URL}/tools/tax-code-decoder` },
  ];

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'UK Tax Code Decoder',
    description:
      'Free tool to decode and explain UK HMRC tax codes. Understand what your tax code means instantly.',
    url: `${SITE_URL}/tools/tax-code-decoder`,
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
      <TaxCodeDecoderClient />
    </>
  );
}
