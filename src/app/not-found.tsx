// src/app/not-found.tsx
'use client';

import { Calculator, FileText, Home, Sparkles } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, LAYOUT, SPACING, SURFACES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

// Quick navigation links for 404 page
const quickLinks = [
  {
    href: '/' as Route,
    icon: Home,
    title: 'Go Home',
    description: 'Back to our main page',
    color: 'from-primary to-accent',
  },
  {
    href: '/#tax-calculator' as Route,
    icon: Calculator,
    title: 'Tax Calculator',
    description: 'Calculate your UK taxes',
    color: 'from-cyan-500 to-cyan-400',
  },
  {
    href: '/blog' as Route,
    icon: FileText,
    title: 'Read Blog',
    description: 'Tax tips and guides',
    color: 'from-pink-500 to-pink-400',
  },
];

export default function NotFound() {
  return (
    <div className={LAYOUT.PAGE_WRAPPER}>
      {/* Animated background particles */}
      <div className='fixed inset-0 -z-10 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background'>
          {[...Array(20)].map((_, i) => {
            const left = (i * 137.5) % 100;
            const top = (i * 37.5) % 100;
            const delay = (i * 0.15) % 3;
            const duration = 2 + (i % 4);
            return (
              <div
                key={`particle-${i}`}
                className='absolute h-2 w-2 animate-pulse rounded-full bg-primary opacity-20'
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Hero Section */}
      <section className={cn(LAYOUT.SECTION, LAYOUT.TEXT_CENTER)}>
        <div className={LAYOUT.CONTAINER_SM}>
          {/* 404 Display */}
          <div className={SPACING.MB_6}>
            <div className='relative inline-block'>
              <h1
                className={cn(
                  'bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text font-black text-transparent',
                  'text-7xl md:text-9xl'
                )}
              >
                404
              </h1>
              <div className='-z-10 absolute inset-0 animate-pulse font-black text-7xl text-primary/10 md:text-9xl'>
                404
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className='mb-12'>
            <h2 className={cn(SPACING.MB_4, 'font-bold text-foreground', TYPOGRAPHY.TEXT_3XL)}>
              Oops! Page Not Found
            </h2>
            <p className={cn(LAYOUT.CENTERED_CONTENT, 'text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
              Looks like this page went on vacation to calculate taxes elsewhere. Don't worry, we've
              got plenty more where that came from!
            </p>
            <div
              className={cn(SPACING.MT_6, 'flex items-center justify-center gap-2 text-primary')}
            >
              <Sparkles className={cn(ICON_SIZES.SIZE_5, 'animate-pulse')} aria-hidden='true' />
              <span className={cn('font-medium', TYPOGRAPHY.TEXT_SM)}>
                Let's get you back on track
              </span>
              <Sparkles className={cn(ICON_SIZES.SIZE_5, 'animate-pulse')} aria-hidden='true' />
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className={cn('mb-12', LAYOUT.GRID_3)}>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group glass-card rounded-xl transition-all duration-300',
                    'border border-primary/20 hover:border-primary/40',
                    'active:scale-[1.02] md:hover:scale-105',
                    SPACING.P_6
                  )}
                >
                  <Icon
                    className={cn(
                      'mx-auto text-primary transition-colors group-hover:text-primary/80',
                      ICON_SIZES.SIZE_8,
                      SPACING.MB_4
                    )}
                    aria-hidden='true'
                  />
                  <h3 className={cn(SPACING.MB_2, 'font-semibold text-foreground')}>
                    {link.title}
                  </h3>
                  <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    {link.description}
                  </p>
                  <div
                    className={cn(
                      SPACING.MT_3,
                      'mx-auto h-1 w-8 rounded-full bg-gradient-to-r transition-all group-hover:w-12',
                      link.color
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* Fun Fact Card */}
          <Card
            className={cn(
              SPACING.MB_8,
              SURFACES.CARD_LARGE,
              'border-border',
              SURFACES.BG_GRADIENT_PRIMARY
            )}
          >
            <Badge variant='outline' className={cn(SPACING.MB_4, 'mx-auto')}>
              Did You Know?
            </Badge>
            <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_BASE)}>
              The UK tax system processes over{' '}
              <span className='font-semibold text-primary'>30 million</span> PAYE returns annually.
              Our calculator helps thousands of people understand their take-home pay every month!
            </p>
          </Card>

          {/* Help Text */}
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
            If you think this is an error, please{' '}
            <a
              href='mailto:support@payetax.co.uk?subject=404 Error Report'
              className='text-primary underline hover:text-primary/80'
            >
              contact us
            </a>{' '}
            and let us know what happened.
          </p>
        </div>
      </section>
    </div>
  );
}
