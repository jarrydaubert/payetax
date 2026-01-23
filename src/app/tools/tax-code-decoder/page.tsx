// src/app/tools/tax-code-decoder/page.tsx
import type { Metadata } from 'next';
import { TaxCodeDecoderClient } from './TaxCodeDecoderClient';

export const metadata: Metadata = {
  title: 'UK Tax Code Decoder | What Does My Tax Code Mean? - PayeTax',
  description:
    'Free UK tax code decoder. Understand what your tax code means, including 1257L, BR, D0, K codes, and Scottish/Welsh variations. Instant explanation with no signup required.',
  keywords:
    'tax code decoder, what does 1257L mean, UK tax code explained, HMRC tax code, tax code letters meaning, Scottish tax code, emergency tax code',
  openGraph: {
    title: 'UK Tax Code Decoder - What Does My Tax Code Mean?',
    description: 'Decode your UK tax code instantly. Understand 1257L, BR, D0, K codes and more.',
    url: 'https://payetax.co.uk/tools/tax-code-decoder',
    type: 'website',
  },
};

export default function TaxCodeDecoderPage() {
  return <TaxCodeDecoderClient />;
}
