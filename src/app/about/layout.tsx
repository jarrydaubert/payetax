import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Note: metadataBase is set in root layout via lib/metadata.ts
// Using relative URLs here works with the base URL
export const metadata: Metadata = {
  title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
  description:
    'Free UK PAYE tax calculator with complete privacy. Client-side calculations, zero data storage, instant results using official HMRC rates for 2025-26.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
    description:
      'The UK tax calculator that respects your privacy, delivers instant accuracy, and costs nothing. No compromises.',
    url: '/about',
    type: 'website',
    siteName: 'PayeTax',
    // Must include images to prevent shallow merge from nuking parent images
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PayeTax',
    description: 'Free UK tax calculator built for privacy. No data collection, instant results.',
    // Must include images to prevent shallow merge from nuking parent images
    images: ['/images/og-image.png'],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
