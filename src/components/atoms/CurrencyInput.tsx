/**
 * Currency text field that keeps the editable text separate from the parsed amount.
 *
 * - The text is never rewritten while the field has focus, so mid-string edits keep the caret.
 * - Valid text is formatted on blur (`1234.5` → `£1,234.50`); empty text stays empty.
 * - Invalid text is kept as typed and reported through `onValidityChange`; the parsed amount is
 *   not changed. The error message is shown after the field is left, then updates live.
 * - External value changes (reset, programmatic clears) resync the text when not focused.
 *
 * Parsing lives in `@/lib/currencyInput` so other currency fields can share one implementation.
 *
 * @module components/atoms/CurrencyInput
 */
'use client';

import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrencyInputValue, parseCurrencyInput } from '@/lib/currencyInput';
import { cn } from '@/lib/utils';

const INVALID = Symbol('invalid-currency-text');
type TextAmount = number | undefined | typeof INVALID;

interface CurrencyInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'inputMode'
  > {
  id: string;
  /** Parsed amount; `undefined` means the field is empty. */
  value: number | undefined;
  /** Called with the parsed amount for valid text, or `undefined` when the text is cleared. */
  onValueChange: (value: number | undefined) => void;
  /** Called with an error message when the text becomes invalid, and `null` when it recovers. */
  onValidityChange?: (error: string | null) => void;
  /** Inclusive upper bound passed to the parser. */
  max?: number;
  /** Optional class for the error message. */
  errorClassName?: string;
}

export function CurrencyInput({
  id,
  value,
  onValueChange,
  onValidityChange,
  max,
  className,
  errorClassName,
  onFocus,
  onBlur,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CurrencyInputProps) {
  const [text, setText] = useState(() => formatCurrencyInputValue(value));
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);

  const isFocusedRef = useRef(false);
  const textAmountRef = useRef<TextAmount>(value);
  const reportedErrorRef = useRef<string | null>(null);
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  const reportValidity = (next: string | null) => {
    if (reportedErrorRef.current === next) return;
    reportedErrorRef.current = next;
    onValidityChangeRef.current?.(next);
  };
  const reportValidityRef = useRef(reportValidity);
  reportValidityRef.current = reportValidity;

  // Resync from an external value change, unless the person is editing this field.
  useEffect(() => {
    if (isFocusedRef.current || Object.is(textAmountRef.current, value)) return;
    textAmountRef.current = value;
    setText(formatCurrencyInputValue(value));
    setError(null);
    setErrorVisible(false);
    reportValidityRef.current(null);
  }, [value]);

  // An unmounted field can no longer be corrected, so it must not hold the form invalid.
  useEffect(
    () => () => {
      if (reportedErrorRef.current !== null) onValidityChangeRef.current?.(null);
    },
    [],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setText(nextText);
    const result = parseCurrencyInput(nextText, max === undefined ? undefined : { max });

    if (result.status === 'invalid') {
      textAmountRef.current = INVALID;
      setError(result.error);
      reportValidity(result.error);
      return;
    }

    const amount = result.status === 'valid' ? result.value : undefined;
    textAmountRef.current = amount;
    setError(null);
    setErrorVisible(false);
    reportValidity(null);
    onValueChange(amount);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    const amount = textAmountRef.current;
    if (amount === INVALID) {
      setErrorVisible(true);
    } else {
      setText(formatCurrencyInputValue(amount));
    }
    onBlur?.(event);
  };

  const showError = errorVisible && error !== null;
  const errorId = `${id}-error`;
  const describedBy =
    [ariaDescribedBy, showError ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <>
      <Input
        {...props}
        id={id}
        type='text'
        inputMode='decimal'
        autoComplete='off'
        spellCheck={false}
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={showError || undefined}
        aria-describedby={describedBy}
        className={cn(className, showError && 'border-destructive focus:border-destructive')}
      />
      {showError ? (
        <p id={errorId} className={cn('text-destructive text-xs leading-relaxed', errorClassName)}>
          {error}
        </p>
      ) : null}
    </>
  );
}
