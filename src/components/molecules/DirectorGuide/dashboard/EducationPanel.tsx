// src/components/molecules/DirectorGuide/dashboard/EducationPanel.tsx
/**
 * Education Panel - Learn cards, warnings, and assumptions
 *
 * Uses Zustand store hooks instead of props.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { TAX_RATES } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useDirectorFormData, useStrategyComparison } from '@/store/directorGuideStore';

const TAX_YEAR = '2025-2026';
const rates = TAX_RATES[TAX_YEAR];
const PERSONAL_ALLOWANCE = rates.personalAllowance;
const PA_TAPER_THRESHOLD = rates.personalAllowanceReductionThreshold;
const PA_TAPER_END = PERSONAL_ALLOWANCE + (rates.bands[1]?.threshold ?? 112570); // 125,140
const SECONDARY_THRESHOLD = rates.nationalInsurance.employer.A.secondary.threshold;
const LEL = rates.nationalInsurance.lowerEarningsLimit;

interface EducationPanelProps {
  className?: string;
}

export function EducationPanel({ className }: EducationPanelProps) {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  const hasResults = comparison && comparison.grossProfit > 0;
  const revenue = formData.revenue ?? 0;
  const optimalSalary = comparison?.strategies?.optimalMix?.salary ?? 0;

  // Calculate total income for PA taper / HICBC warnings
  const totalIncome = hasResults
    ? formData.otherIncome +
      comparison.strategies.optimalMix.salary +
      comparison.strategies.optimalMix.dividends
    : 0;

  // Compute total already taken from YTD fields
  const alreadyTaken = formData.ytdSalary + formData.ytdDividends + formData.ytdDrawings;

  // Determine which warnings to show
  const showVATWarning = hasResults && revenue >= 85000 && revenue < 90000;
  const showVATMandatoryWarning = hasResults && revenue >= 90000;
  const showSelfAssessmentWarning = hasResults && comparison.strategies.optimalMix.dividends > 0;
  const showOtherIncomeWarning = formData.otherIncome > 0;
  // DLA warning if drawings (not salary/dividends) were taken
  const showDLAWarning = formData.ytdDrawings > 0;
  const showComplexityWarning = hasResults && comparison.grossProfit > 250000;
  // Compare against gross extraction available (salary + dividends), not post-tax takeHome
  const grossExtraction = hasResults
    ? comparison.strategies.optimalMix.salary + comparison.strategies.optimalMix.dividends
    : 0;
  const showOverdrawnWarning = hasResults && alreadyTaken > grossExtraction;
  const showPensionWarning = formData.pensionContribution > 60000;
  const showStudentLoanWarning = formData.studentLoanPlans.length > 0;
  const showPATaperWarning = totalIncome > PA_TAPER_THRESHOLD && totalIncome <= PA_TAPER_END;
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

  // Pension Gap Warning: Paying ErNI but no State Pension credit
  const showPensionGapWarning =
    hasResults && optimalSalary > SECONDARY_THRESHOLD && optimalSalary < LEL;

  // Pension taper warning: Annual Allowance reduces from £260k adjusted income
  const showPensionTaperWarning = totalIncome >= 240000;

  // S455 tax warning: When drawings exist and total taken exceeds available
  const showS455Warning = formData.ytdDrawings > 0 && hasResults && alreadyTaken > grossExtraction;

  // BIK warning: Class 1A NI not included in company cost
  const showBIKWarning = formData.companyCarBIK > 0;

  // Plan 5 student loans note
  const showPlan5Note = formData.studentLoanPlans.length > 0;

  // Dividend timing note
  const showDividendTimingNote = hasResults && comparison.strategies.optimalMix.dividends > 0;

  // Distributable profits note
  const showDistributableNote = hasResults && comparison.strategies.optimalMix.dividends > 0;

  // Other PAYE employment warning
  const showOtherPAYEWarning = formData.hasOtherPAYEEmployment;

  return (
    <aside className={cn('flex h-full flex-col bg-[#0f172a] p-6', className)}>
      {/* Learn Section */}
      <section className='mb-8'>
        <h3 className='mb-4 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider'>
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
        showSurvivalModeWarning ||
        showPensionGapWarning ||
        showPensionTaperWarning ||
        showS455Warning ||
        showBIKWarning ||
        showPlan5Note ||
        showDividendTimingNote ||
        showDistributableNote ||
        showOtherPAYEWarning) && (
        <section className='mb-8'>
          <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
            Warnings
          </h3>
          <div className='space-y-3'>
            {/* Critical: Pension Gap Warning (shown first) */}
            {showPensionGapWarning && (
              <WarningCard
                title='Inefficient Salary Zone'
                description='Your salary is between £5,000 and £6,396. You are paying 15% Employer NI but NOT earning a State Pension credit. Consider increasing to ~£6,500 for the credit (~£8/month extra cost).'
                isCritical
              />
            )}
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
            {showPensionTaperWarning && (
              <WarningCard
                title='Pension Annual Allowance Taper'
                description="With adjusted income near or above £240k, your Annual Allowance may be reduced from £60k down to £10k minimum. This is called the 'tapered annual allowance'. Speak to a financial adviser."
              />
            )}
            {showS455Warning && (
              <WarningCard
                title='S455 Tax Warning'
                description="If your Director's Loan is not repaid within 9 months after year-end, the company must pay S455 tax at 33.75%. This is refunded when the loan is repaid, but creates cash flow issues."
                isCritical
              />
            )}
            {showBIKWarning && (
              <WarningCard
                title='Benefit in Kind - Company Cost Incomplete'
                description='The company also pays Class 1A NI (15%) on the BIK value. This is not included in our company cost calculation. Your actual costs will be higher.'
              />
            )}
            {showPlan5Note && (
              <WarningCard
                title='Student Loan Note'
                description='Plan 5 student loans start from April 2026 and are not yet included. If you have multiple plans, repayments are stacked (calculated separately on total income).'
              />
            )}
            {showDividendTimingNote && (
              <WarningCard
                title='Dividend Timing Matters'
                description='Dividends are taxed in the tax year they are declared (not paid). Board minutes and dividend vouchers are legally required. Consider timing around 5 April.'
              />
            )}
            {showDistributableNote && (
              <WarningCard
                title='Verify Distributable Profits'
                description='Dividends can only be paid from distributable profits (retained earnings). Check your last filed accounts or ask your accountant for current position.'
              />
            )}
            {showOtherPAYEWarning && (
              <WarningCard
                title='Other PAYE Employment'
                description='Your NI Primary Threshold may already be used by your other employer. This means any salary from your company will be subject to NI from the first pound. Our calculations assume this is your only PAYE source.'
              />
            )}
          </div>
        </section>
      )}

      {/* Assumptions Section */}
      <section className='mb-8'>
        <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Assumptions
        </h3>
        <div className='rounded-[10px] border border-white/[0.04] bg-[#1e293b] p-4'>
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

      {/* Accuracy & Scope Section */}
      <section>
        <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Accuracy & Scope
        </h3>
        <div className='space-y-3'>
          <div className='rounded-[10px] border border-white/[0.04] bg-[#1e293b] p-4'>
            <div className='mb-2 font-medium text-slate-200 text-sm'>What this calculator does</div>
            <ul className='space-y-1 text-slate-400 text-xs'>
              <li>• Compares salary vs dividend extraction strategies</li>
              <li>• Uses current HMRC rates (single source of truth)</li>
              <li>• Assumes single director, 12-month period, standalone company</li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-white/[0.04] bg-[#1e293b] p-4'>
            <div className='mb-2 font-medium text-slate-200 text-sm'>Known limitations</div>
            <ul className='space-y-1 text-slate-400 text-xs'>
              <li>• Student loan £2k unearned income rule (may overstate)</li>
              <li>• Class 1A NI on benefits in kind (company cost incomplete)</li>
              <li>• Associated company CT threshold adjustments</li>
              <li>• Short accounting period adjustments</li>
              <li>• Marriage Allowance transfers</li>
              <li>• IR35 status considerations</li>
              <li>• Pension carry-forward from previous years</li>
              <li>• MPAA (Money Purchase Annual Allowance) - £10k limit if pension accessed</li>
              <li>• Dividend timing (declaration vs payment date)</li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-amber-500/20 bg-amber-500/5 p-3'>
            <p className='text-amber-200 text-xs leading-relaxed'>
              <strong>Disclaimer:</strong> Illustrative only. Not financial advice. Always consult a
              qualified accountant before making decisions.
            </p>
          </div>
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
    <div className='rounded-[10px] border border-white/[0.04] bg-[#1e293b] p-4'>
      <div className='mb-1 font-medium text-slate-100 text-sm'>{title}</div>
      <div className='text-slate-400 text-xs leading-relaxed'>{description}</div>
    </div>
  );
}

interface WarningCardProps {
  title: string;
  description: string;
  isCritical?: boolean;
}

function WarningCard({ title, description, isCritical }: WarningCardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border p-4',
        isCritical ? 'border-red-500/30 bg-red-500/10' : 'border-amber-500/30 bg-amber-500/10',
      )}
    >
      <div className='mb-2 flex items-center gap-2'>
        <AlertTriangle className={cn('size-4', isCritical ? 'text-red-500' : 'text-amber-500')} />
        <span
          className={cn('font-semibold text-sm', isCritical ? 'text-red-500' : 'text-amber-500')}
        >
          {title}
        </span>
      </div>
      <div className='text-slate-400 text-xs leading-relaxed'>{description}</div>
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
    <div
      className={cn(
        'flex justify-between py-1.5 text-xs',
        !isLast && 'border-white/[0.04] border-b',
      )}
    >
      <span className='text-slate-500'>{label}</span>
      <span className='text-slate-300'>{value}</span>
    </div>
  );
}
