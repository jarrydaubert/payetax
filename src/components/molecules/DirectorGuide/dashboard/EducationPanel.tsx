/**
 * Education Panel - Learn cards, warnings, and assumptions
 *
 * Uses Zustand store hooks instead of props.
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { CURRENT_TAX_YEAR, CURRENT_TAX_YEAR_DISPLAY, TAX_RATES } from '@/constants/taxRates';
import { trackWarningShown } from '@/lib/directorGuideAnalytics';
import { DIRECTOR_GUIDE_BUSINESS_THRESHOLDS } from '@/lib/tax/businessThresholds';
import { cn } from '@/lib/utils';
import {
  type DirectorFormData,
  useDirectorFormSlice,
  useMonthlyModeOutput,
  useStrategyComparison,
} from '@/store/directorGuideStore';

// Tax year configuration - single source
const TAX_YEAR = CURRENT_TAX_YEAR;
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

const {
  vatRegistration: VAT_THRESHOLD,
  vatApproaching: VAT_APPROACHING,
  hicbcStart: HICBC_START,
  hicbcEnd: HICBC_END,
  pensionTaperWarning: PENSION_TAPER_THRESHOLD,
  pensionAnnualAllowance: PENSION_ANNUAL_ALLOWANCE,
  paymentsOnAccount: PAYMENTS_ON_ACCOUNT_THRESHOLD,
  highProfitComplexity: HIGH_PROFIT_COMPLEXITY_THRESHOLD,
} = DIRECTOR_GUIDE_BUSINESS_THRESHOLDS;

const SECTION_HEADING_CLASS = 'mb-3 font-semibold text-slate-500 text-xs uppercase tracking-wider';

interface EducationPanelProps {
  className?: string;
}

type EducationPanelFormData = Pick<
  DirectorFormData,
  | 'mode'
  | 'region'
  | 'revenue'
  | 'otherIncome'
  | 'ytdSalary'
  | 'ytdDividends'
  | 'ytdDrawings'
  | 'hasEmploymentAllowance'
  | 'studentLoanPlans'
  | 'includesVat'
  | 'pensionContribution'
  | 'companyCarBIK'
  | 'associatedCompaniesCount'
  | 'hasOtherPAYEEmployment'
>;

export function EducationPanel({ className }: EducationPanelProps) {
  const formData = useDirectorFormSlice<EducationPanelFormData>((formData) => ({
    mode: formData.mode,
    region: formData.region,
    revenue: formData.revenue,
    otherIncome: formData.otherIncome,
    ytdSalary: formData.ytdSalary,
    ytdDividends: formData.ytdDividends,
    ytdDrawings: formData.ytdDrawings,
    hasEmploymentAllowance: formData.hasEmploymentAllowance,
    studentLoanPlans: formData.studentLoanPlans,
    includesVat: formData.includesVat,
    pensionContribution: formData.pensionContribution,
    companyCarBIK: formData.companyCarBIK,
    associatedCompaniesCount: formData.associatedCompaniesCount,
    hasOtherPAYEEmployment: formData.hasOtherPAYEEmployment,
  }));
  const comparison = useStrategyComparison();
  const monthlyModeOutput = useMonthlyModeOutput();
  const isMonthlyMode = formData.mode === 'monthly';

  const hasResults = comparison !== null && comparison.grossProfit > 0;
  const revenue = isMonthlyMode
    ? (monthlyModeOutput?.projectedRevenue ?? 0)
    : (formData.revenue ?? 0);
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

  const visibleLearnCards = useMemo(
    () =>
      [
        {
          title: 'Why £12,570 matters',
          description:
            'The Personal Allowance is £12,570. Earnings up to this are not subject to income tax; NI credits depend on earnings level.',
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
            '19% on profits up to the small-profits limit, 25% at the main rate limit, with marginal relief in between. Associated companies can reduce these limits.',
          show: true,
        },
        {
          title: 'Employer Pension',
          description:
            'Tax-efficient: company deducts from CT, you pay no tax or NI. Annual allowance £60k (includes all contributions). Can carry forward unused allowance from previous 3 years.',
          show: true,
        },
      ].filter((card) => card.show),
    [comparison, hasResults],
  );

  const sortedWarnings = useMemo(() => {
    const visibleWarnings = buildWarnings({
      hasResults,
      revenue,
      optimalSalary,
      totalIncome,
      alreadyTaken,
      grossExtraction,
      personalTax,
      formData,
      comparison,
      monthlyModeOutput,
      isMonthlyMode,
    }).filter((warning) => warning.show);

    // Sort warnings: critical first, then by order
    return visibleWarnings.sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1;
      if (!a.isCritical && b.isCritical) return 1;
      return 0;
    });
  }, [
    alreadyTaken,
    comparison,
    formData,
    grossExtraction,
    hasResults,
    isMonthlyMode,
    monthlyModeOutput,
    optimalSalary,
    personalTax,
    revenue,
    totalIncome,
  ]);

  // Analytics: record which warnings were actually rendered (once per warning id).
  const trackedWarningIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    for (const w of sortedWarnings) {
      if (!trackedWarningIds.current.has(w.id)) {
        trackWarningShown(w.id);
        trackedWarningIds.current.add(w.id);
      }
    }
  }, [sortedWarnings]);

  return (
    <aside className={cn('flex h-full flex-col bg-slate-900 p-5', className)}>
      <PanelSection title='Learn'>
        <div className='space-y-3'>
          {visibleLearnCards.map((card) => (
            <LearnCard key={card.title} title={card.title} description={card.description} />
          ))}
        </div>
      </PanelSection>

      {sortedWarnings.length > 0 && (
        <PanelSection title='Warnings'>
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
        </PanelSection>
      )}

      <PanelSection title='Assumptions'>
        <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
          <p className='mb-3 text-slate-300 text-xs leading-relaxed'>
            Results below use the current inputs and assumptions shown here.
          </p>
          <AssumptionRow label='Tax Year' value={CURRENT_TAX_YEAR_DISPLAY} />
          <AssumptionRow
            label='Region'
            value={formData.region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}
          />
          <AssumptionRow
            label='Trading Period'
            value={
              isMonthlyMode && monthlyModeOutput
                ? `Monthly projection (${monthlyModeOutput.monthsRemaining} month${monthlyModeOutput.monthsRemaining === 1 ? '' : 's'} remaining)`
                : 'Full Year'
            }
          />
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
          />
          <AssumptionRow
            label='Associated Companies'
            value={String(formData.associatedCompaniesCount)}
            isLast
          />
        </div>
      </PanelSection>

      <PanelSection title='Accuracy & Scope' className='mb-0'>
        <div className='space-y-3'>
          <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
            <div className='mb-2 font-medium text-slate-200 text-sm'>What this calculator does</div>
            <ul className='space-y-1 text-slate-400 text-xs'>
              <li>• Compares salary vs dividend extraction strategies</li>
              <li>• Uses current HMRC rates (single source of truth)</li>
              <li>
                • Assumes single director and standalone company
                {isMonthlyMode ? ', with monthly run-rate projection' : ', with a full-year view'}
              </li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-white/[0.04] bg-slate-800 p-4'>
            <div className='mb-2 font-medium text-slate-200 text-sm'>Known limitations</div>
            <ul className='space-y-1 text-slate-400 text-xs'>
              <li>• Student loan £2k unearned income rule (may overstate)</li>
              <li>• Short accounting period adjustments</li>
              <li>• Marriage Allowance transfers</li>
              <li>• IR35 status considerations</li>
              <li>• Pension carry-forward from previous years</li>
              <li>• MPAA (Money Purchase Annual Allowance) - £10k limit if pension accessed</li>
              <li>• Dividend timing (declaration vs payment date)</li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-cyan-500/20 bg-cyan-500/5 p-4'>
            <div className='mb-2 font-medium text-cyan-200 text-sm'>
              MTD for Income Tax timeline (current HMRC plan)
            </div>
            <ul className='space-y-1 text-cyan-100/90 text-xs'>
              <li>• From 6 April 2026: qualifying income over £50,000</li>
              <li>• From 6 April 2027: qualifying income over £30,000</li>
              <li>• From 6 April 2028: qualifying income over £20,000</li>
            </ul>
            <p className='mt-2 text-cyan-100/85 text-xs leading-relaxed'>
              Scope depends on your personal income sources. Limited-company directors may still
              file Self Assessment outside MTD for Income Tax unless qualifying self-employment or
              property income applies.
            </p>
          </div>
          <div className='rounded-[10px] border border-amber-500/20 bg-amber-500/5 p-3'>
            <p className='text-amber-200 text-xs leading-relaxed'>
              <strong>Disclaimer:</strong> For illustrative purposes only. Not financial or tax
              advice. Consult a qualified accountant for advice specific to your situation. Based on
              HMRC rates for {TAX_YEAR} which may change.
            </p>
          </div>
        </div>
      </PanelSection>
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
  formData: EducationPanelFormData;
  comparison: ReturnType<typeof useStrategyComparison>;
  monthlyModeOutput: ReturnType<typeof useMonthlyModeOutput>;
  isMonthlyMode: boolean;
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
    monthlyModeOutput,
    isMonthlyMode,
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
      id: 'monthly-buffer-shortfall',
      title: 'Cash Buffer Shortfall',
      description: monthlyModeOutput
        ? `Current cash is below your required buffer by £${Math.round(
            monthlyModeOutput.shortfall,
          ).toLocaleString()}. Consider reducing drawings or increasing runway cash.`
        : 'Current cash is below your required runway buffer.',
      show: isMonthlyMode && Boolean(monthlyModeOutput?.hasBufferShortfall),
      isCritical: true,
    },
    {
      id: 'monthly-contract-end-risk',
      title: 'Contract-End Risk',
      description:
        'Your runway target is at or above months remaining in this tax year. Plan for income gaps now.',
      show: isMonthlyMode && Boolean(monthlyModeOutput?.hasContractEndRisk),
      isCritical: true,
    },
    {
      id: 'pension-gap',
      title: 'Inefficient Salary Zone',
      description: `Your salary is between £${SECONDARY_THRESHOLD.toLocaleString()} and £${LEL.toLocaleString()}. Employer NI applies here, but NI credits are not earned. NI credits typically require earnings around £${LEL.toLocaleString()} (illustrative).`,
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
      description: 'Your drawings may exceed the comparison baseline shown here.',
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
      show: hasResults && (comparison?.grossProfit ?? 0) > HIGH_PROFIT_COMPLEXITY_THRESHOLD,
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
      description: `Revenue approaching £${VAT_THRESHOLD.toLocaleString()} VAT threshold. Monitor closely; voluntary registration may be possible depending on your circumstances.${vatNote}`,
      show: revenue >= VAT_APPROACHING && revenue < VAT_THRESHOLD,
    },
    {
      id: 'pension-taper',
      title: 'Pension Annual Allowance Taper',
      description: `With adjusted income near or above £${(PENSION_TAPER_THRESHOLD / 1000).toFixed(0)}k, your Annual Allowance may be reduced from £${(PENSION_ANNUAL_ALLOWANCE / 1000).toFixed(0)}k down to £10k minimum. This is called the 'tapered annual allowance'.`,
      show: totalIncome >= PENSION_TAPER_THRESHOLD,
    },
    {
      id: 'pension-limit',
      title: 'Pension Annual Allowance',
      description: `Contributions over £${(PENSION_ANNUAL_ALLOWANCE / 1000).toFixed(0)}k may incur tax charges. Rules are complex (carry forward, taper for high earners, MPAA).`,
      show: formData.pensionContribution > PENSION_ANNUAL_ALLOWANCE,
    },

    // LOWER priority / informational
    {
      id: 'mid-year-assumption',
      title: 'Mid-Year Projection Assumption',
      description:
        'Monthly mode projects a flat monthly run-rate through March. Real income timing may differ.',
      show: isMonthlyMode,
    },
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
        'Taking a salary means running payroll and submitting RTI to HMRC each payday. Payroll software or an accountant can handle this.',
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
        "Money taken without payroll may create a Director's Loan balance depending on how it's treated in your accounts.",
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
      title: 'Benefit in Kind - Class 1A Included',
      description:
        'Company cost includes estimated Class 1A NI on BIK. Confirm exact treatment with your accountant if benefits change mid-year.',
      show: formData.companyCarBIK > 0,
    },
    {
      id: 'other-paye',
      title: 'Other PAYE Employment',
      description:
        'With another PAYE employment, NI thresholds are typically used in that role first. This model applies NI from the first pound on director salary; confirm with payroll records.',
      show: formData.hasOtherPAYEEmployment,
    },
    {
      id: 'dividend-timing',
      title: 'Dividend Timing Matters',
      description:
        'Dividends are taxed in the tax year they are declared (not paid). Board minutes and dividend vouchers are legally required. Timing around 5 April affects the tax year.',
      show: hasDividends,
    },
    {
      id: 'distributable',
      title: 'Verify Distributable Profits',
      description:
        'Dividends can only be paid from distributable profits (retained earnings). Your last filed accounts show retained earnings.',
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

function PanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-5', className)}>
      <h3 className={SECTION_HEADING_CLASS}>{title}</h3>
      {children}
    </section>
  );
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
