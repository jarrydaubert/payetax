// src/components/atoms/PensionContributionInput.tsx
// Modern component for entering pension contributions with improved usability and accessibility

import type React from 'react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import NumberInput from './NumberInput';

interface PensionContributionInputProps {
  /** Current contribution value */
  value: number;
  /** Current input type (percentage or amount) */
  type: 'percentage' | 'amount';
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Callback when type changes */
  onTypeChange: (type: 'percentage' | 'amount') => void;
  /** Additional CSS classes */
  className?: string;
  /** ID for the component */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Pension contribution input component
 * Allows users to enter pension contributions as either a percentage or fixed amount
 * with proper accessibility attributes and modern styling
 */
const PensionContributionInput: React.FC<PensionContributionInputProps> = ({
  value,
  type,
  onChange,
  onTypeChange,
  className,
  id,
  disabled = false,
}) => {
  // State to track which radio is focused for keyboard navigation
  const [focusedOption, setFocusedOption] = useState<string | null>(null);

  // Generate unique IDs for accessibility
  const groupId = id || `pension-contribution-${Math.random().toString(36).substring(2, 9)}`;
  const percentageId = `${groupId}-percentage`;
  const amountId = `${groupId}-amount`;
  const inputId = `${groupId}-input`;
  const descriptionId = `${groupId}-description`;

  // Handle input change - optimized with useCallback
  const handleValueChange = useCallback(
    (newValue: number) => {
      onChange(newValue);
    },
    [onChange]
  );

  // Handle type change - optimized with useCallback
  const handleTypeChange = useCallback(
    (newType: 'percentage' | 'amount') => {
      // Reset value when switching types to avoid confusion
      onChange(0);
      onTypeChange(newType);
    },
    [onChange, onTypeChange]
  );

  // Handle radio focus - for improved keyboard accessibility
  const handleRadioFocus = useCallback((id: string) => {
    setFocusedOption(id);
  }, []);

  // Handle radio blur
  const handleRadioBlur = useCallback(() => {
    setFocusedOption(null);
  }, []);

  return (
    <div className={cn('space-y-2', className)} aria-labelledby={`${groupId}-label`}>
      {/* Type selection radios with semantic HTML */}
      <fieldset className="flex space-x-5" aria-label="Contribution type" disabled={disabled}>
        <legend className="sr-only">Contribution Type</legend>

        <div className="flex items-center">
          <div className="relative">
            <input
              id={percentageId}
              type="radio"
              checked={type === 'percentage'}
              onChange={() => handleTypeChange('percentage')}
              onFocus={() => handleRadioFocus(percentageId)}
              onBlur={handleRadioBlur}
              className={cn(
                'w-4 h-4 text-primary border-border focus:ring-primary',
                'opacity-0 absolute inset-0 z-10 cursor-pointer'
              )}
              aria-labelledby="percentage-label"
              disabled={disabled}
            />
            {/* Custom styled radio */}
            <div
              className={cn(
                'w-4 h-4 rounded-full border transition-colors duration-200',
                'border-gray-400 dark:border-glass',
                type === 'percentage'
                  ? 'border-primary'
                  : focusedOption === percentageId
                    ? 'border-primary/50'
                    : ''
              )}
              aria-hidden="true"
            >
              {type === 'percentage' && (
                <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-primary" />
              )}
            </div>
          </div>
          <label
            id="percentage-label"
            htmlFor={percentageId}
            className={cn(
              'ml-2 block text-sm font-medium cursor-pointer',
              type === 'percentage' ? 'text-foreground' : 'text-foreground/80',
              disabled && 'opacity-70 cursor-not-allowed'
            )}
          >
            Percentage
          </label>
        </div>

        <div className="flex items-center">
          <div className="relative">
            <input
              id={amountId}
              type="radio"
              checked={type === 'amount'}
              onChange={() => handleTypeChange('amount')}
              onFocus={() => handleRadioFocus(amountId)}
              onBlur={handleRadioBlur}
              className={cn(
                'w-4 h-4 text-primary border-border focus:ring-primary',
                'opacity-0 absolute inset-0 z-10 cursor-pointer'
              )}
              aria-labelledby="amount-label"
              disabled={disabled}
            />
            {/* Custom styled radio */}
            <div
              className={cn(
                'w-4 h-4 rounded-full border transition-colors duration-200',
                'border-gray-400 dark:border-glass',
                type === 'amount'
                  ? 'border-primary'
                  : focusedOption === amountId
                    ? 'border-primary/50'
                    : ''
              )}
              aria-hidden="true"
            >
              {type === 'amount' && (
                <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-primary" />
              )}
            </div>
          </div>
          <label
            id="amount-label"
            htmlFor={amountId}
            className={cn(
              'ml-2 block text-sm font-medium cursor-pointer',
              type === 'amount' ? 'text-foreground' : 'text-foreground/80',
              disabled && 'opacity-70 cursor-not-allowed'
            )}
          >
            Amount
          </label>
        </div>
      </fieldset>

      {/* Input field with modern styling and appropriate ARIA attributes */}
      <div className="relative">
        <NumberInput
          id={inputId}
          value={value}
          onChange={handleValueChange}
          prefix={type === 'amount' ? '£' : ''}
          suffix={type === 'percentage' ? '%' : ''}
          decimals={type === 'percentage' ? 1 : 2}
          min={0}
          max={type === 'percentage' ? 100 : undefined}
          className="w-full"
          placeholder={type === 'percentage' ? '5.0' : '0.00'}
          aria-label={`Pension contribution as ${type}`}
          aria-describedby={descriptionId}
          disabled={disabled}
        />
        <p id={descriptionId} className="sr-only">
          {type === 'percentage'
            ? 'Enter percentage of salary to contribute to pension. Values from 0 to 100 percent.'
            : 'Enter fixed amount to contribute to pension.'}
        </p>

        {/* Help text to explain contribution options */}
        <p className="mt-1 text-xs text-foreground/70">
          {type === 'percentage'
            ? 'Percentage of gross salary for pension contribution'
            : 'Fixed amount for pension contribution per payment period'}
        </p>
      </div>
    </div>
  );
};

export default PensionContributionInput;
