// src/app/tools/tax-code-decoder/page.tsx
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata';
import { TaxCodeDecoderClient } from './TaxCodeDecoderClient';

export const metadata = generateBaseMetadata({
  title: 'UK Tax Code Decoder | What Does My Tax Code Mean?',
  description:
    'Free UK tax code decoder. Understand what your tax code means, including 1257L, BR, D0, K codes, and Scottish/Welsh variations. Instant explanation with no signup required.',
  keywords:
    'tax code decoder, what does 1257L mean, UK tax code explained, HMRC tax code, tax code letters meaning, Scottish tax code, emergency tax code',
  pathname: '/tools/tax-code-decoder',
});

export default function TaxCodeDecoderPage() {
  return <TaxCodeDecoderClient />;
}
