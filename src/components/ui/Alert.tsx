'use client';

/**
 * Alert component for displaying important messages, notifications, and feedback.
 *
 * Features:
 * - Multiple semantic variants (info, success, warning, error)
 * - Customizable icon and title
 * - ARIA attributes for accessibility
 * - Responsive design
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Alert variants representing different message types
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Props for the Alert component
 */
export interface AlertProps {
  /** Alert content */
  children: React.ReactNode;
  /** Alert variant/type affecting colors and styling */
  variant?: AlertVariant;
  /** Optional title for the alert */
  title?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional ID for targeting with CSS or ARIA */
  id?: string;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
}

/**
 * Reusable alert component for displaying important messages
 * Used across about, privacy, and feedback pages
 *
 * @example
 * ```tsx
 * // Basic info alert
 * <Alert>This is an informational message</Alert>
 *
 * // Warning alert with title
 * <Alert variant="warning" title="Warning">Something needs attention</Alert>
 *
 * // Error alert
 * <Alert variant="error">An error occurred</Alert>
 * ```
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  className,
  id,
  dismissible = false,
  onDismiss,
}: AlertProps): React.ReactElement => {
  // Determine styling based on variant
  const variantStyles = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-300',
      content: 'text-blue-700 dark:text-blue-300',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: 'text-green-500 dark:text-green-400',
      title: 'text-green-800 dark:text-green-300',
      content: 'text-green-700 dark:text-green-300',
    },
    warning: {
      container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      icon: 'text-amber-500 dark:text-amber-400',
      title: 'text-amber-800 dark:text-amber-300',
      content: 'text-amber-700 dark:text-amber-300',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-500 dark:text-red-400',
      title: 'text-red-800 dark:text-red-300',
      content: 'text-red-700 dark:text-red-300',
    },
  };

  // Default icons based on variant if none provided
  const defaultIcon = React.useMemo(() => {
    if (icon) return icon;

    switch (variant) {
      case 'info':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Information Icon</title>
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'success':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Success Icon</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Warning Icon</title>
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Error Icon</title>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  }, [variant, icon]);

  // Generate a unique ID if one isn't provided
  const alertId = id || `alert-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div
      id={alertId}
      className={cn('p-4 border-l-4 rounded-md', variantStyles[variant].container, className)}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start">
        {defaultIcon && (
          <div className={cn('flex-shrink-0 mr-3', variantStyles[variant].icon)}>{defaultIcon}</div>
        )}
        <div className="flex-1">
          {title && (
            <h3
              className={cn('text-sm font-medium mb-1', variantStyles[variant].title)}
              id={`${alertId}-title`}
            >
              {title}
            </h3>
          )}
          <div className={cn('text-sm', variantStyles[variant].content)} id={`${alertId}-content`}>
            {children}
          </div>
        </div>

        {dismissible && onDismiss && (
          <button
            type="button"
            className={cn(
              'flex-shrink-0 ml-2 p-1 rounded-full',
              'hover:bg-white/20 dark:hover:bg-black/20 focus:outline-none focus:ring-2',
              'focus:ring-offset-2 transition-colors',
              `focus:ring-${variant === 'info' ? 'blue' : variant === 'success' ? 'green' : variant === 'warning' ? 'amber' : 'red'}-500`
            )}
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
