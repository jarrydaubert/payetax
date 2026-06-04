/**
 * Enhanced number input component with formatting and controls
 *
 * Provides a customizable input field for numeric values with support for:
 * - Currency formatting with prefix/suffix
 * - Decimal precision control
 * - Increment/decrement controls (spinbutton semantics)
 * - Focus behavior customization
 * - Full accessibility support including reduced motion
 *
 * @module components/atoms/NumberInput
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ChangeEvent, FocusEvent, InputHTMLAttributes, KeyboardEvent } from 'react';
import { forwardRef, memo, useCallback, useEffect, useId, useState } from 'react';
import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn, formatNumber, parseFormattedValue } from '@/lib/utils';

/**
 * Props for the NumberInput component
 */
interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Current numeric value */
  value: number;
  /**
   * Callback when value is committed (on blur, Enter, or control click)
   * Note: This fires on commit, not every keystroke. For live updates, use onValueChange
   */
  onChange: (value: number) => void;
  /** Optional callback for live value changes during typing */
  onValueChange?: (value: number) => void;
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
  /** Optional class for the outer wrapper when the input needs to size as a flex/grid item */
  wrapperClassName?: string;
  /** Minimum allowed value (default: 0) */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step size for controls/arrow keys (default: 1, or 10^-decimals for decimals) */
  step?: number;
}

/**
 * Enhanced number input with formatting and spinbutton controls
 * Supports currency, percentage, and standard number inputs with accessibility features
 */
const NumberInput = memo(
  forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
    {
      value,
      onChange,
      onValueChange,
      decimals = 0,
      className,
      wrapperClassName,
      prefix,
      suffix,
      clearOnFocus = true,
      showControls = false,
      disabled,
      id,
      min = 0,
      max,
      step,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    // Internal state for the displayed value
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // SSR-safe ID generation
    const reactId = useId();
    const inputId = id ?? `number-input-${reactId}`;
    const controlsId = `${inputId}-controls`;

    // Respect reduced motion preferences
    const prefersReducedMotion = useReducedMotion();

    // Calculate default step based on decimals
    const effectiveStep = step ?? (decimals > 0 ? 10 ** -decimals : 1);

    // Format the initial value
    useEffect(() => {
      // Only update display value when not focused to prevent cursor jumping
      if (!isFocused) {
        setDisplayValue(formatNumber(value, decimals));
      }
    }, [value, decimals, isFocused]);

    /**
     * Clamp value to min/max bounds
     */
    const clampValue = useCallback(
      (val: number): number => {
        let clamped = val;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        return clamped;
      },
      [min, max],
    );

    /**
     * Handle focus event - clear field for better UX if configured
     */
    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);

        if (clearOnFocus) {
          // Use state only, don't mutate DOM directly
          setDisplayValue('');
        }

        onFocus?.(e);
      },
      [clearOnFocus, onFocus],
    );

    /**
     * Handle blur event - parse and format the current input value
     */
    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        const parsed = parseFormattedValue(e.target.value);
        const clamped = clampValue(parsed);

        setDisplayValue(formatNumber(clamped, decimals));

        // Only notify if value actually changed
        if (clamped !== value) {
          onChange(clamped);
        }

        onBlur?.(e);
      },
      [decimals, onChange, onBlur, clampValue, value],
    );

    /**
     * Handle input change - format with thousand separators while typing
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        if (inputValue === '') {
          setDisplayValue('');
          onValueChange?.(0);
          return;
        }

        // Allow negative sign at start if min < 0
        const allowNegative = min < 0;

        if (decimals > 0) {
          // Remove all non-numeric characters except decimal point (and minus if allowed)
          const cleanPattern = allowNegative ? /[^\d.-]/g : /[^\d.]/g;
          let cleaned = inputValue.replace(cleanPattern, '');

          // Only allow one minus at the start
          if (allowNegative && cleaned.includes('-')) {
            const isNegative = cleaned.startsWith('-');
            cleaned = cleaned.replace(/-/g, '');
            if (isNegative) cleaned = `-${cleaned}`;
          }

          // Prevent multiple decimal points
          const parts = cleaned.split('.');
          if (parts.length > 2) return;

          // Clamp decimal digits
          const decimalPart = parts[1];
          if (parts.length === 2 && decimalPart && decimalPart.length > decimals) {
            parts[1] = decimalPart.slice(0, decimals);
          }

          // Format integer part with commas
          const integerPart = parts[0] || '';
          const isNegative = integerPart.startsWith('-');
          const absInteger = isNegative ? integerPart.slice(1) : integerPart;
          const formattedInteger = absInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const finalInteger = isNegative ? `-${formattedInteger}` : formattedInteger;

          const formatted = parts.length === 2 ? `${finalInteger}.${parts[1] ?? ''}` : finalInteger;

          setDisplayValue(formatted);
          onValueChange?.(parseFormattedValue(formatted));
        } else {
          // For integers
          const cleanPattern = allowNegative ? /[^\d-]/g : /[^\d]/g;
          let cleaned = inputValue.replace(cleanPattern, '');

          // Only allow one minus at the start
          if (allowNegative && cleaned.includes('-')) {
            const isNegative = cleaned.startsWith('-');
            cleaned = cleaned.replace(/-/g, '');
            if (isNegative) cleaned = `-${cleaned}`;
          }

          const isNegative = cleaned.startsWith('-');
          const absValue = isNegative ? cleaned.slice(1) : cleaned;
          const formattedValue = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const formatted = isNegative ? `-${formattedValue}` : formattedValue;

          setDisplayValue(formatted);
          onValueChange?.(parseFormattedValue(formatted));
        }
      },
      [decimals, min, onValueChange],
    );

    /**
     * Handle keydown events - Enter key and arrow controls
     */
    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }

        if (showControls) {
          const multiplier = e.shiftKey ? 10 : 1;
          const currentValue = parseFormattedValue(displayValue);

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newValue = clampValue(currentValue + effectiveStep * multiplier);
            setDisplayValue(formatNumber(newValue, decimals));
            onChange(newValue);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newValue = clampValue(currentValue - effectiveStep * multiplier);
            setDisplayValue(formatNumber(newValue, decimals));
            onChange(newValue);
          }
        }

        onKeyDown?.(e);
      },
      [displayValue, onChange, onKeyDown, showControls, clampValue, effectiveStep, decimals],
    );

    /**
     * Handle increment button click
     */
    const handleIncrement = useCallback(() => {
      if (disabled) return;
      const currentValue = parseFormattedValue(displayValue);
      const newValue = clampValue(currentValue + effectiveStep);
      setDisplayValue(formatNumber(newValue, decimals));
      onChange(newValue);
    }, [disabled, displayValue, onChange, clampValue, effectiveStep, decimals]);

    /**
     * Handle decrement button click
     */
    const handleDecrement = useCallback(() => {
      if (disabled) return;
      const currentValue = parseFormattedValue(displayValue);
      const newValue = clampValue(currentValue - effectiveStep);
      setDisplayValue(formatNumber(newValue, decimals));
      onChange(newValue);
    }, [disabled, displayValue, onChange, clampValue, effectiveStep, decimals]);

    // Motion variants respecting reduced motion
    const controlsAnimation = prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, x: 4 },
          animate: { opacity: disabled ? 0.3 : 1, x: 0 },
          transition: { duration: 0.2 },
        };

    const buttonAnimation = prefersReducedMotion
      ? {}
      : {
          whileHover: { scale: disabled ? 1 : 1.05 },
          whileTap: { scale: disabled ? 1 : 0.95 },
        };

    return (
      <div className={cn('relative flex items-center', disabled && 'opacity-60', wrapperClassName)}>
        {prefix && (
          <span
            className='pointer-events-none absolute left-3 z-10 text-foreground/70'
            aria-hidden='true'
          >
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type='text'
          inputMode='decimal'
          role='spinbutton'
          id={inputId}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={
            prefix || suffix
              ? `${prefix ?? ''}${formatNumber(value, decimals)}${suffix ?? ''}`
              : undefined
          }
          className={cn(
            'flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 shadow-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-muted-foreground',
            'transition-all duration-200',
            'text-foreground',
            TYPOGRAPHY.TEXT_SM,
            prefix && 'pl-7',
            suffix && 'pr-7',
            showControls && 'pr-16',
            isFocused && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
            className,
          )}
          {...props}
        />

        {suffix && (
          <span
            className='pointer-events-none absolute right-3 z-10 text-foreground/70'
            aria-hidden='true'
          >
            {suffix}
          </span>
        )}

        {showControls && (
          <motion.div
            id={controlsId}
            role='group'
            aria-label='Value controls'
            {...controlsAnimation}
            className={cn(
              'absolute inset-y-1 right-1 flex flex-col border-l',
              'border-input bg-background',
              'overflow-hidden rounded-r-sm',
              'shadow-none',
              disabled ? 'opacity-30' : 'opacity-70 hover:opacity-100',
            )}
          >
            <motion.button
              type='button'
              onClick={handleIncrement}
              disabled={disabled}
              {...buttonAnimation}
              className={cn(
                'flex flex-1 items-center justify-center px-2',
                'text-foreground transition-colors hover:bg-accent',
                'focus:bg-accent focus:outline-none disabled:pointer-events-none',
              )}
              aria-label='Increment value'
              aria-controls={inputId}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d='M18 15l-6-6-6 6' />
              </svg>
            </motion.button>
            <motion.button
              type='button'
              onClick={handleDecrement}
              disabled={disabled}
              {...buttonAnimation}
              className={cn(
                'flex flex-1 items-center justify-center px-2',
                'text-foreground transition-colors hover:bg-accent',
                'focus:bg-accent focus:outline-none disabled:pointer-events-none',
              )}
              aria-label='Decrement value'
              aria-controls={inputId}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d='M6 9l6 6 6-6' />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>
    );
  }),
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
export type { NumberInputProps };
