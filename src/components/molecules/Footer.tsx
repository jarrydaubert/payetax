// src/components/molecules/Footer.tsx

'use client';

import { Twitter } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  // Fix hydration mismatch by using static year
  const currentYear = 2025;

  return (
    <footer
      className={cn('mt-auto min-h-[140px] md:min-h-[120px]', className)}
      style={{ contain: 'layout' }}
    >
      {/* Subtle separator line */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

      {/* Main footer content */}
      <div className='glass py-8'>
        <div className='container mx-auto max-w-7xl px-2 sm:px-4'>
          <div className='flex flex-col items-center gap-6 text-center md:text-left'>
            {/* Top row: Brand and resources */}
            <div className='flex w-full flex-col items-center justify-between gap-4 md:flex-row'>
              {/* Brand and copyright */}
              <div className='space-y-2'>
                <span className='font-bold text-base text-foreground'>PayeTax</span>
                <p className='text-muted-foreground text-sm'>
                  © {currentYear} PayeTax. All rights reserved.
                </p>
              </div>

              {/* Helpful Resources */}
              <div className='space-y-2'>
                <p className='font-medium text-muted-foreground text-xs uppercase tracking-wide'>
                  Helpful Resources
                </p>
                <div className='flex flex-wrap items-center justify-center gap-4 md:justify-end'>
                  <a
                    href='https://www.gov.uk/topic/personal-tax/income-tax'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground text-sm transition-colors hover:text-primary'
                  >
                    HMRC / Gov.UK
                  </a>
                  <Link
                    href='/blog/uk-tax-calculator-2025-complete-guide'
                    className='text-muted-foreground text-sm transition-colors hover:text-primary'
                  >
                    Calculator Guide
                  </Link>
                  <Link
                    href='/blog/how-much-tax-will-i-pay-uk-2025'
                    className='text-muted-foreground text-sm transition-colors hover:text-primary'
                  >
                    Tax Examples
                  </Link>
                  <a
                    href='https://businessdebtline.org/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground text-sm transition-colors hover:text-primary'
                  >
                    Business Debtline
                  </a>
                  <a
                    href='https://www.moneyhelper.org.uk'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground text-sm transition-colors hover:text-primary'
                  >
                    Money Helper
                  </a>
                </div>
              </div>
            </div>

            {/* Quick links and theme toggle */}
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <Link
                href='/about'
                className='-mx-3 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                About
              </Link>
              <Link
                href='/blog'
                className='-mx-3 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Blog
              </Link>
              <Link
                href='/compliance'
                className='-mx-3 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Compliance
              </Link>
              <Link
                href='/privacy'
                className='-mx-3 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Privacy
              </Link>
              <a
                href='mailto:support@payetax.co.uk'
                className='-mx-3 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Contact
              </a>
              <a
                href='https://x.com/PayeTaxUK'
                target='_blank'
                rel='noopener noreferrer'
                className='-mx-3 flex items-center gap-1.5 px-3 py-2 text-muted-foreground text-sm transition-colors hover:text-primary'
                aria-label='X: @PayeTaxUK'
              >
                <Twitter className='size-4' />
                @PayeTaxUK
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
