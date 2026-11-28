/**
 * Education Panel - Learn cards, warnings, and assumptions
 */
'use client';

import { AlertTriangle } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import { CURRENT_TAX_YEAR, CURRENT_TAX_YEAR_DISPLAY, TAX_RATES } from '@/constants/taxRates';
import { getSection455Rate, type SafeDrawResult } from '@/lib/tax';
import { DIRECTOR_GUIDE_BUSINESS_THRESHOLDS } from '@/lib/tax/businessThresholds';
import { cn, formatCurrency } from '@/lib/utils';
import {
  type DirectorFormData,
  useMonthlyModeOutput,
  useSubmittedDirectorForm,
} from '@/store/directorGuideStore';

// Tax year configuration - single source
const TAX_YEAR = CURRENT_TAX_YEAR;
const rates = TAX_RATES[TAX_YEAR];

// Validate rates exist at module load (fail fast in dev)
if (!rates) {
  throw new Error(`Tax rates not found for year: ${TAX_YEAR}`);
}

// Extract constants from validated rates
const PA_TAPER_THRESHOLD = rates.personalAllowanceReductionThreshold;
const section455Rate = getSection455Rate(TAX_YEAR);
const section455Percent = section455Rate?.toLocaleString('en-GB', {
  style: 'percent',
  maximumFractionDigits: 2,
});

const {
  vatRegistration: VAT_THRESHOLD,
  hicbcStart: HICBC_START,
  hicbcEnd: HICBC_END,
  pensionTaperWarning: PENSION_TAPER_THRESHOLD,
  pensionAnnualAllowance: PENSION_ANNUAL_ALLOWANCE,
  paymentsOnAccount: PAYMENTS_ON_ACCOUNT_THRESHOLD,
  highProfitComplexity: HIGH_PROFIT_COMPLEXITY_THRESHOLD,
} = DIRECTOR_GUIDE_BUSINESS_THRESHOLDS;

const SECTION_HEADING_CLASS =
  'mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider';

interface EducationPanelProps {
  className?: string;
  monthlyDraw?: SafeDrawResult | null;
}

type EducationPanelFormData = Pick<
  DirectorFormData,
  | 'mode'
  | 'region'
  | 'otherIncome'
  | 'ytdSalary'
  | 'ytdDividends'
  | 'ytdDrawings'
  | 'hasEmploymentAllowance'
  | 'studentLoanPlans'
  | 'pensionContribution'
  | 'companyCarBIK'
  | 'associatedCompaniesCount'
  | 'hasOtherPAYEEmployment'
>;

export function EducationPanel({ className, monthlyDraw }: EducationPanelProps) {
  const formData = useSubmittedDirectorForm();
  const { comparison, activeScenario, profitWhatIfPercent } = useActiveDirectorScenario();
  const grossProfit = comparison?.grossProfit ?? 0;
  const monthlyModeOutput = useMonthlyModeOutput();
  const isMonthlyMode = formData?.mode === 'monthly';

  const hasResults = activeScenario !== null;
  const salary = activeScenario?.salary ?? 0;
  const dividends = activeScenario?.dividends ?? 0;

  // Gross income is used only for the existing pension allowance prompt.
  const totalIncome = hasResults ? (formData?.otherIncome ?? 0) + salary + dividends : 0;

  // Compute total already taken from YTD fields
  const alreadyTaken = formData
    ? formData.ytdSalary + formData.ytdDividends + formData.ytdDrawings
    : 0;

  const grossExtraction = salary + dividends;

  // Personal tax liability
  const personalTax = activeScenario
    ? activeScenario.incomeTax + activeScenario.dividendTax + activeScenario.studentLoan
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
          description: 'Payments to shareholders out of profits available for distribution.',
          show: dividends > 0,
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
        {
          title: 'VAT Registration',
          description: (
            <>
              If your business is UK-established, check your taxable turnover excluding VAT. If
              rolling 12-month taxable turnover went over {formatCurrency(VAT_THRESHOLD, 0)}, notify
              HMRC within 30 days of the end of that month. If you expect taxable turnover in the
              next 30 days alone to go over the threshold, notify HMRC by the end of that period,
              counted from when the expectation arose.{' '}
              <a
                href='https://www.gov.uk/register-for-vat'
                className='underline underline-offset-2'
              >
                Check HMRC’s VAT registration rules
              </a>
            </>
          ),
          show: Boolean(formData),
        },
        {
          title: 'Personal Allowance Taper',
          description: (
            <>
              If your adjusted net income exceeds {formatCurrency(PA_TAPER_THRESHOLD, 0)}, your
              Personal Allowance falls by £1 for every £2 above that amount. The tax impact depends
              on your region and mix of income.{' '}
              <a
                href='https://www.gov.uk/guidance/adjusted-net-income'
                className='underline underline-offset-2'
              >
                Work out your adjusted net income
              </a>
            </>
          ),
          show: hasResults,
        },
        {
          title: 'High Income Child Benefit Charge',
          description: (
            <>
              If you or your partner receive Child Benefit, check both individual adjusted net
              incomes. The charge may apply to the person with the higher income above{' '}
              {formatCurrency(HICBC_START, 0)} and reaches 100% of the benefit from{' '}
              {formatCurrency(HICBC_END, 0)}.{' '}
              <a
                href='https://www.gov.uk/child-benefit-tax-charge'
                className='underline underline-offset-2'
              >
                Check when the charge applies and how to pay it
              </a>
            </>
          ),
          show: Boolean(formData),
        },
      ].filter((card) => card.show),
    [dividends, formData, hasResults],
  );

  const sortedWarnings = useMemo(() => {
    if (!formData) return [];
    const visibleWarnings = buildWarnings({
      hasResults,
      salary,
      dividends,
      totalIncome,
      alreadyTaken,
      grossExtraction,
      personalTax,
      formData,
      grossProfit,
      monthlyDraw: monthlyModeOutput ? monthlyDraw : null,
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
    dividends,
    formData,
    grossExtraction,
    grossProfit,
    hasResults,
    isMonthlyMode,
    monthlyDraw,
    monthlyModeOutput,
    personalTax,
    salary,
    totalIncome,
  ]);

  return (
    <aside className={cn('flex h-full flex-col bg-card p-5', className)}>
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

      {formData && (
        <PanelSection title='Assumptions'>
          <div className='rounded-[10px] border border-border/50 bg-background p-4'>
            <p className='mb-3 text-xs leading-relaxed text-muted-foreground'>
              These assumptions apply to the submitted results.
            </p>
            <AssumptionRow label='Tax Year' value={CURRENT_TAX_YEAR_DISPLAY} />
            <AssumptionRow
              label='Region'
              value={formData.region === 'scotland' ? 'Scotland' : 'England/Wales/NI'}
            />
            <AssumptionRow
              label='Trading Period'
              value={
                isMonthlyMode
                  ? monthlyModeOutput
                    ? `Monthly projection (${monthlyModeOutput.monthsRemaining} month${monthlyModeOutput.monthsRemaining === 1 ? '' : 's'} remaining)`
                    : 'Monthly projection'
                  : 'Full Year'
              }
            />
            {profitWhatIfPercent !== 0 && (
              <AssumptionRow
                label='Profit simulation'
                value={`${profitWhatIfPercent > 0 ? '+' : ''}${profitWhatIfPercent}%`}
              />
            )}
            <AssumptionRow
              label='Other Income'
              value={
                formData.otherIncome > 0 ? `£${formData.otherIncome.toLocaleString()}` : 'None'
              }
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
      )}

      <PanelSection title='Accuracy & Scope' className='mb-0'>
        <div className='space-y-3'>
          <div className='rounded-[10px] border border-border/50 bg-background p-4'>
            <div className='mb-2 text-sm font-medium text-foreground'>
              What this calculator does
            </div>
            <ul className='space-y-1 text-xs text-muted-foreground'>
              <li>• Compares salary vs dividend extraction strategies</li>
              <li>
                • Uses published UK tax rates, including Scottish Government rates for Scottish
                Income Tax
              </li>
              <li>
                • Assumes single director and standalone company
                {isMonthlyMode ? ', with monthly run-rate projection' : ', with a full-year view'}
              </li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-border/50 bg-background p-4'>
            <div className='mb-2 text-sm font-medium text-foreground'>Known limitations</div>
            <ul className='space-y-1 text-xs text-muted-foreground'>
              <li>• Student loan £2k unearned income rule (may overstate)</li>
              <li>• Short accounting period adjustments</li>
              <li>• Marriage Allowance transfers</li>
              <li>• IR35 status considerations</li>
              <li>• Pension carry-forward from previous years</li>
              <li>• MPAA (Money Purchase Annual Allowance) - £10k limit if pension accessed</li>
              <li>• Uses annual dividend totals</li>
            </ul>
          </div>
          <div className='rounded-[10px] border border-primary/20 bg-primary/5 p-4'>
            <div className='mb-2 text-sm font-medium text-primary'>
              MTD for Income Tax timeline (current HMRC plan)
            </div>
            <ul className='space-y-1 text-xs text-primary/90'>
              <li>• From 6 April 2026: qualifying income over £50,000</li>
              <li>• From 6 April 2027: qualifying income over £30,000</li>
              <li>• From 6 April 2028: qualifying income over £20,000</li>
            </ul>
            <p className='mt-2 text-xs leading-relaxed text-primary/85'>
              Scope depends on your personal income sources. Limited-company directors may still
              file Self Assessment outside MTD for Income Tax unless qualifying self-employment or
              property income applies.
            </p>
          </div>
          <div className='rounded-[10px] border border-warning/20 bg-warning/5 p-3'>
            <p className='text-xs leading-relaxed text-warning'>
              <strong>Disclaimer:</strong> For illustrative purposes only. Not financial or tax
              advice. Consult a qualified accountant for advice specific to your situation.
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
  salary: number;
  dividends: number;
  totalIncome: number;
  alreadyTaken: number;
  grossExtraction: number;
  personalTax: number;
  formData: EducationPanelFormData;
  grossProfit: number;
  monthlyDraw?: SafeDrawResult | null;
  isMonthlyMode: boolean;
}

interface Warning {
  id: string;
  title: string;
  description: ReactNode;
  show: boolean;
  isCritical?: boolean;
}

function buildWarnings(ctx: WarningContext): Warning[] {
  const {
    hasResults,
    salary,
    dividends,
    totalIncome,
    alreadyTaken,
    grossExtraction,
    personalTax,
    formData,
    grossProfit,
    monthlyDraw,
    isMonthlyMode,
  } = ctx;

  // Pre-compute conditions
  const isOverdrawn = hasResults && alreadyTaken > grossExtraction;
  const hasDrawings = formData.ytdDrawings > 0;
  const hasDividends = dividends > 0;

  return [
    // CRITICAL warnings first
    {
      id: 'monthly-buffer-shortfall',
      title: 'Cash Buffer Shortfall',
      description: monthlyDraw
        ? `Cash after company tax and employer NI estimated for the full projection period is below your required buffer by £${Math.round(
            monthlyDraw.shortfall,
          ).toLocaleString()}. Consider reducing drawings or increasing runway cash.`
        : 'Current cash is below your required runway buffer.',
      show: isMonthlyMode && Boolean(monthlyDraw?.hasBufferShortfall),
      isCritical: true,
    },
    {
      id: 's455',
      title: 'Section 455 Tax Warning',
      description: (
        <>
          {section455Percent === undefined
            ? 'Section 455 tax may apply to unpaid director’s loans. Check the rate for the tax year the loan was made.'
            : `For loans made in ${CURRENT_TAX_YEAR_DISPLAY}, your company may owe Section 455 tax at ${section455Percent} on amounts still unpaid nine months after the end of the accounting period.`}{' '}
          <a
            href='https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm61505'
            className='underline underline-offset-2'
          >
            HMRC’s Section 455 guidance
          </a>
        </>
      ),
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

    // MEDIUM priority warnings
    {
      id: 'complexity',
      title: 'High Profit Complexity',
      description:
        'At this profit level, an accountant could save you serious money with advanced strategies.',
      show: hasResults && grossProfit > HIGH_PROFIT_COMPLEXITY_THRESHOLD,
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
      description: monthlyDraw?.runwayTargetReachesProjectionEnd
        ? 'Monthly mode projects a flat run-rate through March. Your runway target is at least as long as the period modelled.'
        : 'Monthly mode projects a flat run-rate through March. Real income timing may differ.',
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
      show: hasResults && salary > 0,
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
      title: 'Student Loan Estimate',
      description:
        'We estimate how much this company’s salary and dividends add to your annual student loan liability. We treat Other Personal Income as earnings. If it includes rent, interest or other dividends, your repayment may differ. Under Self Assessment, all unearned income counts once its annual total exceeds £2,000. Class 1A company car benefits are excluded. HMRC rounds repayments down to whole pounds and credits repayments already taken through payroll.',
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
        'Jobs with unrelated employers normally have separate National Insurance thresholds. If earnings must be combined or HMRC has approved deferment, check with your payroll provider. HMRC may refund contributions paid above the annual maximum across jobs.',
      show: formData.hasOtherPAYEEmployment,
    },
    {
      id: 'dividend-timing',
      title: 'Dividend Timing Matters',
      description: (
        <>
          Check when the dividend becomes due and payable. For final dividends, use the payment date
          set in the resolution, or the declaration date if none is set. Interim dividends generally
          count when paid, including when credited to an account you can draw on.{' '}
          <a
            href='https://www.gov.uk/hmrc-internal-manuals/company-taxation-manual/ctm15205'
            className='underline underline-offset-2'
          >
            Check HMRC’s dividend timing guidance
          </a>
        </>
      ),
      show: hasDividends,
    },
    {
      id: 'distributable',
      title: 'Verify Distributable Profits',
      description: (
        <>
          Before paying dividends, use the relevant accounts to check accumulated realised profits
          available for distribution after realised losses.{' '}
          <a
            href='https://www.legislation.gov.uk/ukpga/2006/46/part/23'
            className='underline underline-offset-2'
          >
            Check the Companies Act rules
          </a>
        </>
      ),
      show: hasDividends,
    },
  ];
}

// =============================================================================
// Sub-components
// =============================================================================

interface LearnCardProps {
  title: string;
  description: ReactNode;
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
    <div className='rounded-[10px] border border-border/50 bg-background p-4'>
      <div className='mb-1 text-sm font-medium text-foreground'>{title}</div>
      <div className='text-xs leading-relaxed text-muted-foreground'>{description}</div>
    </div>
  );
}

interface WarningCardProps {
  title: string;
  description: ReactNode;
  isCritical?: boolean;
}

function WarningCard({ title, description, isCritical }: WarningCardProps) {
  return (
    <div
      className={cn(
        'rounded-[10px] border p-4',
        isCritical ? 'border-destructive/30 bg-destructive/10' : 'border-warning/30 bg-warning/10',
      )}
    >
      <div className='mb-2 flex items-center gap-2'>
        <AlertTriangle
          className={cn('size-4', isCritical ? 'text-destructive' : 'text-warning')}
          aria-hidden='true'
        />
        <span
          className={cn('text-sm font-semibold', isCritical ? 'text-destructive' : 'text-warning')}
        >
          {isCritical && <span className='sr-only'>Critical warning: </span>}
          {title}
        </span>
      </div>
      <div className='text-xs leading-relaxed text-muted-foreground'>{description}</div>
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
      className={cn('flex justify-between py-1.5 text-xs', !isLast && 'border-b border-border/50')}
    >
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-foreground'>{value}</span>
    </div>
  );
}
