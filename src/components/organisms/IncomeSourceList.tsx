'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import NumberInput from '@/components/atoms/NumberInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/atoms/ui/alert';
import { Badge } from '@/components/atoms/ui/badge';
import { Button } from '@/components/atoms/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/atoms/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select';
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { PERIODS } from '@/constants/taxRates';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { cn } from '@/lib/utils';
import {
  INCOME_TYPE_LABELS,
  type IncomeSource,
  useCalculatorActions,
  useCalculatorStore,
} from '@/store/calculatorStore';

// Type-safe income types derived from INCOME_TYPE_LABELS
const INCOME_TYPES = Object.keys(INCOME_TYPE_LABELS) as IncomeSource['type'][];

/** Runtime type guard for income type values from Select */
function isIncomeType(value: string): value is IncomeSource['type'] {
  return (INCOME_TYPES as string[]).includes(value);
}

// Pay period options - defined outside component for stability
const PAY_PERIOD_OPTIONS = [
  { value: PERIODS.ANNUALLY, label: 'Annually' },
  { value: PERIODS.MONTHLY, label: 'Monthly' },
  { value: PERIODS.FOUR_WEEKLY, label: '4-Weekly' },
  { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
  { value: PERIODS.WEEKLY, label: 'Weekly' },
] as const;

// Valid period values for runtime validation
const VALID_PERIODS = new Set(Object.values(PERIODS));

/** Runtime type guard for pay period values from Select */
function isValidPeriod(value: string): value is IncomeSource['period'] {
  return VALID_PERIODS.has(value as IncomeSource['period']);
}

export function IncomeSourceList() {
  const incomeSources = useCalculatorStore((state) => state.input.incomeSources || []);
  const { addIncomeSource, updateIncomeSource, removeIncomeSource } = useCalculatorActions();
  const [isOpen, setIsOpen] = React.useState(false);
  const shouldReduceMotion = useMotionPreference();

  // Close the collapsible when income sources are cleared (e.g., on reset)
  React.useEffect(() => {
    if (incomeSources.length === 0) {
      setIsOpen(false);
    }
  }, [incomeSources.length]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className='flex items-center justify-between'>
        <CollapsibleTrigger
          className={cn(
            'group flex items-center rounded-md font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            SPACING.GAP_2,
            TYPOGRAPHY.TEXT_SM,
          )}
        >
          <ChevronRight
            className={cn(
              ICON_SIZES.SIZE_4,
              'transition-transform group-data-[state=open]:rotate-90',
            )}
          />
          <span>Additional Income Sources</span>
          {incomeSources.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {incomeSources.length}
            </Badge>
          )}
        </CollapsibleTrigger>
      </div>
      <p className={cn('mt-1 text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
        Add other income here if you have anything besides your main salary.
      </p>

      <CollapsibleContent className={cn('pt-3', SPACING.SPACE_Y_3)}>
        {incomeSources.length === 0 && (
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
            Add pension income, rental income, or other sources
          </p>
        )}
        {incomeSources.length > 0 && (
          <Alert variant='warning'>
            <AlertTriangle className={ICON_SIZES.SIZE_4} aria-hidden='true' />
            <AlertTitle>Additional income accuracy</AlertTitle>
            <AlertDescription>
              Multiple income sources can affect personal allowance, tax bands, and student loans.
              We&apos;re verifying these edge cases, so totals may be understated.
            </AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode='popLayout'>
          {incomeSources.map((source, index) => (
            <motion.div
              key={source.id}
              layout={!shouldReduceMotion}
              // Simplified animation: opacity + scale only (no height for performance)
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.spring}
              className={cn('flex flex-col rounded-lg border border-input p-2.5', SPACING.GAP_2)}
              data-testid={`income-source-${index}`}
            >
              <div className={cn('flex items-center', SPACING.GAP_2)}>
                <Badge
                  variant='outline'
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0',
                    TYPOGRAPHY.TEXT_XS,
                  )}
                >
                  {index + 1}
                </Badge>

                {/* Income Type - with runtime type guard */}
                <div className='min-w-0 flex-1'>
                  <Select
                    value={source.type}
                    onValueChange={(value) => {
                      if (!isIncomeType(value)) return;
                      updateIncomeSource(source.id, { type: value });
                    }}
                  >
                    <SelectTrigger
                      className={cn('h-9 border-input', TYPOGRAPHY.TEXT_SM)}
                      aria-label='Select income type'
                      data-testid={`income-source-${index}-type`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Remove Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive'
                  onClick={() => removeIncomeSource(source.id)}
                  aria-label={`Remove income source ${index + 1}`}
                >
                  <Trash2 className={ICON_SIZES.SIZE_4} />
                </Button>
              </div>

              {/* Amount and Period Row */}
              <div className={cn('flex items-center', SPACING.GAP_2)}>
                <NumberInput
                  value={source.amount}
                  onChange={(amount) => updateIncomeSource(source.id, { amount })}
                  prefix='£'
                  decimals={0}
                  placeholder='0'
                  min={0}
                  className={cn('h-9 flex-1', TYPOGRAPHY.TEXT_SM)}
                  data-testid={`income-source-${index}-amount`}
                />

                {/* Period - with runtime type guard */}
                <Select
                  value={source.period}
                  onValueChange={(value) => {
                    if (!isValidPeriod(value)) return;
                    updateIncomeSource(source.id, { period: value });
                  }}
                >
                  <SelectTrigger
                    className={cn('h-9 w-28 border-input', TYPOGRAPHY.TEXT_SM)}
                    aria-label='Select pay period'
                    data-testid={`income-source-${index}-period`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Button */}
        <Button
          variant='outline'
          onClick={addIncomeSource}
          className='w-full'
          disabled={incomeSources.length >= 10}
          data-testid='add-income-source'
        >
          <Plus className={cn('mr-2', ICON_SIZES.SIZE_4)} />
          Add Income Source
        </Button>

        {incomeSources.length >= 10 && (
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_XS)}>
            Maximum 10 income sources reached
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
