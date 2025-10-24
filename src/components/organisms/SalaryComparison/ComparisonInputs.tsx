// src/components/organisms/SalaryComparison/ComparisonInputs.tsx
'use client';

import { Calculator } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const getPlaceholder = () => {
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
          <Label>Comparison Type</Label>
          <div className='grid gap-2 sm:grid-cols-3'>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 text-sm transition-colors ${
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
              <span className='block text-muted-foreground text-xs'>e.g., 10%</span>
            </label>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 text-sm transition-colors ${
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
              <span className='block text-muted-foreground text-xs'>e.g., +£5k</span>
            </label>
            <label
              className={`cursor-pointer rounded-lg border-2 p-3 text-sm transition-colors ${
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
              <span className='block text-muted-foreground text-xs'>e.g., £45k</span>
            </label>
          </div>
        </div>

        {/* Value Input */}
        <div className='space-y-2'>
          <Label htmlFor='comparison-value'>{getLabel()}</Label>
          <div className='relative'>
            {mode === 'percentage' && (
              <span className='-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground'>
                %
              </span>
            )}
            {(mode === 'amount' || mode === 'total') && (
              <span className='-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground'>
                £
              </span>
            )}
            <Input
              id={inputId}
              type='number'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={getPlaceholder()}
              className={mode !== 'percentage' ? 'pl-8' : 'pr-8'}
            />
          </div>
        </div>

        {/* Compare Button */}
        <Button onClick={handleCompare} className='w-full' disabled={!value}>
          Compare Salaries
        </Button>
      </CardContent>
    </Card>
  );
}
