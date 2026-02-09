import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Note: metadataBase is set in root layout via lib/metadata.ts
// Using relative URLs here works with the base URL
export const metadata: Metadata = {
  title: 'About PayeTax | How We Build Privacy-First UK Tax Tools',
  description:
    'How PayeTax is built: privacy-first architecture, HMRC-aligned tax logic, and clear user-facing explanations for UK PAYE decisions.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About PayeTax | How We Build Privacy-First UK Tax Tools',
    description:
      'See how PayeTax approaches privacy, tax-rate accuracy, and product quality for UK PAYE calculations.',
    url: '/about',
    type: 'website',
    siteName: 'PayeTax',
    // Must include images to prevent shallow merge from nuking parent images
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PayeTax',
    description: 'How PayeTax is built for privacy, accuracy, and clear UK tax outcomes.',
    // Must include images to prevent shallow merge from nuking parent images
    images: ['/images/og-image.png'],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
