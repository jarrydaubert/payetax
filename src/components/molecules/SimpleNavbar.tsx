// src/components/molecules/SimpleNavbar.tsx
'use client';

import { Menu, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { NavigationLink } from '@/types/navigation';

interface SimpleNavbarProps {
  className?: string;
}

const SimpleNavbar: React.FC<SimpleNavbarProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationLinks: (NavigationLink & { label: string; active: boolean })[] = [
    { href: '/', label: 'Home', name: 'Home', active: pathname === '/' },
    { href: '/about', label: 'About', name: 'About', active: pathname === '/about' },
    { href: '/blog', label: 'Blog', name: 'Blog', active: pathname === '/blog' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 right-0 left-0 z-40',
          'glass border-white/10 border-b',
          className
        )}
        style={{
          background: 'transparent',
          height: '80px',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className='flex w-full items-center justify-between'
          style={{
            maxWidth: '1920px',
            margin: '0 auto',
          }}
        >
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <Link href='/' className='group'>
              <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text font-bold text-2xl text-transparent transition-all duration-300 group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-cyan-300'>
                ToolHubX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden flex-1 items-center justify-center md:flex'>
            <div className='flex items-center gap-8 lg:gap-10'>
              {navigationLinks.map((link) => (
                <div key={link.href} className='relative'>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative flex items-center px-2 py-3',
                      'font-medium text-sm transition-all duration-300',
                      'focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2',
                      link.active ? 'text-white' : 'text-white/70 hover:text-white'
                    )}
                    aria-current={link.active ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                  </Link>

                  {/* Underline indicator */}
                  {link.active && (
                    <div
                      className='absolute right-0 bottom-0 left-0 h-0.5'
                      style={{
                        background:
                          'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Feedback Link */}
          <div className='hidden items-center md:flex'>
            <Link
              href='/feedback'
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-2 font-medium text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
            >
              <MessageSquare className='h-4 w-4' />
              <span>Feedback</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type='button'
            className='relative rounded-lg p-3 md:hidden'
            style={{
              background:
                'linear-gradient(135deg, hsla(270, 100%, 80%, 0.1) 0%, hsla(200, 100%, 70%, 0.1) 100%)',
              border: '1px solid hsla(270, 100%, 80%, 0.2)',
              marginRight: '0.5rem',
            }}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className='h-6 w-6 text-white' />
            ) : (
              <Menu className='h-6 w-6 text-white' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className='absolute top-full right-0 left-0 border-t md:hidden'
            style={{
              background:
                'linear-gradient(135deg, hsla(230, 70%, 8%, 0.98) 0%, hsla(270, 100%, 12%, 0.95) 100%)',
              borderTopColor: 'hsla(270, 100%, 80%, 0.2)',
            }}
          >
            <div className='container mx-auto max-w-7xl px-4 py-8'>
              <div className='flex flex-col items-center gap-6'>
                {navigationLinks.map((link) => (
                  <div key={link.href} className='w-full max-w-xs'>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center justify-center rounded-xl p-4',
                        'font-medium text-base transition-all duration-300',
                        'focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2',
                        link.active ? 'text-white' : 'text-white/70 hover:text-white'
                      )}
                      style={{
                        background: link.active
                          ? 'linear-gradient(135deg, hsla(270, 100%, 80%, 0.2) 0%, hsla(200, 100%, 70%, 0.2) 100%)'
                          : 'hsla(270, 100%, 80%, 0.1)',
                        border: '1px solid hsla(270, 100%, 80%, 0.1)',
                      }}
                      onClick={closeMobileMenu}
                      aria-current={link.active ? 'page' : undefined}
                    >
                      <span>{link.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden'
          onClick={closeMobileMenu}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeMobileMenu();
            }
          }}
          aria-label='Close mobile menu'
        />
      )}
    </>
  );
};

export default SimpleNavbar;
