// src/components/organisms/ResultsTable.tsx
/**
 * Simplified Results Table - Clean and professional
 * 
 * FIXES:
 * ✅ Removed overwhelming complexity and tiny text
 * ✅ Clean, readable table with proper spacing
 * ✅ Focus on essential information only
 * ✅ Professional styling that's easy to scan
 * ✅ Fixed taxYear reference by getting from store (LINE 237 FIX)
 */

import { FileDown, Printer, Calendar } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

interface ResultsTableProps {
  /** Tax calculation results to display */
  results: TaxCalculationResults;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Clean and professional results table
 * Shows tax calculation breakdown in an easy-to-read format
 */
const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  className = '',
}) => {
  // Get tax year from store (FIX for line 237 error)
  const { input } = useCalculatorStore();
  
  // Early return if no results
  if (!results || results.grossSalary.annually <= 0) {
    return null;
  }

  const [selectedPeriod, setSelectedPeriod] = useState<'annually' | 'monthly' | 'weekly'>('annually');

  // Get values for selected period
  const getPeriodValue = (annualValue: number) => {
    switch (selectedPeriod) {
      case 'monthly':
        return annualValue / 12;
      case 'weekly':
        return annualValue / 52;
      default:
        return annualValue;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'monthly':
        return 'Monthly';
      case 'weekly':
        return 'Weekly';
      default:
        return 'Yearly';
    }
  };

  // Calculate values
  const grossValue = getPeriodValue(results.grossSalary.annually);
  const incomeTaxValue = getPeriodValue(results.incomeTax.annually);
  const nationalInsuranceValue = getPeriodValue(results.nationalInsurance.annually);
  const studentLoanValue = getPeriodValue(results.studentLoan.annually);
  const pensionValue = getPeriodValue(results.pensionContribution.annually);
  const netValue = getPeriodValue(results.netPay.annually);

  // Handle export
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = `Category,Amount,Percentage\nGross Pay,${grossValue.toFixed(2)},100.0%\nIncome Tax,-${incomeTaxValue.toFixed(2)},${((incomeTaxValue/grossValue)*100).toFixed(1)}%\nNational Insurance,-${nationalInsuranceValue.toFixed(2)},${((nationalInsuranceValue/grossValue)*100).toFixed(1)}%\n${studentLoanValue > 0 ? `Student Loan,-${studentLoanValue.toFixed(2)},${((studentLoanValue/grossValue)*100).toFixed(1)}%\n` : ''}${pensionValue > 0 ? `Pension,-${pensionValue.toFixed(2)},${((pensionValue/grossValue)*100).toFixed(1)}%\n` : ''}Net Pay,${netValue.toFixed(2)},${((netValue/grossValue)*100).toFixed(1)}%`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`${className}`}>
      {/* Header with Controls */}
      <div className="glass-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tax Breakdown
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed breakdown of your tax calculation
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'annually' | 'monthly' | 'weekly')}
                className="glass-input text-sm py-1 px-2 rounded"
              >
                <option value="annually">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Export Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="glass-button p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                title="Print Results"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="glass-button p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                title="Export CSV"
              >
                <FileDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 dark:border-gray-800/30">
              <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                Category
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                {getPeriodLabel()} (£)
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Gross Pay */}
            <tr className="border-b border-white/5 dark:border-gray-800/20">
              <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                Gross Pay
              </td>
              <td className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(grossValue)}
              </td>
              <td className="text-right py-4 px-6 text-gray-600 dark:text-gray-400">
                100.0%
              </td>
            </tr>

            {/* Income Tax */}
            <tr className="border-b border-white/5 dark:border-gray-800/20">
              <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                Income Tax
              </td>
              <td className="text-right py-4 px-6 font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(incomeTaxValue)}
              </td>
              <td className="text-right py-4 px-6 text-gray-600 dark:text-gray-400">
                {((incomeTaxValue / grossValue) * 100).toFixed(1)}%
              </td>
            </tr>

            {/* National Insurance */}
            <tr className="border-b border-white/5 dark:border-gray-800/20">
              <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                National Insurance
              </td>
              <td className="text-right py-4 px-6 font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(nationalInsuranceValue)}
              </td>
              <td className="text-right py-4 px-6 text-gray-600 dark:text-gray-400">
                {((nationalInsuranceValue / grossValue) * 100).toFixed(1)}%
              </td>
            </tr>

            {/* Student Loan */}
            {studentLoanValue > 0 && (
              <tr className="border-b border-white/5 dark:border-gray-800/20">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                  Student Loan
                </td>
                <td className="text-right py-4 px-6 font-medium text-red-600 dark:text-red-400">
                  -{formatCurrency(studentLoanValue)}
                </td>
                <td className="text-right py-4 px-6 text-gray-600 dark:text-gray-400">
                  {((studentLoanValue / grossValue) * 100).toFixed(1)}%
                </td>
              </tr>
            )}

            {/* Pension */}
            {pensionValue > 0 && (
              <tr className="border-b border-white/5 dark:border-gray-800/20">
                <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                  Pension Contribution
                </td>
                <td className="text-right py-4 px-6 font-medium text-blue-600 dark:text-blue-400">
                  -{formatCurrency(pensionValue)}
                </td>
                <td className="text-right py-4 px-6 text-gray-600 dark:text-gray-400">
                  {((pensionValue / grossValue) * 100).toFixed(1)}%
                </td>
              </tr>
            )}

            {/* Net Pay - Highlighted */}
            <tr className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
              <td className="py-4 px-6 font-semibold text-green-800 dark:text-green-200">
                Net Pay
              </td>
              <td className="text-right py-4 px-6 text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(netValue)}
              </td>
              <td className="text-right py-4 px-6 font-semibold text-green-600 dark:text-green-400">
                {((netValue / grossValue) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Note - FIXED LINE 237! */}
        <div className="p-4 border-t border-white/10 dark:border-gray-800/30 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Calculations based on {input.taxYear || '2024-2025'} tax year rates. 
            For guidance only - consult HMRC for official calculations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;
