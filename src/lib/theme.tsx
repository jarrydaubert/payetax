// src/lib/theme.tsx
'use client';

import { useEffect } from 'react';

/**
 * Theme provider for the light-first Ledger skin.
 * Keeps the SSR-selected theme unless a deliberate .dark class is present.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');

    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  return children;
}
