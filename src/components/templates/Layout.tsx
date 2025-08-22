// src/components/templates/Layout.tsx
'use client';

import type React from 'react';
import { Suspense } from 'react';
import SimpleNavbar from '@/components/molecules/SimpleNavbar';
import Footer from '@/components/molecules/Footer';
import CookieBanner from '@/components/ui/CookieBanner';
import SustainabilityBadge from '@/components/ui/SustainabilityBadge';

interface LayoutProps {
  children: React.ReactNode;
  showScrollTop?: boolean;
}

export function Layout({ children, showScrollTop = true }: LayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content for screen readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Navigation - Fixed at top */}
      <SimpleNavbar />
      
      {/* Main content with proper spacing for fixed navbar */}
      <main id="main-content" className="relative flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

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
