// src/components/molecules/DirectorGuide/inputs/StudentLoanInputs.tsx
/**
 * Student Loan Inputs - Plan 1/2/4/Postgrad checkboxes
 */
'use client';

import { Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CURRENT_TAX_YEAR, type StudentLoanPlan, TAX_RATES } from '@/constants/taxRates';
import { getAvailableDirectorStudentLoanPlans } from '@/lib/tax/studentLoanPlans';
import { useDirectorFormValue, useDirectorGuideActions } from '@/store/directorGuideStore';

function getStudentLoanPlanLabel(plan: StudentLoanPlan): string {
  const thresholds = TAX_RATES[CURRENT_TAX_YEAR].studentLoan;

  switch (plan) {
    case 'plan1':
      return `Plan 1 (pre-2012, threshold £${thresholds.plan1.threshold.toLocaleString()})`;
    case 'plan2':
      return `Plan 2 (post-2012 England/Wales, threshold £${thresholds.plan2.threshold.toLocaleString()})`;
    case 'plan4':
      return `Plan 4 (Scotland, threshold £${thresholds.plan4.threshold.toLocaleString()})`;
    case 'plan5':
      return `Plan 5 (post-2023 England, threshold £${thresholds.plan5.threshold.toLocaleString()})`;
    case 'postgrad':
      return `Postgraduate Loan (threshold £${thresholds.postgrad.threshold.toLocaleString()}, 6%)`;
    default:
      return plan;
  }
}

export function StudentLoanInputs() {
  const studentLoanPlans = useDirectorFormValue((formData) => formData.studentLoanPlans);
  const { toggleStudentLoanPlan } = useDirectorGuideActions();
  const plans = getAvailableDirectorStudentLoanPlans(CURRENT_TAX_YEAR).map((plan) => ({
    id: plan,
    label: getStudentLoanPlanLabel(plan),
  }));

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
              <strong>Directors pay student loans on TOTAL income</strong> (salary + dividends) via
              Self Assessment — not just salary.
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
              checked={studentLoanPlans.includes(plan.id)}
              onCheckedChange={() => toggleStudentLoanPlan(plan.id)}
            />
            <Label htmlFor={plan.id} className='font-normal text-sm'>
              {plan.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
