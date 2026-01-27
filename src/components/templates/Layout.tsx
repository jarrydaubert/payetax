// src/components/templates/Layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { Suspense } from 'react';
import BackgroundElements from '@/components/atoms/BackgroundElements';
import Footer from '@/components/molecules/Footer';
import CookieBanner from '@/components/organisms/CookieBanner';
import SimpleNavbar from '@/components/organisms/SimpleNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

/** Routes that should be full-screen without header/footer */
const FULL_SCREEN_ROUTES = ['/tools/director-guide'];

export function Layout({ children }: LayoutProps): React.ReactElement {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_ROUTES.some((route) => pathname?.startsWith(route));

  // Full-screen mode: no header, footer, or background elements
  if (isFullScreen) {
    return (
      <div className='relative min-h-screen'>
        <a href='#main-content' className='skip-link'>
          Skip to main content
        </a>
        {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for skip-link accessibility */}
        <main id='main-content' className='h-screen'>
          {children}
        </main>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </div>
    );
  }

  return (
    <div className='relative flex min-h-screen flex-col bg-deep'>
      {/* Background geometric elements */}
      <BackgroundElements />

      {/* Skip to main content for screen readers */}
      <a href='#main-content' className='skip-link'>
        Skip to main content
      </a>

      {/* Navigation - Fixed at top */}
      <header>
        <SimpleNavbar />
      </header>

      {/* Main content with proper spacing for fixed navbar */}
      {/* biome-ignore lint/correctness/useUniqueElementIds: Static ID required for skip-link accessibility */}
      <main id='main-content' className='relative flex-1' aria-label='Main Content'>
        {children}
      </main>

      {/* Footer - Template owns semantic <footer> tag */}
      <footer>
        <Footer />
      </footer>

      {/* Cookie Banner - GDPR Compliance */}
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </div>
  );
}

export default Layout;
