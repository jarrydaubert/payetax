// src/components/ui/ThemeToggle.tsx
/**
 * Theme toggle component for switching between light, dark, and system modes
 *
 * This client component provides an accessible UI for users to control
 * their theme preference across the application.
 *
 * @module components/ui/ThemeToggle
 */

'use client';

import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/themeStore';

/**
 * Theme toggle button component
 * Provides accessible controls to switch between light, dark and system themes
 *
 * @returns A theme toggle component with three mode buttons
 */
const ThemeToggle: React.FC = (): React.ReactElement | null => {
  const { theme, setTheme } = useThemeStore();
  const { setTheme: setNextTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync Zustand state with next-themes
  useEffect(() => {
    setNextTheme(theme);
  }, [theme, setNextTheme]);

  // Wait for component to be mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a placeholder during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <div
        className="w-[100px] h-[36px] bg-glass-l3 rounded-full animate-pulse"
        aria-hidden="true"
      />
    );
  }

  /**
   * Sets the theme to light mode
   */
  const setLightTheme = (): void => {
    setTheme('light');
  };

  /**
   * Sets the theme to dark mode
   */
  const setDarkTheme = (): void => {
    setTheme('dark');
  };

  /**
   * Sets the theme to system preference
   */
  const setSystemTheme = (): void => {
    setTheme('system');
  };

  return (
    <fieldset className="relative flex items-center justify-center glass-card-l3 backdrop-blur-glass-sm rounded-full p-1 border-glass shadow-glass-sm transition-all duration-300 hover:shadow-glass overflow-hidden border-0">
      <legend className="sr-only">Theme selection</legend>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5 -z-10" aria-hidden="true" />

      {/* Light mode button */}
      <button
        type="button"
        onClick={setLightTheme}
        className={cn(
          'p-2 rounded-full transition-all duration-300',
          theme === 'light'
            ? 'bg-glass-l2 text-primary glow-sm scale-110'
            : 'text-foreground/70 hover:text-foreground hover:bg-glass-l2 hover:scale-105'
        )}
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <SunIcon className="h-4 w-4 transition-transform duration-300" aria-hidden="true" />
      </button>

      {/* Dark mode button */}
      <button
        type="button"
        onClick={setDarkTheme}
        className={cn(
          'p-2 rounded-full transition-all duration-300',
          theme === 'dark'
            ? 'bg-glass-l2 text-primary glow-sm scale-110'
            : 'text-foreground/70 hover:text-foreground hover:bg-glass-l2 hover:scale-105'
        )}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <MoonIcon className="h-4 w-4 transition-transform duration-300" aria-hidden="true" />
      </button>

      {/* System preference button */}
      <button
        type="button"
        onClick={setSystemTheme}
        className={cn(
          'p-2 rounded-full transition-all duration-300',
          theme === 'system'
            ? 'bg-glass-l2 text-primary glow-sm scale-110'
            : 'text-foreground/70 hover:text-foreground hover:bg-glass-l2 hover:scale-105'
        )}
        aria-label="System preference"
        aria-pressed={theme === 'system'}
      >
        <LaptopIcon className="h-4 w-4 transition-transform duration-300" aria-hidden="true" />
      </button>
    </fieldset>
  );
};

export default ThemeToggle;
