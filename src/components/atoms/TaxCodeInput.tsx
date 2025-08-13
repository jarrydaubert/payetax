// src/components/atoms/TaxCodeInput.tsx
/**
 * Enhanced Tax Code Input with robust validation and formatting
 * 
 * FEATURES:
 * ✅ Auto-uppercase conversion (lowercase → UPPERCASE)
 * ✅ Format validation (1257L, S1257L, etc.)
 * ✅ Default fallback to 1257L if invalid/empty
 * ✅ Scottish tax code detection (S prefix)
 * ✅ Real-time validation feedback
 * ✅ Accessibility compliance
 * ✅ Visual feedback for valid/invalid states
 */

'use client';

import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TaxCodeInputProps {
  /** Current tax code value */
  value: string;
  /** Callback when tax code changes */
  onChange: (taxCode: string, isScottish: boolean) => void;
  /** Optional callback when Scottish status changes */
  onScottishChange?: (isScottish: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Input ID for accessibility */
  id?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Tax code validation patterns and utilities
 */
const TAX_CODE_PATTERNS = {
  // Standard patterns: 1257L, 1257M, BR, D0, etc.
  STANDARD: /^(\d{1,4}[LMNPTY]|BR|D[01]|0T|NT|C\d{1,4}|K\d{1,4})$/,
  // Scottish patterns: S1257L, S1257M, etc.
  SCOTTISH: /^S(\d{1,4}[LMNPTY]|BR|D[01]|0T)$/,
  // Emergency codes
  EMERGENCY: /^(BR|D[01]|0T|NT)$/,
};

const DEFAULT_TAX_CODE = '1257L';
const DEFAULT_SCOTTISH_TAX_CODE = 'S1257L';

/**
 * Common tax code suffixes and their meanings
 */
const TAX_CODE_INFO = {
  L: 'Standard personal allowance',
  M: 'Marriage allowance received',
  N: 'Marriage allowance transferred',
  T: 'Review needed',
  Y: 'Born before 6 April 1938',
  P: 'Age allowance (65-74)',
  BR: 'Basic rate (20%) on all income',
  D0: 'Higher rate (40%) on all income',
  D1: 'Additional rate (45%) on all income',
  NT: 'No tax deducted',
  '0T': 'Personal allowance used up',
} as const;

/**
 * Validate and normalize tax code
 */
function validateTaxCode(input: string): {
  isValid: boolean;
  normalizedCode: string;
  isScottish: boolean;
  isEmergency: boolean;
  suffix: string;
  message?: string;
} {
  // Handle empty input
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      normalizedCode: DEFAULT_TAX_CODE,
      isScottish: false,
      isEmergency: false,
      suffix: 'L',
      message: 'Using default tax code 1257L',
    };
  }

  // Normalize: trim and uppercase
  const normalized = input.trim().toUpperCase();
  
  // Check if Scottish (starts with S)
  const isScottish = normalized.startsWith('S');
  const codeWithoutS = isScottish ? normalized.substring(1) : normalized;
  
  // Validate pattern
  const isStandardValid = TAX_CODE_PATTERNS.STANDARD.test(normalized);
  const isScottishValid = isScottish && TAX_CODE_PATTERNS.SCOTTISH.test(normalized);
  const isValid = isStandardValid || isScottishValid;
  
  // Check if emergency code
  const isEmergency = TAX_CODE_PATTERNS.EMERGENCY.test(codeWithoutS);
  
  // Extract suffix for information
  const suffix = codeWithoutS.match(/[LMNPTY]$/)?.[0] || 
                 codeWithoutS.match(/^(BR|D[01]|0T|NT)$/)?.[0] || '';

  if (!isValid) {
    // Return default based on Scottish preference
    const defaultCode = isScottish ? DEFAULT_SCOTTISH_TAX_CODE : DEFAULT_TAX_CODE;
    return {
      isValid: false,
      normalizedCode: defaultCode,
      isScottish: isScottish,
      isEmergency: false,
      suffix: 'L',
      message: `Invalid format. Using default: ${defaultCode}`,
    };
  }

  return {
    isValid: true,
    normalizedCode: normalized,
    isScottish,
    isEmergency,
    suffix,
  };
}

/**
 * Enhanced tax code input component with validation and formatting
 */
const TaxCodeInput: React.FC<TaxCodeInputProps> = ({
  value,
  onChange,
  onScottishChange,
  className,
  id,
  disabled = false,
  placeholder = '1257L',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [validationState, setValidationState] = useState(() => validateTaxCode(value));
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle input change with real-time validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate and format
    const validation = validateTaxCode(newValue);
    setValidationState(validation);

    // Always call onChange with normalized value
    onChange(validation.normalizedCode, validation.isScottish);
    
    if (onScottishChange) {
      onScottishChange(validation.isScottish);
    }
  }, [onChange, onScottishChange]);

  // Handle blur - apply final formatting
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setInputValue(validationState.normalizedCode);
  }, [validationState.normalizedCode]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    if (value !== inputValue && !isFocused) {
      setInputValue(value);
      setValidationState(validateTaxCode(value));
    }
  }, [value, inputValue, isFocused]);

  // Get validation styling
  const getValidationStyle = () => {
    if (!inputValue.trim()) return '';
    
    if (validationState.isValid) {
      return 'border-green-300 dark:border-green-600 focus:ring-green-500/50';
    } else {
      return 'border-red-300 dark:border-red-600 focus:ring-red-500/50';
    }
  };

  // Get suffix information
  const getSuffixInfo = () => {
    const info = TAX_CODE_INFO[validationState.suffix as keyof typeof TAX_CODE_INFO];
    return info || null;
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'glass-input w-full pr-10',
            getValidationStyle(),
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          aria-invalid={!validationState.isValid}
          aria-describedby={`${id}-validation ${id}-help`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />

        {/* Validation Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {inputValue.trim() && (
            <>
              {validationState.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </>
          )}
        </div>

        {/* Scottish Indicator */}
        {validationState.isScottish && validationState.isValid && (
          <div className="absolute -top-2 left-3 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
            Scottish
          </div>
        )}
      </div>

      {/* Validation Message */}
      <div id={`${id}-validation`} className="mt-1 min-h-[1.25rem]">
        {validationState.message && (
          <div className={cn(
            'text-xs flex items-center gap-1',
            validationState.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            <Info className="h-3 w-3 flex-shrink-0" />
            {validationState.message}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div id={`${id}-help`} className="mt-1">
        {getSuffixInfo() && validationState.isValid && (
          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Info className="h-3 w-3 flex-shrink-0" />
            <span>{validationState.suffix}: {getSuffixInfo()}</span>
          </div>
        )}
      </div>

      {/* Interactive Tooltip for Emergency Codes */}
      {validationState.isEmergency && validationState.isValid && (
        <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-700 dark:text-orange-300">
              <strong>Emergency Tax Code:</strong> This code may result in higher tax deductions. 
              Contact HMRC or your employer to get your correct tax code.
            </div>
          </div>
        </div>
      )}

      {/* Examples Helper (shown on focus when empty) */}
      {isFocused && !inputValue.trim() && (
        <div className="absolute z-10 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-full">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="font-medium mb-2">Common tax codes:</div>
            <div className="grid grid-cols-2 gap-1">
              <div>1257L - Standard</div>
              <div>S1257L - Scottish</div>
              <div>1257M - Marriage allowance</div>
              <div>BR - Basic rate</div>
              <div>0T - No allowance</div>
              <div>NT - No tax</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCodeInput;
