// src/app/embed/EmbedCalculator.tsx
'use client';

import { ArrowRight, Calculator, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { calculateTax } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

export function EmbedCalculator() {
  const salaryId = useId();
  const [salary, setSalary] = useState('');
  const [period, setPeriod] = useState<'annually' | 'monthly'>('annually');
  const [results, setResults] = useState<{
    grossSalary: number;
    netPay: number;
    incomeTax: number;
    nationalInsurance: number;
  } | null>(null);

  const handleCalculate = () => {
    const value = Number.parseFloat(salary.replace(/[£,]/g, ''));
    if (Number.isNaN(value) || value < 0) return;

    const annualSalary = period === 'annually' ? value : value * 12;

    const result = calculateTax({
      salary: annualSalary,
      payPeriod: 'annually',
      taxCode: '1257L',
      taxYear: '2025-2026',
      isScottish: false,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      pensionContribution: 0,
      pensionContributionType: 'amount',
      studentLoanPlans: 'none',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });

    setResults({
      grossSalary: result.grossSalary.annually,
      netPay: result.netPay.annually,
      incomeTax: result.incomeTax.annually,
      nationalInsurance: result.nationalInsurance.annually,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <div className='min-h-screen bg-background p-4'>
      <Card className='mx-auto max-w-md'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Calculator className={ICON_SIZES.SIZE_5} />
            UK Tax Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Salary Input */}
          <div className='space-y-2'>
            <Label htmlFor={salaryId}>Salary</Label>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <span className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'>
                  £
                </span>
                <Input
                  id={salaryId}
                  type='text'
                  inputMode='numeric'
                  placeholder='30,000'
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='pl-7'
                />
              </div>
              <Select value={period} onValueChange={(v: 'annually' | 'monthly') => setPeriod(v)}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='annually'>Per Year</SelectItem>
                  <SelectItem value='monthly'>Per Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculate Button */}
          <Button onClick={handleCalculate} className='w-full' size='lg'>
            Calculate Take-Home Pay
          </Button>

          {/* Results */}
          {results && (
            <div className='space-y-3 rounded-lg border bg-muted/30 p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Gross Salary</span>
                <span className='font-medium'>{formatCurrency(results.grossSalary)}</span>
              </div>
              <div className='flex items-center justify-between text-destructive/80'>
                <span>Income Tax</span>
                <span>-{formatCurrency(results.incomeTax)}</span>
              </div>
              <div className='flex items-center justify-between text-destructive/80'>
                <span>National Insurance</span>
                <span>-{formatCurrency(results.nationalInsurance)}</span>
              </div>
              <div className='border-t pt-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold text-emerald'>Take-Home Pay</span>
                  <span className={cn('font-bold text-emerald', TYPOGRAPHY.TEXT_XL)}>
                    {formatCurrency(results.netPay)}
                  </span>
                </div>
                <p className='mt-1 text-muted-foreground text-xs'>
                  {formatCurrency(results.netPay / 12)} per month
                </p>
              </div>
            </div>
          )}

          {/* Link to full calculator */}
          <Link
            href='https://payetax.co.uk'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-2 pt-2 text-muted-foreground text-sm hover:text-foreground'
          >
            Full calculator with more options
            <ExternalLink className={ICON_SIZES.SIZE_3_5} />
          </Link>
        </CardContent>
      </Card>

      {/* Powered by badge */}
      <div className='mt-4 text-center'>
        <Link
          href='https://payetax.co.uk'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground'
        >
          Powered by
          <span className='font-semibold'>
            paye<span className='text-emerald'>tax</span>
          </span>
          <ArrowRight className='h-3 w-3' />
        </Link>
      </div>
    </div>
  );
}
