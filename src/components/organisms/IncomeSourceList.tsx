'use client';

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
import { PERIODS } from '@/constants/taxRates';
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
        <CollapsibleTrigger className='group flex items-center gap-2 font-medium text-sm transition-colors hover:text-primary'>
          <ChevronRight className='h-4 w-4 transition-transform group-data-[state=open]:rotate-90' />
          <span>Additional Income Sources</span>
          {incomeSources.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {incomeSources.length}
            </Badge>
          )}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='space-y-3 pt-3'>
        {incomeSources.length === 0 && (
          <p className='text-muted-foreground text-sm'>
            Add pension income, rental income, or other sources
          </p>
        )}

        {incomeSources.map((source, index) => (
          <div key={source.id} className='flex flex-col gap-2 rounded-lg border border-input p-2.5'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 text-xs'
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
                  <SelectTrigger className='h-9 border-input text-sm'>
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
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>

            {/* Amount and Period Row */}
            <div className='flex items-center gap-2'>
              <NumberInput
                value={source.amount}
                onChange={(amount) => updateIncomeSource(source.id, { amount })}
                prefix='£'
                decimals={2}
                placeholder='0.00'
                min={0}
                className='h-9 flex-1 text-sm'
              />

              <Select
                value={source.period}
                onValueChange={(period) =>
                  updateIncomeSource(source.id, { period: period as typeof source.period })
                }
              >
                <SelectTrigger className='h-9 w-[110px] border-input text-sm'>
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
          </div>
        ))}

        {/* Add Button */}
        <Button
          variant='outline'
          onClick={addIncomeSource}
          className='w-full'
          disabled={incomeSources.length >= 10} // Reasonable limit
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Income Source
        </Button>

        {incomeSources.length >= 10 && (
          <p className='text-muted-foreground text-xs'>Maximum 10 income sources reached</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
