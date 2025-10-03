// src/components/templates/Layout.tsx
'use client';

import type React from 'react';
import { Suspense, useId } from 'react';
import Footer from '@/components/molecules/Footer';
import SimpleNavbar from '@/components/molecules/SimpleNavbar';
import CookieBanner from '@/components/ui/CookieBanner';
import SustainabilityBadge from '@/components/ui/SustainabilityBadge';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.ReactElement {
  const mainContentId = useId();
  const mainLabelId = useId();

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Skip to main content for screen readers */}
      <a href={`#${mainContentId}`} className='skip-link'>
        Skip to main content
      </a>

      {/* Navigation - Fixed at top */}
      <header>
        <SimpleNavbar />
      </header>

      {/* Main content with proper spacing for fixed navbar */}
      <main id={mainContentId} className='relative flex-1' aria-labelledby={mainLabelId}>
        <h1 id={mainLabelId} className='sr-only'>
          Main Content
        </h1>
        {children}
      </main>

      {/* Footer */}
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
