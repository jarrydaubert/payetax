/**
 * Currency text field that keeps the editable text separate from the parsed amount.
 *
 * - Not focused, a valid amount is shown formatted (`£30,000.50`). On focus it switches to plain
 *   edit text (`30000.50`) with the caret kept after the same digit, so adding or deleting digits
 *   never leaves misplaced commas. While focused the text is never rewritten, so mid-string edits
 *   keep the caret. On blur valid text is formatted again; empty text stays empty.
 * - Invalid text is kept as typed and reported through `onValidityChange` with the text, so the
 *   owner can hold it while the field is hidden or unmounted (and pass it back as
 *   `invalidDraft`). The parsed amount is not changed. The error message shows once the field has
 *   been left, then updates live.
 * - External value changes (reset, programmatic clears) resync the text when not focused.
 *
 * Parsing lives in `@/lib/currencyInput` so other currency fields can share one implementation.
 *
 * @module components/atoms/CurrencyInput
 */
'use client';

import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  formatCurrencyInputEditText,
  formatCurrencyInputValue,
  mapCaretToEditText,
  parseCurrencyInput,
} from '@/lib/currencyInput';
import { cn } from '@/lib/utils';

const INVALID = Symbol('invalid-currency-text');
type TextAmount = number | undefined | typeof INVALID;

/** Unparsed text that is not a valid amount, with its error message. */
export interface CurrencyInputInvalidDraft {
  text: string;
  error: string;
}

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
  /** Called with the invalid text and its error when the text becomes invalid; `null` on recovery. */
  onValidityChange?: (invalid: CurrencyInputInvalidDraft | null) => void;
  /** Invalid text held by the owner (e.g. while this field was hidden); shown with its error. */
  invalidDraft?: CurrencyInputInvalidDraft;
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
  invalidDraft,
  max,
  className,
  errorClassName,
  onFocus,
  onBlur,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CurrencyInputProps) {
  const [text, setText] = useState(() => invalidDraft?.text ?? formatCurrencyInputValue(value));
  const [error, setError] = useState<string | null>(() => invalidDraft?.error ?? null);
  const [errorVisible, setErrorVisible] = useState(() => invalidDraft !== undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const textRef = useRef(text);
  textRef.current = text;
  const textAmountRef = useRef<TextAmount>(invalidDraft ? INVALID : value);
  const reportedRef = useRef<string | null>(invalidDraft ? invalidDraft.text : null);
  const pendingFocusFrameRef = useRef<number | null>(null);
  const pendingCaretRef = useRef<[number, number] | null>(null);
  const onValidityChangeRef = useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;

  const reportValidity = (invalid: CurrencyInputInvalidDraft | null) => {
    const key = invalid ? invalid.text : null;
    if (reportedRef.current === key) return;
    reportedRef.current = key;
    onValidityChangeRef.current?.(invalid);
  };
  const reportValidityRef = useRef(reportValidity);
  reportValidityRef.current = reportValidity;

  const showAmount = (amount: number | undefined) => {
    textAmountRef.current = amount;
    setText(formatCurrencyInputValue(amount));
    setError(null);
    setErrorVisible(false);
  };
  const showAmountRef = useRef(showAmount);
  showAmountRef.current = showAmount;

  // Resync from an external value change, unless the person is editing this field. Runs only
  // when `value` actually changes, so mounting with held invalid text keeps that text.
  const previousValueRef = useRef(value);
  useEffect(() => {
    if (Object.is(previousValueRef.current, value)) return;
    previousValueRef.current = value;
    if (isFocusedRef.current || Object.is(textAmountRef.current, value)) return;
    showAmountRef.current(value);
    reportValidityRef.current(null);
  }, [value]);

  // Follow invalid text held by the owner (another instance of this field, or a remount).
  const draftText = invalidDraft?.text;
  const draftError = invalidDraft?.error;
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    if (isFocusedRef.current) return;
    if (draftText !== undefined && draftError !== undefined) {
      if (textAmountRef.current === INVALID && textRef.current === draftText) return;
      textAmountRef.current = INVALID;
      reportedRef.current = draftText;
      setText(draftText);
      setError(draftError);
      setErrorVisible(true);
    } else if (textAmountRef.current === INVALID) {
      reportedRef.current = null;
      showAmountRef.current(valueRef.current);
    }
  }, [draftText, draftError]);

  // Restore the caret after switching to edit text on focus.
  useLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    if (!(caret && inputRef.current)) return;
    pendingCaretRef.current = null;
    inputRef.current.setSelectionRange(caret[0], caret[1]);
  });

  useEffect(
    () => () => {
      if (pendingFocusFrameRef.current !== null) {
        cancelAnimationFrame(pendingFocusFrameRef.current);
      }
    },
    [],
  );

  const cancelPendingFocusFormat = () => {
    if (pendingFocusFrameRef.current === null) return;
    cancelAnimationFrame(pendingFocusFrameRef.current);
    pendingFocusFrameRef.current = null;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    cancelPendingFocusFormat();
    const nextText = event.target.value;
    setText(nextText);
    const result = parseCurrencyInput(nextText, max === undefined ? undefined : { max });

    if (result.status === 'invalid') {
      textAmountRef.current = INVALID;
      setError(result.error);
      reportValidity({ text: nextText, error: result.error });
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
    const amount = textAmountRef.current;
    const displayText = textRef.current;
    if (typeof amount === 'number' && displayText === formatCurrencyInputValue(amount)) {
      const editText = formatCurrencyInputEditText(amount);
      if (editText !== displayText) {
        // Wait one frame so a pointer focus has placed its caret, then keep it on the same digit.
        const input = event.currentTarget;
        pendingFocusFrameRef.current = requestAnimationFrame(() => {
          pendingFocusFrameRef.current = null;
          if (!isFocusedRef.current || textRef.current !== displayText) return;
          const start = input.selectionStart ?? displayText.length;
          const end = input.selectionEnd ?? start;
          pendingCaretRef.current = [
            mapCaretToEditText(displayText, start),
            mapCaretToEditText(displayText, end),
          ];
          setText(editText);
        });
      }
    }
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    cancelPendingFocusFormat();
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
        ref={inputRef}
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
