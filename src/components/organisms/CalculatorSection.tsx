// src/components/organisms/CalculatorSection.tsx
/**
 * Main UK Tax Calculator Section Component
 *
 * This is the primary calculator interface that combines the input form and results display.
 * It manages the calculation state, handles user interactions, and coordinates between
 * the input form and results table components.
 *
 * Features:
 * - Real-time tax calculations as user types
 * - Error handling and validation
 * - Export functionality (Excel, print)
 * - Responsive design for desktop and mobile
 * - Integration with Zustand store for state management
 *
 * The component follows the container/presenter pattern where this component handles
 * business logic and state management, while child components handle presentation.
 */
'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import SimpleExportButton from '@/components/molecules/SimpleExportButton';
import EnhancedPayslipTable from '@/components/organisms/EnhancedPayslipTable';
import StreamlinedTaxInputForm from '@/components/organisms/StreamlinedTaxInputForm';
import type { PayPeriod, TaxYear } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

/**
 * Props for the CalculatorSection component
 */
interface CalculatorSectionProps {
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** HTML id attribute for the container element */
  id?: string;
  /** Whether the calculator should render in full-screen mode */
  isFullScreen?: boolean;
}

/**
 * Advanced tax options that affect calculations
 * These options modify standard tax rules for specific circumstances
 */
interface TaxOptions {
  /** Whether the taxpayer has reached pension age (affects NI contributions) */
  isPensionAge: boolean;
  /** Whether the taxpayer is married (affects allowances) */
  isMarried: boolean;
  /** Whether the taxpayer is registered blind (affects personal allowance) */
  isBlind: boolean;
  /** Whether to exclude National Insurance calculations */
  noNationalInsurance: boolean;
  /** Amount of marriage allowance transferred from spouse (£0-£1,260) */
  marriageAllowanceTransfer: number;
}

/**
 * Pension contribution configuration
 * Supports both percentage of salary and fixed amount contributions
 */
interface PensionContribution {
  /** Contribution amount (percentage or fixed amount depending on type) */
  amount: number;
  /** Whether amount is a percentage of salary or fixed amount */
  type: 'percentage' | 'amount';
  /** Whether contribution is made before tax (salary sacrifice) */
  isBeforeTax: boolean;
}

/**
 * UK Tax Calculator Section - Main Calculator Interface
 *
 * This component provides a complete tax calculation interface including:
 * - Input form for salary, tax code, and other parameters
 * - Real-time calculation updates as user types
 * - Results table showing breakdown across different pay periods
 * - Export functionality for Excel and print
 * - Error handling and validation
 *
 * The component manages local state for UI-specific concerns while delegating
 * calculation logic to the Zustand store and core calculation functions.
 *
 * @param props - Component configuration options
 * @returns JSX element containing the complete calculator interface
 */
const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  className,
  id = 'calculator',
  isFullScreen = false,
}) => {
  // ===============================================
  // LOCAL STATE MANAGEMENT
  // ===============================================

  // Advanced tax options that modify standard calculations
  // These are not commonly used but provide comprehensive coverage
  const [taxOptions, setTaxOptions] = useState<TaxOptions>({
    isPensionAge: false,
    isMarried: false,
    isBlind: false,
    noNationalInsurance: false,
    marriageAllowanceTransfer: 0,
  });

  // Error handling state for calculation failures
  const [calculationError, setCalculationError] = useState<string | null>(null);
  // UI feedback state for calculation in progress
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [_selectedResultsPeriods, setSelectedResultsPeriods] = useState<string[]>([
    'yearly',
    'monthly',
    'weekly',
  ]);

  // Export data state - matches initial visible periods
  const [exportPeriods, setExportPeriods] = useState<string[]>(['Yearly', 'Monthly', 'Weekly']);
  const [exportPeriodOptions, setExportPeriodOptions] = useState<Record<string, number>>({
    Yearly: 1,
    Monthly: 12,
    '4-Weekly': 13,
    Fortnightly: 26,
    Weekly: 52,
    Daily: 260,
    Hourly: 1950,
  });

  const [pensionContribution, setPensionContribution] = useState<PensionContribution>({
    amount: 0,
    type: 'percentage',
    isBeforeTax: true,
  });

  // Calculator store
  const {
    input,
    results,
    setSalary,
    setPayPeriod,
    setTaxYear,
    setTaxCode,
    setIsScottish,
    setStudentLoanPlans,
    setPensionContribution: setStorePensionContribution,
    setPensionContributionType,
    setAdditionalAllowances,
    setHoursPerWeek,
    calculate,
    reset,
    init,
  } = useCalculatorStore();

  // Initialize with example calculation on component mount
  useEffect(() => {
    // Only initialize if we don't have results and salary is 0 (first load)
    if (!results && input.salary === 0) {
      init();
    }
  }, [init, results, input.salary]);

  // ===============================================
  // EVENT HANDLERS
  // ===============================================

  /**
   * Handles salary input changes with automatic recalculation
   *
   * Updates the store with the new salary value and triggers a recalculation
   * after a short delay to debounce rapid user input changes.
   *
   * @param salary - The new salary amount entered by the user
   */
  const handleSalaryChange = (salary: number) => {
    setSalary(salary);
    // Auto-calculate if salary is valid (including £0 for examples)
    // Use setTimeout to debounce rapid input changes
    if (salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  /**
   * Handles tax year selection changes
   *
   * Updates the tax year in the store and recalculates with new rates.
   * Different tax years have different tax bands and allowances.
   *
   * @param taxYear - The selected tax year (e.g., '2024-25', '2025-26')
   */
  const handleTaxYearChange = (taxYear: TaxYear) => {
    setTaxYear(taxYear);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  /**
   * Handles pay period selection changes
   *
   * Updates how the salary input should be interpreted (annual, monthly, etc.)
   * and recalculates the tax breakdown accordingly.
   *
   * @param payPeriod - The selected pay period frequency
   */
  const handlePayPeriodChange = (payPeriod: PayPeriod) => {
    setPayPeriod(payPeriod);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  /**
   * Handles changes to which periods are shown in results table
   * Currently unused but kept for future functionality
   *
   * @param periods - Array of period identifiers to display
   */
  const _handleResultsPeriodsChange = (periods: string[]) => {
    setSelectedResultsPeriods(periods);
  };

  /**
   * Handles pension contribution changes
   *
   * Updates both local state (for UI) and store state (for calculations).
   * Pension contributions are deducted before tax calculations.
   *
   * @param pension - New pension contribution configuration
   */
  const handlePensionChange = (pension: PensionContribution) => {
    setPensionContribution(pension);
    setStorePensionContribution(pension.amount);
    setPensionContributionType(pension.type);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const handleHoursPerWeekChange = (hours: number) => {
    setHoursPerWeek(hours);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculationError(null);
      setIsRecalculating(true);

      // Comprehensive input validation - matching toolhubx-live
      if (input.salary <= 0) {
        setCalculationError('Please enter a salary greater than zero.');
        return;
      }

      if (pensionContribution.amount < 0) {
        setCalculationError('Pension contribution cannot be negative.');
        return;
      }

      if (pensionContribution.type === 'percentage' && pensionContribution.amount > 100) {
        setCalculationError('Pension percentage cannot exceed 100%.');
        return;
      }

      if (input.hoursPerWeek <= 0 && input.payPeriod === 'hourly') {
        setCalculationError('Hours per week must be positive for hourly calculations.');
        return;
      }

      const totalAllowances = input.additionalAllowances.reduce(
        (sum, allowance) => sum + allowance.amount,
        0
      );
      if (totalAllowances < 0) {
        setCalculationError('Allowances/Deductions cannot be negative.');
        return;
      }

      // Additional validation for extreme values
      if (input.salary > 100000000) {
        // £100M cap
        setCalculationError('Salary amount is too large for calculation.');
        return;
      }

      if (pensionContribution.type === 'amount' && pensionContribution.amount > input.salary) {
        setCalculationError('Pension contribution cannot exceed gross salary.');
        return;
      }

      calculate();

      // Track calculation event with gtag
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag?.('event', 'calculate_tax', {
          tool: 'uk-tax-calculator',
          salary: input.salary,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred during calculation';
      setCalculationError(errorMessage);

      // Debug logging for calculations
      console.error('Calculation error:', errorMessage);
    } finally {
      // Add visual feedback delay for better UX
      setTimeout(() => setIsRecalculating(false), 300);
    }
  };

  const handleReset = () => {
    setCalculationError(null);
    reset();
    setTaxOptions({
      isPensionAge: false,
      isMarried: false,
      isBlind: false,
      noNationalInsurance: false,
      marriageAllowanceTransfer: 0,
    });
    setPensionContribution({
      amount: 0,
      type: 'percentage',
      isBeforeTax: true,
    });

    // Reset calculator to default state
    console.log('Calculator reset by user');
  };

  return (
    <section
      id={id}
      data-testid='calculator-section'
      className={cn(
        'relative',
        isFullScreen
          ? 'flex min-h-screen items-center pt-16 pb-4' // Full height minus navbar, small bottom padding for footer peek
          : 'py-8 lg:py-12',
        className
      )}
    >
      <div className={cn('mx-auto px-4', isFullScreen ? 'w-full' : 'container')}>
        <div
          className={cn(
            'items-start gap-8',
            isFullScreen
              ? 'grid h-full lg:grid-cols-12 xl:grid-cols-12'
              : 'grid lg:grid-cols-12 xl:grid-cols-12'
          )}
        >
          {/* Left Side - Input Form */}
          <div className='space-y-3 lg:col-span-4'>
            <StreamlinedTaxInputForm
              salary={input.salary}
              taxYear={input.taxYear}
              payPeriod={input.payPeriod}
              taxCode={input.taxCode || ''}
              isScottish={input.isScottish || false}
              studentLoanPlans={input.studentLoanPlans || []}
              allowancesDeductions={input.additionalAllowances.reduce(
                (sum, allowance) => sum + allowance.amount,
                0
              )}
              taxOptions={taxOptions}
              pensionContribution={pensionContribution}
              hoursPerWeek={input.hoursPerWeek || 37.5}
              onSalaryChange={handleSalaryChange}
              onTaxYearChange={handleTaxYearChange}
              onPayPeriodChange={handlePayPeriodChange}
              onTaxCodeChange={(code) => {
                setTaxCode(code);
                if (input.salary >= 0) {
                  setTimeout(() => calculate(), 100);
                }
              }}
              onScottishChange={(isScottish) => {
                setIsScottish(isScottish);
                if (input.salary >= 0) {
                  setTimeout(() => calculate(), 100);
                }
              }}
              onStudentLoanPlansChange={(plans) => {
                setStudentLoanPlans(plans);
                if (input.salary >= 0) {
                  setTimeout(() => calculate(), 100);
                }
              }}
              onAllowancesDeductionsChange={(amount) => {
                setAdditionalAllowances([
                  {
                    type: 'other',
                    name: 'Additional Allowances',
                    description: 'Additional allowances/deductions',
                    amount,
                    period: input.payPeriod,
                  },
                ]);
                if (input.salary >= 0) {
                  setTimeout(() => calculate(), 100);
                }
              }}
              onTaxOptionsChange={(newOptions) => {
                setTaxOptions(newOptions);
                if (input.salary >= 0) {
                  setTimeout(() => calculate(), 100);
                }
              }}
              onPensionChange={handlePensionChange}
              onHoursPerWeekChange={handleHoursPerWeekChange}
            />

            {/* Error Display */}
            {calculationError && (
              <div className='glass-card border border-red-400/30 bg-red-500/10'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-400' />
                  <div>
                    <h4 className='mb-1 font-medium text-red-300 text-sm'>Calculation Error</h4>
                    <p className='text-red-200 text-xs'>{calculationError}</p>
                    <p className='mt-1 text-red-200/80 text-xs'>
                      Please check your inputs and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Professional Sizing */}
            <div className='glass-card'>
              <div className='flex gap-2'>
                <button
                  type='button'
                  data-testid='calculate-button'
                  onClick={handleCalculate}
                  disabled={input.salary < 0 || isRecalculating}
                  className='flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-medium text-base text-white transition-all duration-200 hover:from-purple-500 hover:to-cyan-500 focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isRecalculating ? '⏳ Calculating...' : '🔄 Recalculate'}
                </button>

                <button
                  type='button'
                  onClick={handleReset}
                  className='glass flex items-center gap-1 rounded-lg border border-purple-400/30 px-4 py-3 font-medium text-base text-white/80 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500'
                >
                  <RotateCcw className='h-3 w-3' />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className='space-y-3 lg:sticky lg:top-24 lg:col-span-8'>
            <EnhancedPayslipTable
              results={results}
              allowancesDeductions={input.additionalAllowances
                .reduce((sum, allowance) => sum + allowance.amount, 0)
                .toString()}
              studentLoans={input.studentLoanPlans}
              isMarried={taxOptions.isMarried}
              hoursPerWeek={input.hoursPerWeek?.toString() || '37.5'}
              onPeriodsChange={(periods, periodOptions) => {
                setExportPeriods(periods);
                setExportPeriodOptions(periodOptions);
              }}
            />

            {/* Export Button - Outside table container */}
            {results && (
              <div className='mt-3 flex justify-center'>
                <SimpleExportButton
                  result={results}
                  visiblePeriods={exportPeriods}
                  periodOptions={exportPeriodOptions}
                  taxYear={input.taxYear}
                  allowancesDeductions={input.additionalAllowances
                    .reduce((sum, allowance) => sum + allowance.amount, 0)
                    .toString()}
                  studentLoans={input.studentLoanPlans}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
