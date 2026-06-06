// src/components/molecules/NavbarMobileMenu.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
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
  onExitComplete?: () => void;
  utilities?: ReactNode;
}

/**
 * Mobile navigation menu using the canonical brand-surface theme
 *
 * Slides down from navbar with backdrop blur.
 * Matches desktop nav styling with mobile-optimized touch targets.
 * Includes focus trap and escape key handler for accessibility.
 */
export function NavbarMobileMenu({
  isOpen,
  links,
  pathname,
  onLinkClick,
  onBackdropClick,
  onExitComplete,
  utilities,
}: NavbarMobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle escape key to close menu
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBackdropClick();
      }
    },
    [onBackdropClick],
  );

  // Focus trap: keep focus within menu when open
  useEffect(() => {
    if (!isOpen) return;

    // Add escape key listener
    document.addEventListener('keydown', handleKeyDown);

    // Focus first link when menu opens
    const timer = setTimeout(() => {
      firstLinkRef.current?.focus();
    }, 100);

    // Trap focus within menu (but allow Radix dialogs to manage their own focus)
    const handleFocusTrap = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      // If another modal dialog is open, let it own focus.
      const hasOpenPortalDialog = Boolean(
        document.querySelector('[data-radix-portal] [role="dialog"]'),
      );
      if (hasOpenPortalDialog) return;

      // If focus moved to a Radix dialog/portal, let Radix handle focus trapping
      const isInRadixPortal = (target as Element).closest?.('[data-radix-portal]');
      if (isInRadixPortal) return;

      if (menuRef.current && !menuRef.current.contains(target)) {
        firstLinkRef.current?.focus();
      }
    };
    document.addEventListener('focusin', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusTrap);
      clearTimeout(timer);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {isOpen ? (
        <>
          {/* Mobile Menu Backdrop */}
          <motion.div
            key='mobile-menu-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-background/60 md:hidden'
            onClick={onBackdropClick}
            aria-hidden='true'
          />

          {/* Mobile Menu */}
          <motion.div
            key='mobile-menu-panel'
            ref={menuRef}
            role='dialog'
            aria-modal='true'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed right-0 left-0 z-50 md:hidden',
              'top-16',
              'top-[calc(4rem+var(--pwa-safe-area-top,0px))]',
              'border-border/60 border-b bg-card px-4 py-6',
            )}
            aria-label='Mobile navigation menu'
          >
            <nav aria-label='Mobile navigation menu links' className='flex flex-col gap-2'>
              {/* Navigation links - Calculator link already handles /#tax-calculator */}
              {links.map((link, index) => {
                const isActive =
                  pathname === link.href ||
                  (link.label === 'Calculator' && pathname === '/') ||
                  (link.label === 'Blog' && pathname.startsWith('/blog'));

                return (
                  <Link
                    key={link.href as string}
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={link.href as Route}
                    onClick={() => onLinkClick(link.label)}
                    className={cn(
                      'block min-h-11 rounded-lg px-4 py-3 font-medium text-sm transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {utilities}
            </nav>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
