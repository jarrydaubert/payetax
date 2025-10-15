// src/app/about/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata as metadataGenerator } from '@/lib/metadata';

export const metadata: Metadata = metadataGenerator({
  title: 'About PayeTax - Free UK Tax Calculator',
  description:
    'Learn about PayeTax, the UK tax calculator built for privacy, accuracy, and transparency. Free forever with official HMRC rates and no data collection.',
  pathname: '/about',
  keywords: 'about PayeTax, UK tax calculator, HMRC rates, privacy-first tax calculator',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
