// src/components/organisms/SimpleNavbar.tsx
'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { FeedbackDialog } from '@/components/organisms/FeedbackDialog';
import { Button } from '@/components/ui/button';
import { ICON_SIZES } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

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

  const links = [
    { href: '/#tax-calculator', label: 'Calculator' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ] as const;

  const handleCalculatorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      const calculatorElement = document.getElementById('tax-calculator');
      if (calculatorElement) {
        calculatorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setIsMobileMenuOpen(false);
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
        {/* Logo */}
        <Link href='/' className='group' data-testid='nav-logo'>
          <span className='font-display font-semibold text-[1.4rem] text-text-primary-new tracking-[-0.03em]'>
            paye
            <span className='text-gradient-new'>tax</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-12 md:flex'>
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

      {/* Mobile Menu - Outside nav to allow backdrop-filter to work */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        links={links}
        pathname={pathname}
        onLinkClick={handleMobileLinkClick}
        onBackdropClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Spacer for fixed navbar */}
      <div className='h-16 sm:h-20' />
    </>
  );
};

export default SimpleNavbar;
