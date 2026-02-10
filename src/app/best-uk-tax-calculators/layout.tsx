import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/metadata';

const OG_IMAGE = `${SITE_URL}/best-uk-tax-calculators/opengraph-image`;

export const metadata: Metadata = {
  title: 'Best UK Tax Calculators 2026 | Compare Top PAYE Calculators',
  description:
    'Compare the best UK tax calculators for 2026. Honest reviews of PayeTax, GOV.UK, MoneySavingExpert, and The Salary Calculator. Find the right tool for your needs.',
  keywords:
    'best uk tax calculator, uk tax calculator comparison, paye calculator 2026, take home pay calculator uk, salary calculator uk, tax calculator reviews',
  alternates: {
    canonical: `${SITE_URL}/best-uk-tax-calculators`,
  },
  openGraph: {
    title: 'Best UK Tax Calculators 2026 | Compare Top PAYE Calculators',
    description:
      'Compare the best UK tax calculators for 2026. Honest reviews and feature comparisons to help you find the right tool.',
    url: `${SITE_URL}/best-uk-tax-calculators`,
    type: 'article',
    siteName: 'PayeTax',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best UK Tax Calculators 2026',
    description: 'Compare the top UK tax calculators. Honest reviews and feature comparisons.',
    images: [OG_IMAGE],
  },
};

export default function BestCalculatorsLayout({ children }: { children: ReactNode }) {
  return children;
}
