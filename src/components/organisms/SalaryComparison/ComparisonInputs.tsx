// src/components/organisms/SalaryComparison/ComparisonInputs.tsx
'use client';

import { Calculator } from 'lucide-react';
import { useCallback, useId, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { ComparisonInput, ComparisonMode } from '@/lib/salaryComparison';
import { formatCurrency } from '@/lib/utils';
import { ComparisonValueSchema } from '@/lib/validation';

interface ComparisonInputsProps {
  currentSalary: number;
  onCompare: (input: ComparisonInput) => void;
  className?: string;
}

export function ComparisonInputs({ currentSalary, onCompare, className }: ComparisonInputsProps) {
  const [mode, setMode] = useState<ComparisonMode>('percentage');
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const inputId = useId();

  const handleCompare = useCallback(() => {
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    // Validate based on mode
    try {
      const validationData: Record<string, unknown> = { mode, value: numValue };

      // Add mode-specific validation
      if (mode === 'percentage') {
        validationData.percentage = numValue;
        if (numValue < 0.01 || numValue > 1000) {
          setError('Percentage must be between 0.01% and 1000%');
          return;
        }
      } else if (mode === 'amount') {
        validationData.amount = numValue;
        if (numValue < 1 || numValue > 10000000) {
          setError('Amount must be between £1 and £10M');
          return;
        }
      } else if (mode === 'total') {
        validationData.total = numValue;
        if (numValue < 1 || numValue > 10000000) {
          setError('Total salary must be between £1 and £10M');
          return;
        }
      }

      // Validate with Zod
      ComparisonValueSchema.parse(validationData);

      // Clear any previous errors
      setError('');

      // Proceed with comparison
      onCompare({
        mode,
        value: numValue,
        currentSalary,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || 'Invalid input');
      }
    }
  }, [value, mode, currentSalary, onCompare]);

  const getPlaceholder = useCallback(() => {
    switch (mode) {
      case 'percentage':
        return '10';
      case 'amount':
        return '5,000';
      case 'total':
        return '45,000';
      default:
        return '';
    }
  }, [mode]);

  const getLabel = useCallback(() => {
    switch (mode) {
      case 'percentage':
        return 'Percentage Increase';
      case 'amount':
        return 'Amount Increase';
      case 'total':
        return 'New Total Salary';
      default:
        return '';
    }
  }, [mode]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={`flex items-center ${SPACING.GAP_2}`}>
          <Calculator className={ICON_SIZES.SIZE_5} />
          Compare Salary Scenarios
        </CardTitle>
        <CardDescription className={TYPOGRAPHY.TEXT_SM}>
          See how a raise affects your take-home pay. Current salary:{' '}
          {formatCurrency(currentSalary, 0)}
        </CardDescription>
      </CardHeader>
      <CardContent className={SPACING.SPACE_Y_4}>
        {/* Mode Selection */}
        <div className={SPACING.SPACE_Y_3}>
          <Label className={TYPOGRAPHY.TEXT_SM}>Comparison Type</Label>
          <div className={`grid ${SPACING.GAP_2} sm:grid-cols-3`}>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 ${TYPOGRAPHY.TEXT_SM} transition-colors ${
                mode === 'percentage'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type='radio'
                name='comparison-mode'
                value='percentage'
                checked={mode === 'percentage'}
                onChange={() => setMode('percentage')}
                className='sr-only'
              />
              Percentage
              <span className={`block text-muted-foreground ${TYPOGRAPHY.TEXT_XS}`}>e.g., 10%</span>
            </label>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 ${TYPOGRAPHY.TEXT_SM} transition-colors ${
                mode === 'amount'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type='radio'
                name='comparison-mode'
                value='amount'
                checked={mode === 'amount'}
                onChange={() => setMode('amount')}
                className='sr-only'
              />
              £ Amount
              <span className={`block text-muted-foreground ${TYPOGRAPHY.TEXT_XS}`}>
                e.g., +£5k
              </span>
            </label>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 ${TYPOGRAPHY.TEXT_SM} transition-colors ${
                mode === 'total'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input
                type='radio'
                name='comparison-mode'
                value='total'
                checked={mode === 'total'}
                onChange={() => setMode('total')}
                className='sr-only'
              />
              New Total
              <span className={`block text-muted-foreground ${TYPOGRAPHY.TEXT_XS}`}>
                e.g., £45k
              </span>
            </label>
          </div>
        </div>

        {/* Value Input */}
        <div className={SPACING.SPACE_Y_2}>
          <Label htmlFor='comparison-value' className={TYPOGRAPHY.TEXT_SM}>
            {getLabel()}
          </Label>
          <div className='relative'>
            {mode === 'percentage' && (
              <span className='absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground'>
                %
              </span>
            )}
            {(mode === 'amount' || mode === 'total') && (
              <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                £
              </span>
            )}
            <Input
              id={inputId}
              type='number'
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                // Clear error when user types
                if (error) setError('');
              }}
              placeholder={getPlaceholder()}
              className={mode !== 'percentage' ? 'pl-8' : 'pr-8'}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
          </div>
          {error && (
            <p
              id={`${inputId}-error`}
              className={`${TYPOGRAPHY.TEXT_SM} text-destructive`}
              role='alert'
            >
              {error}
            </p>
          )}
        </div>

        {/* Compare Button */}
        <Button onClick={handleCompare} className='w-full' disabled={!value || !!error}>
          Compare Salaries
        </Button>
      </CardContent>
    </Card>
  );
}
