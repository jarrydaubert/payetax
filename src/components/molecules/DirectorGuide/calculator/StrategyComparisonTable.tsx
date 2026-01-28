// src/components/molecules/DirectorGuide/calculator/StrategyComparisonTable.tsx
/**
 * Strategy Comparison Table - 3-strategy comparison (All Salary / Optimal / All Dividends)
 */
'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  useDirectorGuideActions,
  useSelectedStrategy,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function StrategyComparisonTable() {
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const { setSelectedStrategy } = useDirectorGuideActions();

  if (!comparison || comparison.grossProfit <= 0) return null;

  const strategies = [
    { key: 'allSalary' as const, data: comparison.strategies.allSalary },
    { key: 'optimalMix' as const, data: comparison.strategies.optimalMix },
    { key: 'allDividends' as const, data: comparison.strategies.allDividends },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison</CardTitle>
        {comparison.savingsVsAllSalary > 0 && (
          <CardDescription>
            Save {formatCurrency(comparison.savingsVsAllSalary)} vs all-salary approach
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead className='text-right'>Salary</TableHead>
                <TableHead className='text-right'>Dividends</TableHead>
                <TableHead className='text-right'>Total Tax</TableHead>
                <TableHead className='text-right'>Take-Home</TableHead>
                <TableHead className='text-right'>Effective Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map(({ key, data }) => {
                const isSelected = selectedStrategy === key;
                const isBest = comparison.recommended === key;
                const totalTax = data.totalPersonalTax + data.corporationTax + data.employerNI;

                return (
                  <TableRow
                    key={key}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50',
                      isSelected && 'bg-blue-50 ring-2 ring-blue-500 ring-inset dark:bg-blue-950/30',
                      !isSelected && isBest && 'bg-green-50 dark:bg-green-950/20'
                    )}
                    onClick={() => setSelectedStrategy(key)}
                  >
                    <TableCell className='font-medium'>
                      {data.name}
                      {isBest && (
                        <span className='ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300'>
                          Best
                        </span>
                      )}
                      {isSelected && (
                        <CheckCircle2 className='ml-2 inline size-4 text-blue-600' />
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(data.salary)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(data.dividends)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(totalTax)}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(data.takeHome)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {data.effectiveRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
