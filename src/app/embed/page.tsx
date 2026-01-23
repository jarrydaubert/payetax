// src/app/embed/page.tsx
import type { Metadata } from 'next';
import { EmbedCalculator } from './EmbedCalculator';

export const metadata: Metadata = {
  title: 'Embeddable UK Tax Calculator Widget - PayeTax',
  description:
    'Free embeddable UK tax calculator widget for your website. Add a PAYE salary calculator to your site with a simple iframe.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedPage() {
  return <EmbedCalculator />;
}
