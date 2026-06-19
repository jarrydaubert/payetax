// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Percent, PoundSterling } from 'lucide-react';
import { useId, useRef } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import TaxYearSelect from '@/components/atoms/TaxYearSelect';
import { IncomeSourceList } from '@/components/organisms/IncomeSourceList';
import { Button } from '@/components/ui/button';
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
import { PERIODS, type StudentLoanPlan } from '@/constants/taxRates';
import { trackEvent, trackFormInteraction } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';

/** State Pension Age threshold - employees over SPA don't pay NI */
const STATE_PENSION_AGE = 66;

/** Tax code validation: letters, numbers, optional K prefix, max 10 chars */
const TAX_CODE_REGEX = /^[A-Z0-9]{0,10}$/;

const SALARY_PRESETS = [
  { label: '£30k', salary: 30_000 },
  { label: '£40k', salary: 40_000 },
  { label: '£50k', salary: 50_000 },
  { label: '£60k', salary: 60_000 },
  { label: '£100k trap', salary: 100_000 },
] as const;

export function BasicInputs() {
  const trackedFieldFocusesRef = useRef<Set<string>>(new Set());

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
    setInput,
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

  const STUDENT_LOAN_PLANS: StudentLoanPlan[] = ['plan1', 'plan2', 'plan4', 'plan5', 'postgrad'];
  const isStudentLoanPlan = (value: string): value is StudentLoanPlan =>
    STUDENT_LOAN_PLANS.includes(value as StudentLoanPlan);
  const isUndergraduatePlan = (value: string): value is Exclude<StudentLoanPlan, 'postgrad'> =>
    value !== 'postgrad' && isStudentLoanPlan(value);

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

  const trackCalculatorFieldFocus = (fieldName: string) => {
    if (trackedFieldFocusesRef.current.has(fieldName)) return;

    trackedFieldFocusesRef.current.add(fieldName);
    trackFormInteraction('paye_calculator', 'focus', fieldName);
  };

  const trackPresetSelected = (preset: string) => {
    trackEvent({
      action: 'calculator_action',
      category: 'calculator',
      label: 'preset_selected',
      custom_data: { preset },
    });
  };

  const applySalaryPreset = (salary: number, label: string) => {
    setSalary(salary);
    setPayPeriod(PERIODS.ANNUALLY);
    trackPresetSelected(label);
  };

  const applyScotlandPreset = () => {
    const shouldUseStandardScottishCode = input.taxCode === '' || input.taxCode === '1257L';

    setInput({
      region: 'Scotland',
      isScottish: true,
      ...(shouldUseStandardScottishCode ? { taxCode: 'S1257L' } : {}),
    });
    trackPresetSelected('scotland');
  };

  const applyPlanTwoPreset = () => {
    setStudentLoanPlans(['plan2']);
    trackPresetSelected('plan_2_student_loan');
  };

  const applyFivePercentPensionPreset = () => {
    setInput({
      pensionContributionType: 'percentage',
      pensionContribution: 5,
    });
    trackPresetSelected('five_percent_pension');
  };

  const handleUndergraduateLoanChange = (value: string) => {
    trackFormInteraction('paye_calculator', 'change', 'student_loan');

    if (value === 'none') {
      setStudentLoanPlans('none');
      return;
    }
    if (value === 'postgrad') {
      setStudentLoanPlans(['postgrad']);
      return;
    }
    if (!isUndergraduatePlan(value)) return;

    // Undergraduate loan - check if we need to add postgrad
    const undergraduatePlan = value as Exclude<StudentLoanPlan, 'postgrad'>;
    const newPlans: StudentLoanPlan[] = hasPostgraduateAddOn
      ? [undergraduatePlan, 'postgrad']
      : [undergraduatePlan];
    setStudentLoanPlans(newPlans);
  };

  const handlePostgraduateToggle = (checked: boolean | 'indeterminate') => {
    // Guard against indeterminate state
    if (checked !== true) {
      if (isUndergraduatePlan(undergraduateLoan)) {
        setStudentLoanPlans([undergraduateLoan]);
      }
      return;
    }

    if (!isUndergraduatePlan(undergraduateLoan)) return;

    setStudentLoanPlans([undergraduateLoan, 'postgrad']);
  };

  const fieldRowClass = cn(
    'flex flex-col items-start sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center',
    'gap-2',
    'sm:gap-3',
  );
  const fieldLabelClass = cn('flex min-w-0 items-center', 'gap-1.5');
  const fieldControlClass = 'min-w-0 justify-self-start';
  const selectControlClass = cn(fieldControlClass, 'w-44 max-w-full');
  const longSelectControlClass = cn(fieldControlClass, 'w-full max-w-64');
  const numericControlClass = cn(fieldControlClass, 'w-36 max-w-full');
  const fullWidthInputClass = 'w-full';
  const flexInputWrapperClass = numericControlClass;

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
      className={'space-y-3'}
    >
      {/* Heading */}
      <h3 className={cn('font-semibold text-foreground', 'text-base', 'sm:text-lg')}>
        Enter Income Tax Details
      </h3>

      {/* Salary and Pay Period on one line */}
      <div className={fieldRowClass}>
        <div className={fieldLabelClass}>
          <LabelTooltip fieldName='salary' />
          <Label htmlFor={salaryId} className={cn('whitespace-nowrap', 'text-sm')}>
            Salary
          </Label>
        </div>
        <div
          className={cn(
            fieldControlClass,
            'grid w-full max-w-full grid-cols-[minmax(0,1fr)_7.5rem] sm:w-[17rem]',
            'gap-2',
          )}
        >
          <NumberInput
            id={salaryId}
            value={input.salary}
            onChange={(value) => {
              setSalary(value);
            }}
            onFocus={() => trackCalculatorFieldFocus('salary')}
            prefix='£'
            decimals={2}
            placeholder='0.00'
            min={0}
            max={10000000}
            wrapperClassName='min-w-0 flex-1'
            className={cn(fullWidthInputClass, 'text-right tabular-nums')}
            data-testid='salary-input'
          />
          <Select value={input.payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger id={payPeriodId} className='w-full' aria-labelledby={payPeriodLabelId}>
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

      <fieldset className='space-y-2 rounded-md border border-border/70 bg-muted/30 p-3'>
        <legend className='px-1 font-medium text-muted-foreground text-xs'>Quick presets</legend>
        <div className='flex flex-wrap gap-2'>
          {SALARY_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type='button'
              variant='outline'
              size='sm'
              className='h-8 px-2.5 text-xs'
              onClick={() => applySalaryPreset(preset.salary, preset.label)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 px-2.5 text-xs'
            onClick={applyScotlandPreset}
          >
            Scotland
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 px-2.5 text-xs'
            onClick={applyPlanTwoPreset}
          >
            Plan 2 loan
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 px-2.5 text-xs'
            onClick={applyFivePercentPensionPreset}
          >
            5% pension
          </Button>
        </div>
      </fieldset>

      {/* Tax Year */}
      <div className={fieldRowClass}>
        <div className={cn(fieldLabelClass, 'sm:whitespace-nowrap')}>
          <LabelTooltip fieldName='taxYear' />
          <Label htmlFor={taxYearId} className={'text-sm'}>
            Tax Year
          </Label>
        </div>
        <TaxYearSelect
          id={taxYearId}
          value={input.taxYear}
          onChange={setTaxYear}
          label=''
          className={selectControlClass}
          data-testid='tax-year-select'
        />
      </div>

      {/* Tax Code Input with Tooltip - defaults to 1257L (S1257L for Scotland) */}
      <div className={fieldRowClass}>
        <div className={fieldLabelClass}>
          <LabelTooltip fieldName='taxCode' />
          <Label htmlFor={taxCodeId} className={cn('whitespace-nowrap', 'text-sm')}>
            Tax Code
          </Label>
        </div>
        <Input
          id={taxCodeId}
          type='text'
          value={input.taxCode}
          onChange={handleTaxCodeChange}
          onFocus={() => trackCalculatorFieldFocus('tax_code')}
          placeholder={input.region === 'Scotland' ? 'S1257L' : '1257L'}
          className={cn(fieldControlClass, 'w-28 max-w-full uppercase')}
          maxLength={10}
          data-testid='tax-code-input'
        />
      </div>

      {/* Region Select with Tooltip */}
      <div className={fieldRowClass}>
        <div className={fieldLabelClass}>
          <LabelTooltip fieldName='region' />
          <Label
            id={regionLabelId}
            htmlFor={regionId}
            className={cn('whitespace-nowrap', 'text-sm')}
          >
            Region
          </Label>
        </div>
        <Select value={input.region} onValueChange={setRegion}>
          <SelectTrigger
            id={regionId}
            className={selectControlClass}
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
      <fieldset className='border-0 p-0'>
        <legend className='sr-only'>Tax allowances and exemptions</legend>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap'>
          <div className={fieldLabelClass}>
            <LabelTooltip fieldName='marriageAllowance' />
            <Label htmlFor={marriedId} className={cn('whitespace-nowrap', 'text-sm')}>
              Married
            </Label>
            <Checkbox
              id={marriedId}
              checked={input.isMarried}
              onCheckedChange={(v) => setIsMarried(v === true)}
              data-testid='married-checkbox'
            />
          </div>

          <div className={fieldLabelClass}>
            <LabelTooltip fieldName='blindAllowance' />
            <Label htmlFor={blindId} className={cn('whitespace-nowrap', 'text-sm')}>
              Blind
            </Label>
            <Checkbox
              id={blindId}
              checked={input.isBlind}
              onCheckedChange={(v) => setIsBlind(v === true)}
            />
          </div>

          <div className={fieldLabelClass}>
            <LabelTooltip fieldName='payNoNI' />
            <Label htmlFor={payNoNIId} className={cn('whitespace-nowrap', 'text-sm')}>
              No NI
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
        <div className={fieldRowClass}>
          <div className={fieldLabelClass}>
            <LabelTooltip fieldName='partnerGrossWage' />
            <Label htmlFor={partnerWageId} className={cn('sm:whitespace-nowrap', 'text-sm')}>
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
            wrapperClassName={flexInputWrapperClass}
            className={fullWidthInputClass}
            data-testid='partner-salary-input'
          />
        </div>
      )}

      {/* Age - Dropdown for State Pension Age (affects NI) */}
      <div className={cn(fieldRowClass, 'mt-4')}>
        <div className={cn(fieldLabelClass, 'sm:whitespace-nowrap')}>
          <LabelTooltip fieldName='age' />
          <Label id={ageLabelId} htmlFor={ageId} className={cn('whitespace-nowrap', 'text-sm')}>
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
            className={longSelectControlClass}
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
      <div className={cn('flex flex-col', 'gap-2')}>
        <div className={fieldRowClass}>
          <div className={fieldLabelClass}>
            <LabelTooltip fieldName='studentLoanPlan' />
            <Label
              id={studentLoanLabelId}
              htmlFor={studentLoanId}
              className={cn('whitespace-nowrap', 'text-sm')}
            >
              Student Loan
            </Label>
          </div>
          <Select value={undergraduateLoan} onValueChange={handleUndergraduateLoanChange}>
            <SelectTrigger
              id={studentLoanId}
              className={longSelectControlClass}
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
          <div className={cn('flex items-center', 'gap-2', 'sm:pl-6')}>
            <Checkbox
              id={postgraduateAddonId}
              checked={hasPostgraduateAddOn}
              onCheckedChange={handlePostgraduateToggle}
              data-testid='postgraduate-addon-checkbox'
            />
            <Label htmlFor={postgraduateAddonId} className={cn('cursor-pointer', 'text-sm')}>
              I also have a Postgraduate Loan
            </Label>
          </div>
        )}
      </div>

      {/* Non-taxable allowances */}
      <div className={fieldRowClass}>
        <div className={fieldLabelClass}>
          <LabelTooltip fieldName='allowancesDeductions' />
          <Label htmlFor={allowancesId} className={cn('sm:whitespace-nowrap', 'text-sm')}>
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
          wrapperClassName={flexInputWrapperClass}
          className={fullWidthInputClass}
          data-testid='non-taxable-allowances-input'
        />
      </div>

      {/* Pension - Combined Type + Amount on 1 row */}
      <div className={fieldRowClass}>
        <div className={fieldLabelClass}>
          <LabelTooltip fieldName='pensionContribution' />
          <Label htmlFor={pensionId} className={cn('whitespace-nowrap', 'text-sm')}>
            Pension
          </Label>
        </div>
        <div
          className={cn(
            fieldControlClass,
            'grid w-full max-w-[15rem] grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)]',
            'gap-1.5',
          )}
        >
          {/* Type selector with icons */}
          <Select
            value={input.pensionContributionType}
            onValueChange={(value) => {
              if (!(value === 'percentage' || value === 'amount')) return;
              trackFormInteraction('paye_calculator', 'change', 'pension_type');
              setPensionContributionType(value);
            }}
          >
            <SelectTrigger
              id={pensionTypeId}
              className='w-full shrink-0'
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
            onFocus={() => trackCalculatorFieldFocus('pension')}
            prefix={input.pensionContributionType === 'amount' ? '£' : undefined}
            suffix={input.pensionContributionType === 'percentage' ? '%' : undefined}
            decimals={2}
            placeholder={input.pensionContributionType === 'percentage' ? '5.00' : '0.00'}
            min={0}
            max={input.pensionContributionType === 'percentage' ? 100 : undefined}
            wrapperClassName='min-w-0 flex-1'
            className={fullWidthInputClass}
            data-testid='pension-input'
          />
        </div>
      </div>

      <IncomeSourceList />
    </motion.div>
  );
}
