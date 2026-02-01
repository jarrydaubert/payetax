// src/app/tools/tax-code-decoder/page.tsx
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { TaxCodeDecoderClient } from './TaxCodeDecoderClient';

export const metadata = generateBaseMetadata({
  title: 'UK Tax Code Decoder | What Does My Tax Code Mean?',
  description:
    'Free UK tax code decoder. Understand what your tax code means, including 1257L, BR, D0, K codes, and Scottish/Welsh variations. Instant explanation with no signup required.',
  keywords:
    'tax code decoder, what does 1257L mean, UK tax code explained, HMRC tax code, tax code letters meaning, Scottish tax code, emergency tax code',
  pathname: '/tools/tax-code-decoder',
});

export default function TaxCodeDecoderPage() {
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
        name: 'Tax Code Decoder',
        item: `${SITE_URL}/tools/tax-code-decoder`,
      },
    ],
  };

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
      <TaxCodeDecoderClient />
    </>
  );
}
