// src/app/privacy/page.tsx

import type { Metadata } from 'next';
import { StructuredData } from '@/components/organisms/StructuredData';
import { SITE_URL } from '@/lib/metadata';
import { PrivacyPageContent } from './PrivacyPageContent';

const OG_IMAGE = `${SITE_URL}/images/og-image.png`;

export const metadata: Metadata = {
  title: 'Privacy Policy | PayeTax - Privacy-First Tax Calculations',
  description:
    "PayeTax privacy policy: Interactive calculations run in your browser and tax inputs aren't stored. Learn how we protect your financial privacy.",
  keywords:
    'privacy policy, data privacy, in-browser calculations, no stored salary data, uk tax calculator privacy',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | PayeTax',
    description: "Interactive calculations run in your browser and tax inputs aren't stored.",
    url: `${SITE_URL}/privacy`,
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | PayeTax',
    description: "Interactive calculations run in your browser and tax inputs aren't stored.",
    images: [OG_IMAGE],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Privacy', url: `${SITE_URL}/privacy` },
        ]}
      />
      <PrivacyPageContent />
    </>
  );
}
