// src/app/privacy/page.tsx

import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/metadata';
import { PrivacyPageContent } from './PrivacyPageContent';

const OG_IMAGE = `${SITE_URL}/images/og/privacy.jpg`;

export const metadata: Metadata = {
  title: 'Privacy Policy | PayeTax - Client-Side Tax Calculations',
  description:
    'PayeTax privacy policy: All tax calculations run in your browser with zero server-side data storage. Learn how we protect your financial privacy.',
  keywords:
    'privacy policy, data privacy, client-side calculations, zero data storage, uk tax calculator privacy',
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | PayeTax',
    description: 'All tax calculations run in your browser. Zero server-side data storage.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | PayeTax',
    description: 'All tax calculations run in your browser. Zero server-side data storage.',
    images: [OG_IMAGE],
  },
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
