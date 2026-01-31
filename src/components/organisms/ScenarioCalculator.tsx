// src/components/organisms/ScenarioCalculator.tsx
/**
 * Pre-filled calculator for scenario pages
 * Simplified version of the main calculator with scenario-specific defaults
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import NumberInput from '@/components/atoms/NumberInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import type { StudentLoanPlan } from '@/constants/taxRates';
import type { ScenarioDefaults } from '@/data/scenarios';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn } from '@/lib/utils';

interface ScenarioCalculatorProps {
  /** Scenario defaults to pre-fill */
  defaults: ScenarioDefaults;
  /** Callback when results change */
  onResultsChange?: (results: TaxCalculationResults) => void;
  /** Category for styling */
  category?: 'tax-trap' | 'student-loan' | 'life-stage' | 'scottish';
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function ScenarioCalculator({
  defaults,
  onResultsChange,
  category = 'life-stage',
}: ScenarioCalculatorProps) {
  // Generate unique IDs for form fields
  const id = useId();
  const salaryId = `${id}-salary`;
  const pensionId = `${id}-pension`;
  const studentLoanId = `${id}-student-loan`;
  const scottishId = `${id}-scottish`;

  // State for calculator inputs
  const [salary, setSalary] = useState(defaults.salary);
  const [pensionPercent, setPensionPercent] = useState(defaults.pensionPercent ?? 0);
  const [studentLoan, setStudentLoan] = useState<StudentLoanPlan | 'none'>(
    defaults.studentLoan ?? 'none',
  );
  const [isScottish, setIsScottish] = useState(defaults.scottish ?? false);
  const [results, setResults] = useState<TaxCalculationResults | null>(null);

  // Calculate on mount and when inputs change
  useEffect(() => {
    const newResults = calculateTax({
      salary,
      payPeriod: 'annually',
      taxYear: '2025-2026',
      taxCode: isScottish ? 'S1257L' : '1257L',
      isScottish,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans: studentLoan === 'none' ? 'none' : [studentLoan],
      pensionContribution: pensionPercent,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });

    setResults(newResults);
    onResultsChange?.(newResults);
  }, [salary, pensionPercent, studentLoan, isScottish, onResultsChange]);

  // Reset to defaults
  const handleReset = () => {
    setSalary(defaults.salary);
    setPensionPercent(defaults.pensionPercent ?? 0);
    setStudentLoan(defaults.studentLoan ?? 'none');
    setIsScottish(defaults.scottish ?? false);
  };

  // Category colors
  const categoryColors: Record<string, string> = {
    'tax-trap': 'from-amber-500/10 to-orange-500/10',
    'student-loan': 'from-blue-500/10 to-cyan-500/10',
    scottish: 'from-purple-500/10 to-indigo-500/10',
    'life-stage': 'from-green-500/10 to-emerald-500/10',
  };

  return (
    <Card className={cn('overflow-hidden', SPACING.P_0)}>
      {/* Header */}
      <div
        className={cn(
          'bg-gradient-to-r',
          categoryColors[category] || categoryColors['life-stage'],
          SPACING.P_4,
          'sm:p-6',
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Calculator className={cn(ICON_SIZES.SIZE_5, 'text-primary')} />
            <h3 className={cn(TYPOGRAPHY.TEXT_LG, 'font-semibold')}>Interactive Calculator</h3>
          </div>
          <Button variant='ghost' size='sm' onClick={handleReset} className='text-muted-foreground'>
            <RefreshCw className={cn(ICON_SIZES.SIZE_4, 'mr-1')} />
            Reset
          </Button>
        </div>
        <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground', SPACING.MT_1)}>
          Pre-filled for this scenario. Adjust to see how changes affect your tax.
        </p>
      </div>

      {/* Inputs */}
      <div className={cn(SPACING.P_4, 'sm:p-6', SPACING.SPACE_Y_4)}>
        {/* Salary */}
        <div className={SPACING.SPACE_Y_2}>
          <Label htmlFor={salaryId} className={TYPOGRAPHY.TEXT_SM}>
            Annual Salary
          </Label>
          <NumberInput
            id={salaryId}
            value={salary}
            onChange={setSalary}
            prefix='£'
            clearOnFocus
            decimals={0}
          />
        </div>

        {/* Pension */}
        <div className={SPACING.SPACE_Y_2}>
          <Label htmlFor={pensionId} className={TYPOGRAPHY.TEXT_SM}>
            Pension Contribution (%)
          </Label>
          <NumberInput
            id={pensionId}
            value={pensionPercent}
            onChange={setPensionPercent}
            suffix='%'
            clearOnFocus
            decimals={2}
          />
        </div>

        {/* Student Loan */}
        <div className={SPACING.SPACE_Y_2}>
          <Label htmlFor={studentLoanId} className={TYPOGRAPHY.TEXT_SM}>
            Student Loan
          </Label>
          <Select
            value={studentLoan}
            onValueChange={(value) => setStudentLoan(value as StudentLoanPlan | 'none')}
          >
            <SelectTrigger id={studentLoanId}>
              <SelectValue placeholder='Select plan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>No student loan</SelectItem>
              <SelectItem value='plan1'>Plan 1</SelectItem>
              <SelectItem value='plan2'>Plan 2</SelectItem>
              <SelectItem value='plan4'>Plan 4 (Scotland)</SelectItem>
              <SelectItem value='plan5'>Plan 5</SelectItem>
              <SelectItem value='postgrad'>Postgraduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scottish Tax */}
        <div className='flex items-center justify-between'>
          <Label htmlFor={scottishId} className={TYPOGRAPHY.TEXT_SM}>
            Scottish Taxpayer
          </Label>
          <Switch
            id={scottishId}
            checked={isScottish}
            onCheckedChange={setIsScottish}
            className='data-[state=unchecked]:bg-white/20'
          />
        </div>
      </div>

      {/* Quick Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('border-t bg-muted/30', SPACING.P_4, 'sm:p-6')}
        >
          <div className={cn('grid grid-cols-2', SPACING.GAP_4, SPACING.MB_4)}>
            <ResultItem label='Gross' value={formatCurrency(results.grossSalary.annually)} />
            <ResultItem label='Tax' value={formatCurrency(results.incomeTax.annually)} negative />
            <ResultItem
              label='NI'
              value={formatCurrency(results.nationalInsurance.annually)}
              negative
            />
            <ResultItem
              label='Take-Home'
              value={formatCurrency(results.netPay.annually)}
              highlight
            />
          </div>

          {/* Monthly breakdown */}
          <div className={cn('text-center', SPACING.MB_4)}>
            <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>
              Monthly take-home:{' '}
              <span className='font-semibold text-foreground'>
                {formatCurrency(results.netPay.monthly)}
              </span>
            </p>
          </div>

          {/* CTA to full calculator */}
          <Link href='/#calculator' className='block'>
            <Button className='w-full' variant='default'>
              Full Calculator
              <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
            </Button>
          </Link>
        </motion.div>
      )}
    </Card>
  );
}

/**
 * Individual result item
 */
function ResultItem({
  label,
  value,
  negative = false,
  highlight = false,
}: {
  label: string;
  value: string;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className='text-center'>
      <p className={cn(TYPOGRAPHY.TEXT_XS, 'text-muted-foreground')}>{label}</p>
      <p
        className={cn(
          TYPOGRAPHY.TEXT_BASE,
          'font-semibold',
          negative && 'text-red-400/80',
          highlight && 'text-green-400',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default ScenarioCalculator;
