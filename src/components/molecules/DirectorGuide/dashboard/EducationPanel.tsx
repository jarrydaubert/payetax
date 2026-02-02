/**
 * Education Panel - Learn cards, warnings, and assumptions
 *
 * Uses Zustand store hooks instead of props.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useDirectorFormData, useStrategyComparison } from '@/store/directorGuideStore';

// Tax year configuration - single source
const TAX_YEAR: TaxYear = '2025-2026';
const rates = TAX_RATES[TAX_YEAR];

// Validate rates exist at module load (fail fast in dev)
if (!rates) {
  throw new Error(`Tax rates not found for year: ${TAX_YEAR}`);
}

// Extract constants from validated rates
const PERSONAL_ALLOWANCE = rates.personalAllowance;
const PA_TAPER_THRESHOLD = rates.personalAllowanceReductionThreshold;
// PA taper end: threshold + (PA × 2) since PA reduces £1 for every £2 over threshold
const PA_TAPER_END = PA_TAPER_THRESHOLD + PERSONAL_ALLOWANCE * 2; // 100,000 + 25,140 = 125,140
const SECONDARY_THRESHOLD = rates.nationalInsurance.employer.A.secondary.threshold;
const LEL = rates.nationalInsurance.lowerEarningsLimit;

// Thresholds that should ideally be in taxRates.ts
// TODO: Move these to TAX_RATES when we add BUSINESS_THRESHOLDS
const VAT_THRESHOLD = 90000;
const VAT_APPROACHING = 85000;
const HICBC_START = 60000;
const HICBC_END = 80000;
const PENSION_TAPER_THRESHOLD = 240000;
const PAYMENTS_ON_ACCOUNT_THRESHOLD = 1000;

interface EducationPanelProps {
  className?: string;
}

export function EducationPanel({ className }: EducationPanelProps) {
  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();

  const hasResults = comparison !== null && comparison.grossProfit > 0;
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

  // Gross extraction available (salary + dividends from optimal strategy)
  const grossExtraction = hasResults
    ? comparison.strategies.optimalMix.salary + comparison.strategies.optimalMix.dividends
    : 0;

  // Personal tax liability
  const personalTax = hasResults
    ? comparison.strategies.optimalMix.incomeTax +
      comparison.strategies.optimalMix.dividendTax +
      comparison.strategies.optimalMix.studentLoan
    : 0;

  // Warning conditions
  const warnings = buildWarnings({
    hasResults,
    revenue,
    optimalSalary,
    totalIncome,
    alreadyTaken,
    grossExtraction,
    personalTax,
    formData,
    comparison,
  });

  // Learn cards - could be tailored based on user situation
  const learnCards = [
    {
      title: 'Why £12,570 Salary?',
      description:
        'This is the Personal Allowance - in most cases, earn below this and pay zero income tax and employee NI. You also get NI credits for State Pension.',
      show: true,
    },
    {
      title: 'What Are Dividends?',
      description:
        'Payments from company profits to shareholders, taxed at lower rates than salary. Must be paid from retained profits after Corporation Tax.',
      show: hasResults && (comparison?.strategies.optimalMix.dividends ?? 0) > 0,
    },
    {
      title: 'Corporation Tax',
      description:
        '19% on profits up to £50k. Between £50k-£250k, marginal relief applies (26.5% on profits in this band). 25% above £250k.',
      show: true,
    },
    {
      title: 'Employer Pension',
      description:
        'Tax-efficient: company deducts from CT, you pay no tax or NI. Annual allowance £60k (includes all contributions). Can carry forward unused allowance from previous 3 years.',
      show: true, // Always show for now
    },
  ];

  const visibleLearnCards = learnCards.filter((card) => card.show);
  const visibleWarnings = warnings.filter((w) => w.show);

  // Sort warnings: critical first, then by order
  const sortedWarnings = [...visibleWarnings].sort((a, b) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  });

  return (
    <aside className={cn('flex h-full flex-col bg-slate-900 p-6', className)}>
      {/* Learn Section */}
      <section className='mb-8'>
        <h3 className='mb-4 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Learn
        </h3>
        <div className='space-y-3'>
          {visibleLearnCards.map((card) => (
            <LearnCard key={card.title} title={card.title} description={card.description} />
          ))}
        </div>
      </section>

      {/* Warnings Section */}
      {sortedWarnings.length > 0 && (
        <section className='mb-8'>
          <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
            Warnings
          </h3>
          <div className='space-y-3'>
            {sortedWarnings.map((warning) => (
              <WarningCard
                key={warning.id}
                title={warning.title}
                description={warning.description}
                isCritical={warning.isCritical}
              />
            ))}
          </div>
        </section>
      )}

      {/* Assumptions Section */}
      <section className='mb-8'>
        <h3 className='mb-4 font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Assumptions
        </h3>
        <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
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
          <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
            <div className='mb-2 font-medium text-slate-200 text-sm'>What this calculator does</div>
            <ul className='space-y-1 text-slate-400 text-xs'>
              <li>• Compares salary vs dividend extraction strategies</li>
              <li>• Uses current HMRC rates (single source of truth)</li>
              <li>• Assumes single director, 12-month period, standalone company</li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
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

// =============================================================================
// Warning Logic (extracted for testability)
// =============================================================================

interface WarningContext {
  hasResults: boolean;
  revenue: number;
  optimalSalary: number;
  totalIncome: number;
  alreadyTaken: number;
  grossExtraction: number;
  personalTax: number;
  formData: ReturnType<typeof useDirectorFormData>;
  comparison: ReturnType<typeof useStrategyComparison>;
}

interface Warning {
  id: string;
  title: string;
  description: string;
  show: boolean;
  isCritical?: boolean;
}

function buildWarnings(ctx: WarningContext): Warning[] {
  const {
    hasResults,
    revenue,
    optimalSalary,
    totalIncome,
    alreadyTaken,
    grossExtraction,
    personalTax,
    formData,
    comparison,
  } = ctx;

  // Pre-compute conditions
  const isOverdrawn = hasResults && alreadyTaken > grossExtraction;
  const hasDrawings = formData.ytdDrawings > 0;
  const hasDividends = hasResults && (comparison?.strategies.optimalMix.dividends ?? 0) > 0;
  const vatNote = formData.includesVat
    ? ' (If your turnover figure includes VAT, HMRC thresholds use VAT-exclusive taxable turnover — treat this as an estimate.)'
    : '';

  return [
    // CRITICAL warnings first
    {
      id: 'pension-gap',
      title: 'Inefficient Salary Zone',
      description:
        'Your salary is between £5,000 and £6,396. You are paying 15% Employer NI but NOT earning a State Pension credit. Consider increasing to ~£6,500 for the credit (~£8/month extra cost).',
      show: hasResults && optimalSalary > SECONDARY_THRESHOLD && optimalSalary < LEL,
      isCritical: true,
    },
    {
      id: 's455',
      title: 'S455 Tax Warning',
      description:
        "If your Director's Loan is not repaid within 9 months after year-end, the company must pay S455 tax at 33.75%. This is refunded when the loan is repaid, but creates cash flow issues.",
      // Only show S455 if overdrawn AND there are drawings (don't duplicate with plain overdrawn)
      show: hasDrawings && isOverdrawn,
      isCritical: true,
    },

    // HIGH priority warnings
    {
      id: 'overdrawn',
      title: 'Already Taken Too Much',
      description:
        'You may have taken more than the recommended extraction this year. Speak to your accountant about options.',
      // Show overdrawn only if NOT showing S455 (avoid duplication)
      show: isOverdrawn && !hasDrawings,
    },
    {
      id: 'vat-mandatory',
      title: 'VAT Registration Required',
      description: `Revenue exceeds £${VAT_THRESHOLD.toLocaleString()} threshold. VAT registration is mandatory within 30 days of exceeding.${vatNote}`,
      show: revenue >= VAT_THRESHOLD,
    },
    {
      id: 'pa-taper',
      title: 'Personal Allowance Taper',
      description:
        'Income over £100k reduces your Personal Allowance by £1 for every £2. This creates an effective 60% tax rate between £100k-£125k.',
      show: totalIncome > PA_TAPER_THRESHOLD && totalIncome <= PA_TAPER_END,
    },

    // MEDIUM priority warnings
    {
      id: 'complexity',
      title: 'High Profit Complexity',
      description:
        'At this profit level, an accountant could save you serious money with advanced strategies.',
      show: hasResults && (comparison?.grossProfit ?? 0) > 250000,
    },
    {
      id: 'hicbc',
      title: 'High Income Child Benefit Charge',
      description: `If you or your partner claim Child Benefit and your income is £${(HICBC_START / 1000).toFixed(0)}k-£${(HICBC_END / 1000).toFixed(0)}k, you may owe HICBC via Self Assessment.`,
      show: totalIncome >= HICBC_START && totalIncome <= HICBC_END,
    },
    {
      id: 'vat-approaching',
      title: 'VAT Threshold Approaching',
      description: `Revenue approaching £${VAT_THRESHOLD.toLocaleString()} VAT threshold. Monitor closely and consider voluntary registration.${vatNote}`,
      show: revenue >= VAT_APPROACHING && revenue < VAT_THRESHOLD,
    },
    {
      id: 'pension-taper',
      title: 'Pension Annual Allowance Taper',
      description:
        "With adjusted income near or above £240k, your Annual Allowance may be reduced from £60k down to £10k minimum. This is called the 'tapered annual allowance'. Speak to a financial adviser.",
      show: totalIncome >= PENSION_TAPER_THRESHOLD,
    },
    {
      id: 'pension-limit',
      title: 'Pension Annual Allowance',
      description:
        'Contributions over £60k may incur tax charges. Rules are complex (carry forward, taper for high earners, MPAA). Check with a financial adviser.',
      show: formData.pensionContribution > 60000,
    },

    // LOWER priority / informational
    {
      id: 'self-assessment',
      title: 'Self Assessment Likely Required',
      description:
        'Directors taking dividends typically need to file a Self Assessment tax return. Check HMRC criteria. Deadline: 31 Jan.',
      show: hasDividends,
    },
    {
      id: 'payroll',
      title: 'Payroll Administration Required',
      description:
        'Taking a salary means running payroll and submitting RTI to HMRC each payday. Consider payroll software or ask your accountant to set this up.',
      show: hasResults && (comparison?.strategies.optimalMix.salary ?? 0) > 0,
    },
    {
      id: 'payments-on-account',
      title: 'Payments on Account (Year 2)',
      description:
        'If your Self Assessment tax exceeds £1,000 and less than 80% is collected at source, HMRC may require payments on account in Jan and Jul. Check if this applies to you.',
      show: personalTax > PAYMENTS_ON_ACCOUNT_THRESHOLD,
    },
    {
      id: 'other-income',
      title: 'Other Income Affects Bands',
      description:
        'Your other income uses up tax bands, so dividends may be taxed at higher rates.',
      show: formData.otherIncome > 0,
    },
    {
      id: 'dla',
      title: "Possible Director's Loan",
      description:
        "Money taken without payroll may create a Director's Loan balance depending on how it's treated in your accounts. Check with your accountant.",
      show: hasDrawings && !isOverdrawn, // Don't show if S455 already showing
    },
    {
      id: 'student-loan',
      title: 'Student Loan via Self Assessment',
      description:
        'Student loan repayments may be calculated on total income (including dividends) via Self Assessment. Rules depend on your circumstances.',
      show: formData.studentLoanPlans.length > 0,
    },
    {
      id: 'bik',
      title: 'Benefit in Kind - Company Cost Incomplete',
      description:
        'The company also pays Class 1A NI (15%) on the BIK value. This is not included in our company cost calculation. Your actual costs will be higher.',
      show: formData.companyCarBIK > 0,
    },
    {
      id: 'other-paye',
      title: 'Other PAYE Employment',
      description:
        'With another PAYE employment, your NI Primary Threshold may already be used elsewhere. Any salary from your company may be subject to NI differently than shown. Our calculations assume this is your only PAYE source.',
      show: formData.hasOtherPAYEEmployment,
    },
    {
      id: 'dividend-timing',
      title: 'Dividend Timing Matters',
      description:
        'Dividends are taxed in the tax year they are declared (not paid). Board minutes and dividend vouchers are legally required. Consider timing around 5 April.',
      show: hasDividends,
    },
    {
      id: 'distributable',
      title: 'Verify Distributable Profits',
      description:
        'Dividends can only be paid from distributable profits (retained earnings). Check your last filed accounts or ask your accountant for current position.',
      show: hasDividends,
    },
  ];
}

// =============================================================================
// Sub-components
// =============================================================================

interface LearnCardProps {
  title: string;
  description: string;
}

function LearnCard({ title, description }: LearnCardProps) {
  return (
    <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
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
        <AlertTriangle
          className={cn('size-4', isCritical ? 'text-red-500' : 'text-amber-500')}
          aria-hidden='true'
        />
        <span
          className={cn('font-semibold text-sm', isCritical ? 'text-red-500' : 'text-amber-500')}
        >
          {isCritical && <span className='sr-only'>Critical warning: </span>}
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
