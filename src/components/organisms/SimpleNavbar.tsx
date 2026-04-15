// src/components/organisms/SimpleNavbar.tsx
'use client';

import { Menu, MessageSquare, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const CALCULATOR_ID = 'tax-calculator';
const CALCULATOR_HASH = `#${CALCULATOR_ID}`;

/**
 * Navigation bar using the canonical brand-surface theme
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
      <span className='flex min-h-11 items-center rounded-md px-4 py-2.5 font-medium text-on-brand-muted text-sm'>
        Feedback
      </span>
    ),
  },
);

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFeedbackOpen, setIsMobileFeedbackOpen] = useState(false);
  const [pendingMobileFeedbackOpen, setPendingMobileFeedbackOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: `/${CALCULATOR_HASH}`, label: 'Calculator' },
    { href: '/tools/director-guide', label: 'Director Intelligence' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ] as const;

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
        if (scrollToCalculator()) {
          // Update hash for bookmarking/sharing without adding a second history entry.
          window.history.replaceState(null, '', CALCULATOR_HASH);
        }
      } else {
        // The calculator section shell is server-rendered on the homepage,
        // so native browser hash navigation can handle the rest.
        router.push(`/${CALCULATOR_HASH}`);
      }
    },
    [pathname, router, scrollToCalculator],
  );

  const handleMobileLinkClick = useCallback(() => {
    setPendingMobileFeedbackOpen(false);
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileFeedbackClick = useCallback(() => {
    setPendingMobileFeedbackOpen(true);
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileMenuExitComplete = useCallback(() => {
    if (!pendingMobileFeedbackOpen) return;
    setPendingMobileFeedbackOpen(false);
    setIsMobileFeedbackOpen(true);
  }, [pendingMobileFeedbackOpen]);

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
          'bg-surface-brand/80 backdrop-blur-xl',
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
          <span className='brand-wordmark text-2xl text-on-brand'>
            paye
            <span className='text-gradient-brand'>tax</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-8 md:flex'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
              className='font-medium text-on-brand-muted text-sm transition-colors duration-300 hover:text-brand'
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
            className='rounded-full px-5 py-2.5 text-on-brand text-sm hover:scale-105'
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
          className='col-start-3 justify-self-end text-on-brand md:hidden'
          onClick={() => {
            setPendingMobileFeedbackOpen(false);
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
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
        onBackdropClick={() => {
          setPendingMobileFeedbackOpen(false);
          setIsMobileMenuOpen(false);
        }}
        onExitComplete={handleMobileMenuExitComplete}
        utilities={
          <button
            type='button'
            onClick={handleMobileFeedbackClick}
            className='flex min-h-11 items-center gap-2 rounded-lg px-4 py-3 font-medium text-on-brand-muted text-sm transition-colors hover:text-on-brand'
            aria-haspopup='dialog'
            data-testid='mobile-feedback-button'
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
