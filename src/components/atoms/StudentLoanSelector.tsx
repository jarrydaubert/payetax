// src/components/atoms/StudentLoanSelector.tsx
// Modern component for selecting student loan plans with clean design and accessibility

import { Info } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { StudentLoanPlan } from '@/constants/taxRates';
import { cn } from '@/lib/utils';

interface StudentLoanSelectorProps {
  /** Currently selected student loan plans */
  selectedPlans: StudentLoanPlan[];
  /** Callback when selected plans change */
  onChange: (plans: StudentLoanPlan[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** ID for the component */
  id?: string;
}

/**
 * Student loan plan information with thresholds and descriptions
 * Enhanced with accessible properties for screen readers
 */
const STUDENT_LOAN_PLANS = [
  {
    value: 'plan1',
    label: 'Plan 1',
    description: 'Started before September 1, 2012 in England/Wales, or from Northern Ireland',
    threshold: '£22,015 per year',
    rate: '9%',
  },
  {
    value: 'plan2',
    label: 'Plan 2',
    description: 'Started after September 1, 2012 in England/Wales',
    threshold: '£27,295 per year',
    rate: '9%',
  },
  {
    value: 'plan4',
    label: 'Plan 4',
    description: 'Students from Scotland',
    threshold: '£27,660 per year',
    rate: '9%',
  },
  {
    value: 'plan5',
    label: 'Plan 5',
    description: 'Started after August 1, 2023 in England/Wales',
    threshold: '£25,000 per year',
    rate: '9%',
  },
  {
    value: 'postgrad',
    label: 'Postgrad',
    description: 'UK Postgraduate loan',
    threshold: '£21,000 per year',
    rate: '6%',
  },
] as const;

/**
 * Student loan plan selector component
 * Allows selection of multiple student loan plans with information tooltip
 */
const StudentLoanSelector: React.FC<StudentLoanSelectorProps> = ({
  selectedPlans,
  onChange,
  className,
  disabled = false,
  id,
}) => {
  // State for showing info tooltip
  const [showInfo, setShowInfo] = useState(false);

  // Generate unique IDs for accessibility
  const groupId = id || `student-loan-selector-${Math.random().toString(36).substring(2, 9)}`;
  const infoId = `${groupId}-info`;
  const infoButtonId = `${groupId}-info-button`;

  // Maintain memo-ized array of values from plans for quick lookup
  const _planValues = useMemo(() => STUDENT_LOAN_PLANS.map((plan) => plan.value), []);

  // Handle checkbox change - optimized with useCallback
  const handlePlanChange = useCallback(
    (plan: StudentLoanPlan) => {
      if (disabled) return;

      let newSelectedPlans = [...selectedPlans];

      // Toggle the selected plan
      if (newSelectedPlans.includes(plan)) {
        newSelectedPlans = newSelectedPlans.filter((p) => p !== plan);
      } else {
        newSelectedPlans = [...newSelectedPlans, plan];
      }

      // If no plans are selected, default to 'none'
      if (newSelectedPlans.length === 0) {
        onChange(['none']);
      } else {
        // Make sure 'none' is not in the list if we have actual plans
        onChange(newSelectedPlans.filter((p) => p !== 'none'));
      }
    },
    [disabled, selectedPlans, onChange]
  );

  // Toggle info panel - optimized with useCallback
  const toggleInfo = useCallback(() => {
    setShowInfo((prev) => !prev);
  }, []);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Checkbox layout with modern styling and accessibility */}
      <fieldset
        className='rounded-lg border-glass bg-glass p-3 shadow-glass-sm backdrop-blur-glass-sm transition-all duration-200'
        id={groupId}
        aria-describedby={showInfo ? infoId : undefined}
        disabled={disabled}
      >
        <legend className='sr-only'>Student Loan Plans</legend>
        <div className='flex flex-wrap gap-3'>
          {STUDENT_LOAN_PLANS.map((plan) => {
            const checkboxId = `${groupId}-${plan.value}`;
            return (
              <div key={plan.value} className='flex items-center'>
                <div className='relative'>
                  <input
                    id={checkboxId}
                    name={`student-loan-${plan.value}`}
                    type='checkbox'
                    checked={selectedPlans.includes(plan.value)}
                    onChange={() => handlePlanChange(plan.value)}
                    disabled={disabled}
                    className={cn(
                      'h-4 w-4 rounded border-border text-primary transition-colors focus:ring-primary',
                      'absolute inset-0 z-10 cursor-pointer opacity-0'
                    )}
                    aria-describedby={showInfo ? infoId : undefined}
                  />
                  {/* Custom styled checkbox */}
                  <div
                    className={cn(
                      'h-4 w-4 rounded border transition-colors duration-200',
                      // Better visibility in both light and dark modes
                      'border-gray-400 dark:border-glass',
                      selectedPlans.includes(plan.value)
                        ? 'border-primary bg-primary'
                        : 'bg-white/90 dark:bg-glass-deep'
                    )}
                    aria-hidden='true'
                  >
                    {selectedPlans.includes(plan.value) && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='mx-auto h-3 w-3 text-white'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    'ml-2 cursor-pointer whitespace-nowrap text-sm',
                    disabled
                      ? 'opacity-70'
                      : 'transition-colors duration-200 hover:text-foreground',
                    selectedPlans.includes(plan.value)
                      ? 'font-medium text-foreground'
                      : 'text-foreground/80'
                  )}
                >
                  {plan.label}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Information button and popup */}
      <div className='relative'>
        <button
          type='button'
          id={infoButtonId}
          onClick={toggleInfo}
          className={cn(
            'flex items-center text-xs transition-colors duration-200',
            'rounded focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2',
            showInfo ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
          )}
          aria-expanded={showInfo}
          aria-controls={infoId}
          aria-label='View student loan repayment thresholds'
        >
          <div
            className={cn(
              'mr-1.5 rounded-full p-1.5 transition-colors duration-200',
              showInfo ? 'bg-primary/10' : 'bg-glass hover:bg-glass-deep'
            )}
          >
            <Info className='h-3 w-3' aria-hidden='true' />
          </div>
          <span className='underline-offset-2 hover:underline'>
            View student loan repayment thresholds
          </span>
        </button>

        {showInfo && (
          <section
            id={infoId}
            className={cn(
              'absolute right-0 left-0 z-10 mt-3 animate-fade-in rounded-lg bg-glass p-4 text-xs backdrop-blur-glass-sm',
              'border-glass shadow-glass'
            )}
            aria-live='polite'
          >
            <h4 className='mb-3 border-glass border-b pb-2 font-medium text-foreground/90'>
              Student Loan Repayment Thresholds
            </h4>
            <div className='space-y-2.5'>
              {STUDENT_LOAN_PLANS.map((plan) => (
                <div key={plan.value} className='flex items-center justify-between'>
                  <div>
                    <span className='font-medium text-foreground'>{plan.label}:</span>
                    <span className='ml-1.5 text-foreground/70 text-xs'>{plan.description}</span>
                  </div>
                  <span className='ml-2 rounded-full bg-glass-deep px-2 py-0.5 text-right font-medium text-primary'>
                    {plan.threshold}
                  </span>
                </div>
              ))}
            </div>
            <p className='mt-3 rounded bg-glass-deep p-2 text-foreground/70'>
              You pay {STUDENT_LOAN_PLANS[0].rate} of income above these thresholds (
              {STUDENT_LOAN_PLANS[4].rate} for Postgraduate loans).
            </p>
          </section>
        )}
      </div>

      {/* Selected plans summary - simplified design */}
      {selectedPlans.length > 0 && selectedPlans[0] !== 'none' && (
        <div className='relative animate-fade-in overflow-hidden rounded-md bg-glass-deep p-3 text-foreground/80 text-xs'>
          {/* Left accent border */}
          <div
            className='absolute inset-y-0 left-0 w-1 rounded-l-md bg-primary/20'
            aria-hidden='true'
          />
          <div className='pl-2'>
            {selectedPlans.length > 1 ? (
              <span>
                You have selected <strong>{selectedPlans.length}</strong> student loan plans.
                Repayments will be calculated for each plan.
              </span>
            ) : (
              <span>
                You have selected{' '}
                <strong>
                  {STUDENT_LOAN_PLANS.find((p) => p.value === selectedPlans[0])?.label || 'a plan'}
                </strong>
                .
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLoanSelector;
