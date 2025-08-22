// src/components/molecules/TaxResultsDisplay.tsx
'use client';

import React from 'react';
import { 
  PoundSterling, 
  TrendingUp, 
  Percent,
  Calculator,
  PieChart,
  Download
} from 'lucide-react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ExportActions from '@/components/molecules/ExportActions';
import { generateCSV, downloadCSV, type ExportData } from '@/lib/exportUtils';

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
  className = '' 
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
        const { generatePDF } = await import(/* webpackChunkName: "pdf-export" */ '@/lib/pdfExport');
        await generatePDF(exportData);
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
    }
  };
  
  // Early return if no results - but make it educational and helpful
  if (!results) {
    return (
      <div className="glass-card">
        <div className="text-center py-6">
          <Calculator className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">UK Tax Calculator</h3>
          <p className="text-white/70 mb-4 text-sm">
            Enter your salary to see a detailed breakdown of:
          </p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Take-home pay (after tax)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Income tax breakdown</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>National Insurance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Student loan repayments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Pension contributions</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-400/20">
            <p className="text-xs text-white/70">
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
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <PieChart className="h-4 w-4 text-purple-400 mr-2" />
            Results
          </h3>
          <ExportActions
            onPrint={() => handleExport('pdf')}
            onDownload={() => handleExport('csv')}
            className="flex gap-2"
          />
        </div>

        {/* Key Metrics Summary - Compact */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <div className="text-xs text-purple-300 mb-1">Take Home</div>
            <div className="text-lg font-bold text-white">{formatCurrency(netAnnual)}</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
            <div className="text-xs text-cyan-300 mb-1">Tax Rate</div>
            <div className="text-lg font-bold text-white">{effectiveRate.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30">
            <div className="text-xs text-emerald-300 mb-1">Monthly</div>
            <div className="text-lg font-bold text-white">{formatCurrency(netMonthly)}</div>
          </div>
        </div>

        {/* Professional Results Table */}
        <div className="overflow-hidden rounded-lg border border-purple-400/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border-b border-purple-400/20">
                <th className="text-left p-3 font-medium text-white">Description</th>
                <th className="text-right p-3 font-medium text-white">Annual</th>
                <th className="text-right p-3 font-medium text-white">Monthly</th>
                <th className="text-right p-3 font-medium text-white">Weekly</th>
              </tr>
            </thead>
            <tbody className="glass">
              <tr className="border-b border-white/10">
                <td className="p-3 text-white/90 font-medium">Gross Salary</td>
                <td className="p-3 text-right text-white font-mono">{formatCurrency(results.grossSalary.annually)}</td>
                <td className="p-3 text-right text-white font-mono">{formatCurrency(results.grossSalary.monthly)}</td>
                <td className="p-3 text-right text-white font-mono">{formatCurrency(results.grossSalary.weekly)}</td>
              </tr>
              
              <tr className="border-b border-white/10">
                <td className="p-3 text-red-300">Income Tax ({incomeTaxRate.toFixed(1)}%)</td>
                <td className="p-3 text-right text-red-300 font-mono">-{formatCurrency(results.incomeTax.annually)}</td>
                <td className="p-3 text-right text-red-300 font-mono">-{formatCurrency(results.incomeTax.monthly)}</td>
                <td className="p-3 text-right text-red-300 font-mono">-{formatCurrency(results.incomeTax.weekly)}</td>
              </tr>
              
              <tr className="border-b border-white/10">
                <td className="p-3 text-orange-300">National Insurance ({niRate.toFixed(1)}%)</td>
                <td className="p-3 text-right text-orange-300 font-mono">-{formatCurrency(results.nationalInsurance.annually)}</td>
                <td className="p-3 text-right text-orange-300 font-mono">-{formatCurrency(results.nationalInsurance.monthly)}</td>
                <td className="p-3 text-right text-orange-300 font-mono">-{formatCurrency(results.nationalInsurance.weekly)}</td>
              </tr>
              
              {results.pensionContribution.annually > 0 && (
                <tr className="border-b border-white/10">
                  <td className="p-3 text-blue-300">Pension Contribution</td>
                  <td className="p-3 text-right text-blue-300 font-mono">-{formatCurrency(results.pensionContribution.annually)}</td>
                  <td className="p-3 text-right text-blue-300 font-mono">-{formatCurrency(results.pensionContribution.monthly)}</td>
                  <td className="p-3 text-right text-blue-300 font-mono">-{formatCurrency(results.pensionContribution.weekly)}</td>
                </tr>
              )}
              
              {results.studentLoan.annually > 0 && (
                <tr className="border-b border-white/10">
                  <td className="p-3 text-purple-300">Student Loan</td>
                  <td className="p-3 text-right text-purple-300 font-mono">-{formatCurrency(results.studentLoan.annually)}</td>
                  <td className="p-3 text-right text-purple-300 font-mono">-{formatCurrency(results.studentLoan.monthly)}</td>
                  <td className="p-3 text-right text-purple-300 font-mono">-{formatCurrency(results.studentLoan.weekly)}</td>
                </tr>
              )}
              
              <tr className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-t-2 border-emerald-400/50">
                <td className="p-3 text-emerald-300 font-bold">Net Take-Home Pay</td>
                <td className="p-3 text-right text-emerald-300 font-bold font-mono">{formatCurrency(results.netPay.annually)}</td>
                <td className="p-3 text-right text-emerald-300 font-bold font-mono">{formatCurrency(results.netPay.monthly)}</td>
                <td className="p-3 text-right text-emerald-300 font-bold font-mono">{formatCurrency(results.netPay.weekly)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual Breakdown Bar */}
        <div className="mt-4">
          <div className="text-xs text-white/70 mb-2">Salary Breakdown</div>
          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden flex">
            {breakdownData.map((item, index) => (
              <div
                key={index}
                className={`${item.color.replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-400 to-').concat('-600')} h-full flex items-center justify-center text-xs font-medium text-white`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`}
              >
                {item.percentage > 15 && `${item.percentage.toFixed(0)}%`}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {breakdownData.map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className={`w-2 h-2 ${item.color} rounded-full mr-1`} />
                <span className="text-white/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}