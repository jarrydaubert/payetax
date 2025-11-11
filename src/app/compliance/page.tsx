// src/app/compliance/page.tsx

import type { Metadata } from 'next';
import { CompliancePageClient } from './CompliancePageClient';

export const metadata: Metadata = {
  title: 'HMRC Compliance & Data Sources | PayeTax',
  description:
    'PayeTax uses official HMRC tax rates verified for accuracy. Learn about our compliance standards and data sources for UK tax calculations.',
  keywords:
    'hmrc compliance, tax rate verification, official tax rates, uk tax accuracy, paye compliance, hmrc data sources',
  alternates: {
    canonical: 'https://payetax.co.uk/compliance',
  },
  openGraph: {
    title: 'HMRC Compliance & Data Sources | PayeTax',
    description:
      'Official HMRC tax rates and thresholds. Verified accuracy for UK tax calculations.',
    url: 'https://payetax.co.uk/compliance',
    type: 'website',
  },
};

export default function CompliancePage() {
  return <CompliancePageClient />;
}
