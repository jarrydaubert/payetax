// src/components/molecules/TaxInputForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import type { StudentLoanPlan, TaxYear, PayPeriod } from '@/constants/taxRates';
import { getTaxCodeExplanation } from '@/lib/taxRateDescriptions';

type TaxRegion = 'england' | 'wales' | 'northern-ireland' | 'scotland';

interface TaxOptions {
  isPensionAge: boolean;
  isMarried: boolean;
  isBlind: boolean;
  noNationalInsurance: boolean;
  partnerIncome: number;
}

interface PensionContribution {
  amount: number;
  type: 'percentage' | 'amount';
  isBeforeTax: boolean;
}

interface TaxInputFormProps {
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

export default function TaxInputForm({
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
}: TaxInputFormProps) {
  const [taxCodeError, setTaxCodeError] = useState<string | null>(null);
  const [taxCodeValid, setTaxCodeValid] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<TaxRegion>(
    isScottish ? 'scotland' : 'england'
  );

  // Handle region change
  const handleRegionChange = (region: TaxRegion) => {
    setSelectedRegion(region);
    onScottishChange(region === 'scotland');
  };

  // Handle tax options change with error recovery
  const handleTaxOptionChange = (key: keyof TaxOptions, value: boolean | number) => {
    try {
      // Defensive programming - ensure taxOptions exists and is an object
      const currentOptions = taxOptions && typeof taxOptions === 'object' ? taxOptions : {
        isPensionAge: false,
        isMarried: false,
        isBlind: false,
        noNationalInsurance: false,
        partnerIncome: 0,
      };
      
      onTaxOptionsChange({ ...currentOptions, [key]: value });
    } catch (error) {
      console.error('Error handling tax option change:', error);
      // Recovery: reset to default options
      onTaxOptionsChange({
        isPensionAge: false,
        isMarried: false,
        isBlind: false,
        noNationalInsurance: false,
        partnerIncome: 0,
      });
    }
  };

  // Handle pension change with error recovery
  const handlePensionChange = (key: keyof PensionContribution, value: number | boolean | string) => {
    try {
      // Defensive programming - ensure pensionContribution exists and is an object
      const currentPension = pensionContribution && typeof pensionContribution === 'object' ? pensionContribution : {
        amount: 0,
        type: 'percentage' as const,
        isBeforeTax: true,
      };
      
      onPensionChange({ ...currentPension, [key]: value });
    } catch (error) {
      console.error('Error handling pension change:', error);
      // Recovery: reset to default pension settings
      onPensionChange({
        amount: 0,
        type: 'percentage',
        isBeforeTax: true,
      });
    }
  };

  // Format pension display
  const formatPensionDisplay = (value: number, type: string): string => {
    if (value === 0) return '';
    if (type === 'amount') {
      return value.toLocaleString('en-GB', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return value.toString();
  };

  // Handle pension amount change with formatting
  const handlePensionAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (pensionContribution.type === 'amount') {
      const rawValue = e.target.value;
      const cleanValue = rawValue.replace(/[^0-9]/g, '');
      const numericValue = Number(cleanValue) || 0;
      handlePensionChange('amount', numericValue);
    } else {
      const numericValue = Number(e.target.value) || 0;
      handlePensionChange('amount', numericValue);
    }
  };

  // Tax code validation function
  const validateTaxCode = (code: string): { isValid: boolean; error?: string } => {
    if (!code || code.trim() === '') {
      return { isValid: false, error: 'Tax code is required' };
    }

    const trimmedCode = code.trim().toUpperCase();

    // Common patterns for UK tax codes
    const validPatterns = [
      /^[0-9]{1,4}L$/, // Standard codes like 1257L
      /^[0-9]{1,4}M$/, // Marriage allowance codes
      /^[0-9]{1,4}N$/, // Marriage allowance transfer codes  
      /^[0-9]{1,4}T$/, // Special circumstances
      /^K[0-9]{1,4}$/, // Underpayment codes
      /^S[0-9]{1,4}L$/, // Scottish codes like S1257L
      /^S[0-9]{1,4}M$/, // Scottish marriage allowance
      /^S[0-9]{1,4}N$/, // Scottish marriage allowance transfer
      /^S[0-9]{1,4}T$/, // Scottish special circumstances
      /^C[0-9]{1,4}L$/, // Welsh codes (rare but valid)
      /^BR$/, // Basic rate
      /^D0$/, // Higher rate
      /^D1$/, // Additional rate
      /^0T$/, // No allowance
      /^NT$/, // No tax
      /^SBR$/, // Scottish basic rate
      /^SD0$/, // Scottish higher rate  
      /^SD1$/, // Scottish additional rate
    ];

    const isValidPattern = validPatterns.some(pattern => pattern.test(trimmedCode));

    if (!isValidPattern) {
      return { 
        isValid: false, 
        error: 'Invalid tax code format. Should be like 1257L, S1257L, BR, etc.' 
      };
    }

    // Additional validations
    const numericPart = trimmedCode.match(/[0-9]+/)?.[0];
    if (numericPart && Number(numericPart) > 9999) {
      return { 
        isValid: false, 
        error: 'Tax code numeric part cannot exceed 9999' 
      };
    }

    return { isValid: true };
  };

  // Validate tax code whenever it changes
  useEffect(() => {
    const validation = validateTaxCode(taxCode);
    setTaxCodeValid(validation.isValid);
    setTaxCodeError(validation.error || null);
  }, [taxCode]);

  // Update selected region when isScottish prop changes
  useEffect(() => {
    if (isScottish && selectedRegion !== 'scotland') {
      setSelectedRegion('scotland');
    } else if (!isScottish && selectedRegion === 'scotland') {
      setSelectedRegion('england');
    }
  }, [isScottish, selectedRegion]);

  const formatSalaryDisplay = (value: number): string => {
    if (value === 0) return '';
    // Format with comma separators for British locale
    return value.toLocaleString('en-GB', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // Get raw input value and current cursor position
      const input = e.target as HTMLInputElement;
      const cursorPosition = input.selectionStart;
      const rawValue = e.target.value;
      
      // Defensive validation - ensure we have a valid string
      if (typeof rawValue !== 'string') {
        console.warn('Invalid salary input value');
        return;
      }
      
      // Remove all non-numeric characters (including commas)
      const cleanValue = rawValue.replace(/[^0-9]/g, '');
      const numericValue = Number(cleanValue) || 0;
      
      // Validate reasonable salary range (0 to 10 million)
      if (numericValue > 10000000) {
        console.warn('Salary value exceeds reasonable limit');
        return;
      }
      
      // Update the store
      onSalaryChange(numericValue);
      
      // Restore cursor position after formatting
      // Account for added/removed commas
      setTimeout(() => {
        try {
          if (input && cursorPosition !== null) {
            const newFormattedValue = formatSalaryDisplay(numericValue);
            const oldCommaCount = (rawValue.slice(0, cursorPosition).match(/,/g) || []).length;
            const newCommaCount = (newFormattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
            const newCursorPosition = cursorPosition + (newCommaCount - oldCommaCount);
            
            input.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        } catch (error) {
          // Cursor position restoration failed - not critical
          console.debug('Cursor position restoration failed:', error);
        }
      }, 0);
    } catch (error) {
      console.error('Error handling salary change:', error);
      // Recovery: set to 0 on error
      onSalaryChange(0);
    }
  };

  return (
    <div className="glass-card">
      <div className="flex items-center mb-4">
        <Calculator className="h-4 w-4 text-purple-400 mr-2" />
        <h2 className="text-base font-semibold text-white">Calculate Your Tax</h2>
      </div>
      
      <div className="space-y-4">
        {/* Salary and Pay Period Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label 
              htmlFor="salary-input"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Salary (£)
            </label>
            <input
              id="salary-input"
              type="text"
              value={formatSalaryDisplay(salary)}
              onChange={handleSalaryChange}
              placeholder="50,000"
              className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              aria-describedby="salary-help"
            />
            <p id="salary-help" className="text-xs text-white/60 mt-1">
              Enter your gross {payPeriod.replace('ly', '')} salary
            </p>
          </div>

          <div>
            <label 
              htmlFor="pay-period-select"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Pay Period
            </label>
            <select
              id="pay-period-select"
              value={payPeriod}
              onChange={(e) => onPayPeriodChange(e.target.value as PayPeriod)}
              className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="annually">Annual</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>

        {/* Tax Year and Region Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label 
              htmlFor="tax-year-select"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Tax Year
            </label>
            <select
              id="tax-year-select"
              value={taxYear}
              onChange={(e) => onTaxYearChange(e.target.value as TaxYear)}
              className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="2025-2026">2025/26</option>
              <option value="2024-2025">2024/25</option>
              <option value="2023-2024">2023/24</option>
            </select>
          </div>

          <div>
            <label 
              htmlFor="region-select"
              className="block text-sm font-medium text-white/90 mb-1"
            >
              Tax Region
            </label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value as TaxRegion)}
              className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
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
          <label 
            htmlFor="tax-code-input"
            className="block text-sm font-medium text-white/90 mb-1"
          >
            Tax Code
          </label>
          <div className="relative">
            <input
              id="tax-code-input"
              type="text"
              value={taxCode}
              onChange={(e) => {
                // Auto-uppercase and trim whitespace on input
                const rawValue = e.target.value.toUpperCase();
                // Remove excessive whitespace but allow typing
                const cleanValue = rawValue.replace(/\s+/g, ' ');
                onTaxCodeChange(cleanValue);
              }}
              onBlur={(e) => {
                // Final cleanup on blur - trim all whitespace
                const finalValue = e.target.value.toUpperCase().trim();
                if (finalValue !== taxCode) {
                  onTaxCodeChange(finalValue);
                }
              }}
              placeholder="1257L"
              className={`w-full px-3 py-2 pr-8 text-sm glass border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                taxCodeError 
                  ? 'border-red-400/50 focus:ring-red-500 focus:border-red-500' 
                  : taxCodeValid && taxCode 
                    ? 'border-green-400/50 focus:ring-green-500 focus:border-green-500'
                    : 'border-purple-400/30 focus:ring-purple-500 focus:border-purple-500'
              }`}
              aria-describedby="tax-code-help tax-code-error"
              aria-invalid={!taxCodeValid}
            />
            {/* Validation icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {taxCodeError && (
                <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden="true" />
              )}
              {taxCodeValid && taxCode && !taxCodeError && (
                <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
              )}
            </div>
          </div>
          {taxCodeError && (
            <p id="tax-code-error" className="text-xs text-red-400 mt-1" role="alert">
              {taxCodeError}
            </p>
          )}
          <p id="tax-code-help" className="text-xs text-white/70 mt-1">
            {!taxCodeError && getTaxCodeExplanation(taxCode || '1257L')}
          </p>
        </div>

        {/* Student Loan Plans - Single Row Design */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Student Loan Plans (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { plan: 'plan1' as const, label: 'Plan 1', color: 'bg-purple-500/20 border-purple-400/40' },
              { plan: 'plan2' as const, label: 'Plan 2', color: 'bg-cyan-500/20 border-cyan-400/40' },
              { plan: 'plan4' as const, label: 'Plan 4', color: 'bg-indigo-500/20 border-indigo-400/40' },
              { plan: 'postgrad' as const, label: 'Postgrad', color: 'bg-pink-500/20 border-pink-400/40' },
            ].map(({ plan, label, color }) => (
              <label 
                key={plan}
                className={`flex items-center space-x-2 px-3 py-2 glass rounded border cursor-pointer hover:bg-white/5 transition-colors text-xs ${
                  studentLoanPlans.includes(plan) && !studentLoanPlans.includes('none') ? color : 'border-purple-400/20'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={
                    // Defensive check for array and valid values
                    Array.isArray(studentLoanPlans) 
                      ? (studentLoanPlans.includes(plan) && !studentLoanPlans.includes('none'))
                      : false
                  }
                  onChange={(e) => {
                    try {
                      // Defensive programming - ensure we have a valid array
                      const currentPlans = Array.isArray(studentLoanPlans) ? studentLoanPlans : [];
                      
                      // Remove 'none' if it exists when selecting a plan
                      const filteredPlans = currentPlans.filter(p => p !== 'none' && p !== null && p !== undefined);
                      
                      if (e.target.checked) {
                        // Prevent duplicates
                        const newPlans = [...filteredPlans];
                        if (!newPlans.includes(plan)) {
                          newPlans.push(plan);
                        }
                        onStudentLoanPlansChange(newPlans);
                      } else {
                        const newPlans = filteredPlans.filter(p => p !== plan);
                        // Always ensure we have an array, never null/undefined
                        onStudentLoanPlansChange(newPlans);
                      }
                    } catch (error) {
                      console.error('Error handling student loan selection:', error);
                      // Recovery: reset to empty array on error
                      onStudentLoanPlansChange([]);
                    }
                  }}
                  className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white">{label}</span>
              </label>
            ))}
          </div>
          {studentLoanPlans.length === 0 || studentLoanPlans.includes('none') ? (
            <p className="text-xs text-white/60 mt-2">
              No student loan plans selected. Leave blank if you don't have student loans.
            </p>
          ) : (
            <p className="text-xs text-white/60 mt-2">
              Selected: {studentLoanPlans.filter(p => p !== 'none').join(', ')}
            </p>
          )}
        </div>

        {/* Pension Contribution */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Pension Contribution
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                htmlFor="pension-type"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Type
              </label>
              <select
                id="pension-type"
                value={pensionContribution?.type || 'percentage'}
                onChange={(e) => handlePensionChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label 
                htmlFor="pension-amount"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                {(pensionContribution?.type || 'percentage') === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}
              </label>
              <input
                id="pension-amount"
                type="text"
                value={formatPensionDisplay(pensionContribution?.amount || 0, pensionContribution?.type || 'percentage')}
                onChange={handlePensionAmountChange}
                placeholder={(pensionContribution?.type || 'percentage') === 'percentage' ? '5' : '200'}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <label className="flex items-center space-x-2 mt-2 p-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
            <input 
              type="checkbox" 
              checked={pensionContribution?.isBeforeTax || false}
              onChange={(e) => handlePensionChange('isBeforeTax', e.target.checked)}
              className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-white">Salary sacrifice (before tax)</span>
          </label>
        </div>

        {/* Personal Circumstances */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Personal Circumstances
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label 
                htmlFor="age-select"
                className="block text-sm font-medium text-white/90 mb-1"
              >
                Age
              </label>
              <select
                id="age-select"
                value={taxOptions?.isPensionAge ? 'over65' : 'under65'}
                onChange={(e) => handleTaxOptionChange('isPensionAge', e.target.value === 'over65')}
                className="w-full px-3 py-2 text-sm glass border border-purple-400/30 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="under65">Under 65</option>
                <option value="over65">65 or over</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="flex items-center space-x-2 px-3 py-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.isMarried || false}
                onChange={(e) => handleTaxOptionChange('isMarried', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Married</span>
            </label>
            <label className="flex items-center space-x-2 px-3 py-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.isBlind || false}
                onChange={(e) => handleTaxOptionChange('isBlind', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Blind</span>
            </label>
            <label className="flex items-center space-x-2 px-3 py-2 glass rounded border border-purple-400/20 cursor-pointer hover:bg-white/5 transition-colors text-xs">
              <input 
                type="checkbox" 
                checked={taxOptions?.noNationalInsurance || false}
                onChange={(e) => handleTaxOptionChange('noNationalInsurance', e.target.checked)}
                className="w-3 h-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">No NI</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}