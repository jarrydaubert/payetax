/**
 * RateLabel Component
 *
 * Displays labeled rate values (e.g., "Effective Rate: 25.3%").
 * Extracted as part of PAYTAX-90 atomic design refactoring.
 *
 * @example
 * ```tsx
 * <RateLabel label="Effective Rate" rate={25.3} />
 * <RateLabel label="Marginal Rate" rate={40} inline />
 * <RateLabel label="NI Rate" rate={8} variant="muted" />
 * ```
 */

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export interface RateLabelProps {
  /** The label text (e.g., "Effective Rate") */
  label: string;
  /** The rate value as a number (will be formatted as percentage) */
  rate: number;
  /** Display inline (default: false for block display) */
  inline?: boolean;
  /** Number of decimal places (default: 1) */
  precision?: number;
  /** Visual variant */
  variant?: 'default' | 'muted' | 'accent';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a label with associated rate percentage
 */
export function RateLabel({
  label,
  rate,
  inline = false,
  precision = 1,
  variant = 'default',
  className,
}: RateLabelProps): React.ReactElement {
  const formattedRate = rate.toFixed(precision);

  const variantClasses = {
    default: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-primary',
  };

  const containerClass = inline
    ? 'inline-flex items-center gap-2'
    : 'flex items-center justify-between';

  return (
    <div className={cn(containerClass, className)}>
      <span className={cn('font-medium', TYPOGRAPHY.TEXT_SM, variantClasses[variant])}>
        {label}:
      </span>
      <span className={cn('font-mono font-semibold', TYPOGRAPHY.TEXT_SM, variantClasses[variant])}>
        {formattedRate}%
      </span>
    </div>
  );
}

export default RateLabel;
