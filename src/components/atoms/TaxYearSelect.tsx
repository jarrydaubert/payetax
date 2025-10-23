// src/components/atoms/TaxYearSelect.tsx
// Modern select component for tax year selection with enhanced accessibility and glassmorphic styling

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import type React from 'react';
import { Fragment, useId } from 'react';
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
 */
const TaxYearSelect: React.FC<TaxYearSelectProps> = ({
  value,
  onChange,
  id,
  className,
  disabled = false,
  label = 'Tax Year',
  hideLabel = false,
}) => {
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
          className={cn('mb-1 block font-medium text-foreground text-sm', hideLabel && 'sr-only')}
        >
          {label}
        </label>
      )}

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
                'relative w-full rounded-md border border-input bg-secondary/80 py-2 pr-10 pl-3 text-left shadow-sm backdrop-blur-sm',
                'focus:outline-none focus:ring-1 focus:ring-ring',
                'cursor-default transition-colors duration-200',
                'text-foreground text-sm',
                'disabled:cursor-not-allowed disabled:opacity-50',
                open && 'ring-1 ring-ring'
              )}
            >
              <span className='flex items-center'>
                <Calendar className='mr-2 size-4 text-foreground/70' aria-hidden='true' />
                <span className='block truncate'>{value}</span>
              </span>
              <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                <ChevronDown
                  className={cn(
                    'size-4 text-foreground/50 transition-transform duration-200',
                    open && 'rotate-180 transform'
                  )}
                  aria-hidden='true'
                />
              </span>
            </ListboxButton>

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
                  'absolute z-50 mt-1 w-full overflow-auto bg-popover',
                  'max-h-60 rounded-md border border-input shadow-md',
                  'py-1 text-popover-foreground text-sm focus:outline-none'
                )}
              >
                {TAX_YEARS.map((taxYear) => (
                  <ListboxOption
                    key={taxYear}
                    value={taxYear}
                    className={({ active, selected }) =>
                      cn(
                        'relative cursor-default select-none py-2 pr-4 pl-10',
                        'transition-colors duration-150',
                        active && 'bg-accent text-accent-foreground',
                        selected ? 'font-medium text-primary' : 'text-foreground',
                        // Add focus styles for keyboard navigation
                        'focus:bg-accent focus:text-accent-foreground focus:outline-none'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}
                        >
                          {taxYear}
                        </span>
                        {selected && (
                          <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-primary'>
                            <Check className='size-4' aria-hidden='true' />
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

export default TaxYearSelect;
