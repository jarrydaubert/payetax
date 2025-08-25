// src/components/atoms/PayPeriodSelect.tsx
/**
 * Pay period selection dropdown with enhanced accessibility and styling
 *
 * A custom select component for choosing pay periods (annually, monthly, etc.)
 * Implemented with Headless UI for optimal accessibility and keyboard navigation
 *
 * @module components/atoms/PayPeriodSelect
 */

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { CalendarRange, Check, ChevronDown } from 'lucide-react';
import type React from 'react';
import { Fragment, useMemo } from 'react';
import { type PayPeriod, PERIODS } from '@/constants/taxRates';
import { cn } from '@/lib/utils';

/**
 * Human-readable labels for pay periods
 */
const PAY_PERIOD_LABELS: Record<PayPeriod, string> = {
  [PERIODS.ANNUALLY]: 'Annually',
  [PERIODS.MONTHLY]: 'Monthly',
  [PERIODS.FOUR_WEEKLY]: 'Four Weekly',
  [PERIODS.FORTNIGHTLY]: 'Fortnightly',
  [PERIODS.WEEKLY]: 'Weekly',
  [PERIODS.DAILY]: 'Daily',
  [PERIODS.HOURLY]: 'Hourly',
};

/**
 * Props for the PayPeriodSelect component
 */
interface PayPeriodSelectProps {
  /** Currently selected pay period value */
  value: PayPeriod;
  /** Callback when pay period changes */
  onChange: (value: PayPeriod) => void;
  /** Element ID for accessibility */
  id?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Optional label text */
  label?: string;
}

/**
 * Pay period selection dropdown component
 * Uses Headless UI for accessibility and keyboard navigation
 *
 * @param props - Component properties
 * @returns A custom dropdown for selecting pay periods
 */
const PayPeriodSelect: React.FC<PayPeriodSelectProps> = ({
  value,
  onChange,
  id,
  className,
  disabled = false,
  label,
}: PayPeriodSelectProps): React.ReactElement => {
  // Use useMemo to prevent unnecessary recalculations
  const payPeriods = useMemo(() => Object.values(PERIODS) as PayPeriod[], []);

  // Generate unique ID for accessibility if not provided
  const selectId = id || `pay-period-select-${Math.random().toString(36).substring(2, 9)}`;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  return (
    <div className={cn('relative', className)}>
      {/* Optional visible label */}
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className='mb-1 block font-medium text-foreground text-sm'
        >
          {label}
        </label>
      )}

      {/* Headless UI Listbox for keyboard-accessible dropdown */}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <div className='relative'>
            <ListboxButton
              id={selectId}
              aria-labelledby={label ? labelId : undefined}
              aria-haspopup='listbox'
              aria-expanded={open}
              aria-controls={listboxId}
              className={cn(
                'glass-input relative w-full rounded-lg py-2 pr-10 pl-3 text-left',
                'border-glass shadow-glass-sm backdrop-blur-glass-sm',
                'focus:glow-sm focus:outline-none focus:ring-1 focus:ring-primary',
                'cursor-default transition-all duration-200',
                'bg-glass-deep text-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50',
                open && 'glow-sm ring-1 ring-primary',
                disabled && 'cursor-not-allowed opacity-70'
              )}
            >
              <span className='flex items-center'>
                <CalendarRange className='mr-2 h-4 w-4 text-foreground/70' aria-hidden='true' />
                <span className='block truncate'>{PAY_PERIOD_LABELS[value] || value}</span>
              </span>
              <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-foreground/50 transition-transform duration-200',
                    open && 'rotate-180 transform'
                  )}
                  aria-hidden='true'
                />
              </span>
            </ListboxButton>

            {/* Dropdown menu with transition effects */}
            <Transition
              as={Fragment}
              show={open}
              enter='transition ease-out duration-200'
              enterFrom='opacity-0 translate-y-2'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 translate-y-2'
            >
              <ListboxOptions
                id={listboxId}
                className={cn(
                  'absolute z-[100] mt-1 w-full overflow-auto bg-glass',
                  'max-h-60 rounded-lg shadow-glass backdrop-blur-glass-sm',
                  'border border-glass py-1 text-foreground focus:outline-none'
                )}
                style={{ maxHeight: '15rem' }} // Explicit height for better UX
              >
                {payPeriods.map((period) => (
                  <ListboxOption
                    key={period}
                    value={period}
                    className={({ active, selected }) =>
                      cn(
                        'relative cursor-default select-none py-2 pr-4 pl-10',
                        'transition-colors duration-150',
                        (active || selected) && 'bg-glass-deep',
                        selected ? 'font-medium text-primary' : 'text-foreground',
                        // Add focus styles for keyboard navigation
                        'focus:bg-glass-deep focus:text-primary focus:outline-none'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}
                        >
                          {PAY_PERIOD_LABELS[period] || period}
                        </span>
                        {selected && (
                          <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-primary'>
                            <Check className='h-4 w-4' aria-hidden='true' />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
};

export default PayPeriodSelect;
