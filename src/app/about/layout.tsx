import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
  description:
    'Free UK PAYE tax calculator with complete privacy. Client-side calculations, zero data storage, instant results using official HMRC rates for 2025-26.',
  keywords:
    'about payetax, uk tax calculator, privacy-first tax calculator, free paye calculator, open source tax tool, hmrc rates calculator',
  alternates: {
    canonical: 'https://payetax.co.uk/about',
  },
  openGraph: {
    title: 'About PayeTax | Free UK Tax Calculator Built for Privacy',
    description:
      'The UK tax calculator that respects your privacy, delivers instant accuracy, and costs nothing. No compromises.',
    url: 'https://payetax.co.uk/about',
    type: 'website',
    siteName: 'PayeTax',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About PayeTax',
    description: 'Free UK tax calculator built for privacy. No data collection, instant results.',
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
