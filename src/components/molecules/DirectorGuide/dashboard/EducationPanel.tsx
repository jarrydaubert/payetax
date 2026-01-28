// src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx
/**
 * Education Panel - Learn cards, warnings, and assumptions
 *
 * Uses Zustand store hooks instead of props.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useStrategyComparison,
} from '@/store/directorGuideStore';

interface EducationPanelProps {
  className?: string;
}

export function EducationPanel({ className }: EducationPanelProps) {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  const hasResults = comparison && comparison.grossProfit > 0;
  const revenue = formData.revenue ?? 0;

  // Determine which warnings to show
  const showVATWarning = hasResults && revenue >= 85000 && revenue <= 95000;
  const showSelfAssessmentWarning =
    hasResults && comparison.strategies.optimalMix.dividends > 0;
  const showOtherIncomeWarning = formData.otherIncome > 0;
  const showDLAWarning =
    formData.alreadyTaken > 0 && formData.takenViaPayroll === 'no';
  const showComplexityWarning = hasResults && comparison.grossProfit > 250000;
  const showOverdrawnWarning =
    hasResults && formData.alreadyTaken > comparison.strategies.optimalMix.takeHome;
  const showPensionWarning = formData.pensionContribution > 60000;
  const showStudentLoanWarning = formData.studentLoanPlans.length > 0;

  return (
    <aside className={cn('flex h-full flex-col bg-muted/30 p-6', className)}>
      {/* Learn Section */}
      <section className='mb-8'>
        <h3 className='mb-4 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
          Learn
        </h3>
        <div className='space-y-3'>
          <LearnCard
            title='Why £12,570 Salary?'
            description='This is the Personal Allowance - earn below this and pay zero income tax and employee NI. You also get NI credits for State Pension.'
          />
          <LearnCard
            title='What Are Dividends?'
            description='Payments from company profits to shareholders, taxed at lower rates than salary. Must be paid from retained profits after Corporation Tax.'
          />
          <LearnCard
            title='Corporation Tax'
            description='19% on profits up to £50k, marginal relief £50k-£250k (effective ~26.5%), 25% above £250k.'
          />
          <LearnCard
            title='Employer Pension'
            description='Most tax-efficient extraction. Company deducts from CT, you pay no tax or NI. Annual limit £60k.'
          />
        </div>
      </section>

      {/* Warnings Section */}
      {(showVATWarning ||
        showSelfAssessmentWarning ||
        showOtherIncomeWarning ||
        showDLAWarning ||
        showComplexityWarning ||
        showOverdrawnWarning ||
        showPensionWarning ||
        showStudentLoanWarning) && (
        <section className='mb-8'>
          <h3 className='mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
            Warnings
          </h3>
          <div className='space-y-3'>
            {showOverdrawnWarning && (
              <WarningCard
                title='Already Taken Too Much'
                description='You may have taken more than is safe this year. Speak to your accountant about options.'
              />
            )}
            {showComplexityWarning && (
              <WarningCard
                title='High Profit Complexity'
                description='At this profit level, an accountant could save you serious money with advanced strategies.'
              />
            )}
            {showVATWarning && (
              <WarningCard
                title='VAT Threshold'
                description='Revenue approaching £90,000 VAT threshold. Consider registration.'
              />
            )}
            {showSelfAssessmentWarning && (
              <WarningCard
                title='Self Assessment Required'
                description='Directors taking dividends need to file a Self Assessment. Deadline: 31 Jan.'
              />
            )}
            {showOtherIncomeWarning && (
              <WarningCard
                title='Other Income Affects Bands'
                description='Your other income uses up tax bands, so dividends may be taxed at higher rates.'
              />
            )}
            {showDLAWarning && (
              <WarningCard
                title="Director's Loan"
                description="Money taken without payroll may create a Director's Loan with S455 tax implications."
              />
            )}
            {showPensionWarning && (
              <WarningCard
                title='Pension Annual Allowance'
                description='Contributions over £60k may incur tax charges unless you have unused allowance from previous years.'
              />
            )}
            {showStudentLoanWarning && (
              <WarningCard
                title='Student Loan on Dividends'
                description='Directors pay student loans on TOTAL income (salary + dividends) via Self Assessment, not just salary.'
              />
            )}
          </div>
        </section>
      )}

      {/* Assumptions Section */}
      <section>
        <h3 className='mb-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
          Assumptions
        </h3>
        <div className='rounded-lg border bg-background p-4'>
          <AssumptionRow label='Tax Year' value='2025/26' />
          <AssumptionRow
            label='Region'
            value={formData.region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}
          />
          <AssumptionRow label='Trading Period' value='Full Year' />
          <AssumptionRow
            label='Other Income'
            value={formData.otherIncome > 0 ? `£${formData.otherIncome.toLocaleString()}` : 'None'}
          />
          <AssumptionRow
            label='Employment Allowance'
            value={formData.hasEmploymentAllowance ? 'Claimed' : 'Not claimed'}
          />
          <AssumptionRow
            label='Student Loans'
            value={
              formData.studentLoanPlans.length > 0
                ? formData.studentLoanPlans.join(', ')
                : 'None'
            }
            isLast
          />
        </div>
      </section>
    </aside>
  );
}

interface LearnCardProps {
  title: string;
  description: string;
}

function LearnCard({ title, description }: LearnCardProps) {
  return (
    <div className='rounded-lg border bg-background p-4'>
      <div className='mb-1 font-medium text-sm'>{title}</div>
      <div className='text-muted-foreground text-xs leading-relaxed'>{description}</div>
    </div>
  );
}

interface WarningCardProps {
  title: string;
  description: string;
}

function WarningCard({ title, description }: WarningCardProps) {
  return (
    <div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-4'>
      <div className='mb-2 flex items-center gap-2'>
        <AlertTriangle className='size-4 text-amber-600 dark:text-amber-500' />
        <span className='font-semibold text-amber-700 text-sm dark:text-amber-500'>
          {title}
        </span>
      </div>
      <div className='text-muted-foreground text-xs leading-relaxed'>{description}</div>
    </div>
  );
}

interface AssumptionRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function AssumptionRow({ label, value, isLast }: AssumptionRowProps) {
  return (
    <div className={cn('flex justify-between py-1.5 text-xs', !isLast && 'border-b')}>
      <span className='text-muted-foreground'>{label}</span>
      <span>{value}</span>
    </div>
  );
}
