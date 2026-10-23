/**
 * Number input for money and percentage amounts, with formatting and optional controls
 *
 * - Typed or pasted text is parsed by the shared currency parser (`@/lib/currencyInput`), so pence
 *   are kept, never scaled. Text is never rewritten while focused; it is formatted on blur.
 * - Negative, malformed and out-of-range text is not converted into another amount: the text is
 *   kept, a specific error is shown (once the field is left) and associated with the input, and
 *   the committed value is left unchanged. Invalid text is reported through `onValidityChange` as
 *   it is typed, so the owner can stop calculating from (and showing results for) the previous
 *   amount before the field is left; recovery is reported when valid text is committed.
 * - Optional increment/decrement controls (spinbutton semantics) and reduced-motion-safe styling.
 *
 * @module components/atoms/NumberInput
 */

import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  PointerEvent,
} from 'react';
import { forwardRef, memo, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CurrencyInputInvalidDraft } from '@/components/atoms/CurrencyInput';
import {
  type CurrencyInputParseResult,
  type CurrencyInputUnit,
  formatCurrencyInputValue,
  parseCurrencyInput,
} from '@/lib/currencyInput';
import { cn, formatNumber } from '@/lib/utils';

/** Invalid text held for a field, with its error message. */
export type NumberInputInvalidDraft = CurrencyInputInvalidDraft;

/**
 * Props for the NumberInput component
 */
interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Current numeric value */
  value: number;
  /**
   * Callback when a valid value is committed (on blur, Enter, or control click).
   * Never called for invalid text.
   */
  onChange: (value: number) => void;
  /**
   * Called with the invalid text and its error as soon as the text is not a valid amount (while
   * typing and on commit), and with `null` when valid text is committed after a report.
   */
  onValidityChange?: (invalid: NumberInputInvalidDraft | null) => void;
  /** Invalidates a displayed calculation as soon as its text is edited. */
  onDraftChange?: () => void;
  /** Invalid text held by the owner (e.g. while this field was unmounted); shown with its error. */
  invalidDraft?: NumberInputInvalidDraft;
  /**
   * Changing this discards any text being edited, its error and what was last reported, and
   * shows `value`, even while the field is focused (e.g. the owner's Reset).
   */
  resetKey?: number | string;
  /**
   * Decimal places accepted and displayed: 2 for pounds and pence, 0 for whole units only.
   * Text with more significant decimal places is rejected, never rounded.
   */
  decimals?: 0 | 2;
  /** What the amount measures; controls accepted symbols and error wording (default: pounds). */
  unit?: CurrencyInputUnit;
  /** Optional prefix (e.g., currency symbol) */
  prefix?: string;
  /** Optional suffix (e.g., percentage symbol) */
  suffix?: string;
  /** Whether to select the value on focus for easier replacement (never erases it) */
  clearOnFocus?: boolean;
  /** Whether to show increment/decrement controls */
  showControls?: boolean;
  /** Optional class for the outer wrapper when the input needs to size as a flex/grid item */
  wrapperClassName?: string;
  /** Optional class for the error message */
  errorClassName?: string;
  /** Minimum allowed value (default: 0). Negative amounts are never accepted. */
  min?: number;
  /** Maximum allowed value; larger typed amounts are rejected with an error */
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
      onValidityChange,
      onDraftChange,
      invalidDraft,
      resetKey,
      decimals = 0,
      unit = 'pounds',
      className,
      wrapperClassName,
      errorClassName,
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
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    // Displayed text, and the error for that text when it is not a valid amount.
    const [displayValue, setDisplayValue] = useState<string>(
      () => invalidDraft?.text ?? formatNumber(value, decimals),
    );
    const [error, setError] = useState<string | null>(() => invalidDraft?.error ?? null);
    const [errorVisible, setErrorVisible] = useState<boolean>(() => invalidDraft !== undefined);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const isFocusedRef = useRef(false);
    const pendingTouchPointerRef = useRef<number | null>(null);
    const displayValueRef = useRef(displayValue);
    displayValueRef.current = displayValue;
    const errorRef = useRef(error);
    errorRef.current = error;
    // Text of the invalid draft last reported to the owner (null when reported valid).
    const reportedRef = useRef<string | null>(
      invalidDraft ? `${invalidDraft.text}\u0000${invalidDraft.error}` : null,
    );
    const onValidityChangeRef = useRef(onValidityChange);
    onValidityChangeRef.current = onValidityChange;

    // SSR-safe ID generation
    const reactId = useId();
    const inputId = id ?? `number-input-${reactId}`;
    const controlsId = `${inputId}-controls`;
    const errorId = `${inputId}-error`;

    // Calculate default step based on decimals
    const effectiveStep = step ?? (decimals > 0 ? 10 ** -decimals : 1);

    const reportValidity = useCallback((invalid: NumberInputInvalidDraft | null) => {
      const key = invalid ? `${invalid.text}\u0000${invalid.error}` : null;
      if (reportedRef.current === key) return;
      reportedRef.current = key;
      onValidityChangeRef.current?.(invalid);
    }, []);

    const rejectsEmpty = Boolean(onValidityChange);
    const parseText = useCallback(
      (text: string): CurrencyInputParseResult => {
        const result = parseCurrencyInput(
          text,
          max === undefined ? { unit, decimals } : { max, unit, decimals },
        );
        if (result.status === 'empty' && rejectsEmpty) {
          return { status: 'invalid', error: 'Enter an amount, or 0 for none.' };
        }
        if (result.status === 'valid' && result.value < min) {
          const minimum =
            unit === 'percent' ? `${min.toLocaleString('en-GB')}%` : formatCurrencyInputValue(min);
          return { status: 'invalid', error: `Enter ${minimum} or more.` };
        }
        return result;
      },
      [decimals, max, min, unit, rejectsEmpty],
    );

    /** Show a committed amount, discarding any invalid text and its error. */
    const showValue = useCallback(
      (amount: number) => {
        const text = formatNumber(amount, decimals);
        // Keep the refs in step now: later effects in the same commit (e.g. the rules-change
        // re-check when Reset also switches the pension unit) must not act on the old text.
        displayValueRef.current = text;
        errorRef.current = null;
        setDisplayValue(text);
        setError(null);
        setErrorVisible(false);
      },
      [decimals],
    );

    // Resync from an external value change (reset, applied suggestion), unless being edited.
    const previousValueRef = useRef(value);
    useEffect(() => {
      if (Object.is(previousValueRef.current, value)) return;
      previousValueRef.current = value;
      if (isFocusedRef.current) return;
      showValue(value);
      reportValidity(null);
    }, [value, showValue, reportValidity]);

    // The owner reset its inputs: discard everything this field holds, focused or not, so the
    // text shown, the committed value, the error and the reporting state all agree. A later
    // blur commits the reset value,
    // and the same invalid text is reported again if retyped.
    const valueRef = useRef(value);
    valueRef.current = value;
    const previousResetKeyRef = useRef(resetKey);
    const selectAfterResetRef = useRef(false);
    useEffect(() => {
      if (previousResetKeyRef.current === resetKey) return;
      previousResetKeyRef.current = resetKey;
      previousValueRef.current = valueRef.current;
      reportedRef.current = null;
      showValue(valueRef.current);
      selectAfterResetRef.current = isFocusedRef.current;
    }, [resetKey, showValue]);
    useEffect(() => {
      if (!selectAfterResetRef.current || displayValue !== formatNumber(valueRef.current, decimals))
        return;
      selectAfterResetRef.current = false;
      const element = document.getElementById(inputId);
      if (element instanceof HTMLInputElement) element.select();
    }, [displayValue, inputId, decimals]);

    // Re-format valid text when the display precision changes.
    useEffect(() => {
      if (isFocusedRef.current || errorRef.current !== null) return;
      setDisplayValue(formatNumber(previousValueRef.current, decimals));
    }, [decimals]);

    // Follow invalid text held by the owner (a remount, or the owner clearing it on reset).
    // Runs only when the held draft changes, so an owner that does not hold drafts is unaffected.
    const draftText = invalidDraft?.text;
    const draftError = invalidDraft?.error;
    useEffect(() => {
      if (isFocusedRef.current) return;
      if (draftText !== undefined && draftError !== undefined) {
        reportedRef.current = `${draftText}\u0000${draftError}`;
        if (displayValueRef.current === draftText && errorRef.current === draftError) return;
        setDisplayValue(draftText);
        setError(draftError);
        setErrorVisible(true);
      } else if (errorRef.current !== null) {
        reportedRef.current = null;
        showValue(previousValueRef.current);
      }
    }, [draftText, draftError, showValue]);

    /**
     * Commit text: a valid amount is formatted and passed on; owned fields require an explicit
     * amount (including 0). Invalid text is kept with a visible error and the
     * committed value is left unchanged.
     */
    const commit = useCallback(
      (text: string) => {
        const result = parseText(text);
        if (result.status === 'invalid') {
          setError(result.error);
          setErrorVisible(true);
          reportValidity({ text, error: result.error });
          return;
        }
        const amount = result.status === 'valid' ? result.value : 0;
        showValue(amount);
        reportValidity(null);
        if (amount !== value) {
          previousValueRef.current = amount;
          onChange(amount);
        }
      },
      [onChange, parseText, reportValidity, showValue, value],
    );
    const commitRef = useRef(commit);
    commitRef.current = commit;

    // Re-check held invalid text when the field's rules change (e.g. pension £ ↔ %), so the
    // message, the owner's record and the committed value always match the rules shown.
    useEffect(() => {
      if (errorRef.current === null) return;
      const text = displayValueRef.current;
      if (!isFocusedRef.current) {
        commitRef.current(text);
        return;
      }
      const result = parseText(text);
      setError(result.status === 'invalid' ? result.error : null);
    }, [parseText]);

    /**
     * Clamp value to min/max bounds (controls only; typed text is validated, not clamped)
     */
    const clampValue = useCallback(
      (val: number): number => {
        let clamped = Math.max(min, val);
        if (max !== undefined) clamped = Math.min(max, clamped);
        return clamped;
      },
      [min, max],
    );

    /** Step from the valid displayed amount, or the committed value when the text is not valid. */
    const stepBy = useCallback(
      (delta: number) => {
        const current = parseText(displayValue);
        const base = current.status === 'valid' ? current.value : value;
        const newValue = clampValue(base + delta);
        showValue(newValue);
        reportValidity(null);
        previousValueRef.current = newValue;
        onChange(newValue);
      },
      [clampValue, displayValue, onChange, parseText, reportValidity, showValue, value],
    );

    /**
     * Handle focus event - optionally select the value without changing it
     */
    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = true;
        setIsFocused(true);

        // Keep invalid text so the person can correct it.
        if (clearOnFocus && errorRef.current === null) {
          e.currentTarget.select();
        }

        onFocus?.(e);
      },
      [clearOnFocus, onFocus],
    );

    const handlePointerDown = (e: PointerEvent<HTMLInputElement>) => {
      pendingTouchPointerRef.current = null;
      onPointerDown?.(e);
      if (
        !e.defaultPrevented &&
        e.button === 0 &&
        clearOnFocus &&
        errorRef.current === null &&
        document.activeElement !== e.currentTarget
      ) {
        // WebKit places its caret after focus/click handlers. Cancel that first-entry default
        // and focus explicitly so replacement is reliable; subsequent caret edits stay native.
        e.preventDefault();
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          // A pan cancels the pointer. Wait for a completed tap before entering the field.
          pendingTouchPointerRef.current = e.pointerId;
        } else {
          e.currentTarget.focus();
          e.currentTarget.select();
        }
      }
    };

    const handlePointerUp = (e: PointerEvent<HTMLInputElement>) => {
      onPointerUp?.(e);
      if (pendingTouchPointerRef.current !== e.pointerId) return;
      pendingTouchPointerRef.current = null;
      if (
        !e.defaultPrevented &&
        clearOnFocus &&
        errorRef.current === null &&
        document.activeElement !== e.currentTarget
      ) {
        e.currentTarget.focus();
        e.currentTarget.select();
      }
    };

    const handlePointerCancel = (e: PointerEvent<HTMLInputElement>) => {
      if (pendingTouchPointerRef.current === e.pointerId) pendingTouchPointerRef.current = null;
      onPointerCancel?.(e);
    };

    /**
     * Handle blur event - commit the current text
     */
    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = false;
        setIsFocused(false);
        commit(e.target.value);
        onBlur?.(e);
      },
      [commit, onBlur],
    );

    /**
     * Handle input change - keep the text exactly as typed. Invalid text is reported to the owner
     * immediately, so nothing can keep using the previous amount while the field shows something
     * else. Recovery is reported only on commit, when the committed value matches the text, so
     * valid but uncommitted text never unblocks a calculation from the previous amount.
     */
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        onDraftChange?.();
        setDisplayValue(text);
        const result = parseText(text);
        if (result.status === 'invalid') {
          setError(result.error);
          reportValidity({ text, error: result.error });
        } else {
          setError(null);
          setErrorVisible(false);
        }
      },
      [onDraftChange, parseText, reportValidity],
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

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            stepBy(effectiveStep * multiplier);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            stepBy(-effectiveStep * multiplier);
          }
        }

        onKeyDown?.(e);
      },
      [effectiveStep, onKeyDown, showControls, stepBy],
    );

    /**
     * Handle increment button click
     */
    const handleIncrement = useCallback(() => {
      if (disabled) return;
      stepBy(effectiveStep);
    }, [disabled, effectiveStep, stepBy]);

    /**
     * Handle decrement button click
     */
    const handleDecrement = useCallback(() => {
      if (disabled) return;
      stepBy(-effectiveStep);
    }, [disabled, effectiveStep, stepBy]);

    const showError = errorVisible && error !== null;
    const describedBy =
      [ariaDescribedBy, showError ? errorId : null].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('min-w-0', wrapperClassName)}>
        <div className={cn('relative flex items-center', disabled && 'opacity-60')}>
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
            autoComplete='off'
            spellCheck={false}
            id={inputId}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            disabled={disabled}
            aria-valuenow={showError ? undefined : value}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={
              !showError && (prefix || suffix)
                ? `${prefix ?? ''}${formatNumber(value, decimals)}${suffix ?? ''}`
                : undefined
            }
            aria-invalid={showError || undefined}
            aria-describedby={describedBy}
            className={cn(
              'flex h-9 w-full rounded-sm border border-input bg-background px-3 py-1 shadow-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'placeholder:text-muted-foreground',
              'transition-all duration-200',
              'text-foreground',
              'text-sm',
              prefix && 'pl-7',
              suffix && 'pr-7',
              showControls && 'pr-16',
              isFocused && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
              showError && 'border-destructive',
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
            <fieldset
              id={controlsId}
              aria-label='Value controls'
              className={cn(
                'absolute inset-y-1 right-1 flex flex-col border-l',
                'border-input bg-background',
                'overflow-hidden rounded-r-sm',
                'shadow-none',
                disabled ? 'opacity-30' : 'opacity-70 hover:opacity-100',
              )}
            >
              <button
                type='button'
                onClick={handleIncrement}
                disabled={disabled}
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
              </button>
              <button
                type='button'
                onClick={handleDecrement}
                disabled={disabled}
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
              </button>
            </fieldset>
          )}
        </div>
        {showError ? (
          <p
            id={errorId}
            className={cn('mt-1 text-destructive text-xs leading-relaxed', errorClassName)}
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }),
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
export type { NumberInputProps };
