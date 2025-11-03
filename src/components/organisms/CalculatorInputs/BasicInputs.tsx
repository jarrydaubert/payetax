// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Percent, PoundSterling } from 'lucide-react';
import { useId } from 'react';
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
import { PERIODS } from '@/constants/taxRates';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';

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
    setStudentLoanPlan,
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
    { value: 'none' as const, label: 'No' },
    { value: 'plan1' as const, label: 'Plan 1' },
    { value: 'plan2' as const, label: 'Plan 2' },
    { value: 'plan4' as const, label: 'Plan 4' },
    { value: 'plan5' as const, label: 'Plan 5' },
    { value: 'postgrad' as const, label: 'Postgraduate' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-3'
    >
      {/* Heading */}
      <h3 className='font-semibold text-foreground text-lg'>Enter Income Tax Details</h3>
      {/* Salary and Pay Period on one line */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='salary' />
          <Label htmlFor={salaryId} className='whitespace-nowrap text-sm'>
            Salary
          </Label>
        </div>
        <div className='flex flex-1 gap-2'>
          <NumberInput
            id={salaryId}
            value={input.salary}
            onChange={setSalary}
            prefix='£'
            decimals={2}
            placeholder='0.00'
            min={0}
            className='flex-1'
            data-testid='salary-input'
          />
          <Select value={input.payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger
              id={payPeriodId}
              className='w-[140px] border-input'
              aria-label='Select pay period'
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
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='taxYear' />
          <Label htmlFor={taxYearId} className='whitespace-nowrap text-sm'>
            Tax Year
          </Label>
        </div>
        <TaxYearSelect
          id={taxYearId}
          value={input.taxYear}
          onChange={setTaxYear}
          label=''
          className='w-[155px]'
        />
      </div>

      {/* Tax Code Input with Tooltip - defaults to 1257L (S1257L for Scotland) */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='taxCode' />
          <Label htmlFor={taxCodeId} className='whitespace-nowrap text-sm'>
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
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='region' />
          <Label htmlFor={regionId} className='whitespace-nowrap text-sm'>
            Region
          </Label>
        </div>
        <Select value={input.region} onValueChange={setRegion}>
          <SelectTrigger
            id={regionId}
            className='w-[175px] border-input'
            aria-label='Select tax region'
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
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='marriageAllowance' />
          <Label htmlFor={marriedId} className='text-sm'>
            Married
          </Label>
          <Checkbox
            id={marriedId}
            checked={input.isMarried}
            onCheckedChange={setIsMarried}
            data-testid='married-checkbox'
          />
        </div>

        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='blindAllowance' />
          <Label htmlFor={blindId} className='text-sm'>
            Blind
          </Label>
          <Checkbox id={blindId} checked={input.isBlind} onCheckedChange={setIsBlind} />
        </div>

        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='payNoNI' />
          <Label htmlFor={payNoNIId} className='text-sm'>
            I pay no NI
          </Label>
          <Checkbox id={payNoNIId} checked={input.payNoNI} onCheckedChange={setPayNoNI} />
        </div>
      </div>

      {input.isMarried && (
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1.5'>
            <LabelTooltip fieldName='partnerGrossWage' />
            <Label htmlFor={partnerWageId} className='whitespace-nowrap text-sm'>
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
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='age' />
          <Label htmlFor={ageId} className='whitespace-nowrap text-sm'>
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
            className='w-[120px] border-input'
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

      {/* Student Loan */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='studentLoanPlan' />
          <Label htmlFor={studentLoanId} className='whitespace-nowrap text-sm'>
            Student Loan
          </Label>
        </div>
        <Select value={input.studentLoanPlan} onValueChange={setStudentLoanPlan}>
          <SelectTrigger
            id={studentLoanId}
            className='w-[160px] border-input'
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

      {/* Allowances/Deductions */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='allowancesDeductions' />
          <Label htmlFor={allowancesId} className='whitespace-nowrap text-sm'>
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
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='pensionContribution' />
          <Label htmlFor={pensionId} className='whitespace-nowrap text-sm'>
            Pension
          </Label>
        </div>
        <div className='flex flex-1 gap-1.5'>
          {/* Type selector with icons */}
          <Select value={input.pensionContributionType} onValueChange={setPensionContributionType}>
            <SelectTrigger
              id={pensionTypeId}
              className='w-[70px] shrink-0 border-input'
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
