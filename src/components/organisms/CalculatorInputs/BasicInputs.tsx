// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
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
import { PERIODS, TAX_YEARS } from '@/constants/taxRates';
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
    setPayNoNI,
    setStudentLoanPlan,
    setPensionContribution,
    setPensionContributionType,
  } = useCalculatorActions();

  const salaryId = useId();
  const payPeriodId = useId();
  const taxYearId = useId();
  const taxCodeId = useId();
  const regionId = useId();
  const marriedId = useId();
  const partnerWageId = useId();
  const blindId = useId();
  const payNoNIId = useId();
  const studentLoanId = useId();
  const pensionTypeId = useId();
  const pensionId = useId();

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.FOUR_WEEKLY, label: 'Four Weekly' },
  ];

  const taxYearOptions = TAX_YEARS.map((year) => ({
    value: year,
    label: year,
  }));

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
      <CurrencyInput
        id={salaryId}
        label='Salary'
        value={input.salary}
        onChange={setSalary}
        placeholder='0.00'
        inline
      />

      <div className='flex items-center gap-3'>
        <Label htmlFor={payPeriodId} className='min-w-[140px] text-sm'>
          Pay Period
        </Label>
        <Select value={input.payPeriod} onValueChange={setPayPeriod}>
          <SelectTrigger id={payPeriodId} className='flex-1'>
            <SelectValue placeholder='Select pay period' />
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

      <div className='flex items-center gap-3'>
        <Label htmlFor={taxYearId} className='min-w-[140px] text-sm'>
          Tax Year
        </Label>
        <Select value={input.taxYear} onValueChange={setTaxYear}>
          <SelectTrigger id={taxYearId} className='flex-1'>
            <SelectValue placeholder='Select tax year' />
          </SelectTrigger>
          <SelectContent>
            {taxYearOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-3'>
        <Label htmlFor={taxCodeId} className='min-w-[140px] text-sm'>
          Tax Code
        </Label>
        <Input
          id={taxCodeId}
          type='text'
          value={input.taxCode}
          onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
          placeholder='1257L'
          className='flex-1 uppercase'
        />
      </div>

      <div className='flex items-center gap-3'>
        <Label htmlFor={regionId} className='min-w-[140px] text-sm'>
          Region
        </Label>
        <Select value={input.region} onValueChange={setRegion}>
          <SelectTrigger id={regionId} className='flex-1'>
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

      <div className='flex items-center gap-3'>
        <Label htmlFor={marriedId} className='min-w-[140px] text-sm'>
          Married
        </Label>
        <Checkbox id={marriedId} checked={input.isMarried} onCheckedChange={setIsMarried} />
      </div>

      {input.isMarried && (
        <CurrencyInput
          id={partnerWageId}
          label="Partner's Gross Wage"
          value={input.partnerGrossWage}
          onChange={setPartnerGrossWage}
          placeholder='0'
          inline
        />
      )}

      <div className='flex items-center gap-3'>
        <Label htmlFor={blindId} className='min-w-[140px] text-sm'>
          Blind Allowance
        </Label>
        <Checkbox id={blindId} checked={input.isBlind} onCheckedChange={setIsBlind} />
      </div>

      <div className='flex items-center gap-3'>
        <Label htmlFor={payNoNIId} className='min-w-[140px] text-sm'>
          I pay no NI
        </Label>
        <Checkbox id={payNoNIId} checked={input.payNoNI} onCheckedChange={setPayNoNI} />
      </div>

      <div className='flex items-center gap-3'>
        <Label htmlFor={studentLoanId} className='min-w-[140px] text-sm'>
          Student Loan
        </Label>
        <Select value={input.studentLoanPlan} onValueChange={setStudentLoanPlan}>
          <SelectTrigger id={studentLoanId} className='flex-1'>
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

      <div className='flex items-center gap-3'>
        <Label htmlFor={pensionTypeId} className='min-w-[140px] text-sm'>
          Pension Type
        </Label>
        <Select value={input.pensionContributionType} onValueChange={setPensionContributionType}>
          <SelectTrigger id={pensionTypeId} className='flex-1'>
            <SelectValue placeholder='Select type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='percentage'>Percentage</SelectItem>
            <SelectItem value='amount'>Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {input.pensionContributionType === 'percentage' ? (
        <div className='flex items-center gap-3'>
          <Label htmlFor={pensionId} className='min-w-[140px] text-sm'>
            Pension Contribution %
          </Label>
          <div className='relative flex-1'>
            <Input
              id={pensionId}
              type='number'
              value={input.pensionContribution === 0 ? '' : input.pensionContribution}
              onChange={(e) => setPensionContribution(Number(e.target.value) || 0)}
              placeholder='5'
              min='0'
              max='100'
              className='pr-8'
            />
            <span className='-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground text-sm'>
              %
            </span>
          </div>
        </div>
      ) : (
        <CurrencyInput
          id={pensionId}
          label='Pension Contribution'
          value={input.pensionContribution}
          onChange={setPensionContribution}
          placeholder='0'
          inline
        />
      )}
    </motion.div>
  );
}
