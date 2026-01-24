// src/app/tools/scottish-tax-calculator/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { ScottishTaxCalculatorClient } from './ScottishTaxCalculatorClient';

export const metadata = generateBaseMetadata({
  title: 'Scottish Tax Calculator 2025-26 | Compare Scottish vs English Tax',
  description:
    'Free Scottish income tax calculator for 2025-26. Compare the 6 Scottish tax bands with English rates. See exactly how much more (or less) you pay in Scotland.',
  keywords:
    'Scottish tax calculator, Scottish income tax, Scottish tax bands 2025, Scotland vs England tax, S tax code, Scottish tax rates, higher rate tax Scotland',
  pathname: '/tools/scottish-tax-calculator',
});

export default function ScottishTaxCalculatorPage() {
  return <ScottishTaxCalculatorClient />;
}
