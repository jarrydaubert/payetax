// src/components/ui/gradient-heading.tsx

import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { cn } from '@/lib/utils';

const gradientHeadingVariants = cva(
  'bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text font-bold text-transparent',
  {
    variants: {
      level: {
        h1: 'text-4xl sm:text-5xl md:text-6xl',
        h2: 'text-4xl md:text-5xl',
        h3: 'text-3xl md:text-4xl',
        h4: 'text-2xl md:text-3xl',
      },
      gradient: {
        default: 'from-brand-gradient-start to-brand-gradient-end',
        accent: 'from-brand-gradient-start via-brand-accent to-brand-gradient-end',
      },
      spacing: {
        none: '',
        sm: 'mb-3',
        md: 'mb-4',
        lg: 'mb-6',
      },
    },
    defaultVariants: {
      level: 'h2',
      gradient: 'default',
      spacing: 'sm',
    },
  }
);

export interface GradientHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof gradientHeadingVariants> {
  /**
   * The heading level (h1, h2, h3, h4)
   * @default 'h2'
   */
  level?: 'h1' | 'h2' | 'h3' | 'h4';
  /**
   * The gradient variant to use
   * @default 'default'
   */
  gradient?: 'default' | 'accent';
  /**
   * Bottom margin spacing
   * @default 'sm'
   */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * The heading content
   */
  children: React.ReactNode;
}

/**
 * GradientHeading component for displaying gradient text headings
 *
 * @example
 * ```tsx
 * <GradientHeading level="h1" gradient="accent" spacing="lg">
 *   Welcome to PayeTax
 * </GradientHeading>
 * ```
 *
 * @example
 * ```tsx
 * <GradientHeading level="h2">
 *   UK Tax Calculator
 * </GradientHeading>
 * ```
 */
export function GradientHeading({
  level = 'h2',
  gradient,
  spacing,
  className,
  children,
  ...props
}: GradientHeadingProps) {
  const Tag = level;

  return (
    <Tag
      className={cn(gradientHeadingVariants({ level, gradient, spacing }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
