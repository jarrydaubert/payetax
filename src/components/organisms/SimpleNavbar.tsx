// src/components/organisms/SimpleNavbar.tsx
'use client';

import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NavbarLinks } from '@/components/molecules/NavbarLinks';
import { NavbarMobileMenu } from '@/components/molecules/NavbarMobileMenu';
import { FeedbackDialog } from '@/components/organisms/FeedbackDialog';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

/**
 * Simple navigation bar organism
 *
 * IMPORTANT: Logo uses TEXT_3XL (largest in typography scale) for brand prominence
 * Navigation links use TEXT_SM for compact header
 * Desktop navigation uses GAP_8 for generous spacing between links
 * Icon uses SIZE_5 for mobile menu buttons
 */
interface SimpleNavbarProps {
  className?: string;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/#tax-calculator', label: 'Calculator' },
    { href: '/blog', label: 'TaxInsights' },
    { href: '/about', label: 'About' },
  ] as const;

  const handleCalculatorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're already on the homepage, scroll to calculator
    if (pathname === '/') {
      e.preventDefault();
      const calculatorElement = document.getElementById('tax-calculator');
      if (calculatorElement) {
        calculatorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
      setIsMobileMenuOpen(false);
    }
    // Otherwise, let the link navigate normally (it will scroll to #tax-calculator)
  };

  const handleMobileLinkClick = (label: string) => {
    if (label === 'Calculator') {
      // Let handleCalculatorClick handle it via the href
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Skip to main content */}
      <a href='#main-content' className='skip-link'>
        Skip to content
      </a>

      <nav
        className={cn(
          'relative z-50 w-full py-4',
          'border-border/30 border-b bg-background/50 backdrop-blur-md',
          className
        )}
      >
        <div className='container mx-auto flex max-w-7xl items-center justify-between px-2 sm:px-4'>
          {/* Logo */}
          <Link href='/' className='group'>
            <motion.span
              className={cn(
                'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
                TYPOGRAPHY.TEXT_3XL
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              PayeTax
            </motion.span>
          </Link>

          {/* Desktop Navigation - Uses NavbarLinks molecule */}
          <NavbarLinks
            links={links}
            pathname={pathname}
            onCalculatorClick={handleCalculatorClick}
          />

          {/* Desktop Utilities */}
          <div className='hidden items-center gap-2 md:flex'>
            <FeedbackDialog />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className={ICON_SIZES.SIZE_5} />
            ) : (
              <Menu className={ICON_SIZES.SIZE_5} />
            )}
          </Button>
        </div>

        {/* Mobile Menu - Uses NavbarMobileMenu molecule */}
        <NavbarMobileMenu
          isOpen={isMobileMenuOpen}
          links={links}
          pathname={pathname}
          onLinkClick={handleMobileLinkClick}
          onBackdropClick={() => setIsMobileMenuOpen(false)}
          utilities={<FeedbackDialog />}
        />
      </nav>
    </>
  );
};

export default SimpleNavbar;
