// src/components/ui/Typography.tsx
/**
 * Standardized typography system for consistent text styling across the application
 *
 * DESIGN PRINCIPLES:
 * - Mobile-first responsive design
 * - Consistent spacing and hierarchy
 * - Accessibility-focused with semantic HTML
 * - Glass morphism theme integration
 */

import type React from 'react';
import { cn } from '@/lib/utils';

// Typography variant definitions
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextVariant = 'body' | 'small' | 'large' | 'caption' | 'lead';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

/**
 * Base text component props
 */
interface BaseTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  muted?: boolean;
}

/**
 * Heading component props
 */
export interface HeadingProps extends BaseTextProps {
  level: HeadingLevel;
  as?: HeadingLevel; // Override semantic element
}

/**
 * Text component props
 */
export interface TextProps extends BaseTextProps {
  as?: 'p' | 'span' | 'div';
}

/**
 * Typography styles mapping
 */
const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
  h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug',
  h4: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  h5: 'text-lg md:text-xl lg:text-2xl font-medium leading-snug',
  h6: 'text-base md:text-lg lg:text-xl font-medium leading-normal',
};

const textVariantStyles: Record<TextVariant, string> = {
  lead: 'text-xl md:text-2xl leading-relaxed',
  large: 'text-lg md:text-xl leading-relaxed',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-tight',
};

const weightStyles: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignStyles: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Standardized heading component
 */
export function Heading({
  level,
  as,
  children,
  className,
  weight,
  align = 'left',
  muted = false,
  ...props
}: HeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const Component = as || level;

  const styles = cn(
    headingStyles[level],
    weight && weightStyles[weight],
    alignStyles[align],
    muted ? 'text-gray-400' : 'text-white',
    className
  );

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
}

/**
 * Standardized text component
 */
export function Text({
  as = 'p',
  variant = 'body',
  weight = 'normal',
  align = 'left',
  muted = false,
  children,
  className,
  ...props
}: TextProps & React.HTMLAttributes<HTMLElement>) {
  const Component = as;

  const styles = cn(
    textVariantStyles[variant],
    weightStyles[weight],
    alignStyles[align],
    muted ? 'text-gray-400' : 'text-gray-300',
    className
  );

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
}

/**
 * Convenience components for common use cases
 */
export const H1 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h1' {...props} />;
export const H2 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h2' {...props} />;
export const H3 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h3' {...props} />;
export const H4 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h4' {...props} />;
export const H5 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h5' {...props} />;
export const H6 = (props: Omit<HeadingProps, 'level'>) => <Heading level='h6' {...props} />;

export const BodyText = (props: Omit<TextProps, 'variant'>) => <Text variant='body' {...props} />;
export const SmallText = (props: Omit<TextProps, 'variant'>) => <Text variant='small' {...props} />;
export const LargeText = (props: Omit<TextProps, 'variant'>) => <Text variant='large' {...props} />;
export const CaptionText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant='caption' {...props} />
);
export const LeadText = (props: Omit<TextProps, 'variant'>) => <Text variant='lead' {...props} />;
