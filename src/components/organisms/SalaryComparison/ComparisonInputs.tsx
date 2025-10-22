// src/components/organisms/SalaryComparison/ComparisonInputs.tsx
'use client';

import { Calculator, Percent, PoundSterling } from 'lucide-react';
import { useId, useState } from 'react';
import NumberInput from '@/components/atoms/NumberInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import type { ComparisonInput, ComparisonMode } from '@/lib/salaryComparison';
import { formatCurrency } from '@/lib/utils';

interface ComparisonInputsProps {
  currentSalary: number;
  onCompare: (input: ComparisonInput) => void;
  className?: string;
}

export function ComparisonInputs({ currentSalary, onCompare, className }: ComparisonInputsProps) {
  const [mode, setMode] = useState<ComparisonMode>('percentage');
  const [value, setValue] = useState<string>('');
  const inputId = useId();

  const handleCompare = () => {
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return;

    onCompare({
      mode,
      value: numValue,
      currentSalary,
    });
  };

  const getLabel = () => {
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
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calculator className='size-5' />
          Compare Salary Scenarios
        </CardTitle>
        <CardDescription>
          See how a raise affects your take-home pay. Current salary:{' '}
          {formatCurrency(currentSalary, 0)}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Mode Selection */}
        <div className='space-y-3'>
          <FieldLabel>Comparison Type</FieldLabel>
          <div className='grid gap-2 sm:grid-cols-3'>
            <button
              type='button'
              onClick={() => setMode('percentage')}
              className={`rounded-lg border-2 p-3 text-sm transition-colors ${
                mode === 'percentage'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              Percentage
              <span className='block text-muted-foreground text-xs'>e.g., 10%</span>
            </button>
            <button
              type='button'
              onClick={() => setMode('amount')}
              className={`rounded-lg border-2 p-3 text-sm transition-colors ${
                mode === 'amount'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              £ Amount
              <span className='block text-muted-foreground text-xs'>e.g., +£5k</span>
            </button>
            <button
              type='button'
              onClick={() => setMode('total')}
              className={`rounded-lg border-2 p-3 text-sm transition-colors ${
                mode === 'total'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              New Total
              <span className='block text-muted-foreground text-xs'>e.g., £45k</span>
            </button>
          </div>
        </div>

        {/* Value Input - Using InputGroup with £/% indicators */}
        <Field>
          <FieldLabel htmlFor={inputId}>{getLabel()}</FieldLabel>
          <InputGroup>
            {mode !== 'percentage' && (
              <InputGroupAddon align='inline-start'>
                <PoundSterling className='size-4' />
              </InputGroupAddon>
            )}
            <NumberInput
              id={inputId}
              value={parseFloat(value) || 0}
              onChange={(v) => setValue(String(v))}
              decimals={2}
              clearOnFocus={true}
              className='border-0 bg-transparent'
            />
            {mode === 'percentage' && (
              <InputGroupAddon align='inline-end'>
                <Percent className='size-4' />
              </InputGroupAddon>
            )}
          </InputGroup>
        </Field>

        {/* Compare Button */}
        <Button onClick={handleCompare} className='w-full' disabled={!value}>
          Compare Salaries
        </Button>
      </CardContent>
    </Card>
  );
}
