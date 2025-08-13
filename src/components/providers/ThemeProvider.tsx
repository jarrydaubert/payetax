/**
 * src/components/providers/ThemeProvider.tsx
 *
 * Dark mode only theme provider - no theme switching
 * Forces dark mode across the entire application
 */

'use client';

import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * The ThemeProvider component wraps the application with dark mode only
 * 
 * CHANGED: No longer supports theme switching - always dark mode
 * This provides a consistent, premium dark experience
 *
 * @param props The props passed to the theme provider, including children
 * @returns The theme provider component locked to dark mode
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // State to track if component has mounted on client
  const [mounted, setMounted] = useState(false);

  // Set mounted state once component has mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent theme flashing before client-side hydration
  if (!mounted) {
    // Return children with dark class applied during SSR
    return <div className="dark">{children}</div>;
  }

  return (
    <NextThemesProvider
      attribute="class" // Use class attribute for theme
      defaultTheme="dark" // Always dark mode
      enableSystem={false} // Disable system theme detection
      disableTransitionOnChange={false} // Allow transitions
      forcedTheme="dark" // Force dark mode always
      {...props} // Pass any additional props
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
