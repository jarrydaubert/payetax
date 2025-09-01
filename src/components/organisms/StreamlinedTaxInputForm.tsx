// src/components/organisms/StreamlinedTaxInputForm.tsx
'use client';

import { AlertTriangle, Calculator, CheckCircle } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import type { PayPeriod, StudentLoanPlan, TaxYear } from '@/constants/taxRates';

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
  hoursPerWeek?: number;
  onSalaryChange: (salary: number) => void;
  onTaxYearChange: (taxYear: TaxYear) => void;
  onPayPeriodChange: (payPeriod: PayPeriod) => void;
  onTaxCodeChange: (taxCode: string) => void;
  onScottishChange: (isScottish: boolean) => void;
  onStudentLoanPlansChange: (plans: StudentLoanPlan[]) => void;
  onAllowancesDeductionsChange: (amount: number) => void;
  onTaxOptionsChange: (options: TaxOptions) => void;
  onPensionChange: (pension: PensionContribution) => void;
  onHoursPerWeekChange: (hours: number) => void;
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
  hoursPerWeek = 37.5,
  onSalaryChange,
  onTaxYearChange,
  onPayPeriodChange,
  onTaxCodeChange,
  onScottishChange,
  onStudentLoanPlansChange,
  onAllowancesDeductionsChange,
  onTaxOptionsChange,
  onPensionChange,
  onHoursPerWeekChange,
}: StreamlinedTaxInputFormProps) {
  const salaryId = useId();
  const payPeriodId = useId();
  const taxYearId = useId();
  const taxRegionId = useId();
  const taxCodeId = useId();
  const pensionTypeId = useId();
  const pensionAmountId = useId();
  const allowancesId = useId();

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
        if (taxCode?.startsWith('S')) {
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
      const currentOptions =
        taxOptions && typeof taxOptions === 'object'
          ? taxOptions
          : {
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
  const handlePensionChange = (
    key: keyof PensionContribution,
    value: number | boolean | string
  ) => {
    try {
      const currentPension =
        pensionContribution && typeof pensionContribution === 'object'
          ? pensionContribution
          : {
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
      maximumFractionDigits: 0,
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
  const validateTaxCode = useCallback((code: string): { isValid: boolean; error?: string } => {
    if (!code || code.trim() === '') {
      return { isValid: true }; // Empty tax code is valid - use standard allowance
    }

    const trimmedCode = code.trim().toUpperCase();
    const validPatterns = [
      /^[0-9]{1,4}L$/,
      /^[0-9]{1,4}M$/,
      /^[0-9]{1,4}N$/,
      /^[0-9]{1,4}T$/,
      /^K[0-9]{1,4}$/,
      /^S[0-9]{1,4}L$/,
      /^S[0-9]{1,4}M$/,
      /^S[0-9]{1,4}N$/,
      /^S[0-9]{1,4}T$/,
      /^C[0-9]{1,4}L$/,
      /^BR$/,
      /^D0$/,
      /^D1$/,
      /^0T$/,
      /^NT$/,
      /^SBR$/,
      /^SD0$/,
      /^SD1$/,
    ];

    const isValidPattern = validPatterns.some((pattern) => pattern.test(trimmedCode));
    if (!isValidPattern) {
      return { isValid: false, error: 'Invalid tax code format' };
    }

    return { isValid: true };
  }, []);

  // Validate tax code on change
  useEffect(() => {
    const validation = validateTaxCode(taxCode);
    setTaxCodeValid(validation.isValid);
    setTaxCodeError(validation.error || null);
  }, [taxCode, validateTaxCode]);

  // Update selected region when isScottish changes
  useEffect(() => {
    if (isScottish && selectedRegion !== 'scotland') {
      setSelectedRegion('scotland');
    } else if (!isScottish && selectedRegion === 'scotland') {
      setSelectedRegion('england');
    }
  }, [isScottish, selectedRegion]);

  return (
    <div className='glass-card'>
      <div className='mb-3 flex items-center'>
        <Calculator className='mr-2 h-4 w-4 text-purple-400' />
        <h2 className='font-medium text-base text-white'>Salary Information</h2>
      </div>

      <div className='space-y-3 text-sm'>
        {/* Salary and Pay Period */}
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label htmlFor={salaryId} className='mb-1 block text-sm text-white'>
              Gross Salary (£)
            </label>
            <input
              id={salaryId}
              data-testid='salary-input'
              type='text'
              value={formatSalaryDisplay(salary)}
              onChange={handleSalaryChange}
              placeholder='e.g., 30,000'
              aria-label='Gross salary in pounds'
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500'
            />
          </div>
          <div>
            <label htmlFor={payPeriodId} className='mb-1 block text-sm text-white'>
              Input Period
            </label>
            <select
              id={payPeriodId}
              data-testid='pay-period-select'
              value={payPeriod}
              onChange={(e) => onPayPeriodChange(e.target.value as PayPeriod)}
              aria-label='Pay period for salary input'
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value='annually'>Yearly</option>
              <option value='monthly'>Monthly</option>
              <option value='weekly'>Weekly</option>
              <option value='daily'>Daily</option>
              <option value='hourly'>Hourly</option>
            </select>
          </div>
        </div>

        {/* Hours Per Week - only show for hourly pay period */}
        {payPeriod === 'hourly' && (
          <div className='glass-card'>
            <div className='mb-3 flex items-center'>
              <span className='mr-2 text-purple-400'>⏰</span>
              <h2 className='font-medium text-base text-white'>Working Hours</h2>
            </div>
            <div>
              <label htmlFor={`${salaryId}-hours`} className='mb-1 block text-sm text-white'>
                Hours per Week
              </label>
              <input
                id={`${salaryId}-hours`}
                type='number'
                value={hoursPerWeek}
                onChange={(e) => onHoursPerWeekChange(parseFloat(e.target.value) || 0)}
                placeholder='37.5'
                min='0'
                max='168'
                step='0.5'
                aria-label='Hours worked per week'
                className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500'
              />
              <p className='mt-1 text-gray-400 text-xs'>
                Standard full-time is 37.5 hours per week
              </p>
            </div>
          </div>
        )}

        {/* Tax Year and Region */}
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label htmlFor={taxYearId} className='mb-1 block text-sm text-white'>
              Tax Year
            </label>
            <select
              id={taxYearId}
              value={taxYear}
              onChange={(e) => onTaxYearChange(e.target.value as TaxYear)}
              aria-label='Tax year for calculations'
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value='2025-2026'>2025/26</option>
              <option value='2024-2025'>2024/25</option>
              <option value='2023-2024'>2023/24</option>
            </select>
          </div>
          <div>
            <label htmlFor={taxRegionId} className='mb-1 block text-sm text-white'>
              Tax Region
            </label>
            <select
              id={taxRegionId}
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value as TaxRegion)}
              aria-label='Tax region for calculations'
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value='england'>England</option>
              <option value='wales'>Wales</option>
              <option value='northern-ireland'>Northern Ireland</option>
              <option value='scotland'>Scotland</option>
            </select>
          </div>
        </div>

        {/* Tax Code */}
        <div>
          <label htmlFor={taxCodeId} className='mb-1 block text-sm text-white'>
            Tax Code
          </label>
          <div className='relative'>
            <input
              id={taxCodeId}
              type='text'
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
              placeholder=''
              className={`glass w-full rounded border px-3 py-2 pr-6 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-1 ${
                taxCodeError
                  ? 'border-red-400/50 focus:ring-red-500'
                  : taxCodeValid && taxCode
                    ? 'border-green-400/50 focus:ring-green-500'
                    : 'border-purple-400/30 focus:ring-purple-500'
              }`}
            />
            <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
              {taxCodeError && <AlertTriangle className='h-3 w-3 text-red-400' />}
              {taxCodeValid && taxCode && !taxCodeError && (
                <CheckCircle className='h-3 w-3 text-green-400' />
              )}
            </div>
          </div>
          {taxCodeError && <p className='mt-1 text-red-400 text-sm'>{taxCodeError}</p>}
        </div>

        {/* Student Loans */}
        <div>
          <fieldset>
            <legend className='mb-1 block text-sm text-white'>Student Loan Plans</legend>
            <div className='flex flex-wrap gap-1'>
              {[
                { plan: 'plan1' as const, label: 'Plan 1' },
                { plan: 'plan2' as const, label: 'Plan 2' },
                { plan: 'plan4' as const, label: 'Plan 4' },
                { plan: 'postgrad' as const, label: 'Postgrad' },
              ].map(({ plan, label }) => (
                <label
                  key={plan}
                  className='glass flex cursor-pointer items-center space-x-1 rounded border border-purple-400/20 px-2 py-1 text-sm hover:bg-white/5'
                >
                  <input
                    type='checkbox'
                    checked={
                      Array.isArray(studentLoanPlans) ? studentLoanPlans.includes(plan) : false
                    }
                    onChange={(e) => {
                      try {
                        const currentPlans = Array.isArray(studentLoanPlans)
                          ? studentLoanPlans
                          : [];
                        if (e.target.checked) {
                          const newPlans = [...currentPlans.filter((p) => p !== 'none')];
                          if (!newPlans.includes(plan)) {
                            newPlans.push(plan);
                          }
                          onStudentLoanPlansChange(newPlans);
                        } else {
                          onStudentLoanPlansChange(currentPlans.filter((p) => p !== plan));
                        }
                      } catch (error) {
                        console.error('Error handling student loan selection:', error);
                        onStudentLoanPlansChange([]);
                      }
                    }}
                    className='h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500'
                  />
                  <span className='text-white'>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Pension Contribution */}
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <label htmlFor={pensionTypeId} className='mb-1 block text-sm text-white'>
              Pension Type
            </label>
            <select
              id={pensionTypeId}
              data-testid='pension-type-select'
              value={pensionContribution?.type || 'percentage'}
              onChange={(e) => handlePensionChange('type', e.target.value)}
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500'
            >
              <option value='percentage'>%</option>
              <option value='amount'>£</option>
            </select>
          </div>
          <div>
            <label htmlFor={pensionAmountId} className='mb-1 block text-sm text-white'>
              Amount
            </label>
            <input
              id={pensionAmountId}
              data-testid='pension-amount-input'
              type='text'
              value={pensionContribution?.amount || ''}
              onChange={(e) => handlePensionChange('amount', Number(e.target.value) || 0)}
              placeholder=''
              className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500'
            />
          </div>
        </div>

        {/* Allowances/Deductions */}
        <div>
          <label htmlFor={allowancesId} className='mb-1 block text-sm text-white'>
            Allowances/Deductions (£)
          </label>
          <input
            id={allowancesId}
            type='text'
            value={formatAllowancesDisplay(allowancesDeductions)}
            onChange={handleAllowancesChange}
            placeholder='0'
            className='glass w-full rounded border border-purple-400/30 px-3 py-2 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500'
          />
        </div>

        {/* Personal Circumstances - Single Row */}
        <div>
          <fieldset>
            <legend className='mb-1 block text-sm text-white'>Personal Circumstances</legend>
            <div className='flex flex-wrap gap-1'>
              <label className='glass flex cursor-pointer items-center space-x-2 rounded border border-purple-400/20 px-2 py-1 text-sm hover:bg-white/5'>
                <input
                  type='checkbox'
                  checked={taxOptions?.isPensionAge || false}
                  onChange={(e) => handleTaxOptionChange('isPensionAge', e.target.checked)}
                  className='h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-white'>Over State Pension Age</span>
              </label>
              <label className='glass flex cursor-pointer items-center space-x-2 rounded border border-purple-400/20 px-2 py-1 text-sm hover:bg-white/5'>
                <input
                  type='checkbox'
                  checked={taxOptions?.isMarried || false}
                  onChange={(e) => handleTaxOptionChange('isMarried', e.target.checked)}
                  className='h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-white'>Married/Civil Partnership</span>
              </label>
              <label className='glass flex cursor-pointer items-center space-x-2 rounded border border-purple-400/20 px-2 py-1 text-sm hover:bg-white/5'>
                <input
                  type='checkbox'
                  checked={taxOptions?.isBlind || false}
                  onChange={(e) => handleTaxOptionChange('isBlind', e.target.checked)}
                  className='h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-white'>Blind</span>
              </label>
              <label className='glass flex cursor-pointer items-center space-x-2 rounded border border-purple-400/20 px-2 py-1 text-sm hover:bg-white/5'>
                <input
                  type='checkbox'
                  checked={taxOptions?.noNationalInsurance || false}
                  onChange={(e) => handleTaxOptionChange('noNationalInsurance', e.target.checked)}
                  className='h-3 w-3 rounded border-gray-400 text-purple-600 focus:ring-purple-500'
                />
                <span className='text-white'>No National Insurance</span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
