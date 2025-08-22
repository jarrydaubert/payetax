// src/components/organisms/ResultsTable.tsx
'use client';

import React, { useState } from 'react';
import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

interface ResultsTableProps {
  results: TaxCalculationResults;
  className?: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  className = '',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'Yearly' | 'Monthly' | 'Weekly'>('Monthly');

  if (!results || results.grossSalary.annually <= 0) {
    return null;
  }

  const getPeriodValue = (annualValue: number): number => {
    switch (selectedPeriod) {
      case 'Monthly':
        return annualValue / 12;
      case 'Weekly':
        return annualValue / 52;
      default:
        return annualValue;
    }
  };

  const formatValue = (annualValue: number): string => {
    const value = getPeriodValue(annualValue);
    return formatCurrency(value);
  };

  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const grossAnnual = results.grossSalary.annually;
  const taxFreeAnnual = results.taxFreeAmount;
  const taxableAnnual = results.taxableIncome;
  const incomeTaxAnnual = results.incomeTax.annually;
  const nationalInsuranceAnnual = results.nationalInsurance.annually;
  const studentLoanAnnual = results.studentLoan.annually;
  const pensionAnnual = results.pensionContribution.annually;
  const netAnnual = results.netPay.annually;
  const totalDeductionsAnnual = grossAnnual - netAnnual;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Your Payslip Wage Summary</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('Yearly')}
            className={`px-3 py-1 text-sm rounded ${
              selectedPeriod === 'Yearly' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
          </button>
          <button
            onClick={() => setSelectedPeriod('Monthly')}
            className={`px-3 py-1 text-sm rounded ${
              selectedPeriod === 'Monthly' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPeriod('Weekly')}
            className={`px-3 py-1 text-sm rounded ${
              selectedPeriod === 'Weekly' 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 text-white font-semibold">
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-right py-3 px-4">%</th>
              <th className="text-right py-3 px-4">{selectedPeriod} (£)</th>
            </tr>
          </thead>
          <tbody className="text-white">
            <tr className="bg-yellow-500/20">
              <td className="py-3 px-4">Gross Pay</td>
              <td className="text-right py-3 px-4">100%</td>
              <td className="text-right py-3 px-4 font-semibold">{formatValue(grossAnnual)}</td>
            </tr>
            
            {taxFreeAnnual > 0 && (
              <tr className="bg-yellow-400/20">
                <td className="py-3 px-4">Tax free allowance</td>
                <td className="text-right py-3 px-4">{calculatePercentage(taxFreeAnnual, grossAnnual)}</td>
                <td className="text-right py-3 px-4">{formatValue(taxFreeAnnual)}</td>
              </tr>
            )}

            <tr className="bg-white/5">
              <td className="py-3 px-4">Total taxable</td>
              <td className="text-right py-3 px-4">{calculatePercentage(taxableAnnual, grossAnnual)}</td>
              <td className="text-right py-3 px-4">{formatValue(taxableAnnual)}</td>
            </tr>

            {incomeTaxAnnual > 0 && (
              <tr className="bg-red-500/20">
                <td className="py-3 px-4">Total Tax Due</td>
                <td className="text-right py-3 px-4">{calculatePercentage(incomeTaxAnnual, grossAnnual)}</td>
                <td className="text-right py-3 px-4">{formatValue(incomeTaxAnnual)}</td>
              </tr>
            )}

            {studentLoanAnnual > 0 && (
              <tr className="bg-white/5">
                <td className="py-3 px-4">Student Loan</td>
                <td className="text-right py-3 px-4">{calculatePercentage(studentLoanAnnual, grossAnnual)}</td>
                <td className="text-right py-3 px-4">{formatValue(studentLoanAnnual)}</td>
              </tr>
            )}

            {nationalInsuranceAnnual > 0 && (
              <tr className="bg-yellow-400/20">
                <td className="py-3 px-4">National Insurance</td>
                <td className="text-right py-3 px-4">{calculatePercentage(nationalInsuranceAnnual, grossAnnual)}</td>
                <td className="text-right py-3 px-4">{formatValue(nationalInsuranceAnnual)}</td>
              </tr>
            )}

            <tr className="bg-white/5">
              <td className="py-3 px-4">Total Deductions</td>
              <td className="text-right py-3 px-4">{calculatePercentage(totalDeductionsAnnual, grossAnnual)}</td>
              <td className="text-right py-3 px-4">{formatValue(totalDeductionsAnnual)}</td>
            </tr>

            <tr className="bg-yellow-500/30">
              <td className="py-3 px-4 font-semibold">Net Wage</td>
              <td className="text-right py-3 px-4 font-semibold">{calculatePercentage(netAnnual, grossAnnual)}</td>
              <td className="text-right py-3 px-4 font-semibold">{formatValue(netAnnual)}</td>
            </tr>

            {results.employerNI > 0 && (
              <tr className="bg-white/5">
                <td className="py-3 px-4">Employers NI</td>
                <td className="text-right py-3 px-4">{calculatePercentage(results.employerNI, grossAnnual)}</td>
                <td className="text-right py-3 px-4">{formatValue(results.employerNI)}</td>
              </tr>
            )}

            <tr className="bg-white/5">
              <td className="py-3 px-4">Net change from 2024</td>
              <td className="text-right py-3 px-4">0%</td>
              <td className="text-right py-3 px-4">£0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
