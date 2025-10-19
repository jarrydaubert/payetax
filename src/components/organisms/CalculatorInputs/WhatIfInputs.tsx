// src/components/organisms/CalculatorInputs/WhatIfInputs.tsx
'use client';

import { Wand2 } from 'lucide-react';
import { InputTooltip } from '@/components/atoms/InputTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalculatorActions, useWhatIf } from '@/store/calculatorStore';

/**
 * What If Scenario Input Section
 *
 * Allows users to explore salary changes with 3 input modes:
 * - Percentage increase/decrease
 * - Fixed amount change
 * - New total salary
 *
 * Integrates with What If state in calculator store
 */
export function WhatIfInputs() {
  const whatIf = useWhatIf();
  const { setWhatIfType, setWhatIfValue, calculateWhatIf } = useCalculatorActions();

  const handleCompare = () => {
    // Enable What If mode and calculate
    calculateWhatIf();
  };

  // Get label for input based on type
  const getInputLabel = () => {
    switch (whatIf.type) {
      case 'percentage':
        return 'Percentage Change';
      case 'amount':
        return 'Amount Change (£)';
      case 'total':
        return 'New Total Salary (£)';
      default:
        return 'Value';
    }
  };

  // Get placeholder for input based on type
  const getPlaceholder = () => {
    switch (whatIf.type) {
      case 'percentage':
        return 'e.g., 10 for 10% increase';
      case 'amount':
        return 'e.g., 5000 for £5k raise';
      case 'total':
        return 'e.g., 45000 for £45k total';
      default:
        return 'Enter value';
    }
  };

  return (
    <div className='space-y-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4 dark:border-purple-400/30 dark:from-purple-400/10 dark:to-pink-400/10'>
      {/* Header */}
      <div className='flex items-center gap-2 border-purple-500/20 border-b pb-2 dark:border-purple-400/20'>
        <Wand2 className='size-5 text-purple-600 dark:text-purple-400' />
        <h3 className='font-semibold text-foreground text-lg'>What If Scenario</h3>
      </div>

      {/* Inputs Grid */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Change Type Dropdown */}
        <div>
          <label htmlFor='what-if-type' className='mb-2 block font-medium text-foreground text-sm'>
            Change Type
          </label>
          <InputTooltip fieldName='whatIfType'>
            <Select
              value={whatIf.type}
              onValueChange={(value: 'percentage' | 'amount' | 'total') => setWhatIfType(value)}
            >
              <SelectTrigger
                id='what-if-type'
                className='border-purple-500/30 bg-background hover:border-purple-500/50 dark:border-purple-400/30 dark:hover:border-purple-400/50'
                data-testid='what-if-type-select'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='percentage'>Percentage</SelectItem>
                <SelectItem value='amount'>Amount</SelectItem>
                <SelectItem value='total'>Total</SelectItem>
              </SelectContent>
            </Select>
          </InputTooltip>
        </div>

        {/* Value Input */}
        <div>
          <label htmlFor='what-if-value' className='mb-2 block font-medium text-foreground text-sm'>
            {getInputLabel()}
          </label>
          <InputTooltip fieldName='whatIfValue'>
            <NumberInput
              id='what-if-value'
              value={whatIf.value}
              onChange={setWhatIfValue}
              prefix={whatIf.type !== 'percentage' ? '£' : undefined}
              suffix={whatIf.type === 'percentage' ? '%' : undefined}
              placeholder={getPlaceholder()}
              className='border-purple-500/30 hover:border-purple-500/50 focus:border-purple-500 focus:ring-purple-500 dark:border-purple-400/30 dark:focus:border-purple-400 dark:hover:border-purple-400/50'
              data-testid='what-if-value-input'
            />
          </InputTooltip>
        </div>
      </div>

      {/* Compare Button */}
      <Button
        onClick={handleCompare}
        size='lg'
        className='w-full justify-center border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 hover:from-purple-600 hover:to-pink-600 dark:border-purple-400 dark:shadow-purple-400/50'
        data-testid='compare-button'
      >
        <Wand2 className='mr-2 size-5' />
        Compare Scenarios
      </Button>
    </div>
  );
}
