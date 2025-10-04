// src/components/molecules/SimpleNavbar.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FeedbackDialog } from '@/components/molecules/FeedbackDialog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface SimpleNavbarProps {
  className?: string;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/#tax-calculator', label: 'Calculator' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
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

      <nav className={cn('relative z-40 w-full py-4', className)}>
        <div className='container mx-auto flex max-w-7xl items-center justify-between px-4'>
          {/* Logo */}
          <Link href='/' className='group'>
            <motion.span
              className='bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-2xl text-transparent md:text-3xl lg:text-4xl'
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              PayeTax
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center gap-8 md:flex'>
            {links.map((link) => {
              const isActive =
                pathname === link.href || (link.label === 'Calculator' && pathname === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={link.label === 'Calculator' ? handleCalculatorClick : undefined}
                  className={cn(
                    'relative px-3 py-2 font-medium text-base transition-colors',
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
          <div className='hidden items-center gap-2 md:flex'>
            <FeedbackDialog />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className='size-5' /> : <Menu className='size-5' />}
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
              <div className='container mx-auto max-w-7xl space-y-2 px-4 py-4'>
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
                        'block rounded-lg px-4 py-3 font-medium text-base transition-colors',
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
                <div className='mt-4 flex items-center justify-between gap-2'>
                  <FeedbackDialog />
                  <ThemeToggle />
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
