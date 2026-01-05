'use client';

import { ArrowLeft, Calculator, FileText, Home } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const quickLinks = [
  {
    href: '/' as Route,
    icon: Home,
    title: 'Home',
    description: 'Return to homepage',
  },
  {
    href: '/#tax-calculator' as Route,
    icon: Calculator,
    title: 'Calculator',
    description: 'Calculate your taxes',
  },
  {
    href: '/blog' as Route,
    icon: FileText,
    title: 'Blog',
    description: 'Tax guides & tips',
  },
];

export default function NotFound() {
  return (
    <div className={cn(LAYOUT.PAGE_WRAPPER, 'flex items-center justify-center')}>
      <div className={cn(LAYOUT.CONTAINER_SM, 'text-center', SPACING.PY_16)}>
        {/* 404 */}
        <p className='font-mono text-primary text-sm tracking-widest'>404 ERROR</p>

        <h1 className={cn('mt-4 font-bold text-foreground', TYPOGRAPHY.TEXT_4XL)}>
          Page not found
        </h1>

        <p className={cn('mt-4 text-muted-foreground', TYPOGRAPHY.TEXT_BASE, 'mx-auto max-w-md')}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Primary CTA */}
        <div className='mt-8'>
          <Button asChild size='lg'>
            <Link href='/'>
              <ArrowLeft className='mr-2 size-4' />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className='mt-12 border-border border-t pt-8'>
          <p className={cn('mb-6 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
            Or try one of these:
          </p>
          <div className='flex flex-wrap justify-center gap-4'>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg border border-border px-4 py-2',
                    'text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground',
                    TYPOGRAPHY.TEXT_SM
                  )}
                >
                  <Icon className='size-4 text-primary' />
                  {link.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <p className={cn('mt-8 text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
          Think this is a mistake?{' '}
          <a
            href='mailto:support@payetax.co.uk'
            className='text-primary underline-offset-4 hover:underline'
          >
            Let us know
          </a>
        </p>
      </div>
    </div>
  );
}
