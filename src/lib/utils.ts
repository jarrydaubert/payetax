// src/lib/utils.ts
// Utility functions for formatting, calculations, and common operations

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple Tailwind CSS classes and conditionally applies them
 * using the clsx and tailwind-merge libraries.
 *
 * @param inputs - Class values to be combined
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string using GBP format.
 *
 * @param amount - The number to format
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns Formatted currency string with GBP symbol
 */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats a number with thousand separators using en-GB locale.
 *
 * @param amount - The number to format
 * @param decimals - Number of decimal places to display (default: 0)
 * @returns Formatted number string with thousand separators
 */
export function formatNumber(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats a number as a percentage string.
 *
 * @param value - The value to format as percentage (e.g., 25 for 25%)
 * @param decimals - Number of decimal places to display (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Clears input value when focused. Used for better UX in numeric inputs.
 *
 * @param e - Focus event from input element
 */
export function clearOnFocus(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.value = '';
}

/**
 * Formats input value with proper number formatting.
 * Removes non-numeric characters and adds thousand separators.
 *
 * @param value - The input string to format
 * @returns Formatted number string
 */
export function formatInputValue(value: string): string {
  // Remove all non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '');

  // Parse as a number and format with commas
  const num = Number.parseFloat(numericValue);

  if (Number.isNaN(num)) {
    return '';
  }

  return formatNumber(num, numericValue.includes('.') ? 2 : 0);
}

/**
 * Parses a formatted input value back to a number.
 * Handles comma-separated numbers and returns a numeric value.
 *
 * @param value - The formatted string to parse
 * @returns Parsed number value (or 0 if invalid)
 */
export function parseFormattedValue(value: string): number {
  // Remove thousand separators (commas) first
  // Then remove all non-numeric characters except decimal point
  const numericValue = value.replace(/,/g, '').replace(/[^\d.]/g, '');
  const num = Number.parseFloat(numericValue);

  return Number.isNaN(num) ? 0 : num;
}

/**
 * Generates a color for tax breakdown visualization based on index.
 * Provides different colors for light and dark mode.
 *
 * @param index - Index of the band or section
 * @param isDarkMode - Whether dark mode is active
 * @returns CSS color string for the specified index
 */
export function getTaxBandColor(index: number, isDarkMode: boolean): string {
  const baseColors = isDarkMode
    ? [
        'rgba(59, 130, 246, 0.9)', // blue-500 with alpha
        'rgba(99, 102, 241, 0.9)', // indigo-500 with alpha
        'rgba(139, 92, 246, 0.9)', // purple-500 with alpha
        'rgba(236, 72, 153, 0.9)', // pink-500 with alpha
      ]
    : [
        'rgba(59, 130, 246, 0.7)', // blue-500 with alpha
        'rgba(99, 102, 241, 0.7)', // indigo-500 with alpha
        'rgba(139, 92, 246, 0.7)', // purple-500 with alpha
        'rgba(236, 72, 153, 0.7)', // pink-500 with alpha
      ];

  // Cycle through colors for indices beyond array length
  return baseColors[index % baseColors.length] ?? baseColors[0] ?? '#000000';
}

/**
 * Formats an ISO date string to a localized date string.
 *
 * @param dateString - ISO date string to format
 * @param locale - Locale for formatting (default: en-GB)
 * @returns Formatted date string (e.g., "26 April 2025")
 */
export function formatDate(dateString: string, locale = 'en-GB'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
