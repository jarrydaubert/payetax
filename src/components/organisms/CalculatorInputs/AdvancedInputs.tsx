// src/components/organisms/CalculatorInputs/AdvancedInputs.tsx
'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import NumberInput from '@/components/atoms/NumberInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalculatorActions, useCalculatorStore } from '@/store/calculatorStore';

/**
 * Advanced Inputs Component
 *
 * Groups less commonly used inputs into a collapsible section:
 * - Marriage Allowance
 * - Blind Person's Allowance
 * - Age
 * - Pay No NI
 * - Student Loan
 * - Pension Contribution
 * - Allowances/Deductions
 *
 * Implements progressive disclosure to reduce initial complexity
 */
export function AdvancedInputs() {
  const input = useCalculatorStore((state) => state.input);
  const {
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

  // Track open/closed state
  const [isOpen, setIsOpen] = useState(false);

  const marriedId = useId();
  const partnerWageId = useId();
  const blindId = useId();
  const ageId = useId();
  const payNoNIId = useId();
  const studentLoanId = useId();
  const allowancesId = useId();
  const pensionTypeId = useId();
  const pensionId = useId();

  const studentLoanOptions = [
    { value: 'none' as const, label: 'No' },
    { value: 'plan1' as const, label: 'Plan 1' },
    { value: 'plan2' as const, label: 'Plan 2' },
    { value: 'plan4' as const, label: 'Plan 4' },
    { value: 'plan5' as const, label: 'Plan 5' },
    { value: 'postgrad' as const, label: 'Postgraduate' },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-full'>
      <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-primary/20 bg-muted/50 px-4 py-2.5 font-medium text-sm transition-colors hover:bg-muted'>
        <span>Advanced Options</span>
        <ChevronDown
          className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className='mt-3 space-y-3'>
        {/* Marriage Allowance */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={marriedId} className='text-sm'>
              Married
            </Label>
            <LabelTooltip fieldName='marriageAllowance' />
          </div>
          <Checkbox
            id={marriedId}
            checked={input.isMarried}
            onCheckedChange={setIsMarried}
            className='flex-1'
          />
        </div>

        {input.isMarried && (
          <div className='flex items-center gap-3'>
            <div className='flex min-w-[140px] items-center gap-1.5'>
              <Label htmlFor={partnerWageId} className='text-sm'>
                Partner's Gross Wage
              </Label>
              <LabelTooltip fieldName='partnerGrossWage' />
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

        {/* Blind Person's Allowance */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={blindId} className='text-sm'>
              Blind Allowance
            </Label>
            <LabelTooltip fieldName='blindAllowance' />
          </div>
          <Checkbox
            id={blindId}
            checked={input.isBlind}
            onCheckedChange={setIsBlind}
            className='flex-1'
          />
        </div>

        {/* Age */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={ageId} className='text-sm'>
              Age
            </Label>
            <LabelTooltip fieldName='age' />
          </div>
          <NumberInput
            id={ageId}
            value={input.age || 0}
            onChange={(value) => setAge(value > 0 ? value : undefined)}
            decimals={0}
            placeholder='Enter age'
            min={0}
            max={120}
            className='flex-1'
            data-testid='age-input'
          />
        </div>

        {/* Pay No NI */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={payNoNIId} className='text-sm'>
              I pay no NI
            </Label>
            <LabelTooltip fieldName='payNoNI' />
          </div>
          <Checkbox
            id={payNoNIId}
            checked={input.payNoNI}
            onCheckedChange={setPayNoNI}
            className='flex-1'
          />
        </div>

        {/* Student Loan */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={studentLoanId} className='text-sm'>
              Student Loan
            </Label>
            <LabelTooltip fieldName='studentLoanPlan' />
          </div>
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

        {/* Allowances/Deductions */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={allowancesId} className='text-sm'>
              Allowances/Deductions
            </Label>
            <LabelTooltip fieldName='allowancesDeductions' />
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

        {/* Pension Type */}
        <div className='flex items-center gap-3'>
          <div className='flex min-w-[140px] items-center gap-1.5'>
            <Label htmlFor={pensionTypeId} className='text-sm'>
              Pension Type
            </Label>
            <LabelTooltip fieldName='pensionType' />
          </div>
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

        {/* Pension Contribution */}
        {input.pensionContributionType === 'percentage' ? (
          <div className='flex items-center gap-3'>
            <div className='flex min-w-[140px] items-center gap-1.5'>
              <Label htmlFor={pensionId} className='text-sm'>
                Pension Contribution %
              </Label>
              <LabelTooltip fieldName='pensionContribution' />
            </div>
            <NumberInput
              id={pensionId}
              value={input.pensionContribution}
              onChange={setPensionContribution}
              suffix='%'
              decimals={2}
              placeholder='5.00'
              min={0}
              max={100}
              className='flex-1'
            />
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <div className='flex min-w-[140px] items-center gap-1.5'>
              <Label htmlFor={pensionId} className='text-sm'>
                Pension Contribution
              </Label>
              <LabelTooltip fieldName='pensionContribution' />
            </div>
            <NumberInput
              id={pensionId}
              value={input.pensionContribution}
              onChange={setPensionContribution}
              prefix='£'
              decimals={2}
              placeholder='0.00'
              min={0}
              className='flex-1'
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
