// src/app/tools/scottish-tax-calculator/page.tsx
import type { Metadata } from 'next';
import { ScottishTaxCalculatorClient } from './ScottishTaxCalculatorClient';

export const metadata: Metadata = {
  title: 'Scottish Tax Calculator 2025-26 | Compare Scottish vs English Tax - PayeTax',
  description:
    'Free Scottish income tax calculator for 2025-26. Compare the 6 Scottish tax bands with English rates. See exactly how much more (or less) you pay in Scotland.',
  keywords:
    'Scottish tax calculator, Scottish income tax, Scottish tax bands 2025, Scotland vs England tax, S tax code, Scottish tax rates, higher rate tax Scotland',
  openGraph: {
    title: 'Scottish Tax Calculator 2025-26 | Compare Rates',
    description:
      'Calculate your Scottish income tax and compare with English rates. See the real difference in take-home pay.',
    url: 'https://payetax.co.uk/tools/scottish-tax-calculator',
    type: 'website',
  },
};

export default function ScottishTaxCalculatorPage() {
  return <ScottishTaxCalculatorClient />;
}
