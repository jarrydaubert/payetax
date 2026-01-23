import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'UK Tax Calculator Alternatives | PayeTax',
  description:
    'Looking for alternatives to popular UK tax calculators? Compare PayeTax with GOV.UK, MoneySavingExpert, and more. Find the best calculator for your needs.',
  keywords:
    'uk tax calculator alternative, gov.uk calculator alternative, moneysavingexpert calculator alternative, salary calculator alternative, paye calculator comparison',
  alternates: {
    canonical: 'https://payetax.co.uk/alternatives',
  },
  openGraph: {
    title: 'UK Tax Calculator Alternatives | PayeTax',
    description:
      'Compare PayeTax with other UK tax calculators. Find the best alternative for your needs.',
    url: 'https://payetax.co.uk/alternatives',
    type: 'website',
    siteName: 'PayeTax',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Tax Calculator Alternatives',
    description: 'Compare PayeTax with other UK tax calculators.',
  },
};

export default function AlternativesLayout({ children }: { children: ReactNode }) {
  return children;
}
