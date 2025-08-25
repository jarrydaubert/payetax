// src/components/organisms/CalculatorSectionNew.tsx
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

interface CalculatorSectionProps {
  className?: string;
  id?: string;
  isFullScreen?: boolean;
}

interface TaxOptions {
  isPensionAge: boolean;
  isMarried: boolean;
  isBlind: boolean;
  noNationalInsurance: boolean;
  marriageAllowanceTransfer: number;
}

interface PensionContribution {
  amount: number;
  type: 'percentage' | 'amount';
  isBeforeTax: boolean;
}

const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  className,
  id = 'calculator',
  isFullScreen = false,
}) => {
  // Local state for advanced options and error handling
  const [taxOptions, setTaxOptions] = useState<TaxOptions>({
    isPensionAge: false,
    isMarried: false,
    isBlind: false,
    noNationalInsurance: false,
    marriageAllowanceTransfer: 0,
  });

  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [_selectedResultsPeriods, setSelectedResultsPeriods] = useState<string[]>([
    'yearly',
    'monthly',
    'weekly',
  ]);

  // Export data state
  const [exportPeriods, setExportPeriods] = useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
    'Daily',
  ]);
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

  // Handle form changes with auto-calculation
  const handleSalaryChange = (salary: number) => {
    setSalary(salary);
    // Auto-calculate if salary is valid (including £0 for examples)
    if (salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const handleTaxYearChange = (taxYear: TaxYear) => {
    setTaxYear(taxYear);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const handlePayPeriodChange = (payPeriod: PayPeriod) => {
    setPayPeriod(payPeriod);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const _handleResultsPeriodsChange = (periods: string[]) => {
    setSelectedResultsPeriods(periods);
  };

  const handlePensionChange = (pension: PensionContribution) => {
    setPensionContribution(pension);
    setStorePensionContribution(pension.amount);
    setPensionContributionType(pension.type);
    if (input.salary >= 0) {
      setTimeout(() => calculate(), 100);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculationError(null);

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
      className={cn(
        'relative',
        isFullScreen
          ? 'flex min-h-screen items-center pt-16 pb-4' // Full height minus navbar, small bottom padding for footer peek
          : 'py-8 lg:py-12',
        className
      )}
    >
      <div className={cn('mx-auto px-4', isFullScreen ? 'w-full max-w-7xl' : 'container')}>
        <div className={cn('mx-auto', isFullScreen ? 'max-w-7xl' : 'max-w-6xl')}>
          <div
            className={cn(
              'items-start gap-6',
              isFullScreen
                ? 'grid h-full lg:grid-cols-5 xl:grid-cols-5'
                : 'grid lg:grid-cols-5 xl:grid-cols-5'
            )}
          >
            {/* Left Side - Input Form */}
            <div className='space-y-3 lg:col-span-2'>
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
                    onClick={handleCalculate}
                    disabled={input.salary < 0}
                    className='flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-medium text-base text-white hover:from-purple-500 hover:to-cyan-500 focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    Calculate Tax
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
            <div className='space-y-3 lg:sticky lg:top-24 lg:col-span-3'>
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
              {/* Export functionality now integrated into EnhancedPayslipTable */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
