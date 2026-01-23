// src/components/molecules/NavbarMobileMenu.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavLink {
  readonly href: Route | (string & {});
  readonly label: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  links: readonly NavLink[];
  pathname: string;
  onLinkClick: (label: string) => void;
  onBackdropClick: () => void;
}

/**
 * Mobile navigation menu with new design system (Cyan/Emerald theme)
 *
 * Slides down from navbar with backdrop blur.
 * Matches desktop nav styling with mobile-optimized touch targets.
 */
export function NavbarMobileMenu({
  isOpen,
  links,
  pathname,
  onLinkClick,
  onBackdropClick,
}: NavbarMobileMenuProps) {
  return (
    <>
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-deep/80 backdrop-blur-sm md:hidden'
            onClick={onBackdropClick}
            aria-hidden='true'
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed top-[64px] right-0 left-0 z-50 md:hidden',
              'border-border-subtle border-b bg-dark px-4 py-6'
            )}
            aria-label='Mobile navigation menu'
          >
            <div className='flex flex-col gap-2'>
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.label === 'Calculator' && pathname === '/') ||
                  (link.label === 'Blog' && pathname.startsWith('/blog'));

                return (
                  <Link
                    key={link.href as string}
                    href={link.href as Route}
                    onClick={() => onLinkClick(link.label)}
                    className={cn(
                      'block min-h-[44px] rounded-lg px-4 py-3 font-medium text-[0.95rem] transition-colors',
                      isActive ? 'bg-cyan/10 text-cyan' : 'text-text-secondary-new'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile CTA Button */}
              <Link
                href='/#tax-calculator'
                onClick={() => onLinkClick('Calculator')}
                className='mt-4 block rounded-full bg-brand-gradient-new px-5 py-3 text-center font-semibold text-[0.95rem] text-deep transition-all'
              >
                Open Calculator
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
