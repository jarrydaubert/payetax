// src/components/ui/Button.tsx
/**
 * Reusable button component with standardized styling and variants
 *
 * Features:
 * - Multiple style variants (primary, secondary, outline, etc.)
 * - Size variations
 * - Support for icons
 * - Link mode (renders as Next.js Link)
 * - Accessible attributes
 * - Consistent styling API
 */

import Link from 'next/link';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button style variants
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'glass';

/**
 * Button size variants
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for Button component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: React.ReactNode;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size variant */
  size?: ButtonSize;
  /** Optional icon to display before text */
  leftIcon?: React.ReactNode;
  /** Optional icon to display after text */
  rightIcon?: React.ReactNode;
  /** Whether button is full width */
  fullWidth?: boolean;
  /** Optional href (renders as Link instead of button) */
  href?: string;
  /** External link flag - adds target="_blank" and rel="noopener noreferrer" */
  external?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Standardized button component used across pages
 * Can render as either a button or a Link component
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button>Click me</Button>
 *
 * // Secondary button with icon
 * <Button variant="secondary" leftIcon={<Icon />}>With Icon</Button>
 *
 * // Button as link
 * <Button href="/about">Go to About</Button>
 *
 * // External link
 * <Button href="https://example.com" external>External Link</Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      href,
      external = false,
      className,
      ...props
    },
    ref
  ): React.ReactElement => {
    // Variant styles mapping
    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'relative overflow-hidden text-white shadow-sm hover:shadow-md',
      secondary:
        'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
      outline:
        'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
      ghost:
        'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
      link: 'bg-transparent p-0 h-auto text-blue-600 hover:underline dark:text-blue-400',
      glass: 'glass-btn backdrop-blur-glass-sm hover:shadow-glass transition-all',
    };

    // Size styles mapping
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Button base styles
    const buttonStyles = cn(
      'font-medium rounded-lg inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none',
      variant !== 'link' && sizeStyles[size],
      variantStyles[variant],
      fullWidth && 'w-full',
      className
    );

    // Gradient background for primary button
    const gradientBackground = variant === 'primary' && (
      <span
        className="absolute inset-0 -z-10 opacity-90 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6, #d946ef)',
          backgroundSize: '200% 200%',
          animation: 'gradient-animation 4s ease infinite',
        }}
        aria-hidden="true"
      />
    );

    // If href is provided, render as Link
    if (href) {
      return (
        <Link
          href={href}
          className={cn(buttonStyles, 'group')}
          {...(external
            ? {
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-label': `${children} (opens in a new tab)`,
              }
            : {})}
        >
          {gradientBackground}
          {leftIcon && (
            <span className="mr-2" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <span>{children}</span>
          {rightIcon && (
            <span className="ml-2" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </Link>
      );
    }

    // Otherwise render as button
    return (
      <button
        ref={ref}
        className={cn(buttonStyles, 'group')}
        type={props.type || 'button'}
        {...props}
      >
        {gradientBackground}
        {leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

// Display name for React DevTools
Button.displayName = 'Button';

export default Button;
