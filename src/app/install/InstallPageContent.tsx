// src/app/install/InstallPageContent.tsx
// Server Component - presentational only, no hooks or handlers.

import { ArrowRight, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { PageHero } from '@/components/molecules/PageHero';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { INSTALL_BENEFITS, INSTALL_PLATFORMS } from '@/constants/pages/installPageData';

export function InstallPageContent() {
  return (
    <div className='min-h-screen'>
      <PageHero
        badge={{ icon: Download, text: 'Install PayeTax' }}
        title='Add PayeTax to your home screen'
        subtitle='Use PayeTax like an app: faster launch, a cleaner full-screen view, and offline support when your connection drops.'
      />

      {/* Platform steps */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading
            title='Install in a few taps'
            subtitle='Pick your device and follow the steps.'
            align='center'
          />

          <div className='grid gap-6 md:grid-cols-3'>
            {INSTALL_PLATFORMS.map((platform) => (
              <Card
                key={platform.platform}
                className='rounded-sm border-border bg-card p-6 transition-colors hover:border-primary/45'
              >
                <div className='mb-4 flex items-center justify-between gap-3'>
                  <h2 className='font-display font-semibold text-foreground text-xl'>
                    {platform.platform}
                  </h2>
                  <Badge variant='outline' className='rounded-sm border-primary/35 text-primary'>
                    {platform.browser}
                  </Badge>
                </div>
                <ol className='list-decimal space-y-2 pl-5 text-muted-foreground leading-relaxed'>
                  {platform.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className='border-border/60 border-y bg-primary/5 py-12 md:py-20'>
        <div className='container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
          <SectionHeading title='What you get' align='center' />
          <Card className='rounded-sm border-success/30 bg-card p-6'>
            <ul className='space-y-3'>
              {INSTALL_BENEFITS.map((benefit) => (
                <li key={benefit} className='flex items-start gap-3'>
                  <CheckCircle
                    className='mt-0.5 size-5 flex-shrink-0 text-success'
                    aria-hidden='true'
                  />
                  <span className='text-foreground/90 leading-relaxed'>{benefit}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className='py-12 md:py-20'>
        <div className='container mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8'>
          <Button asChild size='touch' className='rounded-sm px-6'>
            <Link href='/'>
              Open Calculator
              <ArrowRight className='size-4' aria-hidden='true' />
            </Link>
          </Button>
          <p className='mt-4 text-muted-foreground text-sm'>
            If install is unavailable, your browser or device might not support PWA installation.
          </p>
        </div>
      </section>
    </div>
  );
}

InstallPageContent.displayName = 'InstallPageContent';
