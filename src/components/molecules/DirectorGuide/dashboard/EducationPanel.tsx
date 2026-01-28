// src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx
/**
 * Education Panel - Learn cards, warnings, and assumptions
 *
 * Uses Zustand store hooks instead of props.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDirectorFormData, useStrategyComparison } from '@/store/directorGuideStore';

interface EducationPanelProps {
  className?: string;
}

export function EducationPanel({ className }: EducationPanelProps) {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  const hasResults = comparison && comparison.grossProfit > 0;
  const revenue = formData.revenue ?? 0;

  // Calculate total income for PA taper / HICBC warnings
  const totalIncome = hasResults
    ? formData.otherIncome +
      comparison.strategies.optimalMix.salary +
      comparison.strategies.optimalMix.dividends
    : 0;

  // Determine which warnings to show
  const showVATWarning = hasResults && revenue >= 85000 && revenue < 90000;
  const showVATMandatoryWarning = hasResults && revenue >= 90000;
  const showSelfAssessmentWarning = hasResults && comparison.strategies.optimalMix.dividends > 0;
  const showOtherIncomeWarning = formData.otherIncome > 0;
  const showDLAWarning = formData.alreadyTaken > 0 && formData.takenViaPayroll === 'no';
  const showComplexityWarning = hasResults && comparison.grossProfit > 250000;
  // Compare against gross extraction available (salary + dividends), not post-tax takeHome
  const grossExtraction = hasResults
    ? comparison.strategies.optimalMix.salary + comparison.strategies.optimalMix.dividends
    : 0;
  const showOverdrawnWarning = hasResults && formData.alreadyTaken > grossExtraction;
  const showPensionWarning = formData.pensionContribution > 60000;
  const showStudentLoanWarning = formData.studentLoanPlans.length > 0;
  const showPATaperWarning = totalIncome > 100000 && totalIncome <= 125140;
  const showHICBCWarning = totalIncome >= 60000 && totalIncome <= 80000;

  // New P0 warnings from strategy doc
  const showPayrollWarning = hasResults && comparison.strategies.optimalMix.salary > 0;
  const personalTax = hasResults
    ? comparison.strategies.optimalMix.incomeTax +
      comparison.strategies.optimalMix.dividendTax +
      comparison.strategies.optimalMix.studentLoan
    : 0;
  const showPaymentsOnAccountWarning = personalTax > 1000;
  const showSurvivalModeWarning = comparison && comparison.grossProfit <= 0;

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
            description='This is the Personal Allowance - in most cases, earn below this and pay zero income tax and employee NI. You also get NI credits for State Pension.'
          />
          <LearnCard
            title='What Are Dividends?'
            description='Payments from company profits to shareholders, taxed at lower rates than salary. Must be paid from retained profits after Corporation Tax.'
          />
          <LearnCard
            title='Corporation Tax'
            description='19% on profits up to £50k. Between £50k-£250k, marginal relief applies (26.5% on profits in this band). 25% above £250k.'
          />
          <LearnCard
            title='Employer Pension'
            description='Tax-efficient: company deducts from CT, you pay no tax or NI. Annual allowance £60k (includes all contributions). Can carry forward unused allowance from previous 3 years.'
          />
        </div>
      </section>

      {/* Warnings Section */}
      {(showVATWarning ||
        showVATMandatoryWarning ||
        showSelfAssessmentWarning ||
        showOtherIncomeWarning ||
        showDLAWarning ||
        showComplexityWarning ||
        showOverdrawnWarning ||
        showPensionWarning ||
        showStudentLoanWarning ||
        showPATaperWarning ||
        showHICBCWarning ||
        showPayrollWarning ||
        showPaymentsOnAccountWarning ||
        showSurvivalModeWarning) && (
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
            {showPATaperWarning && (
              <WarningCard
                title='Personal Allowance Taper'
                description='Income over £100k reduces your Personal Allowance by £1 for every £2. This creates an effective 60% tax rate between £100k-£125k.'
              />
            )}
            {showHICBCWarning && (
              <WarningCard
                title='High Income Child Benefit Charge'
                description='If you or your partner claim Child Benefit and your income is £60k-£80k, you may owe HICBC via Self Assessment.'
              />
            )}
            {showVATMandatoryWarning && (
              <WarningCard
                title='VAT Registration Required'
                description='Revenue exceeds £90,000 threshold. VAT registration is mandatory within 30 days of exceeding.'
              />
            )}
            {showVATWarning && (
              <WarningCard
                title='VAT Threshold Approaching'
                description='Revenue approaching £90,000 VAT threshold. Monitor closely and consider voluntary registration.'
              />
            )}
            {showSelfAssessmentWarning && (
              <WarningCard
                title='Self Assessment Likely Required'
                description='Directors taking dividends typically need to file a Self Assessment tax return. Check HMRC criteria. Deadline: 31 Jan.'
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
                title="Possible Director's Loan"
                description="Money taken without payroll may create a Director's Loan balance depending on how it's treated in your accounts. Check with your accountant."
              />
            )}
            {showPensionWarning && (
              <WarningCard
                title='Pension Annual Allowance'
                description='Contributions over £60k may incur tax charges. Rules are complex (carry forward, taper for high earners, MPAA). Check with a financial adviser.'
              />
            )}
            {showStudentLoanWarning && (
              <WarningCard
                title='Student Loan via Self Assessment'
                description='Student loan repayments may be calculated on total income (including dividends) via Self Assessment. Rules depend on your circumstances.'
              />
            )}
            {showPayrollWarning && (
              <WarningCard
                title='Payroll Administration Required'
                description='Taking a salary means running payroll and submitting RTI to HMRC each payday. Consider payroll software or ask your accountant to set this up.'
              />
            )}
            {showPaymentsOnAccountWarning && (
              <WarningCard
                title='Payments on Account (Year 2)'
                description='If your Self Assessment tax exceeds £1,000 and less than 80% is collected at source, HMRC requires payments on account in Jan and Jul. Your second year may have higher cash needs.'
              />
            )}
            {showSurvivalModeWarning && (
              <WarningCard
                title='No Profit Yet'
                description="Without distributable profits, you cannot legally pay dividends. Money taken may be a Director's Loan (must be repaid or face S455 tax). Consider minimal salary only until profitable."
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
              formData.studentLoanPlans.length > 0 ? formData.studentLoanPlans.join(', ') : 'None'
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
        <span className='font-semibold text-amber-700 text-sm dark:text-amber-500'>{title}</span>
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
