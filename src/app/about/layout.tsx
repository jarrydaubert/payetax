import type { ReactNode } from 'react';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'About PayeTax | How We Build Privacy-First UK Tax Tools',
  description:
    'How PayeTax is built: privacy-first architecture, HMRC-aligned tax logic, and clear user-facing explanations for UK PAYE decisions.',
  pathname: '/about',
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
