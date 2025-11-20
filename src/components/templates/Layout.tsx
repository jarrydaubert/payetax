// src/components/templates/Layout.tsx
'use client';

import type React from 'react';
import { Suspense } from 'react';
import CookieBanner from '@/components/atoms/CookieBanner';
import Footer from '@/components/molecules/Footer';
import SustainabilityBadge from '@/components/molecules/SustainabilityBadge';
import SimpleNavbar from '@/components/organisms/SimpleNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.ReactElement {
  return (
    <div className='flex min-h-screen flex-col'>
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

      {/* Sustainability Badge */}
      <SustainabilityBadge />
    </div>
  );
}

export default Layout;
