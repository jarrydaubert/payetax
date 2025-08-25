// src/components/molecules/TaxResultsDisplay.tsx
'use client';

import { Calculator, PieChart } from 'lucide-react';
import ExportActions from '@/components/molecules/ExportActions';
import { downloadCSV, type ExportData, generateCSV } from '@/lib/exportUtils';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface TaxResultsDisplayProps {
  results: TaxCalculationResults | null;
  salary: number;
  taxYear: string;
  taxCode?: string;
  isScottish?: boolean;
  studentLoanPlans?: string[];
  className?: string;
}

export default function TaxResultsDisplay({
  results,
  salary,
  taxYear,
  taxCode,
  isScottish,
  studentLoanPlans,
  className = '',
}: TaxResultsDisplayProps) {
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!results) return;

    const exportData: ExportData = {
      results,
      salary,
      taxYear,
      taxCode: taxCode || '1257L',
      region: isScottish ? 'Scotland' : 'England, Wales & Northern Ireland',
      studentLoans: studentLoanPlans || [],
      exportDate: new Date().toLocaleDateString('en-GB'),
    };

    try {
      if (format === 'csv') {
        const csvContent = generateCSV(exportData);
        const filename = `tax-calculation-${taxYear.replace('/', '-')}-${Date.now()}.csv`;
        downloadCSV(csvContent, filename);
      } else if (format === 'pdf') {
        // Dynamically import PDF generation to keep it out of the main bundle
        const { generatePDF } = await import(
          /* webpackChunkName: "pdf-export" */ '@/lib/pdfExport'
        );
        await generatePDF(exportData);
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
    }
  };

  // Early return if no results - but make it educational and helpful
  if (!results) {
    return (
      <div className='glass-card'>
        <div className='py-6 text-center'>
          <Calculator className='mx-auto mb-4 h-12 w-12 text-purple-400' />
          <h3 className='mb-2 font-semibold text-lg text-white'>UK Tax Calculator</h3>
          <p className='mb-4 text-sm text-white/70'>
            Enter your salary to see a detailed breakdown of:
          </p>
          <div className='mx-auto max-w-xs space-y-2 text-left'>
            <div className='flex items-center gap-2 text-sm text-white/60'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span>Take-home pay (after tax)</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-white/60'>
              <div className='h-2 w-2 rounded-full bg-red-500'></div>
              <span>Income tax breakdown</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-white/60'>
              <div className='h-2 w-2 rounded-full bg-orange-500'></div>
              <span>National Insurance</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-white/60'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <span>Student loan repayments</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-white/60'>
              <div className='h-2 w-2 rounded-full bg-purple-500'></div>
              <span>Pension contributions</span>
            </div>
          </div>
          <div className='mt-6 rounded-lg border border-purple-400/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4'>
            <p className='text-white/70 text-xs'>
              💡 <strong>Tip:</strong> Try entering £30,000 to see a typical UK salary breakdown
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics
  const grossAnnual = results.grossSalary.annually;
  const netAnnual = results.netPay.annually;
  const netMonthly = results.netPay.monthly;
  const totalTax = results.incomeTax.annually + results.nationalInsurance.annually;
  const effectiveRate = grossAnnual > 0 ? (totalTax / grossAnnual) * 100 : 0;
  const incomeTaxRate = grossAnnual > 0 ? (results.incomeTax.annually / grossAnnual) * 100 : 0;
  const niRate = grossAnnual > 0 ? (results.nationalInsurance.annually / grossAnnual) * 100 : 0;

  // Prepare data for visual breakdown (CSS-based, not charts)
  const breakdownData = [
    {
      label: 'Take Home',
      amount: netAnnual,
      percentage: (netAnnual / grossAnnual) * 100,
      color: 'bg-green-500',
    },
    {
      label: 'Income Tax',
      amount: results.incomeTax.annually,
      percentage: (results.incomeTax.annually / grossAnnual) * 100,
      color: 'bg-red-500',
    },
    {
      label: 'National Insurance',
      amount: results.nationalInsurance.annually,
      percentage: (results.nationalInsurance.annually / grossAnnual) * 100,
      color: 'bg-orange-500',
    },
  ];

  // Add pension if applicable
  if (results.pensionContribution.annually > 0) {
    breakdownData.push({
      label: 'Pension',
      amount: results.pensionContribution.annually,
      percentage: (results.pensionContribution.annually / grossAnnual) * 100,
      color: 'bg-blue-500',
    });
  }

  // Add student loan if applicable
  if (results.studentLoan.annually > 0) {
    breakdownData.push({
      label: 'Student Loan',
      amount: results.studentLoan.annually,
      percentage: (results.studentLoan.annually / grossAnnual) * 100,
      color: 'bg-purple-500',
    });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results Header */}
      <div className='glass-card'>
        <div className='mb-3 flex items-center justify-between'>
          <h3 className='flex items-center font-semibold text-lg text-white'>
            <PieChart className='mr-2 h-4 w-4 text-purple-400' />
            Results
          </h3>
          <ExportActions
            onPrint={() => handleExport('pdf')}
            onDownload={() => handleExport('csv')}
            className='flex gap-2'
          />
        </div>

        {/* Key Metrics Summary - Compact */}
        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div className='rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 text-center'>
            <div className='mb-1 text-purple-300 text-xs'>Take Home</div>
            <div className='font-bold text-lg text-white'>{formatCurrency(netAnnual)}</div>
          </div>
          <div className='rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 text-center'>
            <div className='mb-1 text-cyan-300 text-xs'>Tax Rate</div>
            <div className='font-bold text-lg text-white'>{effectiveRate.toFixed(1)}%</div>
          </div>
          <div className='rounded-lg border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-3 text-center'>
            <div className='mb-1 text-emerald-300 text-xs'>Monthly</div>
            <div className='font-bold text-lg text-white'>{formatCurrency(netMonthly)}</div>
          </div>
        </div>

        {/* Professional Results Table */}
        <div className='overflow-hidden rounded-lg border border-purple-400/30'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-purple-400/20 border-b bg-gradient-to-r from-purple-600/30 to-cyan-600/30'>
                <th className='p-3 text-left font-medium text-white'>Description</th>
                <th className='p-3 text-right font-medium text-white'>Annual</th>
                <th className='p-3 text-right font-medium text-white'>Monthly</th>
                <th className='p-3 text-right font-medium text-white'>Weekly</th>
              </tr>
            </thead>
            <tbody className='glass'>
              <tr className='border-white/10 border-b'>
                <td className='p-3 font-medium text-white/90'>Gross Salary</td>
                <td className='p-3 text-right font-mono text-white'>
                  {formatCurrency(results.grossSalary.annually)}
                </td>
                <td className='p-3 text-right font-mono text-white'>
                  {formatCurrency(results.grossSalary.monthly)}
                </td>
                <td className='p-3 text-right font-mono text-white'>
                  {formatCurrency(results.grossSalary.weekly)}
                </td>
              </tr>

              <tr className='border-white/10 border-b'>
                <td className='p-3 text-red-300'>Income Tax ({incomeTaxRate.toFixed(1)}%)</td>
                <td className='p-3 text-right font-mono text-red-300'>
                  -{formatCurrency(results.incomeTax.annually)}
                </td>
                <td className='p-3 text-right font-mono text-red-300'>
                  -{formatCurrency(results.incomeTax.monthly)}
                </td>
                <td className='p-3 text-right font-mono text-red-300'>
                  -{formatCurrency(results.incomeTax.weekly)}
                </td>
              </tr>

              <tr className='border-white/10 border-b'>
                <td className='p-3 text-orange-300'>National Insurance ({niRate.toFixed(1)}%)</td>
                <td className='p-3 text-right font-mono text-orange-300'>
                  -{formatCurrency(results.nationalInsurance.annually)}
                </td>
                <td className='p-3 text-right font-mono text-orange-300'>
                  -{formatCurrency(results.nationalInsurance.monthly)}
                </td>
                <td className='p-3 text-right font-mono text-orange-300'>
                  -{formatCurrency(results.nationalInsurance.weekly)}
                </td>
              </tr>

              {results.pensionContribution.annually > 0 && (
                <tr className='border-white/10 border-b'>
                  <td className='p-3 text-blue-300'>Pension Contribution</td>
                  <td className='p-3 text-right font-mono text-blue-300'>
                    -{formatCurrency(results.pensionContribution.annually)}
                  </td>
                  <td className='p-3 text-right font-mono text-blue-300'>
                    -{formatCurrency(results.pensionContribution.monthly)}
                  </td>
                  <td className='p-3 text-right font-mono text-blue-300'>
                    -{formatCurrency(results.pensionContribution.weekly)}
                  </td>
                </tr>
              )}

              {results.studentLoan.annually > 0 && (
                <tr className='border-white/10 border-b'>
                  <td className='p-3 text-purple-300'>Student Loan</td>
                  <td className='p-3 text-right font-mono text-purple-300'>
                    -{formatCurrency(results.studentLoan.annually)}
                  </td>
                  <td className='p-3 text-right font-mono text-purple-300'>
                    -{formatCurrency(results.studentLoan.monthly)}
                  </td>
                  <td className='p-3 text-right font-mono text-purple-300'>
                    -{formatCurrency(results.studentLoan.weekly)}
                  </td>
                </tr>
              )}

              <tr className='border-emerald-400/50 border-t-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20'>
                <td className='p-3 font-bold text-emerald-300'>Net Take-Home Pay</td>
                <td className='p-3 text-right font-bold font-mono text-emerald-300'>
                  {formatCurrency(results.netPay.annually)}
                </td>
                <td className='p-3 text-right font-bold font-mono text-emerald-300'>
                  {formatCurrency(results.netPay.monthly)}
                </td>
                <td className='p-3 text-right font-bold font-mono text-emerald-300'>
                  {formatCurrency(results.netPay.weekly)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual Breakdown Bar */}
        <div className='mt-4'>
          <div className='mb-2 text-white/70 text-xs'>Salary Breakdown</div>
          <div className='flex h-4 w-full overflow-hidden rounded-full bg-slate-700'>
            {breakdownData.map((item) => (
              <div
                key={item.label}
                className={`${item.color.replace('bg-', 'from- bg-gradient-to-r').replace('-500', '-400 to-').concat('-600')} flex h-full items-center justify-center font-medium text-white text-xs`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`}
              >
                {item.percentage > 15 && `${item.percentage.toFixed(0)}%`}
              </div>
            ))}
          </div>
          <div className='mt-2 flex flex-wrap gap-2'>
            {breakdownData.map((item) => (
              <div key={item.label} className='flex items-center text-xs'>
                <div className={`h-2 w-2 ${item.color} mr-1 rounded-full`} />
                <span className='text-white/80'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
