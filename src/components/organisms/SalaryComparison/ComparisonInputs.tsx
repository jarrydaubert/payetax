// src/components/organisms/SalaryComparison/ComparisonInputs.tsx
'use client';

import { Calculator } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { Button } from '@/components/atoms/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/ui/card';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { ComparisonInput, ComparisonMode } from '@/lib/salaryComparison';
import { cn, formatCurrency } from '@/lib/utils';
import { ComparisonValueSchema } from '@/lib/validation';

interface ComparisonInputsProps {
  currentSalary: number;
  onCompare: (input: ComparisonInput) => void;
  className?: string;
}

/** Labels for each comparison mode */
const MODE_LABELS: Record<ComparisonMode, string> = {
  percentage: 'Percentage Increase',
  amount: 'Amount Increase',
  total: 'New Total Salary',
};

/** Placeholders for each mode (no commas - cleaner for text input) */
const MODE_PLACEHOLDERS: Record<ComparisonMode, string> = {
  percentage: '10',
  amount: '5000',
  total: '45000',
};

/**
 * Parse a "money-ish" string: strips £, commas, spaces
 * Returns NaN if not a valid number
 */
function parseMoneyish(raw: string): number {
  const normalized = raw.replace(/[,\s£%]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function ComparisonInputs({ currentSalary, onCompare, className }: ComparisonInputsProps) {
  const [mode, setMode] = useState<ComparisonMode>('percentage');
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  const inputId = useId();
  const radioGroupId = useId();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const numValue = parseMoneyish(value);
    if (Number.isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    // Let Zod be the single source of validation truth
    const validation = ComparisonValueSchema.safeParse({ mode, value: numValue });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    // Clear any previous errors
    setError('');

    // Proceed with comparison
    onCompare({
      mode,
      value: numValue,
      currentSalary,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={cn('flex items-center', SPACING.GAP_2)}>
          <Calculator className={ICON_SIZES.SIZE_5} />
          Compare Salary Scenarios
        </CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          See how a raise affects your take-home pay. Current salary:{' '}
          {formatCurrency(currentSalary, 0)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={SPACING.SPACE_Y_4}>
          {/* Mode Selection - proper fieldset/legend for a11y */}
          <fieldset className={SPACING.SPACE_Y_3}>
            <legend id={radioGroupId} className={cn('font-medium', TYPOGRAPHY.TEXT_SM)}>
              Comparison Type
            </legend>
            <div
              className={cn('grid sm:grid-cols-3', SPACING.GAP_2)}
              role='radiogroup'
              aria-labelledby={radioGroupId}
            >
              {(['percentage', 'amount', 'total'] as const).map((m) => (
                <label
                  key={m}
                  className={cn(
                    'cursor-pointer rounded-lg border-2 p-3 transition-colors',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    TYPOGRAPHY.TEXT_SM,
                    mode === m
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <input
                    type='radio'
                    name='comparison-mode'
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className='sr-only'
                  />
                  {m === 'percentage' && 'Percentage'}
                  {m === 'amount' && '£ Amount'}
                  {m === 'total' && 'New Total'}
                  <span className={cn('block text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
                    {m === 'percentage' && 'e.g., 10%'}
                    {m === 'amount' && 'e.g., +£5k'}
                    {m === 'total' && 'e.g., £45k'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Value Input */}
          <div className={SPACING.SPACE_Y_2}>
            <Label htmlFor={inputId} className={TYPOGRAPHY.TEXT_SM}>
              {MODE_LABELS[mode]}
            </Label>
            <div className='relative'>
              {mode === 'percentage' && (
                <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'>
                  %
                </span>
              )}
              {(mode === 'amount' || mode === 'total') && (
                <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                  £
                </span>
              )}
              <Input
                id={inputId}
                type='text'
                inputMode='decimal'
                autoComplete='off'
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  // Clear error when user types
                  if (error) setError('');
                }}
                placeholder={MODE_PLACEHOLDERS[mode]}
                className={mode !== 'percentage' ? 'pl-8' : 'pr-8'}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
              />
            </div>
            {error && (
              <p
                id={`${inputId}-error`}
                className={cn('text-destructive', TYPOGRAPHY.TEXT_SM)}
                role='alert'
              >
                {error}
              </p>
            )}
          </div>

          {/* Compare Button - only disabled when empty, not when error exists */}
          <Button type='submit' className='w-full' disabled={!value.trim()}>
            Compare Salaries
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
