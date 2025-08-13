// src/components/atoms/NumberInput.tsx
/**
 * Enhanced number input component with formatting and controls
 *
 * Provides a customizable input field for numeric values with support for:
 * - Currency formatting with prefix/suffix
 * - Decimal precision control
 * - Increment/decrement controls
 * - Focus behavior customization
 * - Full accessibility support
 *
 * @module components/atoms/NumberInput
 */

import type React from 'react';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { cn, formatNumber, parseFormattedValue } from '@/lib/utils';

/**
 * Props for the NumberInput component
 */
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Current numeric value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Number of decimal places to display */
  decimals?: number;
  /** Optional prefix (e.g., currency symbol) */
  prefix?: string;
  /** Optional suffix (e.g., percentage symbol) */
  suffix?: string;
  /** Whether to clear on focus for easier entry */
  clearOnFocus?: boolean;
  /** Whether to show increment/decrement controls */
  showControls?: boolean;
}

/**
 * Enhanced number input component with formatting and controls
 * Supports currency, percentage, and standard number inputs with accessibility features
 *
 * @param props - Component props including value, onChange, and formatting options
 * @returns A numeric input field with formatting and optional controls
 */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      decimals = 0,
      className,
      prefix,
      suffix,
      clearOnFocus = true,
      showControls = false,
      disabled,
      id,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    // Internal state for the displayed value
    const [displayValue, setDisplayValue] = useState<string>('');

    // State for tracking focus
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Generate unique IDs for accessibility if not provided
    const inputId = useMemo(
      () => id || `number-input-${Math.random().toString(36).substring(2, 9)}`,
      [id]
    );
    const controlsId = `${inputId}-controls`;
    const incrementId = `${inputId}-increment`;
    const decrementId = `${inputId}-decrement`;

    // Format the initial value
    useEffect(() => {
      // Only update display value when not focused to prevent cursor jumping
      if (!isFocused) {
        setDisplayValue(formatNumber(value, decimals));
      }
    }, [value, decimals, isFocused]);

    /**
     * Handle focus event - clear field for better UX if configured
     */
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);

        // Force clear the field completely for better UX
        if (clearOnFocus) {
          e.target.value = '';
          setDisplayValue('');
        }

        // Call original onFocus if provided
        if (onFocus) {
          onFocus(e);
        }
      },
      [clearOnFocus, onFocus]
    );

    /**
     * Handle blur event - parse and format the current input value
     */
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        // Parse and format the current input value
        const numericValue = parseFormattedValue(e.target.value);

        // Update the displayed value
        setDisplayValue(formatNumber(numericValue, decimals));

        // Notify parent of the change
        onChange(numericValue);

        // Call original onBlur if provided
        if (onBlur) {
          onBlur(e);
        }
      },
      [decimals, onChange, onBlur]
    );

    /**
     * Handle input change - allow only valid numeric input with formatting
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow empty string or numeric input with decimal points and commas
      const inputValue = e.target.value;

      // Only update if it's empty or contains valid characters
      if (inputValue === '' || /^[\d.,-]*$/.test(inputValue)) {
        setDisplayValue(inputValue);
      }
    }, []);

    /**
     * Handle keydown events - for Enter key and arrow controls
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow Enter key to trigger blur (apply formatting)
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }

        // Increment/decrement with arrow keys when controls are enabled
        if (showControls) {
          const step = e.shiftKey ? 10 : 1;

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newValue = parseFormattedValue(displayValue) + step;
            onChange(newValue);
            setDisplayValue(String(newValue));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newValue = Math.max(0, parseFormattedValue(displayValue) - step);
            onChange(newValue);
            setDisplayValue(String(newValue));
          }
        }

        // Call original onKeyDown if provided
        if (onKeyDown) {
          onKeyDown(e);
        }
      },
      [displayValue, onChange, onKeyDown, showControls]
    );

    /**
     * Handle increment button click - increase value by 1
     */
    const handleIncrement = useCallback(() => {
      if (disabled) return;
      const currentValue = parseFormattedValue(displayValue);
      const newValue = currentValue + 1;
      setDisplayValue(String(newValue));
      onChange(newValue);
    }, [disabled, displayValue, onChange]);

    /**
     * Handle decrement button click - decrease value by 1, min 0
     */
    const handleDecrement = useCallback(() => {
      if (disabled) return;
      const currentValue = parseFormattedValue(displayValue);
      const newValue = Math.max(0, currentValue - 1);
      setDisplayValue(String(newValue));
      onChange(newValue);
    }, [disabled, displayValue, onChange]);

    return (
      <div className={cn('relative flex items-center', disabled && 'opacity-60')}>
        {/* Prefix (e.g., currency symbol) */}
        {prefix && (
          <span
            className="absolute left-3 text-foreground/70 pointer-events-none z-10"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        {/* Main input field */}
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          id={inputId}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-labelledby={props['aria-labelledby']}
          aria-describedby={props['aria-describedby']}
          aria-invalid={props['aria-invalid']}
          aria-required={props['aria-required'] || props.required}
          aria-controls={showControls ? controlsId : undefined}
          className={cn(
            'w-full px-3 py-2 glass-input backdrop-blur-glass-sm',
            'border-glass rounded-lg shadow-glass-sm',
            'focus:outline-none focus:ring-1 focus:ring-primary focus:glow-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-foreground/50',
            'transition-all duration-200',
            'bg-glass-deep text-foreground',
            prefix && 'pl-7',
            suffix && 'pr-7',
            showControls && 'pr-16',
            isFocused && 'glow-sm',
            className
          )}
          {...props}
        />

        {/* Suffix (e.g., percentage symbol) */}
        {suffix && (
          <span
            className="absolute right-3 text-foreground/70 pointer-events-none z-10"
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}

        {/* Increment/decrement controls */}
        {showControls && (
          <fieldset
            id={controlsId}
            className={cn(
              'absolute right-1 inset-y-1 flex flex-col border-l',
              'border-glass',
              'backdrop-blur-glass-sm bg-glass-deep',
              'rounded-r-md overflow-hidden',
              'shadow-sm',
              disabled ? 'opacity-30' : 'opacity-70 hover:opacity-100'
            )}
            aria-label="Value controls"
          >
            <button
              id={incrementId}
              type="button"
              tabIndex={-1}
              onClick={handleIncrement}
              disabled={disabled}
              className={cn(
                'flex-1 px-2 flex items-center justify-center',
                'text-foreground hover:bg-glass transition-colors',
                'disabled:pointer-events-none focus:outline-none focus:bg-glass-deep'
              )}
              aria-label="Increment value"
              aria-controls={inputId}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
            <button
              id={decrementId}
              type="button"
              tabIndex={-1}
              onClick={handleDecrement}
              disabled={disabled}
              className={cn(
                'flex-1 px-2 flex items-center justify-center',
                'text-foreground hover:bg-glass transition-colors',
                'disabled:pointer-events-none focus:outline-none focus:bg-glass-deep'
              )}
              aria-label="Decrement value"
              aria-controls={inputId}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </fieldset>
        )}
      </div>
    );
  }
);

// Set display name for better debugging in React DevTools
NumberInput.displayName = 'NumberInput';

export default NumberInput;
