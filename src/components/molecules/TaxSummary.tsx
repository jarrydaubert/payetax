// src/components/molecules/TaxSummary.tsx
/**
 * Completely redesigned Tax Summary - Clean, spacious, and professional
 * 
 * FIXES:
 * ✅ Removed cramped layout with tiny cards
 * ✅ Clean, spacious design with proper hierarchy
 * ✅ Focus on key information users actually need
 * ✅ Professional styling that doesn't overwhelm
 */

import { 
  PoundSterling, 
  TrendingUp, 
  Percent,
  Calculator
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface TaxSummaryProps {
  /** Tax calculation results to display */
  results: TaxCalculationResults;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Clean and professional tax summary component
 * Shows only the most important information in a spacious layout
 */
const TaxSummary: React.FC<TaxSummaryProps> = ({
  results,
  className = '',
}) => {
  // Early return if no results
  if (!results || results.grossSalary.annually <= 0) return null;

  // Animation state
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate key metrics
  const grossAnnual = results.grossSalary.annually;
  const netAnnual = results.netPay.annually;
  const netMonthly = results.netPay.monthly;
  const totalDeductions = grossAnnual - netAnnual;
  const effectiveRate = (totalDeductions / grossAnnual) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Summary Card */}
      <div className="glass-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-white/10 dark:border-gray-800/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-3">
            <PoundSterling className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Your Take-Home Pay
          </h3>
        </div>

        {/* Key Results */}
        <div className="space-y-6">
          {/* Annual Take-Home */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Annual Take-Home Pay
            </div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
              {formatCurrency(netAnnual)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              After all taxes and deductions
            </div>
          </div>

          {/* Monthly Take-Home */}
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/30 dark:border-blue-800/30">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
              Monthly Take-Home
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(netMonthly)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Summary */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10 dark:border-gray-800/30">
          <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Tax Breakdown
          </h4>
        </div>

        <div className="space-y-4">
          {/* Gross Salary */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Gross Salary</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(grossAnnual)}
            </span>
          </div>

          {/* Income Tax */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Income Tax</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(results.incomeTax.annually)}
            </span>
          </div>

          {/* National Insurance */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">National Insurance</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrency(results.nationalInsurance.annually)}
            </span>
          </div>

          {/* Student Loan (if applicable) */}
          {results.studentLoan.annually > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Student Loan</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(results.studentLoan.annually)}
              </span>
            </div>
          )}

          {/* Pension (if applicable) */}
          {results.pensionContribution.annually > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Pension Contribution</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                -{formatCurrency(results.pensionContribution.annually)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            {/* Total Deductions */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Deductions</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>

            {/* Effective Tax Rate */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Effective Tax Rate</span>
              <div className="flex items-center gap-1">
                <Percent className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {effectiveRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Final Result */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-green-800 dark:text-green-200">
                Net Take-Home Pay
              </span>
              <span className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(netAnnual)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSummary;
