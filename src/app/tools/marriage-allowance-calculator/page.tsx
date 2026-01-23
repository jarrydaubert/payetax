// src/app/tools/marriage-allowance-calculator/page.tsx
import type { Metadata } from 'next';
import { MarriageAllowanceClient } from './MarriageAllowanceClient';

export const metadata: Metadata = {
  title: 'Marriage Allowance Calculator 2025-26 | Save Up to £252 - PayeTax',
  description:
    'Free Marriage Allowance calculator for 2025-26. Check if you qualify and calculate your £252 annual tax saving. Transfer 10% of your Personal Allowance to your spouse.',
  keywords:
    'Marriage Allowance calculator, marriage tax allowance UK, marriage allowance 2025, £252 tax saving, transfer personal allowance, marriage allowance eligibility',
  openGraph: {
    title: 'Marriage Allowance Calculator 2025-26 | Save £252',
    description:
      'Check if you qualify for Marriage Allowance and calculate your annual tax saving of up to £252.',
    url: 'https://payetax.co.uk/tools/marriage-allowance-calculator',
    type: 'website',
  },
};

export default function MarriageAllowanceCalculatorPage() {
  return <MarriageAllowanceClient />;
}
