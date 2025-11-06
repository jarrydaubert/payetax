'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import NumberInput from '@/components/atoms/NumberInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.FOUR_WEEKLY, label: '4-Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className='flex items-center justify-between'>
        <CollapsibleTrigger
          className={cn(
            'group flex items-center font-medium transition-colors hover:text-primary',
            SPACING.GAP_2,
            TYPOGRAPHY.TEXT_SM
          )}
        >
          <ChevronRight
            className={cn(
              ICON_SIZES.SIZE_4,
              'transition-transform group-data-[state=open]:rotate-90'
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

      <CollapsibleContent className={cn('pt-3', SPACING.SPACE_Y_3)}>
        {incomeSources.length === 0 && (
          <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
            Add pension income, rental income, or other sources
          </p>
        )}

        <AnimatePresence mode='popLayout'>
          {incomeSources.map((source, index) => (
            <motion.div
              key={source.id}
              layout={!shouldReduceMotion}
              initial={shouldReduceMotion ? {} : { opacity: 0, height: 0, scale: 0.8 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, height: 'auto', scale: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, height: 0, scale: 0.8 }}
              transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.spring}
              className={cn('flex flex-col rounded-lg border border-input p-2.5', SPACING.GAP_2)}
            >
              <div className={cn('flex items-center', SPACING.GAP_2)}>
                <Badge
                  variant='outline'
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0',
                    TYPOGRAPHY.TEXT_XS
                  )}
                >
                  {index + 1}
                </Badge>

                {/* Income Type */}
                <div className='min-w-0 flex-1'>
                  <Select
                    value={source.type}
                    onValueChange={(type: IncomeSource['type']) =>
                      updateIncomeSource(source.id, { type })
                    }
                  >
                    <SelectTrigger
                      className={cn('h-9 border-input', TYPOGRAPHY.TEXT_SM)}
                      aria-label='Select income type'
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
                  className='h-9 w-9 shrink-0'
                  onClick={() => removeIncomeSource(source.id)}
                  aria-label='Remove income source'
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
                  decimals={2}
                  placeholder='0.00'
                  min={0}
                  className={cn('h-9 flex-1', TYPOGRAPHY.TEXT_SM)}
                />

                <Select
                  value={source.period}
                  onValueChange={(period) =>
                    updateIncomeSource(source.id, { period: period as typeof source.period })
                  }
                >
                  <SelectTrigger
                    className={cn('h-9 w-[110px] border-input', TYPOGRAPHY.TEXT_SM)}
                    aria-label='Select pay period'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {payPeriodOptions.map((option) => (
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
          disabled={incomeSources.length >= 10} // Reasonable limit
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
