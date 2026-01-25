// src/components/molecules/Footer.tsx
// Simplified footer matching payetax-web design system

import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Footer molecule component - New design system
 *
 * IMPORTANT: This is a MOLECULE - it does NOT own the <footer> semantic tag.
 * The parent TEMPLATE (Layout.tsx) must wrap this in <footer></footer>.
 *
 * Clean, minimal design with:
 * - Logo (paye<span>tax</span>)
 * - Essential links (Blog, About, Privacy, Compliance, Support)
 * - Copyright
 */
interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <div className={cn('footer-new', className)}>
      <div className='footer-content-new'>
        {/* Brand */}
        <div className='footer-brand'>
          paye<span>tax</span>
        </div>

        {/* Links */}
        <nav className='footer-links-new' aria-label='Footer navigation'>
          <Link href='/blog'>Blog</Link>
          <Link href={'/scenarios' as Route}>Scenarios</Link>
          <Link href='/tools/tax-code-decoder'>Tax Code Decoder</Link>
          <Link href={'/tools/scottish-tax-calculator' as Route}>Scottish Tax</Link>
          <Link href='/about'>About</Link>
          <Link href='/privacy'>Privacy</Link>
          <Link href='/compliance'>Compliance</Link>
          <a href='mailto:support@payetax.co.uk'>Support</a>
        </nav>

        {/* Copyright & Version */}
        <div className='footer-copy'>
          &copy; 2026 PayeTax
          {process.env.NEXT_PUBLIC_APP_VERSION && (
            <span className='ml-2 text-white/30'>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Footer;
