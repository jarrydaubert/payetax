import type { ReactNode } from 'react';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'About PayeTax | UK Tax Calculator R&D Project',
  description:
    "About PayeTax: Jarryd Aubert's UK tax calculator R&D project for deterministic calculation correctness, edge cases, privacy, and deployment hygiene.",
  pathname: '/about',
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
