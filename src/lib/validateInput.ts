/**
 * Input Validation and Sanitization for Tax Calculator
 * 
 * This module provides comprehensive validation and error handling for all
 * calculator inputs to ensure robust operation with any user input.
 */

import type { TaxCalculationInput } from './taxCalculator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedInput?: TaxCalculationInput;
}

/**
 * Validates and sanitizes calculator input
 */
export function validateCalculatorInput(input: TaxCalculationInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Clone input for sanitization
  const sanitized = { ...input };
  
  // Validate salary
  if (typeof sanitized.salary !== 'number' || isNaN(sanitized.salary)) {
    errors.push('Salary must be a valid number');
  } else if (sanitized.salary < 0) {
    warnings.push('Negative salary detected - calculations may not be meaningful');
  } else if (sanitized.salary > 10000000) {
    warnings.push('Very high salary detected - please verify the amount');
  }
  
  // Validate age
  if (sanitized.age !== undefined) {
    if (typeof sanitized.age !== 'number' || isNaN(sanitized.age)) {
      errors.push('Age must be a valid number');
      sanitized.age = undefined;
    } else if (sanitized.age < 0) {
      warnings.push('Invalid age - age allowances will not apply');
      sanitized.age = undefined;
    } else if (sanitized.age > 120) {
      warnings.push('Unusual age detected - please verify');
    }
  }
  
  // Validate partner's wage
  if (sanitized.isMarried && sanitized.partnerGrossWage < 0) {
    warnings.push('Negative partner wage - marriage allowance will not apply');
    sanitized.partnerGrossWage = 0;
  }
  
  // Validate pension contribution
  if (sanitized.pensionContribution < 0) {
    warnings.push('Negative pension contribution detected');
  } else if (sanitized.pensionContributionType === 'percentage' && sanitized.pensionContribution > 100) {
    warnings.push('Pension contribution exceeds 100% of salary');
  }
  
  // Validate hours per week for hourly pay
  if (sanitized.payPeriod === 'hourly') {
    if (sanitized.hoursPerWeek <= 0) {
      sanitized.hoursPerWeek = 40; // Default to 40 hours
      warnings.push('Invalid hours per week - defaulting to 40 hours');
    } else if (sanitized.hoursPerWeek > 168) {
      warnings.push('Hours per week exceeds 168 (total hours in a week)');
    }
  }
  
  // Validate tax code
  if (!sanitized.taxCode || sanitized.taxCode.trim() === '') {
    sanitized.taxCode = '1257L'; // Default tax code
    warnings.push('No tax code provided - using default 1257L');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedInput: errors.length === 0 ? sanitized : undefined
  };
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Validates tax year format
 */
export function isValidTaxYear(year: string): boolean {
  const pattern = /^\d{4}-\d{4}$/;
  if (!pattern.test(year)) return false;
  
  const [start, end] = year.split('-').map(Number);
  return end === start + 1;
}

/**
 * Validates tax code format
 */
export function isValidTaxCode(code: string): boolean {
  if (!code) return false;
  
  const cleanCode = code.trim().toUpperCase();
  
  // Special codes
  const specialCodes = ['BR', 'D0', 'D1', 'NT', '0T'];
  if (specialCodes.includes(cleanCode)) return true;
  
  // Standard format: optional S prefix, numbers, optional letter suffix
  const standardPattern = /^S?[0-9]+[LMNPTX]?$/;
  
  // K codes (negative allowance)
  const kCodePattern = /^S?K[0-9]+$/;
  
  return standardPattern.test(cleanCode) || kCodePattern.test(cleanCode);
}

/**
 * Sanitizes salary amount
 */
export function sanitizeSalary(salary: any): number {
  if (typeof salary === 'string') {
    // Remove currency symbols and commas
    const cleaned = salary.replace(/[£$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  if (typeof salary === 'number') {
    return isNaN(salary) ? 0 : salary;
  }
  
  return 0;
}

/**
 * Gets error message for invalid input
 */
export function getInputErrorMessage(field: string, value: any): string | null {
  switch (field) {
    case 'salary':
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Please enter a valid salary amount';
      }
      if (value < 0) {
        return 'Salary cannot be negative';
      }
      break;
      
    case 'age':
      if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
        return 'Please enter a valid age';
      }
      if (value < 0 || value > 120) {
        return 'Please enter an age between 0 and 120';
      }
      break;
      
    case 'partnerGrossWage':
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Please enter a valid wage amount';
      }
      if (value < 0) {
        return 'Partner wage cannot be negative';
      }
      break;
      
    case 'pensionContribution':
      if (typeof value !== 'number' || isNaN(value)) {
        return 'Please enter a valid pension amount';
      }
      if (value < 0) {
        return 'Pension contribution cannot be negative';
      }
      break;
      
    case 'hoursPerWeek':
      if (value <= 0) {
        return 'Hours per week must be greater than 0';
      }
      if (value > 168) {
        return 'Hours per week cannot exceed 168';
      }
      break;
      
    case 'taxCode':
      if (!value || value.trim() === '') {
        return 'Please enter a tax code';
      }
      if (!isValidTaxCode(value)) {
        return 'Please enter a valid tax code (e.g., 1257L, BR, S1257L)';
      }
      break;
  }
  
  return null;
}
