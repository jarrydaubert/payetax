// src/app/privacy/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';

export const metadata: Metadata = metadataGenerator({
  title: 'Privacy Policy - Your Data Stays Private',
  description:
    'PayeTax privacy policy: All calculations run in your browser. We never store your tax data. Optional anonymous analytics with your consent. Privacy by design.',
  pathname: '/privacy',
  keywords:
    'privacy policy, data protection, client-side calculations, UK tax calculator privacy, no data collection',
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
