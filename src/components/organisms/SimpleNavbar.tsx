// src/components/organisms/SimpleNavbar.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FeedbackDialog } from '@/components/organisms/FeedbackDialog';
import { Button } from '@/components/ui/button';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
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

          {/* Desktop Navigation */}
          <div className={cn('hidden items-center md:flex', SPACING.GAP_8)}>
            {links.map((link) => {
              const isActive =
                pathname === link.href || (link.label === 'Calculator' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
                  className={cn(
                    'relative flex min-h-[44px] items-center px-4 py-2.5 font-medium transition-colors',
                    TYPOGRAPHY.TEXT_SM,
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId='navbar-indicator'
                      className='absolute right-0 bottom-0 left-0 h-0.5 bg-primary'
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Utilities */}
          <div className={cn('hidden items-center md:flex', SPACING.GAP_2)}>
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ originY: 0 }}
              className='overflow-hidden border-border/50 border-t md:hidden'
            >
              <div className={cn('container mx-auto max-w-7xl px-4 py-4', SPACING.SPACE_Y_2)}>
                {links.map((link) => {
                  const isActive =
                    pathname === link.href || (link.label === 'Calculator' && pathname === '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={
                        link.label === 'Calculator'
                          ? handleCalculatorClick
                          : () => setIsMobileMenuOpen(false)
                      }
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
                <div className='mt-4'>
                  <FeedbackDialog />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden'
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SimpleNavbar;
