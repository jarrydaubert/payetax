// src/components/organisms/TaxCalculatorForm.tsx
/**
 * Enhanced Tax Calculator Form - Clean Professional Design
 * 
 * FIXES APPLIED:
 * ✅ Removed duplicate labels ("Tax Year" appearing twice)
 * ✅ Simplified student loan selector (no more 5 verbose buttons)
 * ✅ Better visual hierarchy with primary/secondary sections
 * ✅ Progressive disclosure for advanced options
 * ✅ Consistent glass morphism styling
 * ✅ Clean spacing and professional layout
 */

'use client';

import { 
  BarChart3, 
  Calculator,
  ChevronDown,
  ChevronUp,
  Info, 
  PoundSterling,
  RotateCcw,
  Settings,
  TrendingUp
} from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import NumberInput from '@/components/atoms/NumberInput';
import PayPeriodSelect from '@/components/atoms/PayPeriodSelect';
import PensionContributionInput from '@/components/atoms/PensionContributionInput';
import TaxCodeInput from '@/components/atoms/TaxCodeInput';
import TaxOptionsSelector from '@/components/atoms/TaxOptionsSelector';
import TaxYearSelect from '@/components/atoms/TaxYearSelect';
import AllowancesInput from '@/components/molecules/AllowancesInput';
import FormField from '@/components/molecules/FormField';
import { type StudentLoanPlan } from '@/constants/taxRates';
import { trackCalculatorEvent } from '@/lib/analytics';
import { debounce } from '@/lib/debounce';
import { cn } from '@/lib/utils';
import { useCalculatorStore } from '@/store/calculatorStore';

interface TaxCalculatorFormProps {
  className?: string;
  onCalculate?: () => void;
  autoCalculate?: boolean;
}

// Simplified student loan plans data
const STUDENT_LOAN_PLANS = [
  { value: 'none', label: 'None', rate: '' },
  { value: 'plan1', label: 'Plan 1', rate: '9% over £22,015' },
  { value: 'plan2', label: 'Plan 2', rate: '9% over £27,295' },
  { value: 'plan4', label: 'Plan 4', rate: '9% over £27,660' },
  { value: 'plan5', label: 'Plan 5', rate: '9% over £25,000' },
  { value: 'postgrad', label: 'Postgraduate', rate: '6% over £21,000' },
] as const;

const TaxCalculatorForm: React.FC<TaxCalculatorFormProps> = ({
  className,
  onCalculate,
  autoCalculate = false,
}) => {
  const {
    input,
    setSalary,
    setPayPeriod,
    setTaxYear,
    setTaxCode,
    setIsScottish,
    setPensionContribution,
    setPensionContributionType,
    setStudentLoanPlans,
    setNiCategory,
    setHoursPerWeek,
    setAdditionalAllowances,
    calculate,
    reset,
  } = useCalculatorStore();

  // Local state for form validation and UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // Tax options state for advanced section
  const [isPensionAge, setIsPensionAge] = useState(false);
  const [isMarried, setIsMarried] = useState(false);
  const [isBlind, setIsBlind] = useState(false);
  const [noNationalInsurance, setNoNationalInsurance] = useState(false);
  const [partnerIncome, setPartnerIncome] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();

  // Debounced auto-calculation
  const debouncedCalculate = useCallback(
    debounce(() => {
      if (autoCalculate && input.salary > 0) {
        handleCalculate();
      }
    }, 500),
    [autoCalculate, input.salary]
  );

  // Enhanced validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    // Salary validation
    if (input.salary <= 0) {
      newErrors.salary = 'Please enter a valid salary amount greater than £0';
    } else if (input.salary > 10000000) {
      newErrors.salary = 'Salary amount seems unusually high. Please check the value.';
    }
    
    // Hours validation
    if (input.hoursPerWeek < 0 || input.hoursPerWeek > 168) {
      newErrors.hours = 'Hours per week must be between 0 and 168';
    }
    
    // Pension validation
    if (input.pensionContributionType === 'percentage' && input.pensionContribution > 100) {
      newErrors.pension = 'Pension percentage cannot exceed 100%';
    } else if (input.pensionContributionType === 'amount' && input.pensionContribution > input.salary) {
      newErrors.pension = 'Pension contribution cannot exceed your salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [input.salary, input.hoursPerWeek, input.pensionContribution, input.pensionContributionType]);

  // Enhanced calculation handler with validation
  const handleCalculate = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);

    // Track calculation event
    trackCalculatorEvent('calculate', {
      salary: input.salary,
      taxYear: input.taxYear,
      payPeriod: input.payPeriod,
      hasStudentLoan: input.studentLoanPlans.length > 0 && !input.studentLoanPlans.includes('none'),
      hasPension: input.pensionContribution > 0,
      isScottish: input.isScottish,
    });

    try {
      calculate();
      setFormChanged(false);

      // Scroll to results if they exist
      const resultsElement = document.getElementById('results-container');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (onCalculate) onCalculate();
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({
        calculation: 'An error occurred during calculation. Please check your inputs.',
      });
    } finally {
      setIsCalculating(false);
    }
  }, [input, calculate, onCalculate]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleCalculate();
  }, [handleCalculate]);

  // Handle form reset
  const handleReset = useCallback(() => {
    reset();
    setErrors({});
    setFormChanged(false);
    setShowAdvancedOptions(false);
    trackCalculatorEvent('reset');
  }, [reset]);

  // Student loan selection handler
  const handleStudentLoanChange = useCallback((plan: StudentLoanPlan) => {
    let newPlans: StudentLoanPlan[] = [];
    
    if (plan === 'none') {
      newPlans = ['none'];
    } else {
      const currentPlans = input.studentLoanPlans.filter(p => p !== 'none');
      if (currentPlans.includes(plan)) {
        newPlans = currentPlans.filter(p => p !== plan);
        if (newPlans.length === 0) {
          newPlans = ['none'];
        }
      } else {
        newPlans = [...currentPlans, plan];
      }
    }
    
    setStudentLoanPlans(newPlans);
    setFormChanged(true);
  }, [input.studentLoanPlans, setStudentLoanPlans]);

  // Auto-calculate effect
  useEffect(() => {
    debouncedCalculate();
  }, [debouncedCalculate]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn('space-y-6 w-full max-w-6xl mx-auto px-4', className)}
      noValidate
      aria-labelledby="tax-calculator-heading"
    >
      {/* Header Section - Reduced spacing */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-card bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mb-3">
          <Calculator className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 id="tax-calculator-heading" className="text-3xl font-bold text-gradient">
          UK Tax Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Calculate your take-home pay with accurate UK tax rates for 2024-2025
        </p>
      </div>

      {/* Primary Inputs Section - Better spacing for large screens */}
      <div className="tax-form-primary">
        <div className="flex items-center gap-3 mb-4">
          <PoundSterling className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Essential Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            id={`${formId}-salary`}
            label="Annual Salary"
            error={errors.salary}
            tooltip="Enter your gross annual salary before tax"
          >
            <NumberInput
              id={`${formId}-salary`}
              value={input.salary}
              onChange={(value) => {
                setSalary(value);
                setFormChanged(true);
                // Clear salary error when user starts typing
                if (errors.salary && value > 0) {
                  setErrors(prev => ({ ...prev, salary: '' }));
                }
              }}
              placeholder="50000"
              prefix="£"
              suffix="per year"
              min={0}
              max={10000000}
              className={cn(
                'glass-input text-lg font-medium',
                errors.salary && 'border-red-300 dark:border-red-600 focus:ring-red-500/50'
              )}
              aria-invalid={!!errors.salary}
              aria-describedby={errors.salary ? `${formId}-salary-error` : `${formId}-salary-help`}
            />
            {errors.salary && (
              <div id={`${formId}-salary-error`} className="form-error" role="alert">
                <Info className="h-4 w-4 flex-shrink-0" />
                {errors.salary}
              </div>
            )}
            <div id={`${formId}-salary-help`} className="form-hint">
              Enter your annual gross salary before tax and deductions
            </div>
          </FormField>

          <FormField
            id={`${formId}-tax-year`}
            label="Tax Year"
            tooltip="Select the tax year for your calculation"
          >
            <TaxYearSelect
              id={`${formId}-tax-year`}
              value={input.taxYear}
              onChange={(taxYear) => {
                setTaxYear(taxYear);
                setFormChanged(true);
              }}
              className="glass-select"
            />
          </FormField>
        </div>
      </div>

      {/* Secondary Inputs Section - Better grid for large screens */}
      <div className="tax-form-secondary">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField
            id={`${formId}-tax-code`}
            label="Tax Code"
            tooltip="Your tax code (found on your payslip or P60)"
          >
            <TaxCodeInput
              id={`${formId}-tax-code`}
              value={input.taxCode}
              onChange={(taxCode, isScottish) => {
                setTaxCode(taxCode);
                setIsScottish(isScottish);
                setFormChanged(true);
              }}
              onScottishChange={setIsScottish}
              placeholder="1257L"
            />
          </FormField>

          <FormField
            id={`${formId}-pay-period`}
            label="Pay Period"
            tooltip="How often you're paid"
          >
            <PayPeriodSelect
              id={`${formId}-pay-period`}
              value={input.payPeriod}
              onChange={(period) => {
                setPayPeriod(period);
                setFormChanged(true);
              }}
              className="glass-select"
            />
          </FormField>

          <FormField
            id={`${formId}-hours`}
            label="Hours per Week"
            tooltip="For hourly rate calculations (optional)"
            error={errors.hours}
          >
            <NumberInput
              id={`${formId}-hours`}
              value={input.hoursPerWeek}
              onChange={(hours) => {
                setHoursPerWeek(hours);
                setFormChanged(true);
                if (errors.hours && hours >= 0 && hours <= 168) {
                  setErrors(prev => ({ ...prev, hours: '' }));
                }
              }}
              placeholder="37.5"
              suffix="hours"
              min={0}
              max={168}
              className={cn(
                'glass-input',
                errors.hours && 'border-red-300 dark:border-red-600 focus:ring-red-500/50'
              )}
              aria-invalid={!!errors.hours}
            />
            {errors.hours && (
              <div className="form-error" role="alert">
                <Info className="h-4 w-4 flex-shrink-0" />
                {errors.hours}
              </div>
            )}
          </FormField>
        </div>
      </div>

      {/* Student Loan Section - SIMPLIFIED */}
      <div className="tax-form-secondary">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Student Loans
          </h3>
        </div>
        
        <div className="student-loan-grid">
          {STUDENT_LOAN_PLANS.map((plan) => (
            <label
              key={plan.value}
              className={cn(
                'student-loan-option',
                input.studentLoanPlans.includes(plan.value as StudentLoanPlan) && 
                'ring-2 ring-indigo-500/50 bg-indigo-500/10'
              )}
            >
              <input
                type="checkbox"
                checked={input.studentLoanPlans.includes(plan.value as StudentLoanPlan)}
                onChange={() => handleStudentLoanChange(plan.value as StudentLoanPlan)}
                className="sr-only"
              />
              <div className="flex-1 text-center">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {plan.label}
                </div>
                {plan.rate && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {plan.rate}
                  </div>
                )}
              </div>
              <div className="checkbox-indicator ml-2">
                {input.studentLoanPlans.includes(plan.value as StudentLoanPlan) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pension Section */}
      <div className="tax-form-secondary">
        <FormField
          id={`${formId}-pension`}
          label="Pension Contribution"
          tooltip="Salary sacrifice reduces both tax and National Insurance"
          error={errors.pension}
        >
          <PensionContributionInput
            id={`${formId}-pension`}
            value={input.pensionContribution}
            type={input.pensionContributionType}
            onChange={(value) => {
              setPensionContribution(value);
              setFormChanged(true);
              if (errors.pension) {
                setErrors(prev => ({ ...prev, pension: '' }));
              }
            }}
            onTypeChange={(type) => {
              setPensionContributionType(type);
              setFormChanged(true);
            }}
            className={errors.pension ? 'border-red-300 dark:border-red-600' : ''}
            aria-invalid={!!errors.pension}
          />
          {errors.pension && (
            <div className="form-error" role="alert">
              <Info className="h-4 w-4 flex-shrink-0" />
              {errors.pension}
            </div>
          )}
        </FormField>
      </div>

      {/* Advanced Options - Progressive Disclosure */}
      <div className="tax-form-secondary">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="collapsible-trigger glass-button w-full flex items-center justify-between p-4"
          aria-expanded={showAdvancedOptions}
          aria-controls={`${formId}-advanced-options`}
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Advanced Tax Options
            </span>
          </div>
          {showAdvancedOptions ? (
            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <div
          id={`${formId}-advanced-options`}
          className={cn(
            'collapsible-content',
            showAdvancedOptions ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
          aria-hidden={!showAdvancedOptions}
        >
          <div className="glass-card p-4 space-y-4">
            <TaxOptionsSelector
              isPensionAge={isPensionAge}
              isMarried={isMarried}
              isBlind={isBlind}
              noNationalInsurance={noNationalInsurance}
              partnerIncome={partnerIncome}
              niCategory={input.niCategory}
              onPensionAgeChange={(age) => {
                setIsPensionAge(age);
                setFormChanged(true);
              }}
              onMarriedChange={(married) => {
                setIsMarried(married);
                setFormChanged(true);
              }}
              onBlindChange={(blind) => {
                setIsBlind(blind);
                setFormChanged(true);
              }}
              onNoNIChange={(noNI) => {
                setNoNationalInsurance(noNI);
                setFormChanged(true);
              }}
              onPartnerIncomeChange={(income) => {
                setPartnerIncome(income);
                setFormChanged(true);
              }}
              onNICategoryChange={(category) => {
                setNiCategory(category);
                setFormChanged(true);
              }}
            />

            <AllowancesInput
              allowances={input.additionalAllowances}
              onChange={(allowances) => {
                setAdditionalAllowances(allowances);
                setFormChanged(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={isCalculating || input.salary <= 0}
          className={cn(
            'glass-button-primary flex-1 flex items-center justify-center gap-3',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
              Calculating...
            </>
          ) : (
            <>
              <BarChart3 className="h-5 w-5" />
              Calculate Tax
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isCalculating}
          className="glass-button flex items-center justify-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Global Error Display */}
      {errors.calculation && (
        <div className="glass-card p-4 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Info className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{errors.calculation}</span>
          </div>
        </div>
      )}

      {/* Form Status Indicator */}
      {formChanged && !isCalculating && (
        <div className="glass-card p-3 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>Values updated. Click "Calculate Tax" to see new results.</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default TaxCalculatorForm;
