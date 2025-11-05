/**
 * CurrencyDisplay Component
 *
 * Displays currency amounts with consistent formatting across the application.
 * Extracted as part of PAYTAX-90 atomic design refactoring.
 *
 * @example
 * ```tsx
 * <CurrencyDisplay amount={30000} /> // £30,000
 * <CurrencyDisplay amount={1234.56} precision={2} /> // £1,234.56
 * <CurrencyDisplay amount={50000} showCurrency={false} /> // 50,000
 * ```
 */

import { cn } from '@/lib/utils';

export interface CurrencyDisplayProps {
  /** The numeric amount to display */
  amount: number;
  /** Whether to show the currency symbol (default: true) */
  showCurrency?: boolean;
  /** Locale for formatting (default: 'en-GB') */
  locale?: string;
  /** Number of decimal places (default: 0 for whole numbers) */
  precision?: number;
  /** Additional CSS classes */
  className?: string;
  /** Variant styling */
  variant?: 'default' | 'large' | 'small' | 'muted';
}

/**
 * Formats and displays currency amounts with UK locale by default
 */
export function CurrencyDisplay({
  amount,
  showCurrency = true,
  locale = 'en-GB',
  precision = 0,
  className,
  variant = 'default',
}: CurrencyDisplayProps): React.ReactElement {
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  const variantClasses = {
    default: 'text-foreground',
    large: 'font-bold text-2xl text-foreground',
    small: 'text-sm text-foreground',
    muted: 'text-muted-foreground',
  };

  return (
    <span className={cn(variantClasses[variant], className)}>
      {showCurrency && '£'}
      {formatted}
    </span>
  );
}

export default CurrencyDisplay;
