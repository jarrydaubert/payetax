// src/components/atoms/TaxOptionsSelector.tsx
// Component for selecting additional tax options with modern styling and accessibility

import type React from 'react';
import { useCallback, useState, useId } from 'react';
import type { NICategory } from '@/constants/taxRates';
import { cn } from '@/lib/utils';
import NumberInput from './NumberInput';

interface TaxOptionsProps {
  /** Whether user is over pension age */
  isPensionAge: boolean;
  /** Whether user is married or in civil partnership */
  isMarried: boolean;
  /** Whether user is registered blind */
  isBlind: boolean;
  /** Whether user is exempt from National Insurance */
  noNationalInsurance: boolean;
  /** Partner's income (for marriage allowance calculations) */
  partnerIncome: number;
  /** NI category for calculations */
  niCategory: NICategory;
  /** Callbacks for option changes */
  onPensionAgeChange: (value: boolean) => void;
  onMarriedChange: (value: boolean) => void;
  onBlindChange: (value: boolean) => void;
  onNoNIChange: (value: boolean) => void;
  onPartnerIncomeChange: (value: number) => void;
  onNICategoryChange: (value: NICategory) => void;
  /** Additional CSS classes */
  className?: string;
  /** ID for the component */
  id?: string;
}

/**
 * Tax options selector component
 * Allows selection of various tax-related circumstances that affect calculations
 */
const TaxOptionsSelector: React.FC<TaxOptionsProps> = ({
  isPensionAge,
  isMarried,
  isBlind,
  noNationalInsurance,
  partnerIncome,
  // Removed niCategory from destructuring since it's not used
  onPensionAgeChange,
  onMarriedChange,
  onBlindChange,
  onNoNIChange,
  onPartnerIncomeChange,
  onNICategoryChange,
  className,
  id,
}) => {
  // State for managing section expansion
  const [expanded, setExpanded] = useState(true);

  // Generate unique IDs for accessibility using React's useId hook
  const uniqueId = useId();
  const groupId = id || `tax-options-${uniqueId}`;
  const optionPrefix = `${groupId}-option`;
  const partnerIncomeId = `${groupId}-partner-income`;
  const expandButtonId = `${groupId}-expand`;
  const contentId = `${groupId}-content`;

  // Update NI category when options change - optimized with useCallback
  const updateNICategory = useCallback(
    (pensionAge: boolean, noNI: boolean) => {
      // Determine correct NI category based on options
      if (noNI || pensionAge) {
        onNICategoryChange('C'); // No NI or Pension Age
      } else {
        onNICategoryChange('A'); // Standard
      }
    },
    [onNICategoryChange]
  );

  // Handle option changes - optimized with useCallback
  const handlePensionAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      onPensionAgeChange(newValue);
      updateNICategory(newValue, noNationalInsurance);
    },
    [onPensionAgeChange, updateNICategory, noNationalInsurance]
  );

  const handleNoNIChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      onNoNIChange(newValue);
      updateNICategory(isPensionAge, newValue);
    },
    [onNoNIChange, updateNICategory, isPensionAge]
  );

  const handleMarriedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onMarriedChange(e.target.checked);
    },
    [onMarriedChange]
  );

  const handleBlindChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onBlindChange(e.target.checked);
    },
    [onBlindChange]
  );

  // Toggle expanded state - optimized with useCallback
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toggle button for expanding/collapsing */}
      <button
        type="button"
        id={expandButtonId}
        onClick={toggleExpanded}
        className={cn(
          'text-sm font-medium flex items-center justify-between w-full',
          'bg-glass backdrop-blur-glass-sm p-3 rounded-lg border-glass shadow-glass-sm',
          'focus:outline-none focus:ring-1 focus:ring-primary',
          'transition-all duration-200'
        )}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <span className="text-foreground">Tax Options & Circumstances</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            'h-4 w-4 text-foreground/70 transition-transform duration-200',
            expanded ? 'transform rotate-180' : ''
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options section with smooth height transition */}
      <div
        id={contentId}
        className={cn(
          'space-y-3 overflow-hidden transition-all duration-300',
          expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!expanded}
      >
        <fieldset
          className="bg-glass backdrop-blur-glass-sm rounded-lg p-4 border-glass shadow-glass-sm space-y-3"
          aria-labelledby={expandButtonId}
        >
          <legend className="sr-only">Tax circumstances options</legend>

          {/* Pension Age Option */}
          <div className="flex items-start">
            <div className="relative flex items-center h-5 mt-0.5">
              <input
                id={`${optionPrefix}-pension-age`}
                type="checkbox"
                checked={isPensionAge}
                onChange={handlePensionAgeChange}
                className="opacity-0 absolute h-4 w-4 cursor-pointer z-10"
                aria-describedby={`${optionPrefix}-pension-age-description`}
              />
              <div
                className={cn(
                  'h-4 w-4 rounded border transition-colors duration-200',
                  // Better visibility in both light and dark modes
                  'border-gray-400 dark:border-glass',
                  isPensionAge
                    ? 'bg-primary border-primary'
                    : 'bg-white/90 dark:bg-glass-deep'
                )}
                aria-hidden="true"
              >
                {isPensionAge && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mx-auto text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <label
                htmlFor={`${optionPrefix}-pension-age`}
                className="font-medium text-foreground cursor-pointer"
              >
                Over State Pension Age
              </label>
              <p
                id={`${optionPrefix}-pension-age-description`}
                className="text-foreground/70 text-xs mt-0.5"
              >
                No National Insurance if over 66 (HMRC rule)
              </p>
            </div>
          </div>

          {/* Marriage/Civil Partnership Option */}
          <div className="flex items-start">
            <div className="relative flex items-center h-5 mt-0.5">
              <input
                id={`${optionPrefix}-married`}
                type="checkbox"
                checked={isMarried}
                onChange={handleMarriedChange}
                className="opacity-0 absolute h-4 w-4 cursor-pointer z-10"
                aria-describedby={`${optionPrefix}-married-description`}
              />
              <div
                className={cn(
                  'h-4 w-4 rounded border transition-colors duration-200',
                  'border-gray-400 dark:border-glass',
                  isMarried
                    ? 'bg-primary border-primary'
                    : 'bg-white/90 dark:bg-glass-deep'
                )}
                aria-hidden="true"
              >
                {isMarried && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mx-auto text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <label
                htmlFor={`${optionPrefix}-married`}
                className="font-medium text-foreground cursor-pointer"
              >
                Marriage/Civil Partnership Allowance
              </label>
              <p
                id={`${optionPrefix}-married-description`}
                className="text-foreground/70 text-xs mt-0.5"
              >
                May qualify for additional allowance transfer of £252 (HMRC rule)
              </p>
            </div>
          </div>

          {/* Blind Person's Allowance Option */}
          <div className="flex items-start">
            <div className="relative flex items-center h-5 mt-0.5">
              <input
                id={`${optionPrefix}-blind`}
                type="checkbox"
                checked={isBlind}
                onChange={handleBlindChange}
                className="opacity-0 absolute h-4 w-4 cursor-pointer z-10"
                aria-describedby={`${optionPrefix}-blind-description`}
              />
              <div
                className={cn(
                  'h-4 w-4 rounded border transition-colors duration-200',
                  'border-gray-400 dark:border-glass',
                  isBlind
                    ? 'bg-primary border-primary'
                    : 'bg-white/90 dark:bg-glass-deep'
                )}
                aria-hidden="true"
              >
                {isBlind && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mx-auto text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <label
                htmlFor={`${optionPrefix}-blind`}
                className="font-medium text-foreground cursor-pointer"
              >
                {"Blind Person's Allowance"}
              </label>
              <p
                id={`${optionPrefix}-blind-description`}
                className="text-foreground/70 text-xs mt-0.5"
              >
                Extra £3,070 allowance for registered blind persons (HMRC rule)
              </p>
            </div>
          </div>

          {/* No National Insurance Option */}
          <div className="flex items-start">
            <div className="relative flex items-center h-5 mt-0.5">
              <input
                id={`${optionPrefix}-no-ni`}
                type="checkbox"
                checked={noNationalInsurance}
                onChange={handleNoNIChange}
                className="opacity-0 absolute h-4 w-4 cursor-pointer z-10"
                aria-describedby={`${optionPrefix}-no-ni-description`}
              />
              <div
                className={cn(
                  'h-4 w-4 rounded border transition-colors duration-200',
                  'border-gray-400 dark:border-glass',
                  noNationalInsurance
                    ? 'bg-primary border-primary'
                    : 'bg-white/90 dark:bg-glass-deep'
                )}
                aria-hidden="true"
              >
                {noNationalInsurance && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mx-auto text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <label
                htmlFor={`${optionPrefix}-no-ni`}
                className="font-medium text-foreground cursor-pointer"
              >
                No National Insurance
              </label>
              <p
                id={`${optionPrefix}-no-ni-description`}
                className="text-foreground/70 text-xs mt-0.5"
              >
                Exempt from NI contributions (special circumstances under HMRC rules)
              </p>
            </div>
          </div>

          {/* Partner Income Input - only visible when married */}
          {isMarried && (
            <div className="border-t border-glass pt-3">
              <NumberInput
                id={partnerIncomeId}
                value={partnerIncome}
                onChange={onPartnerIncomeChange}
                prefix="£"
                clearOnFocus
                className="w-full"
                placeholder="0"
                aria-label="Partner's annual income"
                aria-describedby={`${partnerIncomeId}-description`}
              />
              <p
                id={`${partnerIncomeId}-description`}
                className="text-foreground/70 text-xs mt-1"
              >
                Partner's annual income (for marriage allowance calculations)
              </p>
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
};

export default TaxOptionsSelector;
