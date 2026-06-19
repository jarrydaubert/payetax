// src/components/molecules/Footer.tsx
// Simplified footer matching the Ledger shell
'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { SITE_CONTACT_MAILTO } from '@/constants/contact';
import { cn } from '@/lib/utils';

/**
 * Footer molecule component
 *
 * IMPORTANT: This is a MOLECULE - it does NOT own the <footer> semantic tag.
 * The parent TEMPLATE (Layout.tsx) must wrap this in <footer></footer>.
 *
 * Clean Ledger design with:
 * - Logo (paye<span>tax</span>)
 * - Essential links (Blog, Tools, About, Privacy, Compliance, Support)
 * - Copyright
 */
interface FooterProps {
  appVersion: string;
  className?: string;
}

export function Footer({ appVersion, className }: FooterProps) {
  const openCookiePreferences = useCallback(() => {
    document.dispatchEvent(new Event('openCookiePreferences'));
  }, []);

  return (
    <div className={cn('relative z-[1] border-border/60 border-t px-8 py-12', className)}>
      <div className='mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-x-6 gap-y-4 text-center md:grid-cols-[auto_minmax(0,1fr)_auto] md:text-left'>
        {/* Brand - links back to home */}
        <Link href='/' className='brand-wordmark text-foreground text-xl'>
          paye<span className='text-primary'>tax</span>
        </Link>

        {/* Links - no `as Route` casts; routes validated by typedRoutes in next.config */}
        <nav
          className='flex min-w-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 text-muted-foreground text-sm'
          aria-label='Footer navigation'
        >
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/blog'>
            Blog
          </Link>
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/tools'>
            Tools
          </Link>
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/install'>
            Install App
          </Link>
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/about'>
            About
          </Link>
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/privacy'>
            Privacy
          </Link>
          <button
            type='button'
            className='inline-flex min-h-6 cursor-pointer items-center border-0 bg-transparent p-0 text-muted-foreground hover:text-primary'
            onClick={openCookiePreferences}
          >
            Cookie Settings
          </button>
          <Link className='inline-flex min-h-6 items-center hover:text-primary' href='/compliance'>
            Compliance
          </Link>
          <a
            className='inline-flex min-h-6 items-center hover:text-primary'
            href={SITE_CONTACT_MAILTO}
          >
            Support
          </a>
        </nav>

        {/* Copyright & Version */}
        <div className='whitespace-nowrap text-muted-foreground text-sm md:justify-self-end'>
          &copy; 2026 PayeTax
          <span className='ml-2 text-muted-foreground'>v{appVersion}</span>
        </div>
      </div>
    </div>
  );
}

export default Footer;
