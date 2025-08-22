// src/components/organisms/StreamlinedTaxInputForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import type { StudentLoanPlan, TaxYear, PayPeriod } from '@/constants/taxRates';

type TaxRegion = 'england' | 'wales' | 'northern-ireland' | 'scotland';

interface TaxOptions {
  isPensionAge: boolean;
  isMarried: boolean;
  isBlind: boolean;
  noNationalInsurance: boolean;
  marriageAllowanceTransfer: number; // Amount to transfer to partner
}

interface PensionContribution {
  amount: number;
  type: 'percentage' | 'amount';
  isBeforeTax: boolean;
}

interface StreamlinedTaxInputFormProps {
  salary: number;
  taxYear: TaxYear;
  payPeriod: PayPeriod;
  taxCode: string;
  isScottish: boolean;
  studentLoanPlans: StudentLoanPlan[];
  allowancesDeductions: number;
  taxOptions: TaxOptions;
  pensionContribution: PensionContribution;
  onSalaryChange: (salary: number) => void;
  onTaxYearChange: (taxYear: TaxYear) => void;
  onPayPeriodChange: (payPeriod: PayPeriod) => void;
  onTaxCodeChange: (taxCode: string) => void;
  onScottishChange: (isScottish: boolean) => void;
  onStudentLoanPlansChange: (plans: StudentLoanPlan[]) => void;
  onAllowancesDeductionsChange: (amount: number) => void;
  onTaxOptionsChange: (options: TaxOptions) => void;
  onPensionChange: (pension: PensionContribution) => void;
}

export default function StreamlinedTaxInputForm({
  salary,
  taxYear,
  payPeriod,
  taxCode,
  isScottish,
  studentLoanPlans,
  allowancesDeductions,
  taxOptions,
  pensionContribution,
  onSalaryChange,
  onTaxYearChange,
  onPayPeriodChange,
  onTaxCodeChange,
  onScottishChange,
  onStudentLoanPlansChange,
  onAllowancesDeductionsChange,
  onTaxOptionsChange,
  onPensionChange,
}: StreamlinedTaxInputFormProps) {
  const [taxCodeError, setTaxCodeError] = useState<string | null>(null);
  const [taxCodeValid, setTaxCodeValid] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<TaxRegion>(
    isScottish ? 'scotland' : 'england'
  );

  // Handle region change
  const handleRegionChange = (region: TaxRegion) => {
    try {
      setSelectedRegion(region);
      onScottishChange(region === 'scotland');
      
      // Auto-update tax code for Scotland
      if (region === 'scotland') {
        if (taxCode && !taxCode.startsWith('S')) {
          onTaxCodeChange(`S${taxCode}`);
        }
      } else {
        if (taxCode && taxCode.startsWith('S')) {
          onTaxCodeChange(taxCode.substring(1));
        }
      }
    } catch (error) {
      console.error('Error changing region:', error);
    }
  };

  // Handle tax options change with error recovery
  const handleTaxOptionChange = (key: keyof TaxOptions, value: boolean | number) => {
    try {
      const currentOptions = taxOptions && typeof taxOptions === 'object' ? taxOptions : {
        isPensionAge: false,
        isMarried: false,
        isBlind: false,
        noNationalInsurance: false,
        marriageAllowanceTransfer: 0,
      };
      
      onTaxOptionsChange({ ...currentOptions, [key]: value });
    } catch (error) {
      console.error('Error handling tax option change:', error);
      onTaxOptionsChange({
        isPensionAge: false,
        isMarried: false,
        isBlind: false,
        noNationalInsurance: false,
        marriageAllowanceTransfer: 0,
      });
    }
  };

  // Handle pension change with error recovery
  const handlePensionChange = (key: keyof PensionContribution, value: number | boolean | string) => {
    try {
      const currentPension = pensionContribution && typeof pensionContribution === 'object' ? pensionContribution : {
        amount: 0,
        type: 'percentage' as const,
        isBeforeTax: true,
      };
      
      onPensionChange({ ...currentPension, [key]: value });
    } catch (error) {
      console.error('Error handling pension change:', error);
      onPensionChange({
        amount: 0,
        type: 'percentage',
        isBeforeTax: true,
      });
    }
  };

  // Format salary display
  const formatSalaryDisplay = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('en-GB', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Handle salary change with error recovery
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const rawValue = e.target.value;
      if (typeof rawValue !== 'string') return;
      
      const cleanValue = rawValue.replace(/[^0-9]/g, '');
      const numericValue = Number(cleanValue) || 0;
      
      if (numericValue > 10000000) return; // Reasonable limit
      
      onSalaryChange(numericValue);
    } catch (error) {
      console.error('Error handling salary change:', error);
      onSalaryChange(0);
    }
  };

  // Format allowances display
  const formatAllowancesDisplay = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('en-GB');
  };

  const handleAllowancesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const rawValue = e.target.value;
      const cleanValue = rawValue.replace(/[^0-9]/g, '');
      const numericValue = Number(cleanValue) || 0;
      onAllowancesDeductionsChange(numericValue);
    } catch (error) {
      console.error('Error handling allowances change:', error);
      onAllowancesDeductionsChange(0);
    }
  };

  // Tax code validation
  const validateTaxCode = (code: string): { isValid: boolean; error?: string } => {
    if (!code || code.trim() === '') {
      return { isValid: true }; // Empty tax code is valid - use standard allowance
    }

    const trimmedCode = code.trim().toUpperCase();
    const validPatterns = [
      /^[0-9]{1,4}L$/, /^[0-9]{1,4}M$/, /^[0-9]{1,4}N$/, /^[0-9]{1,4}T$/,
      /^K[0-9]{1,4}$/, /^S[0-9]{1,4}L$/, /^S[0-9]{1,4}M$/, /^S[0-9]{1,4}N$/, /^S[0-9]{1,4}T$/,
      /^C[0-9]{1,4}L$/, /^BR$/, /^D0$/, /^D1$/, /^0T$/, /^NT$/, /^SBR$/, /^SD0$/, /^SD1$/,
    ];

    const isValidPattern = validPatterns.some(pattern => pattern.test(trimmedCode));
    if (!isValidPattern) {
      return { isValid: false, error: 'Invalid tax code format' };
    }

    return { isValid: true };
  };

  // Validate tax code on change
  useEffect(() => {
    const validation = validateTaxCode(taxCode);
    setTaxCodeValid(validation.isValid);
    setTaxCodeError(validation.error || null);
  }, [taxCode]);

  // Update selected region when isScottish changes
  useEffect(() => {
    if (isScottish && selectedRegion !== 'scotland') {
      setSelectedRegion('scotland');
    } else if (!isScottish && selectedRegion === 'scotland') {
      setSelectedRegion('england');
    }
  }, [isScottish, selectedRegion]);

  return (
    <div className="glass-card">
      <div className="flex items-center mb-3">
        <Calculator className="h-4 w-4 text-purple-400 mr-2" />
        <h2 className="text-sm font-medium text-white">UK Tax Calculator</h2>
      </div>
      
      <div className="space-y-3 text-xs">
        {/* Salary and Pay Period */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-white/90 mb-1">Gross Salary (£)</label>
            <input
              type="text"
              value={formatSalaryDisplay(salary)}
              onChange={handleSalaryChange}
              placeholder="22,308"
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-white/90 mb-1">Input Period</label>
            <select
              value={payPeriod}
              onChange={(e) => onPayPeriodChange(e.target.value as PayPeriod)}
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="annually">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>

        {/* Tax Year and Region */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-white/90 mb-1">Tax Year</label>
            <select
              value={taxYear}
              onChange={(e) => onTaxYearChange(e.target.value as TaxYear)}
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="2025-2026">2025/26</option>
              <option value="2024-2025">2024/25</option>
              <option value="2023-2024">2023/24</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/90 mb-1">Tax Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value as TaxRegion)}
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="england">England</option>
              <option value="wales">Wales</option>
              <option value="northern-ireland">Northern Ireland</option>
              <option value="scotland">Scotland</option>
            </select>
          </div>
        </div>

        {/* Tax Code */}
        <div>
          <label className="block text-xs text-white/90 mb-1">Tax Code</label>
          <div className="relative">
            <input
              type="text"
              value={taxCode}
              onChange={(e) => {
                const rawValue = e.target.value.toUpperCase();
                const cleanValue = rawValue.replace(/\s+/g, ' ');
                onTaxCodeChange(cleanValue);
              }}
              onBlur={(e) => {
                const finalValue = e.target.value.toUpperCase().trim();
                if (finalValue !== taxCode) {
                  onTaxCodeChange(finalValue);
                }
              }}
              placeholder="Leave empty for standard allowance"
              className={`w-full px-2 py-1.5 pr-6 text-xs glass border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                taxCodeError 
                  ? 'border-red-400/50 focus:ring-red-500' 
                  : taxCodeValid && taxCode 
                    ? 'border-green-400/50 focus:ring-green-500'
                    : 'border-purple-400/30 focus:ring-purple-500'
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {taxCodeError && <AlertTriangle className="h-3 w-3 text-red-400" />}
              {taxCodeValid && taxCode && !taxCodeError && <CheckCircle className="h-3 w-3 text-green-400" />}
            </div>
          </div>
          {taxCodeError && (
            <p className="text-xs text-red-400 mt-1">{taxCodeError}</p>
          )}
        </div>

        {/* Student Loans */}
        <div>
          <label className="block text-xs text-white/90 mb-1">Student Loan Plans</label>
          <div className="flex flex-wrap gap-1">
            {[
              { plan: 'plan1' as const, label: 'Plan 1' },
              { plan: 'plan2' as const, label: 'Plan 2' },
              { plan: 'plan4' as const, label: 'Plan 4' },
              { plan: 'postgrad' as const, label: 'Postgrad' },
            ].map(({ plan, label }) => (
              <label key={plan} className="flex items-center space-x-1 px-2 py-1 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 text-xs">
                <input 
                  type="checkbox" 
                  checked={Array.isArray(studentLoanPlans) ? studentLoanPlans.includes(plan) : false}
                  onChange={(e) => {
                    try {
                      const currentPlans = Array.isArray(studentLoanPlans) ? studentLoanPlans : [];
                      if (e.target.checked) {
                        const newPlans = [...currentPlans.filter(p => p !== 'none')];
                        if (!newPlans.includes(plan)) {
                          newPlans.push(plan);
                        }
                        onStudentLoanPlansChange(newPlans);
                      } else {
                        onStudentLoanPlansChange(currentPlans.filter(p => p !== plan));
                      }
                    } catch (error) {
                      console.error('Error handling student loan selection:', error);
                      onStudentLoanPlansChange([]);
                    }
                  }}
                  className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pension Contribution */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-white/90 mb-1">Pension Type</label>
            <select
              value={pensionContribution?.type || 'percentage'}
              onChange={(e) => handlePensionChange('type', e.target.value)}
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="percentage">%</option>
              <option value="amount">£</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/90 mb-1">Amount</label>
            <input
              type="text"
              value={pensionContribution?.amount || ''}
              onChange={(e) => handlePensionChange('amount', Number(e.target.value) || 0)}
              placeholder={(pensionContribution?.type || 'percentage') === 'percentage' ? '5' : '200'}
              className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Allowances/Deductions */}
        <div>
          <label className="block text-xs text-white/90 mb-1">Allowances/Deductions (£)</label>
          <input
            type="text"
            value={formatAllowancesDisplay(allowancesDeductions)}
            onChange={handleAllowancesChange}
            placeholder="0"
            className="w-full px-2 py-1.5 text-xs glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Personal Circumstances - Single Row */}
        <div>
          <label className="block text-xs text-white/90 mb-1">Personal Circumstances</label>
          <div className="flex flex-wrap gap-1">
            <label className="flex items-center space-x-2 px-2 py-1 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.isPensionAge || false}
                onChange={(e) => handleTaxOptionChange('isPensionAge', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Over State Pension Age</span>
            </label>
            <label className="flex items-center space-x-2 px-2 py-1 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.isMarried || false}
                onChange={(e) => handleTaxOptionChange('isMarried', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Married/Civil Partnership</span>
            </label>
            <label className="flex items-center space-x-2 px-2 py-1 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.isBlind || false}
                onChange={(e) => handleTaxOptionChange('isBlind', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Blind</span>
            </label>
            <label className="flex items-center space-x-2 px-2 py-1 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.noNationalInsurance || false}
                onChange={(e) => handleTaxOptionChange('noNationalInsurance', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">No National Insurance</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}