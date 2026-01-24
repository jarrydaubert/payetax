// src/app/tools/embed-widget/EmbedWidgetClient.tsx
'use client';

import { Check, Code2, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export function EmbedWidgetClient() {
  const widthId = useId();
  const heightId = useId();
  const [width, setWidth] = useState('400');
  const [height, setHeight] = useState('500');
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="https://payetax.co.uk/embed"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: 1px solid #e2e8f0; border-radius: 8px;"
  title="UK Tax Calculator by PayeTax"
  loading="lazy"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  return (
    <div className={cn('mx-auto max-w-6xl', SPACING.PX_4, SPACING.PY_12)}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <h1
          className={cn(
            'mb-4 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-transparent',
            TYPOGRAPHY.TEXT_4XL
          )}
        >
          Embed Tax Calculator Widget
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Add a free UK tax calculator to your website. Perfect for HR portals, finance sites, job
          boards, and recruitment platforms.
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-2'>
        {/* Left: Configuration & Code */}
        <div className='space-y-6'>
          {/* Size Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Code2 className={ICON_SIZES.SIZE_5} />
                Customize Widget
              </CardTitle>
              <CardDescription>Adjust the size to fit your website layout.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor={widthId}>Width (px)</Label>
                  <Input
                    id={widthId}
                    type='number'
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    min='300'
                    max='800'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={heightId}>Height (px)</Label>
                  <Input
                    id={heightId}
                    type='number'
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min='400'
                    max='800'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy and paste this code into your website HTML.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <pre className='overflow-x-auto rounded-lg bg-muted p-4 text-sm'>
                  <code>{embedCode}</code>
                </pre>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCopy}
                  className='absolute top-2 right-2'
                >
                  {copied ? (
                    <>
                      <Check className={cn('mr-1', ICON_SIZES.SIZE_4)} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className={cn('mr-1', ICON_SIZES.SIZE_4)} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='space-y-2 text-muted-foreground text-sm'>
                {[
                  'Official HMRC tax rates (2024-26)',
                  'Responsive design - works on all devices',
                  'Dark mode support',
                  'No API key required',
                  'Loads lazily for performance',
                  'Free for any use (commercial or personal)',
                  'Links back to full calculator for advanced options',
                ].map((feature) => (
                  <li key={feature} className='flex items-start gap-2'>
                    <Check className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 flex-shrink-0 text-emerald')} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                Live Preview
                <a
                  href='/embed'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-normal text-muted-foreground text-sm hover:text-foreground'
                >
                  Open in new tab
                  <ExternalLink className={cn('ml-1 inline', ICON_SIZES.SIZE_3_5)} />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className='mx-auto overflow-hidden rounded-lg border'
                style={{ width: `${Math.min(Number.parseInt(width, 10) || 400, 500)}px` }}
              >
                <iframe
                  src='/embed'
                  width='100%'
                  height={height}
                  title='UK Tax Calculator Preview'
                  className='border-0'
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className='rounded-lg border border-emerald/20 bg-emerald/5 p-6 text-center'>
            <p className={cn('mb-4 font-medium', TYPOGRAPHY.TEXT_LG)}>
              Need custom features for your website?
            </p>
            <p className='mb-4 text-muted-foreground text-sm'>
              We can build a customized calculator with your branding, specific tax scenarios, or
              API integration.
            </p>
            <Link href='mailto:support@payetax.co.uk'>
              <Button variant='outline'>Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
