// src/lib/theme.tsx
// Dark mode only - no theme switching
'use client';

import { useEffect } from 'react';

/**
 * Theme provider that enforces dark mode.
 * Applies dark theme classes on mount.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    root.setAttribute('data-theme', 'dark');
  }, []);

  return children;
}
