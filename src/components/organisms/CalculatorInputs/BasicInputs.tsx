// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Percent, PoundSterling } from 'lucide-react';
import { useId } from 'react';
import { z } from 'zod';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import TaxYearSelect from '@/components/atoms/TaxYearSelect';
import { IncomeSourceList } from '@/components/organisms/IncomeSourceList';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { PERIODS } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';

/**
 * Zod validation schema for salary input
 * Validates that salary is between £0 and £10M
 *
 * Future: Add schemas for partnerWage, pensionContribution, allowances
 */
const salarySchema = z
  .number()
  .min(0, 'Salary cannot be negative')
  .max(10000000, 'Salary cannot exceed £10M');

export function BasicInputs() {
  // Use optimized selectors - extract only input state and actions
  const input = useCalculatorStore((state) => state.input);
  const {
    setSalary,
    setPayPeriod,
    setTaxYear,
    setTaxCode,
    setRegion,
    setIsMarried,
    setPartnerGrossWage,
    setIsBlind,
    setAge,
    setPayNoNI,
    setStudentLoanPlans,
    setPensionContribution,
    setPensionContributionType,
    setAllowancesDeductions,
  } = useCalculatorActions();

  const salaryId = useId();
  const payPeriodId = useId();
  const taxYearId = useId();
  const taxCodeId = useId();
  const regionId = useId();
  const marriedId = useId();
  const partnerWageId = useId();
  const blindId = useId();
  const ageId = useId();
  const payNoNIId = useId();
  const studentLoanId = useId();
  const postgraduateAddonId = useId();
  const allowancesId = useId();
  const pensionTypeId = useId();
  const pensionId = useId();

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.FOUR_WEEKLY, label: '4-Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
    { value: PERIODS.DAILY, label: 'Daily' },
    { value: PERIODS.HOURLY, label: 'Hourly' },
  ];

  const regionOptions = [
    { value: 'England' as const, label: 'England' },
    { value: 'Scotland' as const, label: 'Scotland' },
    { value: 'Wales' as const, label: 'Wales' },
    { value: 'Northern Ireland' as const, label: 'Northern Ireland' },
  ];

  const studentLoanOptions = [
    { value: 'none' as const, label: 'No student loan' },
    { value: 'plan1' as const, label: 'Plan 1 (pre-Sept 2012)' },
    { value: 'plan2' as const, label: 'Plan 2 (Sept 2012+)' },
    { value: 'plan4' as const, label: 'Plan 4 (Scotland)' },
    { value: 'plan5' as const, label: 'Plan 5 (2023+)' },
    { value: 'postgrad' as const, label: 'Postgraduate only' },
  ];

  // Determine undergraduate loan from store
  const undergraduateLoan =
    input.studentLoanPlans === 'none' || !Array.isArray(input.studentLoanPlans)
      ? 'none'
      : input.studentLoanPlans.includes('postgrad') && input.studentLoanPlans.length === 1
        ? 'postgrad'
        : input.studentLoanPlans.find((p) => p !== 'postgrad') || 'none';

  // Check if has postgraduate in addition to undergrad
  const hasPostgraduateAddOn =
    Array.isArray(input.studentLoanPlans) &&
    input.studentLoanPlans.includes('postgrad') &&
    input.studentLoanPlans.length === 2;

  const handleUndergraduateLoanChange = (value: string) => {
    if (value === 'none') {
      setStudentLoanPlans('none');
    } else if (value === 'postgrad') {
      setStudentLoanPlans(['postgrad']);
    } else {
      // Undergraduate loan - check if we need to add postgrad
      // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic plan selection
      const newPlans = hasPostgraduateAddOn ? [value as any, 'postgrad'] : [value as any];
      setStudentLoanPlans(newPlans);
    }
  };

  const handlePostgraduateToggle = (checked: boolean) => {
    if (undergraduateLoan === 'none' || undergraduateLoan === 'postgrad') return;

    if (checked) {
      // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic plan
      setStudentLoanPlans([undergraduateLoan as any, 'postgrad']);
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic plan
      setStudentLoanPlans([undergraduateLoan as any]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={SPACING.SPACE_Y_3}
    >
      {/* Heading */}
      {/* IMPORTANT: Uses TEXT_LG to match other section headings (ResultsTable, PeriodSelectorCard)
          Ensures visual consistency across calculator interface */}
      <h3 className={cn('font-semibold text-foreground', TYPOGRAPHY.TEXT_LG)}>
        Enter Income Tax Details
      </h3>
      {/* Salary and Pay Period on one line */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='salary' />
          <Label htmlFor={salaryId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Salary
          </Label>
        </div>
        <div className={cn('flex flex-1', SPACING.GAP_2)}>
          <NumberInput
            id={salaryId}
            value={input.salary}
            onChange={(value) => {
              setSalary(value);
              // Validate on change for immediate feedback
              try {
                salarySchema.parse(value);
              } catch (err) {
                // Validation happens silently - NumberInput has min/max constraints
                if (err instanceof z.ZodError) {
                  console.warn('Salary validation:', err.issues[0]?.message);
                }
              }
            }}
            prefix='£'
            decimals={2}
            placeholder='0.00'
            min={0}
            max={10000000}
            className='flex-1'
            data-testid='salary-input'
          />
          <Select value={input.payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger id={payPeriodId} className='w-[140px]' aria-label='Select pay period'>
              <SelectValue placeholder='Annually' />
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

      {/* IMPORTANT: Tax Year width must be 170px minimum
          Calendar icon (16px) + gap (8px) + text "2025-2026" (~80px) + 
          dropdown arrow (~20px) + padding (~24px) = ~148px required.
          Using 170px provides comfortable spacing without text wrapping. */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center whitespace-nowrap', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='taxYear' />
          <Label htmlFor={taxYearId} className={TYPOGRAPHY.TEXT_SM}>
            Tax Year
          </Label>
        </div>
        <TaxYearSelect
          id={taxYearId}
          value={input.taxYear}
          onChange={setTaxYear}
          label=''
          className='w-[170px]'
        />
      </div>

      {/* Tax Code Input with Tooltip - defaults to 1257L (S1257L for Scotland) */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='taxCode' />
          <Label htmlFor={taxCodeId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Tax Code
          </Label>
        </div>
        <Input
          id={taxCodeId}
          type='text'
          value={input.taxCode}
          onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
          placeholder={input.region === 'Scotland' ? 'S1257L' : '1257L'}
          className='w-[100px] uppercase'
        />
      </div>

      {/* Region Select with Tooltip */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='region' />
          <Label htmlFor={regionId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Region
          </Label>
        </div>
        <Select value={input.region} onValueChange={setRegion}>
          <SelectTrigger id={regionId} className='w-[175px]' aria-label='Select tax region'>
            <SelectValue placeholder='Select region' />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3 Checkboxes on 1 row: Married, Blind, I pay no NI */}
      <div className={cn('flex items-center', SPACING.GAP_4)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='marriageAllowance' />
          <Label htmlFor={marriedId} className={TYPOGRAPHY.TEXT_SM}>
            Married
          </Label>
          <Checkbox
            id={marriedId}
            checked={input.isMarried}
            onCheckedChange={setIsMarried}
            data-testid='married-checkbox'
          />
        </div>

        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='blindAllowance' />
          <Label htmlFor={blindId} className={TYPOGRAPHY.TEXT_SM}>
            Blind
          </Label>
          <Checkbox id={blindId} checked={input.isBlind} onCheckedChange={setIsBlind} />
        </div>

        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='payNoNI' />
          <Label htmlFor={payNoNIId} className={TYPOGRAPHY.TEXT_SM}>
            I pay no NI
          </Label>
          <Checkbox id={payNoNIId} checked={input.payNoNI} onCheckedChange={setPayNoNI} />
        </div>
      </div>

      {input.isMarried && (
        <div className={cn('flex items-center', SPACING.GAP_3)}>
          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='partnerGrossWage' />
            <Label htmlFor={partnerWageId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
              Partner's Gross Wage
            </Label>
          </div>
          <NumberInput
            id={partnerWageId}
            value={input.partnerGrossWage}
            onChange={setPartnerGrossWage}
            prefix='£'
            decimals={2}
            placeholder='0.00'
            min={0}
            className='flex-1'
          />
        </div>
      )}

      {/* Age - Dropdown for HMRC NI thresholds */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='age' />
          <Label htmlFor={ageId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Age
          </Label>
        </div>
        <Select
          value={
            !input.age || input.age < 65
              ? 'under-65'
              : input.age >= 65 && input.age < 75
                ? '65-74'
                : '75-plus'
          }
          onValueChange={(value) => {
            // Set representative age for each bracket
            // Age affects personal allowance and NI calculations
            if (value === 'under-65')
              setAge(undefined); // Working age (no age allowance)
            else if (value === '65-74')
              setAge(70); // Gets £3,660 age allowance, auto-exempt from NI if 66+
            else setAge(76); // Gets £3,960 age allowance, auto-exempt from NI
          }}
        >
          <SelectTrigger
            id={ageId}
            className='w-[120px]'
            data-testid='age-select'
            aria-label='Select age range'
          >
            <SelectValue placeholder='Select age range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='under-65'>Under 65</SelectItem>
            <SelectItem value='65-74'>65-74</SelectItem>
            <SelectItem value='75-plus'>Over 75</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Loan - Select + Conditional */}
      <div className={cn('flex flex-col', SPACING.GAP_2)}>
        <div className={cn('flex items-center', SPACING.GAP_3)}>
          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='studentLoanPlan' />
            <Label htmlFor={studentLoanId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
              Student Loan
            </Label>
          </div>
          <Select value={undergraduateLoan} onValueChange={handleUndergraduateLoanChange}>
            <SelectTrigger
              id={studentLoanId}
              className='w-[200px]'
              aria-label='Select student loan plan'
              data-testid='student-loan-select'
            >
              <SelectValue placeholder='Select student loan' />
            </SelectTrigger>
            <SelectContent>
              {studentLoanOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional: Show postgraduate add-on if undergraduate loan selected */}
        {undergraduateLoan !== 'none' && undergraduateLoan !== 'postgrad' && (
          <div className={cn('flex items-center', SPACING.GAP_2, 'pl-6')}>
            <Checkbox
              id={postgraduateAddonId}
              checked={hasPostgraduateAddOn}
              onCheckedChange={handlePostgraduateToggle}
              data-testid='postgraduate-addon-checkbox'
            />
            <Label
              htmlFor={postgraduateAddonId}
              className={cn('cursor-pointer', TYPOGRAPHY.TEXT_SM)}
            >
              I also have a Postgraduate Loan
            </Label>
          </div>
        )}
      </div>

      {/* Allowances/Deductions */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='allowancesDeductions' />
          <Label htmlFor={allowancesId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Allowances/Deductions
          </Label>
        </div>
        <NumberInput
          id={allowancesId}
          value={input.allowancesDeductions}
          onChange={setAllowancesDeductions}
          prefix='£'
          decimals={2}
          placeholder='0.00'
          min={0}
          className='flex-1'
        />
      </div>

      {/* Pension - Combined Type + Amount on 1 row */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='pensionContribution' />
          <Label htmlFor={pensionId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Pension
          </Label>
        </div>
        <div className={cn('flex flex-1', SPACING.GAP_1_5)}>
          {/* Type selector with icons */}
          <Select value={input.pensionContributionType} onValueChange={setPensionContributionType}>
            <SelectTrigger
              id={pensionTypeId}
              className='w-[70px] shrink-0'
              aria-label='Select pension contribution type'
              data-testid='pension-type-select'
            >
              <SelectValue>
                {input.pensionContributionType === 'percentage' ? (
                  <Percent className='size-4' />
                ) : (
                  <PoundSterling className='size-4' />
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='percentage'>
                <div className='flex items-center justify-center'>
                  <Percent className='size-4' />
                </div>
              </SelectItem>
              <SelectItem value='amount'>
                <div className='flex items-center justify-center'>
                  <PoundSterling className='size-4' />
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Input field */}
          <NumberInput
            id={pensionId}
            value={input.pensionContribution}
            onChange={setPensionContribution}
            prefix={input.pensionContributionType === 'amount' ? '£' : undefined}
            suffix={input.pensionContributionType === 'percentage' ? '%' : undefined}
            decimals={2}
            placeholder={input.pensionContributionType === 'percentage' ? '5.00' : '0.00'}
            min={0}
            max={input.pensionContributionType === 'percentage' ? 100 : undefined}
            className='flex-1'
            data-testid='pension-input'
          />
        </div>
      </div>

      {/* Additional Income Sources */}
      <IncomeSourceList />
    </motion.div>
  );
}
