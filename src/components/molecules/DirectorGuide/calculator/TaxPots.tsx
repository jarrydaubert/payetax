// src/components/molecules/DirectorGuide/calculator/TaxPots.tsx
/**
 * Tax Pots - Company and Personal tax pots to set aside
 */
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateSalaryScenario } from '@/lib/tax/strategyComparison';
import {
  useDirectorFormData,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function TaxPots() {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();
  const selectedStrategy = useSelectedStrategy();
  const sliderSalary = useSliderSalary();

  // Calculate active scenario values
  const values = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0) return null;

    // If using slider, calculate custom scenario
    if (sliderSalary !== null) {
      const scenario = calculateSalaryScenario(
        sliderSalary,
        comparison.grossProfit - formData.pensionContribution,
        formData.region!,
        TAX_YEAR,
        formData.otherIncome,
        formData.hasEmploymentAllowance,
        formData.studentLoanPlans,
        formData.pensionContribution,
        formData.companyCarBIK
      );

      return {
        corporationTax: scenario.corporationTax,
        incomeTax: scenario.incomeTax,
        dividendTax: scenario.dividendTax,
        studentLoan: scenario.studentLoan,
      };
    }

    // Use selected strategy
    const strategy = comparison.strategies[selectedStrategy];
    return {
      corporationTax: strategy.corporationTax,
      incomeTax: strategy.incomeTax,
      dividendTax: strategy.dividendTax,
      studentLoan: strategy.studentLoan,
    };
  }, [comparison, sliderSalary, selectedStrategy, formData]);

  if (!values) return null;

  const personalTotal = values.incomeTax + values.dividendTax + values.studentLoan;

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Company Tax Pot */}
        <Card className='border-blue-500/50'>
          <CardHeader>
            <CardTitle className='text-blue-700 dark:text-blue-400'>Company Tax Pot</CardTitle>
            <CardDescription>Set aside in company account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Corporation Tax</span>
                <span>{formatCurrency(values.corporationTax)}</span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='font-semibold'>Total</span>
                <span className='font-bold text-xl'>{formatCurrency(values.corporationTax)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Tax Pot */}
        <Card className='border-purple-500/50'>
          <CardHeader>
            <CardTitle className='text-purple-700 dark:text-purple-400'>Personal Tax Pot</CardTitle>
            <CardDescription>Set aside for Self Assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Income Tax</span>
                <span>{formatCurrency(values.incomeTax)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Dividend Tax</span>
                <span>{formatCurrency(values.dividendTax)}</span>
              </div>
              {values.studentLoan > 0 && (
                <div className='flex justify-between'>
                  <span>Student Loan</span>
                  <span>{formatCurrency(values.studentLoan)}</span>
                </div>
              )}
              <div className='flex justify-between border-t pt-2'>
                <span className='font-semibold'>Total</span>
                <span className='font-bold text-xl'>{formatCurrency(personalTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Transfer References */}
      <Card className='border-muted'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Bank Transfer References</CardTitle>
          <CardDescription>Use these labels when making transfers for clear records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-2 text-sm md:grid-cols-2'>
            <div className='flex items-center justify-between rounded bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>Salary transfer:</span>
              <code className='font-mono text-xs'>SALARY [MONTH]</code>
            </div>
            <div className='flex items-center justify-between rounded bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>Dividend payment:</span>
              <code className='font-mono text-xs'>DIVIDEND [DATE]</code>
            </div>
            <div className='flex items-center justify-between rounded bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>Tax pot (company):</span>
              <code className='font-mono text-xs'>TAX RESERVE</code>
            </div>
            <div className='flex items-center justify-between rounded bg-muted/50 px-3 py-2'>
              <span className='text-muted-foreground'>Tax pot (personal):</span>
              <code className='font-mono text-xs'>SA TAX SAVE</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
