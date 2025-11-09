// src/components/molecules/NavbarMobileMenu.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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
  utilities?: ReactNode;
}

/**
 * Mobile navigation menu molecule
 *
 * Animated slide-down menu with backdrop for mobile devices.
 * Uses AnimatePresence for smooth enter/exit animations.
 *
 * @param isOpen - Whether the menu is open
 * @param links - Array of navigation links
 * @param pathname - Current pathname for active state
 * @param onLinkClick - Handler for link clicks
 * @param onBackdropClick - Handler for backdrop clicks
 * @param utilities - Optional utility components (e.g., FeedbackDialog)
 */
export function NavbarMobileMenu({
  isOpen,
  links,
  pathname,
  onLinkClick,
  onBackdropClick,
  utilities,
}: NavbarMobileMenuProps) {
  return (
    <>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ originY: 0 }}
            className='overflow-hidden border-border/50 border-t md:hidden'
            aria-label='Mobile navigation menu'
          >
            <div className={cn('container mx-auto max-w-7xl px-4 py-4', SPACING.SPACE_Y_2)}>
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.label === 'Calculator' && pathname === '/') ||
                  (link.label === 'TaxInsights' && pathname.startsWith('/blog'));

                return (
                  <Link
                    key={link.href as string}
                    href={link.href as Route}
                    onClick={() => onLinkClick(link.label)}
                    className={cn(
                      'block rounded-lg px-4 py-3 font-medium transition-colors',
                      TYPOGRAPHY.TEXT_SM,
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Utilities */}
              {utilities && <div className='mt-4'>{utilities}</div>}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden'
            onClick={onBackdropClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}
