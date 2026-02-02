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
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SPACING } from '@/constants/designTokens';
import {
  trackCalculationRun,
  trackGuideReset,
  trackGuideStarted,
  trackResultsShown,
} from '@/lib/directorGuideAnalytics';
import { cn } from '@/lib/utils';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  useStrategyComparison,
} from '@/store/directorGuideStore';

/** Debounce delay for auto-calculate (ms) */
const CALCULATE_DEBOUNCE_MS = 200;

export function DirectorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Icon menu collapsed by default
  const [inputsCollapsed, setInputsCollapsed] = useState(false); // Inputs panel expanded
  const [educationCollapsed, setEducationCollapsed] = useState(false); // Education panel expanded
  const [mobileInputsOpen, setMobileInputsOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const formData = useDirectorFormData();
  const comparison = useStrategyComparison();
  const { calculate, reset } = useDirectorGuideActions();

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

  // Auto-calculate when inputs change (debounced to avoid keystroke thrash)
  useEffect(() => {
    const canCalculate =
      formData.region !== undefined &&
      formData.revenue !== undefined &&
      formData.revenue >= 0 &&
      formData.expenses !== undefined &&
      formData.expenses >= 0;

    if (!canCalculate) return;

    // Track once per distinct input set (avoid spamming analytics while typing).
    const signature = `${formData.region}|${formData.revenue}|${formData.expenses}|${String(
      formData.includesVat,
    )}`;
    if (lastTrackedCalcSignature.current !== signature) {
      trackCalculationRun({
        revenue: formData.revenue,
        expenses: formData.expenses,
        region: formData.region,
        includesVat: formData.includesVat,
      });
      lastTrackedCalcSignature.current = signature;
    }

    const timer = window.setTimeout(() => calculate(), CALCULATE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [formData.region, formData.revenue, formData.expenses, formData.includesVat, calculate]);

  // Track results shown (once per session, when comparison first becomes available)
  useEffect(() => {
    if (comparison && !hasTrackedResults.current) {
      trackResultsShown(comparison.grossProfit, comparison.grossProfit <= 0 ? 'survival' : 'normal');
      hasTrackedResults.current = true;
    }
  }, [comparison]);

  // Handle reset
  const handleReset = useCallback(() => {
    trackGuideReset();
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
          />
        }
        inputs={<InputsPanel onReset={handleReset} />}
        main={
          <main className='p-6'>
            {/* Header */}
            <div className={inputsCollapsed ? 'mb-6 pl-12' : 'mb-6'}>
              <h1 className='font-semibold text-2xl text-slate-100'>
                Director Pay{' '}
                <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
                  Dashboard
                </span>
              </h1>
            </div>

            {/* Results */}
            {hasComparison ? (
              <div className='space-y-6'>
                {isSurvivalMode ? (
                  <>
                    <SurvivalModePanel />
                    <KeyDates />
                  </>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <SummaryCards />

                    {/* Salary Slider */}
                    <SalarySlider />

                    {/* Strategy Comparison Table */}
                    <StrategyComparisonTable />

                    {/* Detail Cards (2x2 grid) */}
                    <DetailCards />

                    {/* Two Pots - Company vs Personal */}
                    <TaxPots />

                    {/* Pension Gap Warning */}
                    <PensionGapWarning />

                    {/* Money Flow + Key Dates */}
                    <div className='grid gap-4 md:grid-cols-2'>
                      <MoneyFlowChart />
                      <KeyDates />
                    </div>
                  </>
                )}

                {/* Email CTA Banner */}
                <div
                  className={cn(
                    'rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10',
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
                      <h3 className='mb-1 font-semibold text-lg text-slate-100'>
                        Save this breakdown for your records
                      </h3>
                      <p className='text-slate-400 text-sm'>
                        Get a full tax strategy report emailed to you - perfect for sharing with
                        your accountant.
                      </p>
                    </div>
                    <Button
                      onClick={() => setEmailDialogOpen(true)}
                      className='flex shrink-0 items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-[#020617] hover:opacity-90'
                    >
                      <Mail className='size-4' aria-hidden='true' />
                      Email My Results
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className='flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-white/[0.08] border-dashed bg-[#0f172a]/50'>
                <div className='mx-auto max-w-md text-center'>
                  <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20'>
                    <Calculator className='size-10 text-cyan-500' />
                  </div>
                  <h2 className='mb-2 font-semibold text-lg text-slate-100'>
                    Find your optimal salary & dividend mix
                  </h2>
                  <p className='mb-6 text-slate-500'>
                    Enter your company profit on the left to see exactly how much you could take
                    home. We&apos;ll show you the tax-efficient split and when to pay yourself.
                  </p>
                  <div
                    className={cn(
                      'flex items-center justify-center text-slate-600 text-sm',
                      SPACING.GAP_2,
                    )}
                  >
                    <span
                      className='size-2 rounded-full bg-cyan-500 motion-safe:animate-pulse'
                      aria-hidden='true'
                    />
                    Enter your figures to get started
                  </div>
                </div>
              </div>
            )}
          </main>
        }
        education={<EducationPanel />}
        inputsCollapsed={inputsCollapsed}
        educationCollapsed={educationCollapsed}
        onToggleInputs={() => setInputsCollapsed((prev) => !prev)}
        onToggleEducation={() => setEducationCollapsed((prev) => !prev)}
        mobileInputsOpen={mobileInputsOpen}
        onToggleMobileInputs={() => setMobileInputsOpen((prev) => !prev)}
        mobileEducationOpen={mobileEducationOpen}
        onToggleMobileEducation={() => setMobileEducationOpen((prev) => !prev)}
      />

      {/* Email Results Dialog */}
      <EmailResultsDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        comparison={comparison}
      />
    </TooltipProvider>
  );
}
