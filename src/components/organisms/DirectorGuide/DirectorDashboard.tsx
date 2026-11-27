// src/components/organisms/DirectorGuide/DirectorDashboard.tsx
/**
 * Director Dashboard - Main orchestrator component
 *
 * 4-panel layout matching the original mockup:
 * - Sidebar nav (60px)
 * - Inputs panel (280px)
 * - Main content: Summary Cards → Slider → Detail Cards → Chart
 * - Education panel (320px)
 */
'use client';

import { Calculator, Mail } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  KeyDates,
  PensionGapWarning,
  StrategyComparisonTable,
  TaxPots,
} from '@/components/molecules/DirectorGuide/calculator';
import { useActiveDirectorScenario } from '@/components/molecules/DirectorGuide/calculator/useActiveDirectorScenario';
import {
  DashboardLayout,
  DetailCards,
  EducationPanel,
  InputsPanel,
  MoneyFlowChart,
  RecommendationHero,
  SidebarNav,
  SummaryCards,
  SurvivalModePanel,
} from '@/components/molecules/DirectorGuide/dashboard';
import { EmailResultsDialog } from '@/components/molecules/DirectorGuide/EmailResultsDialog';
import { useDirectorEmailUnavailableReason } from '@/components/molecules/DirectorGuide/useDirectorEmailUnavailableReason';
import {
  FigureStorageAlert,
  FigureStorageControls,
  LEGACY_RESTORE_SELECTOR,
} from '@/components/molecules/FigureStorageControls';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { formatCurrencyInputValue } from '@/lib/currencyInput';
import {
  trackCalculationRun,
  trackGuideStarted,
  trackResultsShown,
} from '@/lib/directorGuideAnalytics';
import { useFigureStorage } from '@/lib/figureStorage';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { calculateSafeMonthlyDraw } from '@/lib/tax';
import { cn, formatCurrency } from '@/lib/utils';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';
import {
  hasCurrentDirectorResults,
  useDirectorError,
  useDirectorGuideActions,
  useDirectorGuideStore,
  useHasDirectorInputErrors,
  useHasUnsubmittedDirectorCommitment,
  useMonthlyModeOutput,
  useStrategyComparison,
  useSubmittedDirectorForm,
} from '@/store/directorGuideStore';

export const DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY = 'director-guide-education-collapsed:v1';

export function DirectorDashboard() {
  const emailUnavailableId = useId();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Icon menu collapsed by default
  const [inputsCollapsed, setInputsCollapsed] = useState(false); // Inputs panel expanded
  const [educationCollapsed, setEducationCollapsed] = useState(true); // Start collapsed to prioritize calculator workspace
  const [hasLoadedEducationPreference, setHasLoadedEducationPreference] = useState(false);
  const [mobileInputsOpen, setMobileInputsOpen] = useState(false);
  const [reviewLegacyIn, setReviewLegacyIn] = useState<'desktop' | 'mobile' | null>(null);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const hasLegacyFigures = useFigureStorage((state) => state.legacy);
  const formData = useSubmittedDirectorForm();
  const comparison = useStrategyComparison();
  const monthlyModeOutput = useMonthlyModeOutput();
  const { activeScenario, isProfitWhatIfActive } = useActiveDirectorScenario();
  const hasInputErrors = useHasDirectorInputErrors();
  const hasUnsubmittedCommitment = useHasUnsubmittedDirectorCommitment();
  const calculationError = useDirectorError();
  const hasPreviousSubmission = useDirectorGuideStore((state) => state.strategyComparison !== null);
  const { calculate, reset } = useDirectorGuideActions();
  const monthlyDraw =
    formData?.mode === 'monthly' && monthlyModeOutput && activeScenario
      ? calculateSafeMonthlyDraw({
          annualTakeHome: activeScenario.takeHome,
          companyTaxReserve: activeScenario.corporationTax + activeScenario.employerNI,
          monthsRemaining: monthlyModeOutput.monthsRemaining,
          cashInBank: formData.cashInBank,
          additionalCommittedCash: formData.additionalCommittedCash,
          minimumMonthlyDraw: formData.minimumMonthlyDraw,
          runwayMonths: formData.runwayMonths,
          monthlyExpenses: formData.monthlyExpenses,
        })
      : null;

  const emailUnavailableReason = useDirectorEmailUnavailableReason(
    'Calculate a current scenario before emailing results.',
    true,
  );
  const canEmail = emailUnavailableReason === null;
  const revenue =
    formData?.mode === 'monthly' ? monthlyModeOutput?.projectedRevenue : formData?.revenue;
  const expenses =
    formData?.mode === 'monthly' ? monthlyModeOutput?.projectedExpenses : formData?.expenses;
  const emailInput: DirectorEmailInput | null =
    formData && formData.region !== undefined && revenue !== undefined && expenses !== undefined
      ? {
          mode: formData.mode,
          region: formData.region,
          revenue,
          includesVat: formData.includesVat,
          expenses,
          lossesBroughtForward: formData.lossesBroughtForward,
          otherIncome: formData.otherIncome,
          employmentAllowance: formData.hasEmploymentAllowance,
          studentLoanPlans: formData.studentLoanPlans,
          pensionContribution: formData.isPensionAlreadyDeducted ? 0 : formData.pensionContribution,
          companyCarBIK: formData.companyCarBIK,
          associatedCompaniesCount: formData.associatedCompaniesCount,
          minimumSalaryRequirement: formData.minimumSalaryRequirement,
          hasOtherPAYEEmployment: formData.hasOtherPAYEEmployment,
          ytdSalary: formData.ytdSalary,
          ytdDividends: formData.ytdDividends,
          ytdDrawings: formData.ytdDrawings,
          yourSetupSalary: formData.yourSetupSalary,
          yourSetupDividends: formData.yourSetupDividends,
          monthlyIncome: formData.monthlyIncome,
          monthlyExpenses: formData.monthlyExpenses,
          contractStartMonth: formData.contractStartMonth,
          cashInBank: formData.cashInBank,
          minimumMonthlyDraw: formData.minimumMonthlyDraw,
          runwayMonths: formData.runwayMonths,
        }
      : null;

  const hasTrackedStart = useRef(false);
  const hasTrackedResults = useRef(false);

  // Track page load (once)
  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackGuideStarted();
      hasTrackedStart.current = true;
    }
  }, []);

  // Restore persisted learn-panel preference once per session.
  useEffect(() => {
    const persisted = safeGetItem(DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY);
    if (persisted === 'true' || persisted === 'false') {
      setEducationCollapsed(persisted === 'true');
    }
    setHasLoadedEducationPreference(true);
  }, []);

  // Persist learn-panel preference after initial load.
  useEffect(() => {
    if (!hasLoadedEducationPreference) return;
    safeSetItem(DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY, String(educationCollapsed));
  }, [educationCollapsed, hasLoadedEducationPreference]);

  const handleCalculate = useCallback(() => {
    trackCalculationRun();
    calculate();
  }, [calculate]);

  // Track results shown (once per session, when comparison first becomes available)
  useEffect(() => {
    if (comparison && !hasTrackedResults.current) {
      trackResultsShown();
      hasTrackedResults.current = true;
    }
  }, [comparison]);

  // Handle reset
  const handleReset = useCallback(() => {
    hasTrackedResults.current = false;
    reset();
  }, [reset]);

  // Show results when calculation is complete (even for 0 or negative profit)
  const hasComparison = Boolean(comparison && formData);
  const isSurvivalMode = Boolean(comparison && comparison.grossProfit <= 0);
  const companyShortfall =
    activeScenario?.companyShortfall ?? comparison?.strategies.allDividends.companyShortfall ?? 0;
  const mix = comparison?.strategies.optimalMix;

  useEffect(() => {
    if (!canEmail) setEmailDialogOpen(false);
  }, [canEmail]);
  const openEmailDialog = useCallback(() => {
    const state = useDirectorGuideStore.getState();
    if (canEmail && state.strategyComparison === comparison && hasCurrentDirectorResults(state)) {
      setEmailDialogOpen(true);
    }
  }, [canEmail, comparison]);

  return (
    <TooltipProvider>
      <DashboardLayout
        sidebar={
          <SidebarNav
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
            onEmailResults={canEmail ? openEmailDialog : undefined}
            emailUnavailableReason={emailUnavailableReason}
            onReset={handleReset}
            dashboardVariant={hasComparison ? (isSurvivalMode ? 'survival' : 'normal') : undefined}
          />
        }
        inputs={
          <InputsPanel
            onReset={handleReset}
            onCalculate={handleCalculate}
            className='h-auto flex-1 pb-3'
          />
        }
        inputActions={
          <div className='px-5 pb-6'>
            <FigureStorageControls />
          </div>
        }
        main={
          <main className='p-6' data-testid='director-dashboard-main'>
            {/* Header */}
            <div className={inputsCollapsed ? 'mb-6 pl-12' : 'mb-6'}>
              <h1 className='font-display text-3xl leading-tight font-semibold text-foreground'>
                Director Pay <span className='text-primary'>Dashboard</span>
              </h1>
              <nav
                aria-label='Director Intelligence navigation links'
                className='mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'
              >
                <Link href='/' className='hover:text-foreground'>
                  PAYE Calculator
                </Link>
                <span aria-hidden='true'>|</span>
                <Link href='/tools' className='hover:text-foreground'>
                  All Tools
                </Link>
                <span aria-hidden='true'>|</span>
                <Link href='/blog' className='hover:text-foreground'>
                  Tax Guides
                </Link>
              </nav>
            </div>
            {hasLegacyFigures && (
              <div className='mb-4 space-y-2'>
                <p className='text-sm font-medium'>
                  Previously saved figures are waiting. Choose Restore or Clear below Reset in Your
                  Numbers.
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='touch'
                  className='lg:hidden'
                  onClick={() => {
                    setReviewLegacyIn('mobile');
                    setMobileInputsOpen(true);
                  }}
                >
                  Review saved figures
                </Button>
                {inputsCollapsed && (
                  <Button
                    type='button'
                    variant='outline'
                    size='touch'
                    className='hidden lg:inline-flex'
                    onClick={() => {
                      setReviewLegacyIn('desktop');
                      setInputsCollapsed(false);
                    }}
                  >
                    Review saved figures
                  </Button>
                )}
              </div>
            )}
            {!mobileInputsOpen && (
              <FigureStorageAlert className={cn('mb-4', !inputsCollapsed && 'lg:hidden')} />
            )}

            {/* Results */}
            <p
              role='status'
              data-testid={hasInputErrors && !hasComparison ? 'director-results-paused' : undefined}
              className={cn(
                hasInputErrors
                  ? 'mb-4 rounded-sm border border-warning/40 bg-card p-4 text-sm text-foreground'
                  : 'mb-3 text-sm text-muted-foreground',
              )}
            >
              {hasComparison && hasUnsubmittedCommitment
                ? 'Showing results from your last calculation. Check the committed cash amount and select Calculate to update.'
                : hasInputErrors
                  ? 'Results are paused until every amount is valid. Check the amounts in Your Numbers.'
                  : hasComparison
                    ? 'Results are up to date.'
                    : calculationError || hasPreviousSubmission
                      ? 'Select Calculate in Your Numbers to see current results.'
                      : ''}
            </p>
            {hasComparison && formData ? (
              <div className='space-y-6'>
                {(formData.includesVat ||
                  formData.hasOtherPAYEEmployment ||
                  formData.pensionContribution > 0) && (
                  <section
                    aria-label='About this estimate'
                    className='space-y-2 rounded-sm border border-border bg-card p-4 text-sm text-muted-foreground'
                    data-testid='director-estimate-notes'
                  >
                    {formData.includesVat && (
                      <p>
                        VAT has not been removed from the revenue you entered, so this estimate may
                        be too high.
                      </p>
                    )}
                    {formData.hasOtherPAYEEmployment && (
                      <p>
                        This estimate applies the annual director National Insurance thresholds to
                        pay from this company. It assumes your other job has a separate National
                        Insurance calculation. Ask your payroll provider if your earnings must be
                        combined, for example if the employers carry on business in association.
                        HMRC may refund contributions paid above the annual maximum across jobs.
                      </p>
                    )}
                    {formData.pensionContribution > 0 && (
                      <p>
                        Company pension contributions count towards your annual allowance across all
                        your pensions. Going over your available allowance may mean a personal tax
                        charge, which is not included in this estimate. Unused allowance from the
                        previous three tax years may help; high income or some pension withdrawals
                        can reduce your allowance.
                      </p>
                    )}
                  </section>
                )}
                {companyShortfall > 0 && (
                  <p
                    role='status'
                    className='rounded-sm border border-warning/40 bg-card p-4 text-sm'
                  >
                    Available company profit falls short of the Class 1A National Insurance bill by{' '}
                    {formatCurrency(companyShortfall)}. The full-year strategies have £0 available
                    for salary or dividends.
                  </p>
                )}
                {mix && (mix.minimumSalaryShortfall ?? 0) > 0 && (
                  <p
                    role='status'
                    className='rounded-sm border border-warning/40 bg-card p-4 text-sm'
                  >
                    The highest affordable salary is {formatCurrency(mix.salary)}, which falls{' '}
                    {formatCurrency(mix.minimumSalaryShortfall ?? 0)} short of your minimum.
                  </p>
                )}
                {isSurvivalMode ? (
                  <>
                    <section data-director-section='director-survival' aria-label='Survival plan'>
                      <SurvivalModePanel />
                    </section>
                    <section data-director-section='director-key-dates' aria-label='Key dates'>
                      <KeyDates />
                    </section>
                  </>
                ) : (
                  <>
                    {activeScenario && monthlyDraw && (
                      <section className='rounded-sm border border-success/30 bg-card p-4'>
                        <h3 className='text-sm font-semibold tracking-wider text-success uppercase'>
                          Monthly Draw Estimate
                        </h3>
                        <div className='mt-2 grid gap-3 md:grid-cols-3'>
                          <div>
                            <div className='text-xs text-muted-foreground'>
                              Estimated draw this month
                            </div>
                            <div className='font-mono font-semibold text-foreground'>
                              {formatCurrencyInputValue(monthlyDraw.safeMonthlyDraw)}
                            </div>
                          </div>
                          <div>
                            <div className='text-xs text-muted-foreground'>Required buffer</div>
                            <div className='font-mono font-semibold text-foreground'>
                              {formatCurrencyInputValue(monthlyDraw.requiredBuffer)}
                            </div>
                          </div>
                          <div>
                            <div className='text-xs text-muted-foreground'>Buffer status</div>
                            <div
                              className={cn(
                                'font-medium',
                                monthlyDraw.hasBufferShortfall ? 'text-warning' : 'text-success',
                              )}
                            >
                              {monthlyDraw.hasBufferShortfall
                                ? `Shortfall ${formatCurrencyInputValue(monthlyDraw.shortfall)}`
                                : 'On track'}
                            </div>
                          </div>
                        </div>
                        {monthlyDraw.spendingShortfall > 0 && (
                          <p className='mt-2 text-sm text-foreground'>
                            {formatCurrencyInputValue(monthlyDraw.spendingShortfall)}/mo below your
                            spending target
                          </p>
                        )}
                        <p className='mt-2 text-xs text-muted-foreground'>
                          This estimate covers this month only. It uses bank cash after the buffer
                          and the Corporation Tax and employer NI reserve for the full projection
                          period. Projected monthly take-home caps the draw.{' '}
                          {formData.additionalCommittedCash === undefined
                            ? 'Additional commitments were left blank, so they are excluded.'
                            : `The estimate deducts ${formatCurrencyInputValue(formData.additionalCommittedCash)} in additional commitments.`}
                          {isProfitWhatIfActive &&
                            ' Take-home and tax reserves use the simulated profit. The buffer uses your submitted monthly running costs.'}
                        </p>
                      </section>
                    )}

                    <div data-director-section='director-recommendation'>
                      <RecommendationHero />
                    </div>

                    <section data-director-section='director-summary' aria-label='Summary cards'>
                      <SummaryCards
                        monthlyDraw={activeScenario ? monthlyDraw?.safeMonthlyDraw : undefined}
                      />
                    </section>

                    <section
                      data-director-section='director-strategy'
                      aria-label='Strategy comparison'
                    >
                      <StrategyComparisonTable />
                    </section>

                    <section
                      data-director-section='director-details'
                      aria-label='Detailed breakdowns'
                    >
                      <DetailCards />
                    </section>

                    <section aria-label='Company and personal tax pots'>
                      <TaxPots />
                    </section>

                    <section aria-label='Pension gap warning'>
                      <PensionGapWarning />
                    </section>

                    <section
                      data-director-section='director-key-dates'
                      aria-label='Money flow and key dates'
                    >
                      <div className='grid gap-4 md:grid-cols-2'>
                        <MoneyFlowChart />
                        <KeyDates />
                      </div>
                    </section>
                  </>
                )}

                {/* Email CTA Banner */}
                <div className='mt-8 rounded-sm border border-primary/25 bg-card p-6'>
                  <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                    <div className='text-center sm:text-left'>
                      <h3 className='mb-1 text-lg font-semibold text-foreground'>
                        Save this breakdown for your records
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Get a full tax strategy report emailed to you - perfect for sharing with
                        your accountant.
                      </p>
                    </div>
                    <Button
                      onClick={openEmailDialog}
                      disabled={!canEmail}
                      aria-describedby={emailUnavailableReason ? emailUnavailableId : undefined}
                      variant='outline'
                      className='flex shrink-0 items-center gap-2 px-6 py-3 font-semibold'
                    >
                      <Mail className='size-4' aria-hidden='true' />
                      Email My Results
                    </Button>
                  </div>
                  {emailUnavailableReason && (
                    <p
                      id={emailUnavailableId}
                      role='status'
                      aria-label='Email availability'
                      className='mt-3 text-sm text-muted-foreground'
                    >
                      {emailUnavailableReason}
                    </p>
                  )}
                </div>
              </div>
            ) : hasPreviousSubmission || calculationError ? null : (
              /* Empty State */
              <div className='flex min-h-[calc(100dvh-11rem)] flex-col items-center justify-center rounded-sm border border-dashed border-border/70 bg-background px-5 py-8 sm:min-h-[calc(100dvh-9rem)] sm:px-8 lg:min-h-screen'>
                <div className='mx-auto max-w-xl text-center'>
                  <p className='mb-3 text-xs font-semibold tracking-[0.28em] text-primary/90 uppercase'>
                    Start Here
                  </p>
                  <div className='mx-auto mb-5 flex size-20 items-center justify-center rounded-sm border border-primary/25 bg-card'>
                    <Calculator className='size-10 text-primary' />
                  </div>
                  <h2 className='font-display mb-3 text-[1.7rem] leading-tight font-semibold text-foreground sm:text-[2rem]'>
                    Enter your numbers to compare director pay options
                  </h2>
                  <p className='mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base'>
                    Enter annual revenue and business expenses, or monthly contract income and
                    costs, plus your tax region. Enter revenue before expenses, not profit: the
                    calculator subtracts costs to estimate profit before the director salary being
                    compared.
                  </p>

                  <div className='mt-6 grid gap-3 text-left sm:grid-cols-3'>
                    {[
                      {
                        title: '1. Revenue or contract income',
                        copy: 'Use annual revenue or monthly contract income, not profit after expenses.',
                      },
                      {
                        title: '2. Expenses and region',
                        copy: 'Exclude director salary and employer NI modelled in the comparison from expenses, then select your tax region.',
                      },
                      {
                        title: '3. Compare outcomes',
                        copy: 'See take-home, tax pots, and common salary/dividend mixes.',
                      },
                    ].map((item) => (
                      <div key={item.title} className='rounded-sm border border-border bg-card p-4'>
                        <h3 className='mb-1 text-sm font-medium text-foreground'>{item.title}</h3>
                        <p className='text-sm leading-6 text-muted-foreground'>{item.copy}</p>
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 space-y-3'>
                    <p className='hidden text-sm text-muted-foreground lg:block'>
                      Use the <span className='font-medium text-foreground'>Your Numbers</span>{' '}
                      panel on the left to start the comparison.
                    </p>

                    <Button
                      type='button'
                      onClick={() => setMobileInputsOpen(true)}
                      variant='outline'
                      className='inline-flex min-h-11 items-center gap-2 px-5 py-3 font-semibold lg:hidden'
                    >
                      <Calculator className='size-4' aria-hidden='true' />
                      Open Calculator
                    </Button>

                    <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                      <span
                        className='size-2 rounded-sm border border-primary/50 bg-primary'
                        aria-hidden='true'
                      />
                      On mobile, tap the calculator button to enter your figures.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        }
        education={<EducationPanel monthlyDraw={monthlyDraw} />}
        inputsCollapsed={inputsCollapsed}
        educationCollapsed={educationCollapsed}
        onToggleInputs={() => {
          setReviewLegacyIn(null);
          setInputsCollapsed((prev) => !prev);
        }}
        desktopInputsInitialFocusSelector={
          reviewLegacyIn === 'desktop' ? LEGACY_RESTORE_SELECTOR : undefined
        }
        onToggleEducation={() => setEducationCollapsed((prev) => !prev)}
        mobileInputsOpen={mobileInputsOpen}
        onToggleMobileInputs={() => {
          setReviewLegacyIn(null);
          setMobileInputsOpen((prev) => !prev);
        }}
        mobileInputsReady={hasComparison}
        mobileInputsInitialFocusSelector={
          reviewLegacyIn === 'mobile' ? LEGACY_RESTORE_SELECTOR : undefined
        }
        mobileEducationOpen={mobileEducationOpen}
        onToggleMobileEducation={() => setMobileEducationOpen((prev) => !prev)}
      />

      {/* Email Results Dialog */}
      <EmailResultsDialog
        open={emailDialogOpen && canEmail}
        onOpenChange={setEmailDialogOpen}
        comparison={comparison}
        emailInput={emailInput}
        unavailableReason={emailUnavailableReason}
      />
    </TooltipProvider>
  );
}
