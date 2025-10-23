'use client';

import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NumberInput from '@/components/atoms/NumberInput';
import { PERIODS } from '@/constants/taxRates';
import {
  INCOME_TYPE_LABELS,
  type IncomeSource,
  useCalculatorActions,
  useCalculatorStore,
} from '@/store/calculatorStore';

export function IncomeSourceList() {
  const incomeSources = useCalculatorStore((state) => state.input.incomeSources);
  const { addIncomeSource, updateIncomeSource, removeIncomeSource } = useCalculatorActions();

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.FOUR_WEEKLY, label: '4-Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
  ];

  return (
    <Collapsible defaultOpen={false}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="group flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
          <span>Additional Income Sources</span>
          {incomeSources.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {incomeSources.length}
            </Badge>
          )}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-3 pt-3">
        {incomeSources.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Add pension income, rental income, or other sources
          </p>
        )}

        {incomeSources.map((source, index) => (
          <div key={source.id} className="flex items-center gap-2 rounded-lg border p-3">
            <Badge variant="outline" className="shrink-0">
              {index + 1}
            </Badge>

            {/* Income Type */}
            <div className="flex-1">
              <Select
                value={source.type}
                onValueChange={(type: IncomeSource['type']) =>
                  updateIncomeSource(source.id, { type })
                }
              >
                <SelectTrigger className="w-full">
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

            {/* Amount */}
            <div className="w-32">
              <NumberInput
                value={source.amount}
                onChange={(amount) => updateIncomeSource(source.id, { amount })}
                prefix="£"
                decimals={2}
                placeholder="0.00"
                min={0}
              />
            </div>

            {/* Period */}
            <div className="w-32">
              <Select
                value={source.period}
                onValueChange={(period) => updateIncomeSource(source.id, { period: period as typeof source.period })}
              >
                <SelectTrigger>
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

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeIncomeSource(source.id)}
              aria-label="Remove income source"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add Button */}
        <Button
          variant="outline"
          onClick={addIncomeSource}
          className="w-full"
          disabled={incomeSources.length >= 10} // Reasonable limit
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Income Source
        </Button>

        {incomeSources.length >= 10 && (
          <p className="text-muted-foreground text-xs">
            Maximum 10 income sources reached
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
