// src/components/organisms/PayslipSummaryTable.tsx
'use client';

import React, { useState } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

type PayPeriod = 'yearly' | 'monthly' | 'fourWeekly' | 'fortnightly' | 'weekly' | 'daily' | 'hourly';

interface PayslipSummaryTableProps {
  results: TaxCalculationResults | null;
  className?: string;
  onPeriodsChange?: (periods: PayPeriod[]) => void;
}

const PERIOD_LABELS: Record<PayPeriod, string> = {
  yearly: 'Yearly',
  monthly: 'Monthly',
  fourWeekly: '4-Weekly',
  fortnightly: 'Fortnightly',
  weekly: 'Weekly',
  daily: 'Daily',
  hourly: 'Hourly'
};

const PERIOD_DIVISORS: Record<PayPeriod, number> = {
  yearly: 1,
  monthly: 12,
  fourWeekly: 13,
  fortnightly: 26,
  weekly: 52,
  daily: 260, // 52 weeks * 5 days
  hourly: 2080 // 52 weeks * 40 hours (standard full-time)
};

export default function PayslipSummaryTable({ results, className = '', onPeriodsChange }: PayslipSummaryTableProps) {
  const [selectedPeriods, setSelectedPeriods] = useState<PayPeriod[]>(['yearly', 'monthly', 'weekly']);

  if (!results) {
    return (
      <div className={`glass-card ${className}`}>
        <h2 className="text-lg font-semibold mb-4 text-white">
          <span className="mr-2">📊</span>Your Payslip Summary
        </h2>
        <div className="text-center py-6">
          <p className="text-sm text-white/60">Enter your salary to see detailed calculations</p>
        </div>
      </div>
    );
  }

  const calculateForPeriod = (annualAmount: number, period: PayPeriod): number => {
    try {
      return annualAmount / PERIOD_DIVISORS[period];
    } catch (error) {
      console.error('Error calculating period amount:', error);
      return 0;
    }
  };

  const calculatePercentage = (amount: number, gross: number): string => {
    try {
      if (gross === 0) return '0.0%';
      return `${Math.abs((amount / gross) * 100).toFixed(1)}%`;
    } catch (error) {
      console.error('Error calculating percentage:', error);
      return '0.0%';
    }
  };

  const togglePeriod = (period: PayPeriod) => {
    try {
      setSelectedPeriods(prev => {
        const newPeriods = (() => {
          if (prev.includes(period)) {
            // Don't allow removing if only one period selected
            return prev.length > 1 ? prev.filter(p => p !== period) : prev;
          } else {
            // Allow all periods to be selected
            return [...prev, period];
          }
        })();
        
        onPeriodsChange?.(newPeriods);
        return newPeriods;
      });
    } catch (error) {
      console.error('Error toggling period:', error);
    }
  };

  // Ensure at least one period is selected
  const displayPeriods = selectedPeriods.length > 0 ? selectedPeriods : ['monthly'];

  const grossAnnual = results.grossSalary?.annually || 0;
  const taxFreeAllowance = 12570; // 2024/25 personal allowance
  const totalTaxable = Math.max(0, grossAnnual - taxFreeAllowance);
  
  // Calculate employer NI (13.8% above £9,100)
  const employerNI = Math.max(0, (grossAnnual - 9100) * 0.138);
  
  const tableData = [
    {
      category: 'Gross Pay',
      annual: grossAnnual,
      percentage: '100%',
      isPositive: true,
      isHighlight: false
    },
    {
      category: 'Tax-Free Allowance',
      annual: Math.min(taxFreeAllowance, grossAnnual),
      percentage: calculatePercentage(Math.min(taxFreeAllowance, grossAnnual), grossAnnual),
      isPositive: true,
      isHighlight: false
    },
    {
      category: 'Total Taxable',
      annual: totalTaxable,
      percentage: calculatePercentage(totalTaxable, grossAnnual),
      isPositive: true,
      isHighlight: false
    },
    {
      category: 'Income Tax',
      annual: -(results.incomeTax?.annually || 0),
      percentage: calculatePercentage(results.incomeTax?.annually || 0, grossAnnual),
      isPositive: false,
      isHighlight: false
    },
    {
      category: 'National Insurance',
      annual: -(results.nationalInsurance?.annually || 0),
      percentage: calculatePercentage(results.nationalInsurance?.annually || 0, grossAnnual),
      isPositive: false,
      isHighlight: false
    },
    {
      category: 'Pension (You)',
      annual: -(results.pensionContribution?.annually || 0),
      percentage: calculatePercentage(results.pensionContribution?.annually || 0, grossAnnual),
      isPositive: false,
      isHighlight: false
    },
    {
      category: 'Student Loan',
      annual: -(results.studentLoan?.annually || 0),
      percentage: calculatePercentage(results.studentLoan?.annually || 0, grossAnnual),
      isPositive: false,
      isHighlight: false
    },
    {
      category: 'Net Pay',
      annual: results.netPay?.annually || 0,
      percentage: calculatePercentage(results.netPay?.annually || 0, grossAnnual),
      isPositive: true,
      isHighlight: true
    },
    {
      category: 'Employers NI',
      annual: employerNI,
      percentage: calculatePercentage(employerNI, grossAnnual),
      isPositive: false,
      isHighlight: false
    }
  ];

  return (
    <div className={`glass-card ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-white">
        <span className="mr-2">📊</span>Your Payslip Summary
      </h2>

      {/* Summary Statistics Row */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="text-white/70">Gross Annual</div>
            <div className="text-white font-mono text-sm">
              {formatCurrency(grossAnnual)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-red-400/70">Total Deductions</div>
            <div className="text-red-400 font-mono text-sm">
              {formatCurrency((results.incomeTax?.annually || 0) + (results.nationalInsurance?.annually || 0) + (results.pensionContribution?.annually || 0) + (results.studentLoan?.annually || 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-green-400/70">Net Annual</div>
            <div className="text-green-400 font-mono text-sm">
              {formatCurrency(results.netPay?.annually || 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/70">Effective Rate</div>
            <div className="text-white font-mono text-sm">
              {calculatePercentage((results.incomeTax?.annually || 0) + (results.nationalInsurance?.annually || 0), grossAnnual)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Period Toggle Buttons */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {(Object.keys(PERIOD_LABELS) as PayPeriod[]).map(period => (
            <button
              key={period}
              onClick={() => togglePeriod(period)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedPeriods.includes(period)
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-2 text-white/90 font-medium">Category</th>
              <th className="text-right py-2 text-white/90 font-medium">%</th>
              {displayPeriods.map(period => (
                <th key={period} className="text-right py-2 text-white/90 font-medium min-w-20">
                  {PERIOD_LABELS[period as PayPeriod]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              // Skip rows with zero values (except gross pay and net pay)
              if (Math.abs(row.annual) === 0 && !['Gross Pay', 'Net Pay'].includes(row.category)) {
                return null;
              }

              return (
                <tr 
                  key={index}
                  className={`border-b border-white/10 ${
                    row.isHighlight ? 'bg-green-500/10' : ''
                  }`}
                >
                  <td className={`py-2 ${
                    row.isHighlight 
                      ? 'text-green-400 font-medium' 
                      : row.isPositive 
                        ? 'text-white' 
                        : 'text-red-400'
                  }`}>
                    {row.category}
                  </td>
                  <td className="text-right py-2 text-white/70 text-xs">
                    {row.percentage}
                  </td>
                  {displayPeriods.map(period => (
                    <td 
                      key={period} 
                      className={`text-right py-2 text-xs font-mono ${
                        row.isHighlight 
                          ? 'text-green-400 font-medium' 
                          : row.isPositive 
                            ? 'text-white' 
                            : 'text-red-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(calculateForPeriod(row.annual, period as PayPeriod)))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}