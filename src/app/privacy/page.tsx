// src/app/privacy/page.tsx

import type { Metadata } from 'next';
import { PrivacyPageClient } from './PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | PayeTax - Client-Side Tax Calculations',
  description:
    'PayeTax privacy policy: All tax calculations run in your browser with zero server-side data storage. Learn how we protect your financial privacy.',
  keywords:
    'privacy policy, data privacy, client-side calculations, zero data storage, uk tax calculator privacy',
  alternates: {
    canonical: 'https://payetax.co.uk/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | PayeTax',
    description: 'All tax calculations run in your browser. Zero server-side data storage.',
    url: 'https://payetax.co.uk/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}
