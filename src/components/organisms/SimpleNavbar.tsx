// src/components/organisms/SimpleNavbar.tsx
'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { FeedbackDialog } from '@/components/organisms/FeedbackDialog';
import { Button } from '@/components/ui/button';
import { ICON_SIZES } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const tools = [
  { href: '/tools/director-guide', label: 'Director Guide', description: 'Salary vs dividend optimizer' },
  { href: '/tools/tax-code-decoder', label: 'Tax Code Decoder', description: 'Understand your tax code' },
  { href: '/tools/scottish-tax-calculator', label: 'Scottish Tax', description: '6-band Scottish rates' },
  { href: '/tools/national-insurance-calculator', label: 'NI Calculator', description: 'National Insurance breakdown' },
  { href: '/tools/marriage-allowance-calculator', label: 'Marriage Allowance', description: 'Transfer allowance calculator' },
] as const;

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

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/#tax-calculator', label: 'Calculator' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ] as const;

  const scrollToCalculator = () => {
    const element = document.getElementById('tax-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }
    return false;
  };

  const waitForElementAndScroll = () => {
    // Try immediately first
    if (scrollToCalculator()) return;

    // Wait for navigation to complete
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Check again after navigation
        if (scrollToCalculator()) return;

        // Scroll down to trigger DeferredContent's IntersectionObserver
        // (DeferredContent has timeout=0, so it only renders when scrolled into view)
        window.scrollTo({ top: window.innerHeight, behavior: 'instant' });

        // Watch for calculator to be added to DOM
        const observer = new MutationObserver((_mutations, obs) => {
          if (scrollToCalculator()) {
            obs.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Safety timeout to prevent infinite observation
        setTimeout(() => observer.disconnect(), 5000);
      }, 100);
    });
  };

  const handleCalculatorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (pathname === '/') {
      // Try to scroll; if calculator hasn't rendered yet, trigger lazy loading
      if (!scrollToCalculator()) {
        waitForElementAndScroll();
      }
    } else {
      router.push('/');
      waitForElementAndScroll();
    }
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip to main content */}
      <a href='#main-content' className='skip-link'>
        Skip to content
      </a>

      <nav
        className={cn(
          'fixed top-0 right-0 left-0 z-50',
          'flex items-center justify-between',
          'px-4 py-4 sm:px-8 sm:py-6',
          'bg-deep/80 backdrop-blur-[20px]',
          className
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
          <span className='font-display font-semibold text-[1.4rem] text-text-primary-new tracking-[-0.03em]'>
            paye
            <span className='text-gradient-new'>tax</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-10 md:flex'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
              className='font-medium text-[0.85rem] text-text-secondary-new transition-colors duration-300 hover:text-cyan'
            >
              {link.label}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div className='group relative'>
            <button
              type='button'
              className='flex items-center gap-1 font-medium text-[0.85rem] text-text-secondary-new transition-colors duration-300 hover:text-cyan'
            >
              Tools
              <ChevronDown className='size-4 transition-transform duration-200 group-hover:rotate-180' />
            </button>

            {/* Dropdown Menu */}
            <div className='pointer-events-none invisible absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100'>
              <div className='overflow-hidden rounded-xl border border-white/10 bg-deep/95 shadow-xl backdrop-blur-xl'>
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className='block px-4 py-3 transition-colors hover:bg-white/5'
                  >
                    <span className='block font-medium text-sm text-text-primary-new'>
                      {tool.label}
                    </span>
                    <span className='block text-text-secondary-new text-xs'>
                      {tool.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Utilities */}
        <div className='hidden items-center gap-2 md:flex'>
          <FeedbackDialog />
          <Link
            href='/#tax-calculator'
            onClick={handleCalculatorClick}
            className={cn(
              'rounded-full border border-transparent px-5 py-2.5 font-semibold text-[0.85rem] text-text-primary-new transition-all duration-300',
              '[background:linear-gradient(#020617,#020617)_padding-box,linear-gradient(135deg,#06b6d4,#10b981)_border-box]',
              'hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
            )}
          >
            Open Calculator
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='text-text-primary-new md:hidden'
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
        tools={tools}
        pathname={pathname}
        onLinkClick={handleMobileLinkClick}
        onBackdropClick={() => setIsMobileMenuOpen(false)}
        utilities={<FeedbackDialog />}
      />

      {/* Spacer for fixed navbar */}
      <div className='h-16 sm:h-20' />
    </>
  );
};

export default SimpleNavbar;
