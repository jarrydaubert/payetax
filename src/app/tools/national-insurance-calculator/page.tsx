// src/app/tools/national-insurance-calculator/page.tsx
import type { Metadata } from 'next';
import { NICalculatorClient } from './NICalculatorClient';

export const metadata: Metadata = {
  title: 'National Insurance Calculator 2025-26 | NI Rates & Thresholds - PayeTax',
  description:
    'Free UK National Insurance calculator for 2025-26. Calculate employee and employer NI contributions. See all NI categories (A, B, C, H, J, M, Z) and current rates.',
  keywords:
    'National Insurance calculator, NI calculator UK, NI contributions 2025, employee NI, employer NI, Class 1 NI, NI category A, NI thresholds',
  openGraph: {
    title: 'National Insurance Calculator 2025-26 | UK NI Rates',
    description:
      'Calculate your National Insurance contributions for 2025-26. Employee and employer rates explained.',
    url: 'https://payetax.co.uk/tools/national-insurance-calculator',
    type: 'website',
  },
};

export default function NICalculatorPage() {
  return <NICalculatorClient />;
}
