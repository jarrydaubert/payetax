// src/components/molecules/Footer.tsx

'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
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
      <div className='h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent' />

      {/* Main footer content */}
      <div className='glass py-8'>
        <div className='container mx-auto max-w-7xl px-4'>
          <div className='flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left'>
            {/* Brand and copyright */}
            <div className='space-y-2'>
              <div className='flex items-center justify-center gap-2 md:justify-start'>
                <Sparkles className='h-4 w-4 text-blue-400' />
                <span className='font-bold text-base text-white'>PayeTax</span>
              </div>
              <p className='text-sm text-white/70'>© {currentYear} PayeTax. All rights reserved.</p>
            </div>

            {/* Quick links */}
            <div className='flex flex-wrap items-center justify-center gap-6'>
              <Link
                href='/about'
                className='text-sm text-white/80 transition-colors hover:text-blue-400'
              >
                About
              </Link>
              <Link
                href='/blog'
                className='text-sm text-white/80 transition-colors hover:text-blue-400'
              >
                Blog
              </Link>
              <Link
                href='/privacy'
                className='text-sm text-white/80 transition-colors hover:text-blue-400'
              >
                Privacy
              </Link>
              <a
                href='mailto:support@payetax.co.uk'
                className='text-sm text-white/80 transition-colors hover:text-blue-400'
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
