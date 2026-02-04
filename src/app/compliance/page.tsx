// src/app/compliance/page.tsx

import type { Metadata } from 'next';
import { StructuredData } from '@/components/organisms/StructuredData';
import { SITE_URL } from '@/lib/metadata';
import { CompliancePageContent } from './CompliancePageContent';

const OG_IMAGE = `${SITE_URL}/images/og/compliance.jpg`;

export const metadata: Metadata = {
  title: 'HMRC Compliance & Data Sources | PayeTax',
  description:
    'PayeTax uses official HMRC tax rates verified for accuracy. Learn about our compliance standards and data sources for UK tax calculations.',
  keywords:
    'hmrc compliance, tax rate verification, official tax rates, uk tax accuracy, paye compliance, hmrc data sources',
  alternates: {
    canonical: `${SITE_URL}/compliance`,
  },
  openGraph: {
    title: 'HMRC Compliance & Data Sources | PayeTax',
    description:
      'Official HMRC tax rates and thresholds. Verified accuracy for UK tax calculations.',
    url: `${SITE_URL}/compliance`,
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HMRC Compliance & Data Sources | PayeTax',
    description:
      'Official HMRC tax rates and thresholds. Verified accuracy for UK tax calculations.',
    images: [OG_IMAGE],
  },
};

export default function CompliancePage() {
  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Compliance', url: `${SITE_URL}/compliance` },
        ]}
      />
      <CompliancePageContent />
    </>
  );
}
