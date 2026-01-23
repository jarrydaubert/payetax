// src/app/tools/embed-widget/page.tsx
import type { Metadata } from 'next';
import { EmbedWidgetClient } from './EmbedWidgetClient';

export const metadata: Metadata = {
  title: 'Free Embeddable UK Tax Calculator Widget for Your Website - PayeTax',
  description:
    'Add a free UK tax calculator widget to your website. Simple embed code, responsive design, no API key required. Perfect for HR, finance, and recruitment sites.',
  keywords:
    'embed tax calculator, website widget, UK tax widget, PAYE calculator embed, free calculator widget, iframe tax calculator',
  openGraph: {
    title: 'Free UK Tax Calculator Widget for Your Website',
    description:
      'Add a free, responsive UK tax calculator to your site. Simple iframe embed, no API key needed.',
    url: 'https://payetax.co.uk/tools/embed-widget',
    type: 'website',
  },
};

export default function EmbedWidgetPage() {
  return <EmbedWidgetClient />;
}
