/**
 * PercentageDisplay Component
 *
 * Displays percentage values with consistent formatting and optional badge styling.
 * Extracted as part of PAYTAX-90 atomic design refactoring.
 *
 * @example
 * ```tsx
 * <PercentageDisplay value={20} /> // 20%
 * <PercentageDisplay value={0.45} showSign /> // +45%
 * <PercentageDisplay value={-5} variant="warning" /> // -5% (warning color)
 * <PercentageDisplay value={25.5} precision={1} /> // 25.5%
 * ```
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface PercentageDisplayProps {
  /** The percentage value (can be 0-100 or 0-1, auto-detected) */
  value: number;
  /** Show +/- sign for positive/negative values */
  showSign?: boolean;
  /** Number of decimal places (default: 1) */
  precision?: number;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  /** Display as badge (default: false) */
  asBadge?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats and displays percentage values with optional badge styling
 */
export function PercentageDisplay({
  value,
  showSign = false,
  precision = 1,
  variant = 'default',
  asBadge = false,
  className,
}: PercentageDisplayProps): React.ReactElement {
  // Auto-detect if value is 0-1 (convert to percentage)
  const percentValue = value < 1 && value > -1 && value !== 0 ? value * 100 : value;

  // Format the number
  const formatted = percentValue.toFixed(precision);

  // Add sign if requested
  const displayValue = showSign && percentValue > 0 ? `+${formatted}` : formatted;
  const displayText = `${displayValue}%`;

  // Determine color variant based on value if not specified
  const effectiveVariant =
    variant === 'default'
      ? percentValue > 0
        ? 'success'
        : percentValue < 0
          ? 'destructive'
          : 'default'
      : variant;

  if (asBadge) {
    const badgeVariant =
      effectiveVariant === 'success'
        ? 'default'
        : effectiveVariant === 'warning'
          ? 'secondary'
          : effectiveVariant;

    return (
      <Badge variant={badgeVariant} className={className}>
        {displayText}
      </Badge>
    );
  }

  const variantClasses = {
    default: 'text-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400',
  };

  return (
    <span className={cn('font-mono', variantClasses[effectiveVariant], className)}>
      {displayText}
    </span>
  );
}

export default PercentageDisplay;
