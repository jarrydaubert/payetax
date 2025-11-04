// src/components/atoms/TaxYearSelect.tsx
// Modern select component for tax year selection with enhanced accessibility and glassmorphic styling

import { Calendar } from 'lucide-react';
import type React from 'react';
import { memo, useId } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
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
  /** Optional label text */
  label?: string;
  /** Whether the label should be visually hidden */
  hideLabel?: boolean;
}

/**
 * Tax Year Select component
 * Enhanced dropdown for selecting the tax year with improved accessibility and glassmorphic styling
 *
 * Performance: Memoized with React 19 - static most of the time, only re-renders on value change
 */
const TaxYearSelect: React.FC<TaxYearSelectProps> = memo(function TaxYearSelect({
  value,
  onChange,
  id,
  className,
  disabled = false,
  label = 'Tax Year',
  hideLabel = false,
}) {
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const selectId = id || `tax-year-select-${uniqueId}`;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className={cn(
            'mb-1 block font-medium text-foreground',
            TYPOGRAPHY.TEXT_SM,
            hideLabel && 'sr-only'
          )}
        >
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          aria-labelledby={label ? labelId : undefined}
          className='w-full'
        >
          {/* IMPORTANT: Use flex container with gap-2 (not mr-2 on icon)
              This prevents icon/text wrapping issues. Using margin on the icon
              can cause separation when flex wrapping occurs. Container-level
              gap ensures reliable spacing in all flex scenarios. */}
          <div className='flex items-center gap-2'>
            <Calendar className={cn('text-foreground/70', ICON_SIZES.SIZE_4)} aria-hidden='true' />
            <SelectValue placeholder='Select tax year' />
          </div>
        </SelectTrigger>
        <SelectContent id={listboxId}>
          {TAX_YEARS.map((taxYear) => (
            <SelectItem key={taxYear} value={taxYear}>
              {taxYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

export default TaxYearSelect;
