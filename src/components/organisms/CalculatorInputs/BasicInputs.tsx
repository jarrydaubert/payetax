// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Percent, PoundSterling } from 'lucide-react';
import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import TaxYearSelect from '@/components/atoms/TaxYearSelect';
import { Checkbox } from '@/components/atoms/ui/checkbox';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select';
import { IncomeSourceList } from '@/components/organisms/IncomeSourceList';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { PERIODS } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';

/** State Pension Age threshold - employees over SPA don't pay NI */
const STATE_PENSION_AGE = 66;

/** Tax code validation: letters, numbers, optional K prefix, max 10 chars */
const TAX_CODE_REGEX = /^[A-Z0-9]{0,10}$/;

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

  // Generate unique IDs for accessibility
  const salaryId = useId();
  const payPeriodId = useId();
  const payPeriodLabelId = `${payPeriodId}-label`;
  const taxYearId = useId();
  const taxCodeId = useId();
  const regionId = useId();
  const regionLabelId = `${regionId}-label`;
  const marriedId = useId();
  const partnerWageId = useId();
  const blindId = useId();
  const ageId = useId();
  const ageLabelId = `${ageId}-label`;
  const payNoNIId = useId();
  const studentLoanId = useId();
  const studentLoanLabelId = `${studentLoanId}-label`;
  const postgraduateAddonId = useId();
  const allowancesId = useId();
  const pensionTypeId = useId();
  const pensionTypeLabelId = `${pensionTypeId}-label`;
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
    { value: 'plan5' as const, label: 'Plan 5 (from 2023/24)' },
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

  // Determine if user is over State Pension Age (for NI exemption)
  const isOverStatePensionAge = input.age !== undefined && input.age >= STATE_PENSION_AGE;

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

  const handlePostgraduateToggle = (checked: boolean | 'indeterminate') => {
    // Guard against indeterminate state
    if (checked !== true) {
      if (undergraduateLoan !== 'none' && undergraduateLoan !== 'postgrad') {
        // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic plan
        setStudentLoanPlans([undergraduateLoan as any]);
      }
      return;
    }

    if (undergraduateLoan === 'none' || undergraduateLoan === 'postgrad') return;

    // biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for dynamic plan
    setStudentLoanPlans([undergraduateLoan as any, 'postgrad']);
  };

  /**
   * Normalize tax code input:
   * - Uppercase
   * - Remove spaces
   * - Strip invalid characters
   * - Cap at 10 characters
   */
  const handleTaxCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/\s+/g, '');
    // Only allow valid tax code characters
    if (TAX_CODE_REGEX.test(raw)) {
      setTaxCode(raw);
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
            <SelectTrigger
              id={payPeriodId}
              className='w-[140px]'
              aria-labelledby={payPeriodLabelId}
            >
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
          {/* Hidden label for screen readers */}
          <span id={payPeriodLabelId} className='sr-only'>
            Pay period
          </span>
        </div>
      </div>

      {/* Tax Year */}
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
          onChange={handleTaxCodeChange}
          placeholder={input.region === 'Scotland' ? 'S1257L' : '1257L'}
          className='w-[100px] uppercase'
          maxLength={10}
          data-testid='tax-code-input'
        />
      </div>

      {/* Region Select with Tooltip */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='region' />
          <Label
            id={regionLabelId}
            htmlFor={regionId}
            className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}
          >
            Region
          </Label>
        </div>
        <Select value={input.region} onValueChange={setRegion}>
          <SelectTrigger
            id={regionId}
            className='w-[175px]'
            aria-labelledby={regionLabelId}
            data-testid='region-select'
          >
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
      <fieldset className='m-0 border-0 p-0'>
        <legend className='sr-only'>Tax allowances and exemptions</legend>
        <div className={cn('flex items-center', SPACING.GAP_4)}>
          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='marriageAllowance' />
            <Label htmlFor={marriedId} className={TYPOGRAPHY.TEXT_SM}>
              Married
            </Label>
            <Checkbox
              id={marriedId}
              checked={input.isMarried}
              onCheckedChange={(v) => setIsMarried(v === true)}
              data-testid='married-checkbox'
            />
          </div>

          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='blindAllowance' />
            <Label htmlFor={blindId} className={TYPOGRAPHY.TEXT_SM}>
              Blind
            </Label>
            <Checkbox
              id={blindId}
              checked={input.isBlind}
              onCheckedChange={(v) => setIsBlind(v === true)}
            />
          </div>

          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='payNoNI' />
            <Label htmlFor={payNoNIId} className={TYPOGRAPHY.TEXT_SM}>
              I pay no NI
            </Label>
            <Checkbox
              id={payNoNIId}
              checked={input.payNoNI}
              onCheckedChange={(v) => setPayNoNI(v === true)}
            />
          </div>
        </div>
      </fieldset>

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
            data-testid='partner-salary-input'
          />
        </div>
      )}

      {/* Age - Dropdown for State Pension Age (affects NI) */}
      <div className={cn('flex items-center', SPACING.GAP_3, SPACING.MT_2)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='age' />
          <Label
            id={ageLabelId}
            htmlFor={ageId}
            className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}
          >
            Age
          </Label>
        </div>
        <Select
          value={isOverStatePensionAge ? 'over-spa' : 'under-spa'}
          onValueChange={(value) => {
            // Store a representative age for calculation purposes
            // Under SPA: undefined (standard NI applies)
            // Over SPA: 67 (NI exempt - employees don't pay NI after State Pension Age)
            if (value === 'under-spa') {
              setAge(undefined);
            } else {
              setAge(67); // Representative age over State Pension Age
            }
          }}
        >
          <SelectTrigger
            id={ageId}
            className='min-w-[220px] flex-1'
            data-testid='age-select'
            aria-labelledby={ageLabelId}
          >
            <SelectValue placeholder='Select age range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='under-spa'>Under State Pension Age</SelectItem>
            <SelectItem value='over-spa'>State Pension Age or over</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Loan - Select + Conditional */}
      <div className={cn('flex flex-col', SPACING.GAP_2)}>
        <div className={cn('flex items-center', SPACING.GAP_3)}>
          <div className={cn('flex items-center', SPACING.GAP_1_5)}>
            <LabelTooltip fieldName='studentLoanPlan' />
            <Label
              id={studentLoanLabelId}
              htmlFor={studentLoanId}
              className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}
            >
              Student Loan
            </Label>
          </div>
          <Select value={undergraduateLoan} onValueChange={handleUndergraduateLoanChange}>
            <SelectTrigger
              id={studentLoanId}
              className='w-[200px]'
              aria-labelledby={studentLoanLabelId}
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

      {/* Non-taxable allowances */}
      <div className={cn('flex items-center', SPACING.GAP_3)}>
        <div className={cn('flex items-center', SPACING.GAP_1_5)}>
          <LabelTooltip fieldName='allowancesDeductions' />
          <Label htmlFor={allowancesId} className={cn('whitespace-nowrap', TYPOGRAPHY.TEXT_SM)}>
            Non-taxable allowance(s)
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
          data-testid='non-taxable-allowances-input'
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
              aria-labelledby={pensionTypeLabelId}
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
          {/* Hidden label for screen readers */}
          <span id={pensionTypeLabelId} className='sr-only'>
            Pension contribution type
          </span>

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
