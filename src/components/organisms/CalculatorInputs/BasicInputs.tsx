// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Percent, PoundSterling } from 'lucide-react';
import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import TaxYearSelect from '@/components/atoms/TaxYearSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
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

      {/* Salary and Pay Period - Mobile: stacked, Desktop: inline with £ prefix */}
      <Field>
        <FieldLabel htmlFor={salaryId}>
          <LabelTooltip fieldName='salary' />
          Salary
        </FieldLabel>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <InputGroup className='flex-1'>
            <InputGroupAddon align='inline-start'>
              <PoundSterling className='size-4' />
            </InputGroupAddon>
            <NumberInput
              id={salaryId}
              value={input.salary || 0}
              onChange={setSalary}
              decimals={2}
              clearOnFocus={true}
              data-testid='salary-input'
              className='border-0 bg-transparent'
            />
          </InputGroup>
          <Select value={input.payPeriod} onValueChange={setPayPeriod}>
            <SelectTrigger id={payPeriodId} className='w-full sm:w-[140px]'>
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
      </Field>

      {/* Tax Year */}
      <Field>
        <FieldLabel htmlFor={taxYearId}>
          <LabelTooltip fieldName='taxYear' />
          Tax Year
        </FieldLabel>
        <TaxYearSelect
          id={taxYearId}
          value={input.taxYear}
          onChange={setTaxYear}
          label=''
          className='flex-1'
        />
      </Field>

      {/* Tax Code - defaults to 1257L (S1257L for Scotland) */}
      <Field>
        <FieldLabel htmlFor={taxCodeId}>
          <LabelTooltip fieldName='taxCode' />
          Tax Code
        </FieldLabel>
        <Input
          id={taxCodeId}
          type='text'
          value={input.taxCode}
          onChange={(e) => setTaxCode(e.target.value.toUpperCase())}
          placeholder={input.region === 'Scotland' ? 'S1257L' : '1257L'}
          className='flex-1 uppercase'
        />
      </Field>

      {/* Region Select */}
      <Field>
        <FieldLabel htmlFor={regionId}>
          <LabelTooltip fieldName='region' />
          Region
        </FieldLabel>
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
      </Field>

      {/* 3 Checkboxes on 1 row: Married, Blind, I pay no NI */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-1.5'>
          <LabelTooltip fieldName='marriageAllowance' />
          <Label htmlFor={marriedId} className='text-sm'>
            Married
          </Label>
          <Checkbox id={marriedId} checked={input.isMarried} onCheckedChange={setIsMarried} />
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

      {/* Partner's Gross Wage - Only shown when married - Using InputGroup with £ prefix */}
      {input.isMarried && (
        <Field>
          <FieldLabel htmlFor={partnerWageId}>
            <LabelTooltip fieldName='partnerGrossWage' />
            Partner's Gross Wage
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon align='inline-start'>
              <PoundSterling className='size-4' />
            </InputGroupAddon>
            <NumberInput
              id={partnerWageId}
              value={input.partnerGrossWage || 0}
              onChange={setPartnerGrossWage}
              decimals={2}
              clearOnFocus={true}
              className='border-0 bg-transparent'
            />
          </InputGroup>
        </Field>
      )}

      {/* Age - Dropdown for HMRC NI thresholds */}
      <Field>
        <FieldLabel htmlFor={ageId}>
          <LabelTooltip fieldName='age' />
          Age
        </FieldLabel>
        <Select
          value={
            !input.age || input.age < 65
              ? 'under-65'
              : input.age >= 65 && input.age < 75
                ? '65-74'
                : '75-plus'
          }
          onValueChange={(value) => {
            // Set representative age for each bracket (affects NI calculations)
            if (value === 'under-65')
              setAge(undefined); // Use default (working age)
            else if (value === '65-74')
              setAge(70); // Over state pension age (no NI)
            else setAge(76); // 75+ (no NI)
          }}
        >
          <SelectTrigger id={ageId} className='flex-1' data-testid='age-select'>
            <SelectValue placeholder='Select age range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='under-65'>Under 65</SelectItem>
            <SelectItem value='65-74'>65-74</SelectItem>
            <SelectItem value='75-plus'>Over 75</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Student Loan */}
      <Field>
        <FieldLabel htmlFor={studentLoanId}>
          <LabelTooltip fieldName='studentLoanPlan' />
          Student Loan
        </FieldLabel>
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
      </Field>

      {/* Allowances/Deductions - Using InputGroup with £ prefix */}
      <Field>
        <FieldLabel htmlFor={allowancesId}>
          <LabelTooltip fieldName='allowancesDeductions' />
          Allowances/Deductions
        </FieldLabel>
        <InputGroup>
          <InputGroupAddon align='inline-start'>
            <PoundSterling className='size-4' />
          </InputGroupAddon>
          <NumberInput
            id={allowancesId}
            value={input.allowancesDeductions || 0}
            onChange={setAllowancesDeductions}
            decimals={2}
            clearOnFocus={true}
            className='border-0 bg-transparent'
          />
        </InputGroup>
      </Field>

      {/* Pension - Mobile: stacked, Desktop: inline with type selector + £/% */}
      <Field>
        <FieldLabel htmlFor={pensionId}>
          <LabelTooltip fieldName='pensionContribution' />
          Pension
        </FieldLabel>
        <div className='flex flex-col gap-2 sm:flex-row sm:gap-1.5'>
          {/* Type selector with icons - full width on mobile */}
          <Select value={input.pensionContributionType} onValueChange={setPensionContributionType}>
            <SelectTrigger id={pensionTypeId} className='w-full sm:w-[60px] sm:shrink-0'>
              <SelectValue>
                {input.pensionContributionType === 'percentage' ? (
                  <>
                    <span className='sm:hidden'>Percentage</span>
                    <Percent className='hidden size-4 sm:block' />
                  </>
                ) : (
                  <>
                    <span className='sm:hidden'>Fixed Amount</span>
                    <PoundSterling className='hidden size-4 sm:block' />
                  </>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='percentage'>
                <div className='flex items-center gap-2'>
                  <Percent className='size-4' />
                  <span className='sm:hidden'>Percentage</span>
                </div>
              </SelectItem>
              <SelectItem value='amount'>
                <div className='flex items-center gap-2'>
                  <PoundSterling className='size-4' />
                  <span className='sm:hidden'>Fixed Amount</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Input field with prefix/suffix */}
          <InputGroup className='flex-1'>
            {input.pensionContributionType === 'amount' && (
              <InputGroupAddon align='inline-start'>
                <PoundSterling className='size-4' />
              </InputGroupAddon>
            )}
            <NumberInput
              id={pensionId}
              value={input.pensionContribution || 0}
              onChange={setPensionContribution}
              decimals={2}
              clearOnFocus={true}
              className='border-0 bg-transparent'
            />
            {input.pensionContributionType === 'percentage' && (
              <InputGroupAddon align='inline-end'>
                <Percent className='size-4' />
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </Field>
    </motion.div>
  );
}
