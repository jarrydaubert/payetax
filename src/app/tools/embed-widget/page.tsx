// src/app/tools/embed-widget/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { EmbedWidgetClient } from './EmbedWidgetClient';

export const metadata = generateBaseMetadata({
  title: 'Free Embeddable UK Tax Calculator Widget for Your Website',
  description:
    'Add a free UK tax calculator widget to your website. Simple embed code, responsive design, no API key required. Perfect for HR, finance, and recruitment sites.',
  keywords:
    'embed tax calculator, website widget, UK tax widget, PAYE calculator embed, free calculator widget, iframe tax calculator',
  pathname: '/tools/embed-widget',
});

export default function EmbedWidgetPage() {
  return <EmbedWidgetClient />;
}
