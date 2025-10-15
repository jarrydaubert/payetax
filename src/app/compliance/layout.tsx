// src/app/compliance/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';

export const metadata: Metadata = metadataGenerator({
  title: 'HMRC Compliance & Tax Rate Accuracy',
  description:
    'PayeTax uses official HMRC tax rates and thresholds, updated within 24 hours of changes. Verified calculations for UK income tax, National Insurance, and student loans.',
  pathname: '/compliance',
  keywords:
    'HMRC compliance, official tax rates, UK tax accuracy, PAYE compliance, tax calculator verification',
});

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
