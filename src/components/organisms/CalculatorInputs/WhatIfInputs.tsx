// src/components/organisms/CalculatorInputs/WhatIfInputs.tsx
'use client';

import { RotateCcw, Wand2 } from 'lucide-react';
import { useId, useState } from 'react';
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
import { ICON_SIZES, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { WhatIfValueSchema } from '@/lib/calculatorValidation';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useWhatIf, useWhatIfResults } from '@/store/calculatorStore';

interface WhatIfInputsProps {
  onCompare?: () => void;
}

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
export function WhatIfInputs({ onCompare }: WhatIfInputsProps) {
  const whatIf = useWhatIf();
  const whatIfResults = useWhatIfResults();
  const { setWhatIfType, setWhatIfValue, calculateWhatIf, clearWhatIf } = useCalculatorActions();
  const [error, setError] = useState<string>('');
  const typeSelectId = useId();
  const typeLabelId = `${typeSelectId}-label`;
  const valueInputId = useId();

  const handleCompare = () => {
    // Validate using Zod 4.x .safeParse() pattern (consistent with store)
    const validated = WhatIfValueSchema.safeParse({
      type: whatIf.type,
      value: whatIf.value,
    });

    if (!validated.success) {
      // Extract Zod's error message (now type-aware from superRefine)
      const errorMessage = validated.error.issues[0]?.message || 'Invalid input';
      setError(errorMessage);
      return;
    }

    // Clear any previous errors
    setError('');

    // Enable What If mode and calculate
    calculateWhatIf();

    // Notify parent to scroll to results
    if (onCompare) {
      onCompare();
    }
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
    <div
      className={cn(
        'rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10 p-4',
        SPACING.SPACE_Y_4,
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center border-primary/20 border-b pb-2', SPACING.GAP_2)}>
        <Wand2 className={cn(ICON_SIZES.SIZE_5, 'text-accent-foreground')} />
        {/* IMPORTANT: Uses TEXT_LG to match other section headings (BasicInputs, ResultsTable)
            Ensures visual consistency across calculator interface */}
        <h3 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>
          What If Scenario
        </h3>
      </div>

      {/* Inputs Grid */}
      <div className={cn('grid sm:grid-cols-2', SPACING.GAP_4)}>
        {/* Change Type Dropdown */}
        <div>
          <label
            id={typeLabelId}
            htmlFor={typeSelectId}
            className={cn('block font-medium text-foreground', SPACING.MB_2, TYPOGRAPHY.TEXT_SM)}
          >
            Change Type
          </label>
          <InputTooltip fieldName='whatIfType'>
            <Select
              value={whatIf.type}
              onValueChange={(value: 'percentage' | 'amount' | 'total') => setWhatIfType(value)}
            >
              <SelectTrigger
                id={typeSelectId}
                data-testid='what-if-type-select'
                className='w-full'
                aria-labelledby={typeLabelId}
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
          <label
            htmlFor={valueInputId}
            className={cn('block font-medium text-foreground', SPACING.MB_2, TYPOGRAPHY.TEXT_SM)}
          >
            {getInputLabel()}
          </label>
          <InputTooltip fieldName='whatIfValue'>
            <NumberInput
              id={valueInputId}
              value={whatIf.value}
              onChange={(val) => {
                setWhatIfValue(val);
                // Clear error when user changes value
                if (error) setError('');
              }}
              prefix={whatIf.type !== 'percentage' ? '£' : undefined}
              suffix={whatIf.type === 'percentage' ? '%' : undefined}
              placeholder={getPlaceholder()}
              data-testid='what-if-value-input'
              aria-invalid={!!error}
              aria-describedby={error ? `${valueInputId}-error` : undefined}
            />
          </InputTooltip>
          {error && (
            <p
              id={`${valueInputId}-error`}
              className={cn('text-destructive', SPACING.MT_1, TYPOGRAPHY.TEXT_SM)}
              role='alert'
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className={cn('flex', SPACING.GAP_2)}>
        <Button
          onClick={handleCompare}
          size='lg'
          className={cn(
            'flex-1 justify-center bg-primary text-primary-foreground hover:bg-primary/90',
            SHADOWS.GLOW_ACCENT,
            SHADOWS.GLOW_ACCENT_HOVER,
          )}
          data-testid='what-if-trigger'
        >
          <Wand2 className={cn('mr-2', ICON_SIZES.SIZE_5)} />
          Compare Scenarios
        </Button>

        {/* Clear Button - only show when What If is active */}
        {whatIfResults && (
          <Button
            onClick={() => {
              clearWhatIf();
              setError('');
            }}
            variant='outline'
            size='default'
            className='border-primary/30 hover:border-primary/50'
            data-testid='clear-what-if-button'
            aria-label='Clear What If scenario'
          >
            <RotateCcw className={ICON_SIZES.SIZE_4} />
          </Button>
        )}
      </div>
    </div>
  );
}
