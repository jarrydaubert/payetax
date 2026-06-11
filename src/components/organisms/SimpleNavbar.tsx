// src/components/organisms/SimpleNavbar.tsx
'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CALCULATOR_ID = 'tax-calculator';
const CALCULATOR_HASH = `#${CALCULATOR_ID}`;

/**
 * Navigation bar using the Ledger shell.
 */
interface SimpleNavbarProps {
  className?: string;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
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
          'border-border border-b bg-background',
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
          <span className='brand-wordmark text-2xl text-foreground'>
            paye
            <span className='text-primary'>tax</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-8 md:flex'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
              className='font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-primary'
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Utilities */}
        <div className={cn('hidden items-center justify-end md:flex', 'gap-2')}>
          <Button asChild size='touch' variant='outline' className='px-5 py-2.5 text-sm'>
            <Link href={`/${CALCULATOR_HASH}`} onClick={handleCalculatorClick}>
              Open Calculator
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='col-start-3 justify-self-end text-foreground md:hidden'
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          data-testid='mobile-menu-button'
        >
          {isMobileMenuOpen ? <X className={'size-5'} /> : <Menu className={'size-5'} />}
        </Button>
      </nav>

      {/*
       * Mobile Menu - Outside nav to allow backdrop-filter to work.
       * Calculator navigation handled by links array (/#tax-calculator).
       */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        links={links}
        pathname={pathname}
        onLinkClick={handleMobileLinkClick}
        onBackdropClick={() => {
          setIsMobileMenuOpen(false);
        }}
      />

      {/* Spacer for fixed navbar */}
      <div className='navbar-safe-spacer' data-testid='navbar-spacer' />
    </>
  );
};

export default SimpleNavbar;
