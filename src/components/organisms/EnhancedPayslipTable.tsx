// src/components/organisms/EnhancedPayslipTable.tsx
'use client';

import type React from 'react';
import { useState } from 'react';
import { getColorForCategory, getIconForCategory, TAX_TABLE_ICONS } from '@/lib/iconMapping';
import type { TaxCalculationResults } from '@/lib/taxCalculator';

// Export moved outside table container

interface EnhancedPayslipTableProps {
  results: TaxCalculationResults | null;
  allowancesDeductions?: string;
  studentLoans?: string[];
  isMarried?: boolean;
  hoursPerWeek?: string;
  className?: string;
  onPeriodsChange?: (periods: string[], periodOptions: Record<string, number>) => void;
}

interface TableRow {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
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
  // Period toggle state - exactly like toolhubx-live
  const [visiblePeriods, setVisiblePeriods] = useState<string[]>([
    'Yearly',
    'Monthly',
    'Weekly',
    'Daily',
  ]);

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
      <div className={`overflow-x-auto rounded bg-gray-800 p-4 shadow-md ${className}`}>
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
      icon: getIconForCategory('Gross Pay'),
      annual: grossAnnual,
      percentage: '100%',
      color: getColorForCategory('Gross Pay'),
      isHighlight: false,
    },

    // 2. Tax-Free Allowance
    {
      category: 'Tax-Free Allowance',
      icon: getIconForCategory('Tax-Free Allowance'),
      annual: taxFreeAllowance,
      percentage: calculatePercentage(taxFreeAllowance, grossAnnual),
      color: getColorForCategory('Tax-Free Allowance'),
      isHighlight: false,
    },

    // 3. Total Taxable
    {
      category: 'Total Taxable',
      icon: getIconForCategory('Total Taxable'),
      annual: taxableIncome,
      percentage: calculatePercentage(taxableIncome, grossAnnual),
      color: getColorForCategory('Total Taxable'),
      isHighlight: false,
    },

    // 4. Total Tax Due
    {
      category: 'Total Tax Due',
      icon: getIconForCategory('Total Tax Due'),
      annual: results.incomeTax.annually,
      percentage: calculatePercentage(results.incomeTax.annually, grossAnnual),
      color: getColorForCategory('Total Tax Due'),
      isHighlight: false,
    },

    // 5. Tax Band Breakdown (sub-rows)
    ...results.taxBands.map((band) => ({
      category: `${band.rate}% Rate`,
      icon: getIconForCategory('rate'),
      annual: band.amount,
      percentage: calculatePercentage(band.amount, grossAnnual),
      color: getColorForCategory('tax band'),
      isHighlight: false,
      isSubRow: true,
    })),

    // 6. Student Loans (if applicable)
    ...(studentLoans.length > 0
      ? [
          {
            category: `Student Loan${studentLoans.length > 1 ? 's' : ''}`,
            icon: getIconForCategory('Student Loan'),
            annual: results.studentLoan.annually,
            percentage: calculatePercentage(results.studentLoan.annually, grossAnnual),
            color: getColorForCategory('Student Loan'),
            isHighlight: false,
          },
        ]
      : []),

    // 7. National Insurance
    {
      category: 'National Insurance',
      icon: getIconForCategory('National Insurance'),
      annual: results.nationalInsurance.annually,
      percentage: calculatePercentage(results.nationalInsurance.annually, grossAnnual),
      color: getColorForCategory('National Insurance'),
      isHighlight: false,
    },

    // 8. Pension [You]
    {
      category: 'Pension [You]',
      icon: getIconForCategory('Pension'),
      annual: results.pensionContribution.annually,
      percentage: calculatePercentage(results.pensionContribution.annually, grossAnnual),
      color: getColorForCategory('Pension'),
      isHighlight: false,
    },

    // 9. Pension [HMRC Relief]
    {
      category: 'Pension [HMRC Relief]',
      icon: getIconForCategory('HMRC Relief'),
      annual: 0, // Pension relief calculation to be implemented
      percentage: 'N/A',
      color: getColorForCategory('HMRC Relief'),
      isHighlight: false,
    },

    // 10. Marriage Allowance (if applicable)
    ...(isMarried && results.additionalAllowances
      ? [
          {
            category: 'Marriage Allowance',
            icon: getIconForCategory('Marriage Allowance'),
            annual: results.additionalAllowances.annually,
            percentage: calculatePercentage(results.additionalAllowances.annually, grossAnnual),
            color: getColorForCategory('Marriage Allowance'),
            isHighlight: false,
          },
        ]
      : []),

    // 11. Allowances/Deductions
    {
      category: 'Allowances/Deductions',
      icon: getIconForCategory('Allowances/Deductions'),
      annual: allowancesAmount,
      percentage: calculatePercentage(allowancesAmount, grossAnnual),
      color: getColorForCategory('Allowances/Deductions'),
      isHighlight: false,
    },

    // 12. Net Pay (highlighted)
    {
      category: 'Net Pay',
      icon: getIconForCategory('Net Pay'),
      annual: results.netPay.annually,
      percentage: calculatePercentage(results.netPay.annually, grossAnnual),
      color: getColorForCategory('Net Pay'),
      isHighlight: true,
    },

    // 13. Employers NI
    {
      category: 'Employers NI',
      icon: getIconForCategory('Employers NI'),
      annual: results.employerNI,
      percentage: calculatePercentage(results.employerNI, grossAnnual),
      color: getColorForCategory('Employers NI'),
      isHighlight: false,
    },

    // 14. Net Change from Previous Year
    {
      category: 'Net Change from Previous Year',
      icon: getIconForCategory('Net Change'),
      annual: 0, // Net change calculation to be implemented
      percentage: '0.0%',
      color: getColorForCategory('Net Change'),
      isHighlight: false,
    },
  ];

  return (
    <div className={`overflow-x-auto rounded bg-gray-800 p-4 ${className}`}>
      {/* Header - EXACT from toolhubx-live */}
      <h2 className='sticky top-0 z-10 mb-4 bg-gray-800 font-semibold text-gray-100 text-lg md:text-xl'>
        <TAX_TABLE_ICONS.table className='mr-2 inline h-5 w-5 text-blue-500' />
        Your Payslip Summary
      </h2>

      {/* Period Toggle Checkboxes - EXACT from toolhubx-live */}
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

      {/* Table container with proper fixed layout */}
      <div className='overflow-x-auto'>
        <table
          className='w-full min-w-[1400px] border border-gray-600 text-gray-100 text-sm'
          data-testid='results-table'
        >
          <colgroup>
            <col style={{ width: '180px' }} />
            <col style={{ width: '50px' }} />
            {visiblePeriods.map((period) => (
              <col key={period} style={{ width: visiblePeriods.length >= 6 ? '110px' : '130px' }} />
            ))}
          </colgroup>
          <thead>
            <tr className='border-gray-600 border-b bg-gray-700'>
              <th className='whitespace-nowrap border-gray-600 border-r px-3 py-3 text-left font-bold text-sm'>
                Category
              </th>
              <th className='whitespace-nowrap border-gray-600 border-r px-2 py-3 text-right font-bold text-xs'>
                %
              </th>
              {visiblePeriods.map((period) => (
                <th
                  key={period}
                  className='whitespace-nowrap border-gray-600 border-r px-1 py-3 text-right font-bold text-xs'
                >
                  <div className='flex flex-col items-end'>
                    <span className='font-semibold text-xs'>{period}</span>
                    <span className='text-gray-300 text-xs'>(£)</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr
                key={`${row.category}-${index}`}
                className={`border-gray-600 border-b ${row.isHighlight ? 'bg-green-500/10' : ''}`}
              >
                <td
                  className={`border-gray-600 border-r px-3 py-3 ${row.color} ${row.isSubRow ? 'pl-6' : ''} overflow-hidden whitespace-nowrap`}
                >
                  <div className='flex min-w-0 items-center'>
                    <row.icon className='mr-2 h-4 w-4 flex-shrink-0' />
                    <span className='truncate text-sm'>{row.category}</span>
                  </div>
                </td>
                <td
                  className={`border-gray-600 border-r px-2 py-3 text-right ${row.color} whitespace-nowrap text-xs tabular-nums`}
                >
                  {row.percentage}
                </td>
                {visiblePeriods.map((period) => {
                  const periodValue = row.annual / periodOptions[period];
                  return (
                    <td
                      key={period}
                      className={`border-gray-600 border-r px-2 py-3 text-right ${row.color} ${
                        row.isHighlight ? 'font-bold' : ''
                      } whitespace-nowrap text-xs tabular-nums`}
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

        {/* Footer note - like toolhubx-live */}
        <p className='mt-2 text-gray-400 text-xs'>
          *Pension calculated as salary sacrifice; relief reflected in reduced tax and NI.
        </p>
      </div>
    </div>
  );
};

export default EnhancedPayslipTable;
