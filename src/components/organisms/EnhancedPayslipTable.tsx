// src/components/organisms/EnhancedPayslipTable.tsx
/**
 * Enhanced Payslip Table - Comprehensive Tax Breakdown Display
 *
 * This component displays tax calculation results in a professional payslip-style table.
 * It provides a detailed breakdown of all deductions, allowances, and net pay across
 * different pay periods with visual indicators and export functionality.
 *
 * Features:
 * - Multi-period display (Annual, Monthly, Weekly, etc.)
 * - Visual breakdown with icons and color coding
 * - Tax band breakdown with progressive tax visualization
 * - Student loan repayments and pension contributions
 * - Export functionality integration
 * - Responsive design for mobile and desktop
 * - Professional payslip-style formatting
 * - Accessibility compliance with ARIA attributes
 *
 * The component follows the atomic design pattern as an organism, combining
 * multiple molecules and atoms to create a complete functional unit.
 *
 * Data Flow:
 * - Receives calculation results from calculator engine
 * - Processes data into table rows with formatting
 * - Provides period selection and export callbacks
 * - Handles responsive layout and mobile optimization
 *
 * Design System:
 * - Uses glass-morphism styling for modern appearance
 * - Consistent with ToolHubX visual identity
 * - Icon system for visual recognition
 * - Color coding for different types of entries
 */
'use client';

import type React from 'react';
import { useState } from 'react';
import { TAX_TABLE_ICONS } from '@/lib/iconMapping';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

/**
 * Props for the EnhancedPayslipTable component
 */
interface EnhancedPayslipTableProps {
  /** Tax calculation results to display, null during loading */
  results: TaxCalculationResults | null;
  /** Additional allowances and deductions description */
  allowancesDeductions?: string;
  /** Student loan plans applied to the calculation */
  studentLoans?: string[];
  /** Whether the taxpayer is married (affects certain allowances) */
  isMarried?: boolean;
  /** Hours worked per week for hourly rate calculations */
  hoursPerWeek?: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Callback when selected periods change for export purposes */
  onPeriodsChange?: (periods: string[], periodOptions: Record<string, number>) => void;
}

interface TableRow {
  category: string;
  icon: string;
  annual: number;
  percentage: string;
  color: string;
  isHighlight?: boolean;
  isSubRow?: boolean;
}

const EnhancedPayslipTable: React.FC<EnhancedPayslipTableProps> = ({
  results,
  allowancesDeductions = '0',
  studentLoans = [],
  isMarried = false,
  hoursPerWeek = '37.5',
  className = '',
  onPeriodsChange,
}) => {
  // Period toggle state - limited initially to prevent horizontal scrolling on desktop
  const [visiblePeriods, setVisiblePeriods] = useState<string[]>(['Yearly', 'Monthly', 'Weekly']);

  // Period options - EXACT from toolhubx-live
  const periodOptions: Record<string, number> = {
    Yearly: 1,
    Monthly: 12,
    '4-Weekly': 13,
    Fortnightly: 26,
    Weekly: 52,
    Daily: 260,
    Hourly: 1950 * (parseFloat(hoursPerWeek) / 37.5),
  };

  // Handle period toggle
  const handlePeriodToggle = (period: string) => {
    const newPeriods = visiblePeriods.includes(period)
      ? visiblePeriods.filter((p) => p !== period)
      : [...visiblePeriods, period];

    setVisiblePeriods(newPeriods);

    // Notify parent component of period changes for export
    if (onPeriodsChange) {
      onPeriodsChange(newPeriods, periodOptions);
    }
  };

  if (!results) {
    return (
      <div
        className={`overflow-x-auto rounded bg-gray-800 p-4 shadow-md ${className}`}
        data-testid='tax-results'
      >
        <h2 className='mb-4 font-semibold text-gray-100 text-lg md:text-xl'>
          <TAX_TABLE_ICONS.table className='mr-2 inline h-5 w-5 text-blue-500' />
          Tax Summary
        </h2>
        <div className='py-6 text-center'>
          <p className='text-gray-400 text-sm'>Enter your salary to see detailed calculations</p>
        </div>
      </div>
    );
  }

  // Calculate percentage helper
  const calculatePercentage = (amount: number, total: number): string => {
    if (total === 0) return '0.0%';
    return `${Math.abs((amount / total) * 100).toFixed(1)}%`;
  };

  // Build table rows - EXACT structure from toolhubx-live
  const grossAnnual = results.grossSalary.annually;
  const taxFreeAllowance = results.taxFreeAmount;
  const taxableIncome = results.taxableIncome;
  const allowancesAmount = parseFloat(allowancesDeductions.replace(/,/g, ''));

  const tableRows: TableRow[] = [
    // 1. Gross Pay
    {
      category: 'Gross Pay',
      icon: 'fas fa-money-bill-wave',
      annual: grossAnnual,
      percentage: '100%',
      color: '',
      isHighlight: false,
    },

    // 2. Tax-Free Allowance
    {
      category: 'Tax-Free Allowance',
      icon: 'fas fa-shield-alt',
      annual: taxFreeAllowance,
      percentage: calculatePercentage(taxFreeAllowance, grossAnnual),
      color: '',
      isHighlight: false,
    },

    // 3. Total Taxable
    {
      category: 'Total Taxable',
      icon: 'fas fa-balance-scale',
      annual: taxableIncome,
      percentage: calculatePercentage(taxableIncome, grossAnnual),
      color: '',
      isHighlight: false,
    },

    // 4. Total Tax Due
    {
      category: 'Total Tax Due',
      icon: 'fas fa-hand-holding-usd',
      annual: results.incomeTax.annually,
      percentage: calculatePercentage(results.incomeTax.annually, grossAnnual),
      color: 'text-red-400',
      isHighlight: false,
    },

    // 5. Tax Band Breakdown (sub-rows)
    ...results.taxBands.map((band) => ({
      category: `${band.rate}% Rate`,
      icon: 'fas fa-percentage',
      annual: band.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      color: 'text-red-400',
      isHighlight: false,
      isSubRow: true,
    })),

    // 6. Student Loans (if applicable)
    ...(studentLoans.length > 0
      ? [
          {
            category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
            icon: 'fas fa-graduation-cap',
            annual: results.studentLoan.annually,
            percentage: calculatePercentage(results.studentLoan.annually, grossAnnual),
            color: 'text-orange-400',
            isHighlight: false,
          },
        ]
      : []),

    // 7. National Insurance
    {
      category: 'National Insurance',
      icon: 'fas fa-id-card',
      annual: results.nationalInsurance.annually,
      percentage: calculatePercentage(results.nationalInsurance.annually, grossAnnual),
      color: 'text-yellow-400',
      isHighlight: false,
    },

    // 8. Pension [You]
    {
      category: 'Pension [You]',
      icon: 'fas fa-piggy-bank',
      annual: results.pensionContribution.annually,
      percentage: calculatePercentage(results.pensionContribution.annually, grossAnnual),
      color: 'text-purple-400',
      isHighlight: false,
    },

    // 9. Pension [HMRC Relief]
    {
      category: 'Pension [HMRC Relief]',
      icon: 'fas fa-hand-holding-heart',
      annual: 0, // Pension relief calculation to be implemented
      percentage: 'N/A',
      color: 'text-purple-400',
      isHighlight: false,
    },

    // 10. Marriage Allowance (if applicable)
    ...(isMarried && results.additionalAllowances
      ? [
          {
            category: 'Marriage Allowance',
            icon: 'fas fa-ring',
            annual: results.additionalAllowances.annually,
            percentage: calculatePercentage(results.additionalAllowances.annually, grossAnnual),
            color: 'text-green-400',
            isHighlight: false,
          },
        ]
      : []),

    // 11. Allowances/Deductions
    {
      category: 'Allowances/Deductions',
      icon: 'fas fa-hand-holding-usd',
      annual: allowancesAmount,
      percentage: calculatePercentage(allowancesAmount, grossAnnual),
      color: 'text-teal-400',
      isHighlight: false,
    },

    // 12. Net Pay (highlighted)
    {
      category: 'Net Pay',
      icon: 'fas fa-wallet',
      annual: results.netPay.annually,
      percentage: calculatePercentage(results.netPay.annually, grossAnnual),
      color: 'text-green-400',
      isHighlight: true,
    },

    // 13. Employers NI
    {
      category: 'Employers NI',
      icon: 'fas fa-building',
      annual: results.employerNI,
      percentage: calculatePercentage(results.employerNI, grossAnnual),
      color: 'text-gray-400',
      isHighlight: false,
    },

    // 14. Net Change from Previous Year
    {
      category: 'Net Change from Previous Year',
      icon: 'fas fa-exchange-alt',
      annual: 0, // Net change calculation to be implemented
      percentage: '0.0%',
      color: 'text-blue-400',
      isHighlight: false,
    },
  ];

  return (
    <div
      className={`overflow-x-auto rounded bg-gray-800 p-4 ${className}`}
      data-testid='tax-results'
    >
      {/* Header - EXACT from toolhubx-live */}
      <h2 className='sticky top-0 z-10 mb-4 bg-gray-800 font-semibold text-gray-100 text-lg md:text-xl'>
        <i className='fas fa-table mr-2 text-blue-500'></i>
        Your Payslip Summary
      </h2>

      <div className='mb-4 flex flex-wrap gap-2'>
        {Object.keys(periodOptions).map((period) => (
          <label key={period} className='flex items-center gap-1 text-gray-100 text-sm'>
            <input
              type='checkbox'
              checked={visiblePeriods.includes(period)}
              onChange={() => handlePeriodToggle(period)}
              className='h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600'
              aria-label={`Toggle ${period} column visibility`}
            />
            {period}
          </label>
        ))}
      </div>

      <table
        className='w-full border border-gray-600 text-gray-100 text-sm'
        data-testid='results-table'
      >
        <thead>
          <tr className='sticky top-8 z-10 border-gray-600 border-b bg-gray-700'>
            <th className='border-gray-600 border-r p-2 text-left'>Category</th>
            <th className='border-gray-600 border-r p-2 text-right'>%</th>
            {visiblePeriods.map((period) => (
              <th key={period} className='border-gray-600 border-r p-2 text-right'>
                {period} (£)
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, index) => (
            <tr
              key={`${row.category}-${index}`}
              className={`border-gray-600 border-b ${row.isHighlight ? 'font-bold' : ''}`}
            >
              <td
                className={`border-gray-600 border-r p-2 ${row.isSubRow ? 'pl-4' : ''} ${row.isHighlight ? 'font-bold' : ''}`}
              >
                <i className={`${row.icon} mr-2`}></i>
                {row.category}
              </td>
              <td
                className={`border-gray-600 border-r p-2 text-right ${row.color} ${row.isHighlight ? 'font-bold' : ''}`}
              >
                {row.percentage}
              </td>
              {visiblePeriods.map((period) => {
                const periodValue = row.annual / periodOptions[period];
                return (
                  <td
                    key={period}
                    className={`p-2 text-right ${row.color} border-gray-600 border-r ${
                      row.isHighlight ? 'font-bold' : ''
                    }`}
                  >
                    {periodValue.toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className='mt-2 text-gray-400 text-xs'>
        *Pension calculated as salary sacrifice; relief reflected in reduced tax and NI.
      </p>
    </div>
  );
};

export default EnhancedPayslipTable;
