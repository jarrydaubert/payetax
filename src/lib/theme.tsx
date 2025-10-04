// src/lib/theme.tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Resolve theme (system → actual theme)
  const resolveTheme = useCallback(
    (t: Theme): 'light' | 'dark' => {
      if (t === 'system') return getSystemTheme();
      return t;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((t: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    root.style.colorScheme = t;
    root.setAttribute('data-theme', t);
  }, []);

  // Set theme with localStorage and GA4 tracking
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Track theme change in GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'theme_toggle', {
        event_category: 'engagement',
        event_label: newTheme,
        value: newTheme === 'system' ? getSystemTheme() : newTheme,
      });
    }
  };

  // Cycle through themes: Current → Next in cycle
  const cycleTheme = () => {
    const cycle: Record<Theme, Theme> = {
      system: 'light',
      light: 'dark',
      dark: 'system',
    };
    setTheme(cycle[theme]);
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get stored theme or default to system
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || 'system';

    setThemeState(initial);
    const resolved = resolveTheme(initial);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Listen for theme changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);
        const resolved = resolveTheme(newTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [theme, applyTheme, getSystemTheme, resolveTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
