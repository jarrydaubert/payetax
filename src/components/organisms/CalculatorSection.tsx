// src/components/organisms/CalculatorSectionNew.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';
import Button from '@/components/ui/Button';
import StreamlinedTaxInputForm from '@/components/organisms/StreamlinedTaxInputForm';
import PayslipSummaryTable from '@/components/organisms/PayslipSummaryTable';
import ExportActions from '@/components/molecules/ExportActions';
import { useCalculatorStore } from '@/store/calculatorStore';
import { cn } from '@/lib/utils';
import type { TaxYear, PayPeriod } from '@/constants/taxRates';

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
  isFullScreen = false
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
  const [selectedResultsPeriods, setSelectedResultsPeriods] = useState<string[]>(['yearly', 'monthly', 'weekly']);

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
    setNiCategory,
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

  const handleResultsPeriodsChange = (periods: string[]) => {
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
      calculate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during calculation';
      setCalculationError(errorMessage);
      
      // Additional Sentry context for UI-triggered calculations
      Sentry.addBreadcrumb({
        category: 'user-action',
        message: 'User clicked calculate button',
        level: 'info',
      });
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
    
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: 'User reset calculator',
      level: 'info',
    });
  };


  return (
    <section 
      id={id}
      className={cn(
        'relative',
        isFullScreen 
          ? 'min-h-screen flex items-center pt-16 pb-4' // Full height minus navbar, small bottom padding for footer peek
          : 'py-8 lg:py-12',
        className
      )}
    >
      <div className={cn(
        'mx-auto px-4',
        isFullScreen ? 'w-full max-w-none' : 'container'
      )}>
        <div className={cn(
          'mx-auto',
          isFullScreen ? 'max-w-7xl' : 'max-w-7xl'
        )}>
          <div className={cn(
            'gap-6 items-start',
            isFullScreen 
              ? 'grid lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] h-full' 
              : 'grid lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr]'
          )}>
            
            {/* Left Side - Input Form */}
            <div className="space-y-3">
              <StreamlinedTaxInputForm
                salary={input.salary}
                taxYear={input.taxYear}
                payPeriod={input.payPeriod}
                taxCode={input.taxCode || ''}
                isScottish={input.isScottish || false}
                studentLoanPlans={input.studentLoanPlans || []}
                allowancesDeductions={input.additionalAllowances.reduce((sum, allowance) => sum + allowance.amount, 0)}
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
                  setAdditionalAllowances([{ 
                    type: 'other', 
                    name: 'Additional Allowances',
                    description: 'Additional allowances/deductions', 
                    amount,
                    period: input.payPeriod
                  }]);
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
                <div className="glass-card border border-red-400/30 bg-red-500/10">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-300 font-medium mb-1 text-sm">Calculation Error</h4>
                      <p className="text-red-200 text-xs">{calculationError}</p>
                      <p className="text-red-200/80 text-xs mt-1">
                        Please check your inputs and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Professional Sizing */}
              <div className="glass-card">
                <div className="flex gap-2">
                  <button
                    onClick={handleCalculate}
                    disabled={input.salary < 0}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 focus:ring-2 focus:ring-purple-500"
                  >
                    Calculate Tax
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 text-sm font-medium text-white/80 rounded-lg glass border border-purple-400/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Results */}
            <div className="lg:sticky lg:top-24 space-y-3">
              <PayslipSummaryTable
                results={results}
                onPeriodsChange={handleResultsPeriodsChange}
              />
              
              {/* Export Actions - Below Results */}
              {results && (
                <div className="glass-card">
                  <ExportActions
                    onPrint={async () => {
                      try {
                        const { generatePDF } = await import('@/lib/pdfExport');
                        const exportData = {
                          results,
                          salary: input.salary,
                          taxYear: input.taxYear,
                          taxCode: input.taxCode || '1257L',
                          region: input.isScottish ? 'Scotland' : 'England, Wales & Northern Ireland',
                          studentLoans: input.studentLoanPlans || [],
                          exportDate: new Date().toLocaleDateString('en-GB'),
                        };
                        await generatePDF(exportData);
                      } catch (error) {
                        console.error('PDF export failed:', error);
                      }
                    }}
                    onDownload={() => {
                      try {
                        // CSV export implementation
                        console.log('CSV export not yet implemented');
                      } catch (error) {
                        console.error('CSV export failed:', error);
                      }
                    }}
                    className="flex gap-2 justify-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;