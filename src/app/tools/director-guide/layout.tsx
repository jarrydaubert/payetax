// src/app/tools/director-guide/layout.tsx
/**
 * Custom layout for Director Guide - Full screen dashboard without header/footer
 *
 * This overrides the default Layout template to provide an immersive
 * dashboard experience matching the mockup design.
 */

import { Suspense } from 'react';
import CookieBanner from '@/components/organisms/CookieBanner';

export default function DirectorGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-screen bg-slate-950'>
      {/* Skip link for accessibility */}
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-cyan-500 focus:px-4 focus:py-2 focus:text-slate-950'
      >
        Skip to main content
      </a>

      {/* Main content - full screen */}
      <main id='main-content' className='h-screen'>
        {children}
      </main>

      {/* Cookie Banner - still need GDPR compliance */}
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>
    </div>
  );
}
