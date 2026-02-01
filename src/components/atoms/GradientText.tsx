import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const GRADIENT_CLASSES = {
  brand: 'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end',
  'brand-full': 'bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end',
} as const;

type GradientVariant = keyof typeof GRADIENT_CLASSES | 'custom';

type AllowedElements = 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

type GradientTextProps<T extends AllowedElements = 'span'> = {
  children: ReactNode;
  /**
   * Gradient variant to apply
   * - 'brand': Simple gradient from start to end
   * - 'brand-full': Full gradient with accent in the middle
   * - 'custom': Use custom gradient classes via className (must include bg-gradient-*)
   */
  variant?: GradientVariant;
  /**
   * HTML element to render as
   */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'children'>;

/**
 * GradientText Component
 *
 * Applies brand gradient to text with transparent background clipping.
 * Eliminates duplication of gradient class strings across the codebase.
 *
 * Note: Gradient text can reduce contrast. Use primarily for headings/hero copy,
 * not long paragraphs. In forced-colors mode, text falls back to foreground color.
 *
 * @example
 * ```tsx
 * <GradientText variant="brand">Tax Calculations</GradientText>
 * <GradientText variant="brand-full" as="h1" id="hero-title">Welcome</GradientText>
 * ```
 */
export function GradientText<T extends AllowedElements = 'span'>({
  children,
  variant = 'brand',
  as,
  className,
  ...props
}: GradientTextProps<T>) {
  const Component = (as ?? 'span') as ElementType;

  const gradientClass = variant === 'custom' ? undefined : GRADIENT_CLASSES[variant];

  // For 'custom', only apply clip/transparent if className likely contains a gradient
  const hasGradient = variant !== 'custom' || className?.includes('bg-gradient');

  return (
    <Component
      className={cn(
        'inline-block',
        hasGradient && 'bg-clip-text text-transparent',
        // Forced-colors fallback: text becomes visible foreground color
        'forced-colors:bg-none forced-colors:text-[CanvasText]',
        gradientClass,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export type { GradientTextProps };
