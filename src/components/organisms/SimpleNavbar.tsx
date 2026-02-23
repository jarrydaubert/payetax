// src/components/organisms/SimpleNavbar.tsx
'use client';

import { Menu, MessageSquare, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const CALCULATOR_ID = 'tax-calculator';
const CALCULATOR_HASH = `#${CALCULATOR_ID}`;

/**
 * Navigation bar with new design system (Cyan/Emerald theme)
 *
 * Design specs from payetax-web:
 * - Fixed position with backdrop blur
 * - Logo: "paye<span>tax</span>" with gradient on "tax"
 * - Nav links: Simple hover color change (no underlines)
 * - CTA: Gradient pill button
 */
interface SimpleNavbarProps {
  className?: string;
}

// Keep feedback UI off the critical path for initial mobile render.
const FeedbackDialog = dynamic(
  () => import('@/components/organisms/FeedbackDialog').then((mod) => mod.FeedbackDialog),
  {
    ssr: false,
    loading: () => (
      <span className='flex min-h-11 items-center rounded-md px-4 py-2.5 font-medium text-sm text-text-secondary-new'>
        Feedback
      </span>
    ),
  },
);

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFeedbackOpen, setIsMobileFeedbackOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Refs for cleanup of async operations
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const links = [
    { href: `/${CALCULATOR_HASH}`, label: 'Calculator' },
    { href: '/tools/director-guide', label: 'Director Intelligence' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ] as const;

  /** Clean up any pending observers/timeouts */
  const cleanupWait = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanupWait, [cleanupWait]);

  /** Scroll to calculator element, returns true if successful */
  const scrollToCalculator = useCallback(() => {
    const element = document.getElementById(CALCULATOR_ID);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  }, []);

  /**
   * Wait for calculator element and scroll when found
   * Uses MutationObserver with proper cleanup
   */
  const waitForElementAndScroll = useCallback(() => {
    // Clean up any previous wait
    cleanupWait();

    // Try immediately
    if (scrollToCalculator()) return;

    // Watch for calculator to be added to DOM
    observerRef.current = new MutationObserver(() => {
      if (scrollToCalculator()) {
        cleanupWait();
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Safety timeout to prevent infinite observation (5s)
    timeoutRef.current = window.setTimeout(cleanupWait, 5000);
  }, [cleanupWait, scrollToCalculator]);

  /**
   * Handle calculator link click
   * Respects modifier keys for native behavior (open in new tab, etc.)
   */
  const handleCalculatorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow native behavior for modifier keys (Cmd/Ctrl+click, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      e.preventDefault();
      setIsMobileMenuOpen(false);

      if (pathname === '/') {
        // Already on home - scroll directly or wait for element
        if (!scrollToCalculator()) {
          waitForElementAndScroll();
          // Trigger hashchange so DeferredContent can render the calculator section even if it's deferred.
          window.location.hash = CALCULATOR_ID;
          return;
        }
        // Update hash for bookmarking/sharing (no extra history entry)
        window.history.replaceState(null, '', CALCULATOR_HASH);
      } else {
        // Navigate to home with hash - HomePageContent handles scroll via hashchange
        router.push(`/${CALCULATOR_HASH}`);
      }
    },
    [pathname, router, scrollToCalculator, waitForElementAndScroll],
  );

  const handleMobileLinkClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileFeedbackClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => {
      setIsMobileFeedbackOpen(true);
    }, 120);
  }, []);

  return (
    <>
      {/* Skip to main content */}
      <a href='#main-content' className='skip-link'>
        Skip to content
      </a>

      <nav
        className={cn(
          'nav-safe-top fixed right-0 left-0 z-50',
          'grid grid-cols-[1fr_auto_1fr] items-center',
          'px-4 pt-[calc(var(--pwa-safe-area-top,0px)+1rem)] pb-4 sm:px-8 sm:py-6',
          'bg-deep/80 backdrop-blur-xl',
          className,
        )}
        aria-label='Main navigation'
      >
        {/* Logo - Home button */}
        <Link
          href='/'
          className='group'
          data-testid='nav-logo'
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <span className='brand-wordmark text-2xl text-text-primary-new'>
            paye
            <span className='text-gradient-new'>tax</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-8 md:flex'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
              className='font-medium text-sm text-text-secondary-new transition-colors duration-300 hover:text-cyan'
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Utilities */}
        <div className={cn('hidden items-center justify-end md:flex', SPACING.GAP_2)}>
          <FeedbackDialog />
          <Button
            asChild
            size='touch'
            variant='brandOutline'
            className='rounded-full px-5 py-2.5 text-sm text-text-primary-new hover:scale-105'
          >
            <Link href={`/${CALCULATOR_HASH}`} onClick={handleCalculatorClick}>
              Open Calculator
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='col-start-3 justify-self-end text-text-primary-new md:hidden'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          data-testid='mobile-menu-button'
        >
          {isMobileMenuOpen ? (
            <X className={ICON_SIZES.SIZE_5} />
          ) : (
            <Menu className={ICON_SIZES.SIZE_5} />
          )}
        </Button>
      </nav>

      {/*
       * Mobile Menu - Outside nav to allow backdrop-filter to work.
       * Calculator navigation handled by links array (/#tax-calculator).
       * FeedbackDialog passed as utility, rendered after nav links.
       */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        links={links}
        pathname={pathname}
        onLinkClick={handleMobileLinkClick}
        onBackdropClick={() => setIsMobileMenuOpen(false)}
        utilities={
          <button
            type='button'
            onClick={handleMobileFeedbackClick}
            className='flex min-h-11 items-center gap-2 rounded-lg px-4 py-3 font-medium text-sm text-text-secondary-new transition-colors hover:text-text-primary-new'
            aria-haspopup='dialog'
          >
            <MessageSquare className={ICON_SIZES.SIZE_4} aria-hidden='true' />
            Feedback
          </button>
        }
      />

      <FeedbackDialog
        open={isMobileFeedbackOpen}
        onOpenChange={setIsMobileFeedbackOpen}
        hideTrigger={true}
      />

      {/* Spacer for fixed navbar */}
      <div className='navbar-safe-spacer' data-testid='navbar-spacer' />
    </>
  );
};

export default SimpleNavbar;
