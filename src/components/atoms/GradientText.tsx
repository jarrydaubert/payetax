// src/components/atoms/GradientText.tsx

import type React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  /**
   * Gradient variant to apply
   * - 'brand': Simple gradient from start to end
   * - 'brand-full': Full gradient with accent in the middle
   * - 'custom': Use custom gradient classes via className
   */
  variant?: 'brand' | 'brand-full' | 'custom';
  /**
   * HTML element to render as
   */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  /**
   * Additional classes to apply
   */
  className?: string;
}

/**
 * GradientText Component
 *
 * Applies brand gradient to text with transparent background clipping.
 * Eliminates duplication of gradient class strings across the codebase.
 *
 * @example
 * ```tsx
 * <GradientText variant="brand">Tax Calculations</GradientText>
 * <GradientText variant="brand-full" as="h1">Welcome</GradientText>
 * ```
 */
export function GradientText({
  children,
  variant = 'brand',
  as: Component = 'span',
  className,
}: GradientTextProps) {
  const gradientClasses = {
    brand: 'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end',
    'brand-full':
      'bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end',
    custom: '', // User provides gradient via className
  };

  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent',
        variant !== 'custom' && gradientClasses[variant],
        className,
      )}
    >
      {children}
    </Component>
  );
}
