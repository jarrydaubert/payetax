/**
 * Layout.tsx - Main application layout with dark mode only
 * UPDATED: Removed theme toggle - dark mode only experience
 */

'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, 
  BookOpen, 
  MessageSquare, 
  Menu, 
  X,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackSEOAction } from '@/lib/analytics';

// Types
interface NavigationLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  showScrollTop?: boolean;
}

/**
 * Skip to content component for accessibility
 */
const SkipToContent: React.FC = (): React.ReactElement => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50"
  >
    Skip to content
  </a>
);

/**
 * Professional layout component with modern design system
 * UPDATED: Removed theme toggle, dark mode only
 */
const Layout: React.FC<LayoutProps> = ({ children }): React.ReactElement => {
  const pathname = usePathname();
  
  // UI interaction state
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Enhanced scroll tracking
  useEffect(() => {
    const handleScroll = (): void => {
      const offset = window.scrollY;
      setScrolled(offset > 20);
      setShowScrollTop(offset > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset mobile menu on pathname change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation configuration
  const navigationLinks: NavigationLink[] = useMemo(() => [
    {
      href: '/',
      label: 'Calculator',
      icon: <Calculator className="h-4 w-4" />,
      active: pathname === '/',
    },
    {
      href: '/blog',
      label: 'Blog',
      icon: <BookOpen className="h-4 w-4" />,
      active: pathname === '/blog' || pathname.startsWith('/blog/'),
    },
    {
      href: '/feedback',
      label: 'Feedback',
      icon: <MessageSquare className="h-4 w-4" />,
      active: pathname === '/feedback',
    },
  ], [pathname]);

  // Optimized handlers with useCallback
  const scrollToTop = useCallback((): void => {
    trackSEOAction('share', { action_type: 'scroll_top' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleMobileMenu = useCallback((): void => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-foreground">
      {/* Skip to content for accessibility */}
      <SkipToContent />

      {/* Aurora gradient background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
      </div>

      {/* Main header with glass effect */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          'backdrop-blur-md border-b border-white/10',
          scrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 shadow-lg' 
            : 'bg-white/60 dark:bg-gray-900/60'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group transition-all duration-200 hover:scale-105"
              aria-label="ToolHubX - UK Tax Calculator"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ToolHubX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-sm',
                    link.active
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200'
                  )}
                  aria-current={link.active ? 'page' : undefined}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions - Theme toggle removed */}
            <div className="hidden md:flex items-center space-x-3">
              {/* No theme toggle - dark mode only */}
              <div className="text-xs text-gray-500 dark:text-gray-400">Dark Mode</div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <nav className="flex flex-col space-y-2" role="navigation" aria-label="Mobile navigation">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      link.active
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={link.active ? 'page' : undefined}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10" id="main-content">
        {children}
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/* About Section - Above Footer */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-indigo-50/80 via-white/80 to-purple-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                About ToolHubX
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                A free, HMRC-compliant UK tax calculator built by a UK veteran to help people understand their taxes and plan their finances with confidence.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Accurate Calculations</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">HMRC-compliant algorithms ensure precise tax calculations for 2024-2025</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Educational Resources</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Comprehensive guides and articles to help you understand UK taxation</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Community Feedback</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Your input helps us improve and add new features continuously</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ChevronUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Always Free</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">No hidden costs, no subscriptions - professional tax tools accessible to everyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/95 text-white py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">ToolHubX</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                Professional UK tax calculation tools designed for accuracy, privacy, and ease of use. 
                Built by tax professionals for everyone who needs to understand their take-home pay.
              </p>
              <p className="text-sm text-gray-400">
                © 2024 ToolHubX. All rights reserved. HMRC-compliant calculations for UK taxation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Tax Calculator</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog & Guides</Link></li>
                <li><Link href="/feedback" className="text-gray-300 hover:text-white transition-colors">Feedback</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog/category/tax-basics" className="text-gray-300 hover:text-white transition-colors">Tax Basics</Link></li>
                <li><Link href="/blog/category/tax-tips" className="text-gray-300 hover:text-white transition-colors">Tax Tips</Link></li>
                <li><Link href="/blog/category/personal-finance" className="text-gray-300 hover:text-white transition-colors">Personal Finance</Link></li>
                <li><a href="https://gov.uk/income-tax" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Official HMRC Info</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
