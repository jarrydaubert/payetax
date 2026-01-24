// src/app/tools/national-insurance-calculator/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { NICalculatorClient } from './NICalculatorClient';

export const metadata = generateBaseMetadata({
  title: 'National Insurance Calculator 2025-26 | NI Rates & Thresholds',
  description:
    'Free UK National Insurance calculator for 2025-26. Calculate employee and employer NI contributions. See all NI categories (A, B, C, H, J, M, Z) and current rates.',
  keywords:
    'National Insurance calculator, NI calculator UK, NI contributions 2025, employee NI, employer NI, Class 1 NI, NI category A, NI thresholds',
  pathname: '/tools/national-insurance-calculator',
});

export default function NICalculatorPage() {
  return <NICalculatorClient />;
}
