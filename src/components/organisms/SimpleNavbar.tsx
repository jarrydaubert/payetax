// src/components/organisms/SimpleNavbar.tsx
'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
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
          'border-b backdrop-blur-[20px]',
          className
        )}
        style={{
          background: 'rgba(2, 6, 23, 0.8)',
          borderColor: 'var(--border-subtle)',
        }}
        aria-label='Main navigation'
      >
        {/* Logo */}
        <Link href='/' className='group' data-testid='nav-logo'>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--text-primary-new)',
              letterSpacing: '-0.03em',
            }}
          >
            paye
            <span
              style={{
                background: 'var(--brand-gradient-new)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              tax
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className='hidden items-center gap-12 md:flex'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
              className='font-medium text-[0.85rem] transition-colors duration-300 hover:text-[var(--brand-cyan)]'
              style={{ color: 'var(--text-secondary-new)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <Link
          href='/#tax-calculator'
          onClick={handleCalculatorClick}
          className={cn(
            'hidden rounded-full px-5 py-2.5 font-semibold text-[0.85rem] transition-all duration-300 md:inline-block',
            'hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
          )}
          style={{
            background: 'var(--brand-gradient-new)',
            color: 'var(--bg-deep)',
          }}
        >
          Open Calculator
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          data-testid='mobile-menu-button'
          style={{ color: 'var(--text-primary-new)' }}
        >
          {isMobileMenuOpen ? (
            <X className={ICON_SIZES.SIZE_5} />
          ) : (
            <Menu className={ICON_SIZES.SIZE_5} />
          )}
        </Button>

        {/* Mobile Menu */}
        <NavbarMobileMenu
          isOpen={isMobileMenuOpen}
          links={links}
          pathname={pathname}
          onLinkClick={handleMobileLinkClick}
          onBackdropClick={() => setIsMobileMenuOpen(false)}
        />
      </nav>

      {/* Spacer for fixed navbar */}
      <div className='h-16 sm:h-20' />
    </>
  );
};

export default SimpleNavbar;
