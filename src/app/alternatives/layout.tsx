import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = 'https://payetax.co.uk';

export const metadata: Metadata = {
  title: 'UK Tax Calculator Alternatives | PayeTax',
  description:
    'Compare PayeTax with popular UK tax calculators and find the best option for your situation.',
  alternates: {
    canonical: `${SITE_URL}/alternatives`,
  },
  openGraph: {
    title: 'UK Tax Calculator Alternatives | PayeTax',
    description:
      'Compare PayeTax with popular UK tax calculators and find the best option for your situation.',
    url: `${SITE_URL}/alternatives`,
    type: 'website',
    siteName: 'PayeTax',
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'PayeTax - UK Tax Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Tax Calculator Alternatives | PayeTax',
    description:
      'Compare PayeTax with popular UK tax calculators and find the best option for your situation.',
    images: [`${SITE_URL}/images/og-image.png`],
  },
};

export default function AlternativesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
