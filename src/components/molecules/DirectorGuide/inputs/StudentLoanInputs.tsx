// src/components/molecules/DirectorGuide/inputs/StudentLoanInputs.tsx
/**
 * Student Loan Inputs - Plan 1/2/4/Postgrad checkboxes
 */
'use client';

import { Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TAX_RATES } from '@/constants/taxRates';
import { useDirectorFormData, useDirectorGuideActions } from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';

export function StudentLoanInputs() {
  const formData = useDirectorFormData();
  const { toggleStudentLoanPlan } = useDirectorGuideActions();

  const plans = [
    {
      id: 'plan1',
      label: `Plan 1 (pre-2012, threshold £${TAX_RATES[TAX_YEAR].studentLoan.plan1.threshold.toLocaleString()})`,
    },
    {
      id: 'plan2',
      label: `Plan 2 (post-2012 England/Wales, threshold £${TAX_RATES[TAX_YEAR].studentLoan.plan2.threshold.toLocaleString()})`,
    },
    {
      id: 'plan4',
      label: `Plan 4 (Scotland, threshold £${TAX_RATES[TAX_YEAR].studentLoan.plan4.threshold.toLocaleString()})`,
    },
    {
      id: 'postgrad',
      label: `Postgraduate Loan (threshold £${TAX_RATES[TAX_YEAR].studentLoan.postgrad.threshold.toLocaleString()}, 6%)`,
    },
  ] as const;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-1'>
        <Label>Student Loan</Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className='size-4 text-muted-foreground' />
          </TooltipTrigger>
          <TooltipContent>
            <p className='max-w-xs'>
              <strong>Directors pay student loans on TOTAL income</strong> (salary + dividends)
              via Self Assessment — not just salary.
              <span className='mt-1 block text-amber-200'>
                This is different from employees where student loans only come from salary via PAYE.
              </span>
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='space-y-2 pt-1'>
        {plans.map((plan) => (
          <div key={plan.id} className='flex items-center gap-2'>
            <Checkbox
              id={plan.id}
              checked={formData.studentLoanPlans.includes(plan.id)}
              onCheckedChange={() => toggleStudentLoanPlan(plan.id)}
            />
            <Label htmlFor={plan.id} className='text-sm font-normal'>
              {plan.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
