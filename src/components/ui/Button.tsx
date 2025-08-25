// src/components/ui/Button.tsx
/**
 * Reusable button component with standardized styling and variants
 *
 * DESIGN SYSTEM INTEGRATION:
 * - Uses globals.css .btn classes exclusively
 * - Follows glass morphism design patterns
 * - Consistent with ToolHubX gradient theme
 * - Supports both button and Link rendering
 *
 * ACCESSIBILITY FEATURES:
 * - Proper ARIA attributes
 * - Keyboard navigation support
 * - Screen reader optimized
 * - Focus management
 */

import Link from 'next/link';
import type React from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import type { Route } from '@/types/routes';

/**
 * Button style variants - maps directly to globals.css classes
 * Each variant corresponds to a .btn-* class in the design system
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';

/**
 * Button size variants with responsive considerations
 * Designed mobile-first with appropriate touch targets
 */
type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Comprehensive props interface with full TypeScript safety
 * Extends HTMLButtonElement props while adding our custom properties
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content - can be text, JSX, or React nodes */
  children: React.ReactNode;

  /** Visual variant affecting styling via globals.css classes */
  variant?: ButtonVariant;

  /** Size variant for different use cases */
  size?: ButtonSize;

  /** Icon displayed before button text with proper spacing */
  leftIcon?: React.ReactNode;

  /** Icon displayed after button text with proper spacing */
  rightIcon?: React.ReactNode;

  /** Whether button should take full width of container */
  fullWidth?: boolean;

  /** If provided, renders as Next.js Link instead of button */
  href?: Route;

  /** External link handling - adds security attributes */
  external?: boolean;

  /** Additional CSS classes for customization */
  className?: string;

  /** Loading state for async operations */
  loading?: boolean;

  /** Custom aria-label for accessibility */
  'aria-label'?: string;
}

/**
 * Standardized button component following ToolHubX design system
 *
 * USAGE EXAMPLES:
 *
 * Basic button:
 * <Button>Click me</Button>
 *
 * Primary action with icon:
 * <Button variant="primary" leftIcon={<Save />}>Save Changes</Button>
 *
 * Navigation link:
 * <Button href="/about">Learn More</Button>
 *
 * External link with security:
 * <Button href="https://example.com" external>External Site</Button>
 *
 * Loading state:
 * <Button loading disabled>Processing...</Button>
 *
 * @param props - Button component props
 * @param ref - Forwarded ref for button element
 * @returns Accessible button or link component
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
      loading = false,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ): React.ReactElement => {
    const externalWarningId = useId();
    /**
     * Base button classes from globals.css
     * All styling comes from the design system
     */
    const baseClasses = 'btn';

    /**
     * Variant classes mapping to globals.css .btn-* classes
     * Ensures consistency across the application
     */
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      glass: 'btn-glass',
    };

    /**
     * Size classes for responsive design
     * Mobile-first approach with appropriate touch targets
     */
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-small px-3 py-1.5 min-h-[2rem]', // 32px min height
      md: 'text-body px-4 py-2 min-h-[2.5rem]', // 40px min height
      lg: 'text-large px-6 py-3 min-h-[3rem]', // 48px min height
    };

    /**
     * Combined button styles with proper precedence
     * Order matters for CSS specificity
     */
    const buttonStyles = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      loading && 'cursor-not-allowed opacity-75',
      className
    );

    /**
     * Button content with proper icon spacing and accessibility
     * Icons are marked as decorative (aria-hidden)
     */
    const buttonContent = (
      <>
        {leftIcon && !loading && (
          <span className='mr-2 flex-shrink-0' aria-hidden='true'>
            {leftIcon}
          </span>
        )}
        {loading && (
          <span className='mr-2 flex-shrink-0' aria-hidden='true'>
            <svg
              className='h-4 w-4 animate-spin'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              aria-label='Loading'
            >
              <title>Loading</title>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          </span>
        )}
        <span className={loading ? 'opacity-75' : ''}>{children}</span>
        {rightIcon && !loading && (
          <span className='ml-2 flex-shrink-0' aria-hidden='true'>
            {rightIcon}
          </span>
        )}
      </>
    );

    /**
     * Link rendering for navigation
     * Includes security attributes for external links
     */
    if (href) {
      return (
        <Link
          href={href}
          className={buttonStyles}
          aria-label={ariaLabel}
          {...(external
            ? {
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-describedby': externalWarningId,
              }
            : {})}
        >
          {buttonContent}
          {external && (
            <span id={externalWarningId} className='sr-only'>
              (opens in a new tab)
            </span>
          )}
        </Link>
      );
    }

    /**
     * Button rendering with full accessibility support
     * Includes loading state management and ARIA attributes
     */
    return (
      <button
        ref={ref}
        className={buttonStyles}
        type={props.type || 'button'}
        disabled={props.disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

// Display name for React DevTools debugging
Button.displayName = 'Button';

export default Button;
