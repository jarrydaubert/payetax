// src/app/tools/marriage-allowance-calculator/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { MarriageAllowanceClient } from './MarriageAllowanceClient';

export const metadata = generateBaseMetadata({
  title: 'Marriage Allowance Calculator 2025-26 | Save Up to £252',
  description:
    'Free Marriage Allowance calculator for 2025-26. Check if you qualify and calculate your £252 annual tax saving. Transfer 10% of your Personal Allowance to your spouse.',
  keywords:
    'Marriage Allowance calculator, marriage tax allowance UK, marriage allowance 2025, £252 tax saving, transfer personal allowance, marriage allowance eligibility',
  pathname: '/tools/marriage-allowance-calculator',
});

export default function MarriageAllowanceCalculatorPage() {
  return <MarriageAllowanceClient />;
}
