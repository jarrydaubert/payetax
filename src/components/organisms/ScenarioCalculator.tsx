// src/components/organisms/ScenarioCalculator.tsx
/**
 * Pre-filled calculator for scenario pages
 * Simplified version of the main calculator with scenario-specific defaults
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { type StudentLoanPlan, TAX_YEARS, type TaxYear } from '@/constants/taxRates';
import type { ScenarioDefaults } from '@/data/scenarios';
import { calculateTax, type TaxCalculationResults } from '@/lib/taxCalculator';
import { cn, formatCurrency } from '@/lib/utils';

// Current tax year from single source of truth (TAX_YEARS is ordered newest first)
const CURRENT_TAX_YEAR = TAX_YEARS[0] ?? '2025-2026';

// Valid student loan values for runtime type guard
const STUDENT_LOAN_VALUES = ['none', 'plan1', 'plan2', 'plan4', 'plan5', 'postgrad'] as const;
type StudentLoanValue = (typeof STUDENT_LOAN_VALUES)[number];

function isStudentLoanValue(v: string): v is StudentLoanValue {
  return (STUDENT_LOAN_VALUES as readonly string[]).includes(v);
}

export interface ScenarioCalculatorInputs {
  salary: number;
  pensionPercent: number;
  studentLoan: StudentLoanValue;
  isScottish: boolean;
  taxYear: TaxYear;
}

interface ScenarioCalculatorProps {
  /** Scenario defaults to pre-fill */
  defaults: ScenarioDefaults;
  /** Callback when results change */
  onResultsChange?: (results: TaxCalculationResults) => void;
  /** Callback when inputs change (used by scenario pages for optimization comparisons) */
  onInputsChange?: (inputs: ScenarioCalculatorInputs) => void;
  /** Category for styling */
  category?: 'tax-trap' | 'student-loan' | 'life-stage' | 'scottish';
}

export function ScenarioCalculator({
  defaults,
  onResultsChange,
  onInputsChange,
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
  const [studentLoan, setStudentLoan] = useState<StudentLoanValue>(defaults.studentLoan ?? 'none');
  const [isScottish, setIsScottish] = useState(defaults.scottish ?? false);

  // Ref to store callback without causing re-renders
  const onResultsChangeRef = useRef(onResultsChange);
  useEffect(() => {
    onResultsChangeRef.current = onResultsChange;
  }, [onResultsChange]);

  // Notify parent when inputs change (lifted state without fully controlling the form)
  const onInputsChangeRef = useRef(onInputsChange);
  useEffect(() => {
    onInputsChangeRef.current = onInputsChange;
  }, [onInputsChange]);

  useEffect(() => {
    onInputsChangeRef.current?.({
      salary,
      pensionPercent,
      studentLoan,
      isScottish,
      taxYear: CURRENT_TAX_YEAR as TaxYear,
    });
  }, [salary, pensionPercent, studentLoan, isScottish]);

  // Compute results with useMemo (pure function of state)
  const results = useMemo(() => {
    return calculateTax({
      salary,
      payPeriod: 'annually',
      taxYear: CURRENT_TAX_YEAR as TaxYear,
      taxCode: isScottish ? 'S1257L' : '1257L',
      isScottish,
      isMarried: false,
      partnerGrossWage: 0,
      isBlind: false,
      payNoNI: false,
      studentLoanPlans: studentLoan === 'none' ? 'none' : [studentLoan as StudentLoanPlan],
      pensionContribution: pensionPercent,
      pensionContributionType: 'percentage',
      niCategory: 'A',
      hoursPerWeek: 37.5,
    });
  }, [salary, pensionPercent, studentLoan, isScottish]);

  // Notify parent when results change (using ref to avoid dependency)
  useEffect(() => {
    onResultsChangeRef.current?.(results);
  }, [results]);

  // Reset to defaults
  const handleReset = () => {
    setSalary(defaults.salary);
    setPensionPercent(defaults.pensionPercent ?? 0);
    setStudentLoan(defaults.studentLoan ?? 'none');
    setIsScottish(defaults.scottish ?? false);
  };

  // Clamp pension percent to valid range
  const handlePensionChange = (value: number) => {
    setPensionPercent(Math.min(100, Math.max(0, value)));
  };

  // Clamp salary to valid range
  const handleSalaryChange = (value: number) => {
    setSalary(Math.max(0, value));
  };

  // Category colors
  const categoryColors: Record<string, string> = {
    'tax-trap': 'from-warning/10 to-destructive/10',
    'student-loan': 'from-primary/10 to-primary/5',
    scottish: 'from-primary/10 to-muted/20',
    'life-stage': 'from-success/10 to-primary/10',
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
            onChange={handleSalaryChange}
            prefix='£'
            clearOnFocus
            decimals={0}
            min={0}
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
            onChange={handlePensionChange}
            suffix='%'
            clearOnFocus
            decimals={1}
            min={0}
            max={100}
          />
        </div>

        {/* Student Loan - with runtime type guard */}
        <div className={SPACING.SPACE_Y_2}>
          <Label htmlFor={studentLoanId} className={TYPOGRAPHY.TEXT_SM}>
            Student Loan
          </Label>
          <Select
            value={studentLoan}
            onValueChange={(value) => {
              if (isStudentLoanValue(value)) {
                setStudentLoan(value);
              }
            }}
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
            Scottish Income Tax Rates
          </Label>
          <Switch
            id={scottishId}
            checked={isScottish}
            onCheckedChange={setIsScottish}
            className='data-[state=unchecked]:bg-muted'
          />
        </div>
      </div>

      {/* Quick Results */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('border-t bg-muted/30', SPACING.P_4, 'sm:p-6')}
      >
        <div className={cn('grid grid-cols-2', SPACING.GAP_4, SPACING.MB_4)}>
          <ResultItem label='Gross' value={formatCurrency(results.grossSalary.annually, 0)} />
          <ResultItem label='Tax' value={formatCurrency(results.incomeTax.annually, 0)} negative />
          <ResultItem
            label='NI'
            value={formatCurrency(results.nationalInsurance.annually, 0)}
            negative
          />
          <ResultItem
            label='Take-Home'
            value={formatCurrency(results.netPay.annually, 0)}
            highlight
          />
        </div>

        {/* Monthly breakdown */}
        <div className={cn('text-center', SPACING.MB_4)}>
          <p className={cn(TYPOGRAPHY.TEXT_SM, 'text-muted-foreground')}>
            Monthly take-home:{' '}
            <span className='font-semibold text-foreground'>
              {formatCurrency(results.netPay.monthly, 0)}
            </span>
          </p>
        </div>

        {/* CTA to full calculator - using asChild for proper semantics */}
        <Button asChild className='w-full' variant='default'>
          <Link href='/#tax-calculator'>
            Full Calculator
            <ArrowRight className={cn(ICON_SIZES.SIZE_4, 'ml-2')} />
          </Link>
        </Button>
      </motion.div>
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
          negative && 'text-destructive',
          highlight && 'text-success',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default ScenarioCalculator;
