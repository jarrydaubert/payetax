'use client';

import { Calendar } from 'lucide-react';
import { useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import { cn } from '@/lib/utils';

interface TaxYearSelectProps {
  /** Currently selected tax year */
  value: TaxYear;
  /** Callback when tax year changes */
  onChange: (value: TaxYear) => void;
  /** Element ID for accessibility */
  id?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /**
   * Visible label text. Required for accessibility unless aria-label is provided.
   */
  label?: string;
  /**
   * Whether the label should be visually hidden (still read by screen readers)
   */
  hideLabel?: boolean;
  /**
   * Fallback accessible name when label is not visible.
   * Required when hideLabel is true or label is omitted.
   */
  'aria-label'?: string;
  /** Stable hook for end-to-end tests */
  'data-testid'?: string;
}

/**
 * Tax Year Select component
 *
 * Accessible dropdown for selecting the tax year.
 * Uses aria-labelledby for proper screen reader association (not htmlFor,
 * which doesn't reliably work with Radix Select buttons).
 *
 * @example
 * ```tsx
 * // With visible label
 * <TaxYearSelect
 *   value={taxYear}
 *   onChange={setTaxYear}
 *   label="Tax Year"
 * />
 *
 * // With hidden label
 * <TaxYearSelect
 *   value={taxYear}
 *   onChange={setTaxYear}
 *   label="Tax Year"
 *   hideLabel
 * />
 *
 * // Standalone with aria-label
 * <TaxYearSelect
 *   value={taxYear}
 *   onChange={setTaxYear}
 *   aria-label="Select tax year"
 * />
 * ```
 */
export default function TaxYearSelect({
  value,
  onChange,
  id,
  className,
  disabled = false,
  label = 'Tax Year',
  hideLabel = false,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: TaxYearSelectProps) {
  const uniqueId = useId();
  const selectId = id ?? `tax-year-select-${uniqueId}`;
  const labelId = `${selectId}-label`;

  // Determine accessible name: prefer aria-labelledby, fallback to aria-label
  const accessibleName = label ? labelId : undefined;
  const fallbackAriaLabel = ariaLabel ?? (hideLabel ? label : undefined);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          id={labelId}
          // htmlFor provides click-to-focus, but real a11y is via aria-labelledby on trigger
          htmlFor={selectId}
          className={cn(
            'mb-1 block font-medium text-foreground',
            'text-sm',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}

      <Select value={value} onValueChange={(v) => onChange(v as TaxYear)} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          aria-labelledby={accessibleName}
          aria-label={accessibleName ? undefined : fallbackAriaLabel}
          className='w-full'
          data-testid={dataTestId}
        >
          <div className='flex items-center gap-2'>
            <Calendar className='size-4 text-foreground/70' aria-hidden='true' />
            <SelectValue placeholder='Select tax year' />
          </div>
        </SelectTrigger>
        <SelectContent>
          {TAX_YEARS.map((taxYear) => (
            <SelectItem key={taxYear} value={taxYear}>
              {taxYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
