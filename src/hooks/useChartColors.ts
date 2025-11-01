/**
 * useChartColors Hook
 *
 * Gets computed CSS variable values for chart text/axis colors.
 * Recharts doesn't directly evaluate CSS variables from strings like 'hsl(var(--muted-foreground))'.
 * This hook reads the actual computed values and updates when theme changes.
 */

import { useEffect, useState } from 'react';

interface ChartColors {
  foreground: string;
  mutedForeground: string;
  border: string;
  primary: string;
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>({
    foreground: 'hsl(0, 0%, 15%)', // Fallback light mode
    mutedForeground: 'hsl(0, 0%, 45%)',
    border: 'hsl(0, 0%, 90%)',
    primary: 'hsl(0, 0%, 20%)',
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      // Read actual computed values from CSS variables
      const foreground = style.getPropertyValue('--foreground').trim();
      const mutedForeground = style.getPropertyValue('--muted-foreground').trim();
      const border = style.getPropertyValue('--border').trim();
      const primary = style.getPropertyValue('--primary').trim();

      // Convert OKLCH to usable format for Recharts
      // Recharts needs actual color values, not CSS variables
      setColors({
        foreground: foreground ? `oklch(${foreground})` : 'hsl(0, 0%, 15%)',
        mutedForeground: mutedForeground ? `oklch(${mutedForeground})` : 'hsl(0, 0%, 45%)',
        border: border ? `oklch(${border})` : 'hsl(0, 0%, 90%)',
        primary: primary ? `oklch(${primary})` : 'hsl(0, 0%, 20%)',
      });
    };

    // Initial update
    updateColors();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')
        ) {
          updateColors();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
