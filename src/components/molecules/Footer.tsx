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
    <footer className={cn('mt-auto', className)}>
      {/* Subtle separator line */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-border to-transparent' />

      {/* Main footer content */}
      <div className='glass py-8'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left'>
            {/* Brand and copyright */}
            <div className='space-y-2'>
              <span className='font-bold text-base text-foreground'>PayeTax</span>
              <p className='text-muted-foreground text-sm'>
                © {currentYear} PayeTax. All rights reserved.
              </p>
            </div>

            {/* Quick links and theme toggle */}
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <Link
                href='/about'
                className='py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                About
              </Link>
              <Link
                href='/blog'
                className='py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Blog
              </Link>
              <Link
                href='/compliance'
                className='py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Compliance
              </Link>
              <Link
                href='/privacy'
                className='py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Privacy
              </Link>
              <a
                href='mailto:support@payetax.co.uk'
                className='py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
              >
                Contact
              </a>
              <a
                href='https://x.com/PayeTaxUK'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1.5 py-2 px-3 -mx-3 text-muted-foreground text-sm transition-colors hover:text-primary'
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
