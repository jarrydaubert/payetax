// src/components/molecules/NavbarMobileMenu.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Route } from 'next';
import Link from 'next/link';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { LAYOUT } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface NavLink {
  readonly href: Route | (string & {});
  readonly label: string;
}

interface ToolLink {
  readonly href: string;
  readonly label: string;
  readonly description: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  links: readonly NavLink[];
  tools?: readonly ToolLink[];
  pathname: string;
  onLinkClick: (label: string) => void;
  onBackdropClick: () => void;
  /**
   * Optional utility components rendered after nav links (e.g., FeedbackDialog).
   * Styled consistently with nav links for visual coherence.
   */
  utilities?: ReactNode;
}

/**
 * Mobile navigation menu with new design system (Cyan/Emerald theme)
 *
 * Slides down from navbar with backdrop blur.
 * Matches desktop nav styling with mobile-optimized touch targets.
 * Includes focus trap and escape key handler for accessibility.
 */
export function NavbarMobileMenu({
  isOpen,
  links,
  tools,
  pathname,
  onLinkClick,
  onBackdropClick,
  utilities,
}: NavbarMobileMenuProps) {
  const menuRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle escape key to close menu
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBackdropClick();
      }
    },
    [onBackdropClick]
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
      const target = event.target as Node;

      // If focus moved to a Radix dialog/portal, let Radix handle focus trapping
      // This prevents infinite focus loops when FeedbackDialog opens from mobile menu
      const isInRadixPortal = (target as Element).closest?.('[data-radix-portal]');
      if (isInRadixPortal) return;

      if (menuRef.current && !menuRef.current.contains(target)) {
        event.preventDefault();
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
    <>
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-40 bg-deep/60 md:hidden'
            onClick={onBackdropClick}
            aria-hidden='true'
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            ref={menuRef}
            role='dialog'
            aria-modal='true'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed right-0 left-0 z-50 md:hidden',
              LAYOUT.BELOW_NAVBAR,
              'mobile-menu-blur px-4 py-6'
            )}
            aria-label='Mobile navigation menu'
          >
            <div className='flex flex-col gap-2'>
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
                      'block min-h-[44px] rounded-lg px-4 py-3 font-medium text-[0.95rem] transition-colors',
                      isActive ? 'bg-cyan/10 text-cyan' : 'text-text-secondary-new'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Tools section */}
              {tools && tools.length > 0 && (
                <>
                  <div className='my-2 border-t border-white/10' />
                  <p className='px-4 pt-2 pb-1 font-medium text-text-secondary-new text-xs uppercase tracking-wider'>
                    Tools
                  </p>
                  {tools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href as Route}
                        onClick={() => onLinkClick(tool.label)}
                        className={cn(
                          'block min-h-[44px] rounded-lg px-4 py-3 transition-colors',
                          isActive ? 'bg-cyan/10 text-cyan' : 'text-text-secondary-new'
                        )}
                      >
                        <span className='block font-medium text-[0.95rem]'>{tool.label}</span>
                        <span className='block text-text-secondary-new text-xs'>
                          {tool.description}
                        </span>
                      </Link>
                    );
                  })}
                </>
              )}

              {/*
               * Utilities section (e.g., FeedbackDialog)
               * Rendered after nav links for logical flow - users navigate first, then provide feedback.
               * No separate CTA button needed since "Calculator" link above serves that purpose.
               */}
              {utilities}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
