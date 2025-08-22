// src/components/ui/Alert.tsx
'use client';

/**
 * Alert component for displaying important messages, notifications, and feedback.
 * Updated to use glass morphism design system for consistency.
 *
 * Features:
 * - Multiple semantic variants (info, success, warning, error)
 * - Glass morphism styling
 * - Customizable icon and title
 * - ARIA attributes for accessibility
 * - Responsive design
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
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
 * Default icons for each variant
 */
const variantIcons: Record<AlertVariant, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
};

/**
 * Reusable alert component for displaying important messages
 * Now using glass morphism styling for consistency
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
  // Determine styling based on variant using CSS variables
  const variantStyles: Record<AlertVariant, string> = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300', 
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  };

  const iconStyles: Record<AlertVariant, string> = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400', 
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <div
      role="alert"
      id={id}
      className={cn(
        'glass-card border rounded-lg p-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex">
        {/* Icon */}
        <div className={cn('flex-shrink-0', iconStyles[variant])}>
          {icon || variantIcons[variant]}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? '' : 'mt-0.5')}>
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                  iconStyles[variant],
                  'hover:bg-black/5 dark:hover:bg-white/5 focus:ring-current'
                )}
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
