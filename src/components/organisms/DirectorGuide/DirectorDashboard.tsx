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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyDates,
  PensionGapWarning,
  SalarySlider,
  StrategyComparisonTable,
  TaxPots,
} from '@/components/molecules/DirectorGuide/calculator';
import {
  DashboardLayout,
  DetailCards,
  EducationPanel,
  InputsPanel,
  MoneyFlowChart,
  SidebarNav,
  SummaryCards,
  SurvivalModePanel,
} from '@/components/molecules/DirectorGuide/dashboard';
import { EmailResultsDialog } from '@/components/molecules/DirectorGuide/EmailResultsDialog';
import { DirectorGuideWelcomeDialog } from '@/components/molecules/DirectorGuide/WelcomeDialog';
import { NewsletterCTA } from '@/components/organisms/NewsletterCTA';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SPACING } from '@/constants/designTokens';
import {
  trackCalculationRun,
  trackGuideStarted,
  trackResultsShown,
} from '@/lib/directorGuideAnalytics';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';
import { resolveAnnualFinancials } from '@/lib/tax/variableIncome';
import { cn } from '@/lib/utils';
import type { DirectorEmailInput } from '@/lib/validation/emailValidation';
import {
  useDirectorFormSlice,
  useDirectorGuideActions,
  useMonthlyModeOutput,
  useStrategyComparison,
} from '@/store/directorGuideStore';

/** Debounce delay for auto-calculate (ms) */
const CALCULATE_DEBOUNCE_MS = 200;
export const DIRECTOR_EDUCATION_COLLAPSED_STORAGE_KEY = 'director-guide-education-collapsed:v1';

export function DirectorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Icon menu collapsed by default
  const [inputsCollapsed, setInputsCollapsed] = useState(false); // Inputs panel expanded
  const [educationCollapsed, setEducationCollapsed] = useState(true); // Start collapsed to prioritize calculator workspace
  const [hasLoadedEducationPreference, setHasLoadedEducationPreference] = useState(false);
  const [mobileInputsOpen, setMobileInputsOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const formData = useDirectorFormSlice((state) => ({
    mode: state.mode,
    region: state.region,
    revenue: state.revenue,
    includesVat: state.includesVat,
    expenses: state.expenses,
    lossesBroughtForward: state.lossesBroughtForward,
    ytdSalary: state.ytdSalary,
    ytdDividends: state.ytdDividends,
    ytdDrawings: state.ytdDrawings,
    otherIncome: state.otherIncome,
    hasOtherPAYEEmployment: state.hasOtherPAYEEmployment,
    studentLoanPlans: state.studentLoanPlans,
    pensionContribution: state.pensionContribution,
    isPensionAlreadyDeducted: state.isPensionAlreadyDeducted,
    companyCarBIK: state.companyCarBIK,
    associatedCompaniesCount: state.associatedCompaniesCount,
    hasEmploymentAllowance: state.hasEmploymentAllowance,
    minimumSalaryRequirement: state.minimumSalaryRequirement,
    yourSetupSalary: state.yourSetupSalary,
    yourSetupDividends: state.yourSetupDividends,
    monthlyIncome: state.monthlyIncome,
    monthlyExpenses: state.monthlyExpenses,
    contractStartMonth: state.contractStartMonth,
    cashInBank: state.cashInBank,
    minimumMonthlyDraw: state.minimumMonthlyDraw,
    runwayMonths: state.runwayMonths,
  }));
  const comparison = useStrategyComparison();
  const monthlyModeOutput = useMonthlyModeOutput();
  const { calculate, reset } = useDirectorGuideActions();
  const isMonthlyMode = formData.mode === 'monthly';

  const annualizedFromInputs = resolveAnnualFinancials({
    mode: formData.mode,
    revenue: formData.revenue,
    expenses: formData.expenses,
    monthlyIncome: formData.monthlyIncome,
    monthlyExpenses: formData.monthlyExpenses,
    contractStartMonth: formData.contractStartMonth,
  });

  const effectiveRevenue = isMonthlyMode
    ? (monthlyModeOutput?.projectedRevenue ?? annualizedFromInputs.revenue)
    : annualizedFromInputs.revenue;
  const effectiveExpenses = isMonthlyMode
    ? (monthlyModeOutput?.projectedExpenses ?? annualizedFromInputs.expenses)
    : annualizedFromInputs.expenses;

  const emailInput: DirectorEmailInput | null =
    comparison &&
    formData.region !== undefined &&
    effectiveRevenue !== undefined &&
    effectiveExpenses !== undefined
      ? {
          mode: formData.mode,
          region: formData.region,
          revenue: effectiveRevenue,
          includesVat: formData.includesVat,
          expenses: effectiveExpenses,
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
  const lastTrackedCalcSignature = useRef<string | null>(null);

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

  // Auto-calculate when inputs change (debounced to avoid keystroke thrash)
  useEffect(() => {
    const { region, includesVat } = formData;
    if (region === undefined) {
      return;
    }

    const annualizedFinancials = resolveAnnualFinancials({
      mode: formData.mode,
      revenue: formData.revenue,
      expenses: formData.expenses,
      monthlyIncome: formData.monthlyIncome,
      monthlyExpenses: formData.monthlyExpenses,
      contractStartMonth: formData.contractStartMonth,
    });

    const revenue = annualizedFinancials.revenue;
    const expenses = annualizedFinancials.expenses;

    if (revenue === undefined || expenses === undefined) {
      return;
    }
    if (revenue < 0 || expenses < 0) {
      return;
    }
    if (annualizedFinancials.hasInvalidContractStartMonth) {
      return;
    }

    // Track once per distinct input set (avoid spamming analytics while typing).
    const signature = `${formData.mode}|${region}|${revenue}|${expenses}|${String(includesVat)}`;
    if (lastTrackedCalcSignature.current !== signature) {
      trackCalculationRun({
        revenue,
        expenses,
        region,
        includesVat,
      });
      lastTrackedCalcSignature.current = signature;
    }

    const timer = window.setTimeout(() => calculate(), CALCULATE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [formData, calculate]);

  // Track results shown (once per session, when comparison first becomes available)
  useEffect(() => {
    if (comparison && !hasTrackedResults.current) {
      trackResultsShown(
        comparison.grossProfit,
        comparison.grossProfit <= 0 ? 'survival' : 'normal',
      );
      hasTrackedResults.current = true;
    }
  }, [comparison]);

  // Handle reset
  const handleReset = useCallback(() => {
    hasTrackedResults.current = false;
    reset();
  }, [reset]);

  // Show results when calculation is complete (even for 0 or negative profit)
  const hasComparison = Boolean(comparison);
  const isSurvivalMode = Boolean(comparison && comparison.grossProfit <= 0);

  return (
    <TooltipProvider>
      <DashboardLayout
        sidebar={
          <SidebarNav
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
            onEmailResults={() => setEmailDialogOpen(true)}
            onReset={handleReset}
            dashboardVariant={hasComparison ? (isSurvivalMode ? 'survival' : 'normal') : undefined}
          />
        }
        inputs={<InputsPanel onReset={handleReset} />}
        main={
          <main className='p-6' data-testid='director-dashboard-main'>
            {/* Header */}
            <div className={inputsCollapsed ? 'mb-6 pl-12' : 'mb-6'}>
              <h1 className='font-semibold text-2xl text-foreground'>
                Director Pay <span className='text-gradient-brand'>Dashboard</span>
              </h1>
              <nav
                aria-label='Director Intelligence navigation links'
                className='mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-sm'
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

            {/* Results */}
            {hasComparison ? (
              <div className='space-y-6'>
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
                    {isMonthlyMode && monthlyModeOutput && (
                      <section className='rounded-xl border border-success/20 bg-success/10 p-4'>
                        <h3 className='font-semibold text-sm text-success uppercase tracking-wider'>
                          Safe Monthly Draw
                        </h3>
                        <div className='mt-2 grid gap-3 md:grid-cols-3'>
                          <div>
                            <div className='text-muted-foreground text-xs'>Recommended draw</div>
                            <div className='font-mono font-semibold text-foreground'>
                              £{Math.round(monthlyModeOutput.safeMonthlyDraw).toLocaleString()}/mo
                            </div>
                          </div>
                          <div>
                            <div className='text-muted-foreground text-xs'>Required buffer</div>
                            <div className='font-mono font-semibold text-foreground'>
                              £{Math.round(monthlyModeOutput.requiredBuffer).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className='text-muted-foreground text-xs'>Buffer status</div>
                            <div
                              className={cn(
                                'font-medium',
                                monthlyModeOutput.hasBufferShortfall
                                  ? 'text-warning'
                                  : 'text-success',
                              )}
                            >
                              {monthlyModeOutput.hasBufferShortfall
                                ? `Shortfall £${Math.round(monthlyModeOutput.shortfall).toLocaleString()}`
                                : 'On track'}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    <section data-director-section='director-summary' aria-label='Summary cards'>
                      <SummaryCards />
                    </section>

                    <section data-director-section='director-slider' aria-label='Salary slider'>
                      <SalarySlider />
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
                <div
                  className={cn(
                    'rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-success/10',
                    SPACING.MT_8,
                    SPACING.P_6,
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-between sm:flex-row',
                      SPACING.GAP_4,
                    )}
                  >
                    <div className='text-center sm:text-left'>
                      <h3 className='mb-1 font-semibold text-foreground text-lg'>
                        Save this breakdown for your records
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Get a full tax strategy report emailed to you - perfect for sharing with
                        your accountant.
                      </p>
                    </div>
                    <Button
                      onClick={() => setEmailDialogOpen(true)}
                      variant='brandOutline'
                      className='flex shrink-0 items-center gap-2 px-6 py-3 font-semibold'
                    >
                      <Mail className='size-4' aria-hidden='true' />
                      Email My Results
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className='flex min-h-[calc(100dvh-11rem)] flex-col items-center justify-center rounded-[1.75rem] border border-border/50 border-dashed bg-background/60 px-5 py-8 sm:min-h-[calc(100dvh-9rem)] sm:px-8 lg:min-h-screen'>
                <div className='mx-auto max-w-xl text-center'>
                  <p className='mb-3 font-semibold text-primary/90 text-xs uppercase tracking-[0.28em]'>
                    Start Here
                  </p>
                  <div className='mx-auto mb-5 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-success/20'>
                    <Calculator className='size-10 text-primary' />
                  </div>
                  <h2 className='mb-3 font-semibold text-[1.7rem] text-foreground leading-tight sm:text-[2rem]'>
                    Enter your numbers to compare director pay options
                  </h2>
                  <p className='mx-auto max-w-2xl text-muted-foreground text-sm leading-7 sm:text-base'>
                    Add your company profit, costs, and region to see take-home pay, tax to set
                    aside, and common salary versus dividend mixes.
                  </p>

                  <div className='mt-6 grid gap-3 text-left sm:grid-cols-3'>
                    {[
                      {
                        title: '1. Company profit',
                        copy: 'Annual profit or monthly income, depending on the mode you choose.',
                      },
                      {
                        title: '2. Expenses and region',
                        copy: 'Add costs and select your tax region so the comparison is grounded.',
                      },
                      {
                        title: '3. Compare outcomes',
                        copy: 'See take-home, tax pots, and common salary/dividend mixes.',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className='rounded-2xl border border-border/60 bg-card/70 p-4'
                      >
                        <h3 className='mb-1 font-medium text-foreground text-sm'>{item.title}</h3>
                        <p className='text-muted-foreground text-sm leading-6'>{item.copy}</p>
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 space-y-3'>
                    <p className='hidden text-muted-foreground text-sm lg:block'>
                      Use the <span className='font-medium text-foreground'>Your Numbers</span>{' '}
                      panel on the left to start the comparison.
                    </p>

                    <Button
                      type='button'
                      onClick={() => setMobileInputsOpen(true)}
                      variant='brandOutline'
                      className='inline-flex min-h-11 items-center gap-2 px-5 py-3 font-semibold lg:hidden'
                    >
                      <Calculator className='size-4' aria-hidden='true' />
                      Open Calculator
                    </Button>

                    <div
                      className={cn(
                        'flex items-center justify-center text-muted-foreground text-sm',
                        SPACING.GAP_2,
                      )}
                    >
                      <span
                        className='size-2 rounded-full bg-primary motion-safe:animate-pulse'
                        aria-hidden='true'
                      />
                      On mobile, tap the calculator button to enter your figures.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section aria-label='Tax updates newsletter' className={SPACING.MT_8}>
              <NewsletterCTA
                className='mx-auto max-w-4xl'
                title='Get Director Tax Updates by Email'
                description='HMRC changes, director tax guidance, and practical planning tips.'
              />
            </section>
          </main>
        }
        education={<EducationPanel />}
        inputsCollapsed={inputsCollapsed}
        educationCollapsed={educationCollapsed}
        onToggleInputs={() => setInputsCollapsed((prev) => !prev)}
        onToggleEducation={() => setEducationCollapsed((prev) => !prev)}
        mobileInputsOpen={mobileInputsOpen}
        onToggleMobileInputs={() => setMobileInputsOpen((prev) => !prev)}
        mobileInputsReady={hasComparison}
        mobileEducationOpen={mobileEducationOpen}
        onToggleMobileEducation={() => setMobileEducationOpen((prev) => !prev)}
      />

      {/* Email Results Dialog */}
      <EmailResultsDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        comparison={comparison}
        emailInput={emailInput}
      />
      <DirectorGuideWelcomeDialog />
    </TooltipProvider>
  );
}
