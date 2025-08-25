// src/lib/iconMapping.ts
/**
 * FontAwesome to Lucide React icon mapping
 * Based on analysis of toolhubx-live components
 */

import {
  ArrowUpDown,
  Banknote,
  Building2,
  ChevronDown,
  CreditCard,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  HandCoins,
  Heart,
  Percent,
  PiggyBank,
  Printer,
  Receipt,
  Scale,
  Shield,
  Table,
  Wallet,
} from 'lucide-react';

/**
 * Tax table icons mapping from toolhubx-live FontAwesome to Lucide
 */
export const TAX_TABLE_ICONS = {
  // Header
  table: Table, // fas fa-table

  // Income & Profit
  profitBeforeTax: Banknote, // fas fa-money-bill-wave
  grossPay: Banknote, // fas fa-money-bill-wave

  // Taxes & Deductions
  corporationTax: HandCoins, // fas fa-hand-holding-usd
  totalTaxDue: HandCoins, // fas fa-hand-holding-usd
  incomeTax: HandCoins, // fas fa-hand-holding-usd
  taxBandRate: Percent, // fas fa-percentage

  // National Insurance
  employerNI: CreditCard, // fas fa-id-card
  nationalInsurance: CreditCard, // fas fa-id-card

  // Other taxes
  vat: Receipt, // fas fa-receipt
  dividendTax: FileText, // fas fa-money-check-alt

  // Allowances & Benefits
  taxFreeAllowance: Shield, // fas fa-shield-alt
  totalTaxable: Scale, // fas fa-balance-scale
  marriageAllowance: Heart, // fas fa-ring
  allowancesDeductions: HandCoins, // fas fa-hand-holding-usd

  // Pension
  pension: PiggyBank, // fas fa-piggy-bank
  hmrcRelief: Heart, // fas fa-hand-holding-heart

  // Final results
  netProfit: Wallet, // fas fa-wallet
  netPay: Wallet, // fas fa-wallet

  // Employer costs
  employersNI: Building2, // fas fa-building

  // Comparisons
  netChange: ArrowUpDown, // fas fa-exchange-alt

  // Export icons
  download: Download,
  chevronDown: ChevronDown,
  fileSpreadsheet: FileSpreadsheet,
  fileText: FileText,
  database: Database,
  printer: Printer,
} as const;

/**
 * Get icon component by category name
 * Provides fallback to ensure we always have an icon
 */
export const getIconForCategory = (category: string) => {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z]/g, '');

  // Direct mappings
  const categoryMappings: Record<string, keyof typeof TAX_TABLE_ICONS> = {
    // Income
    grosspay: 'grossPay',
    profitbeforetax: 'profitBeforeTax',

    // Allowances
    taxfreeallowance: 'taxFreeAllowance',
    totaltaxable: 'totalTaxable',
    allowancesdeductions: 'allowancesDeductions',

    // Taxes
    totaltaxdue: 'totalTaxDue',
    incometax: 'incomeTax',
    corporationtax: 'corporationTax',
    rate: 'taxBandRate', // For tax band rates

    // National Insurance
    nationalinsurance: 'nationalInsurance',
    employerni: 'employerNI',
    employersni: 'employersNI',

    // Pension
    pensionyou: 'pension',
    pension: 'pension',
    hmrcrelief: 'hmrcRelief',

    // Benefits
    marriageallowance: 'marriageAllowance',

    // Final results
    netpay: 'netPay',
    netprofit: 'netProfit',

    // Comparisons
    netchange: 'netChange',
    netchangefrompreviousyear: 'netChange',

    // Other
    vat: 'vat',
    studentloan: 'fileText',
    studentloans: 'fileText',
  };

  const mappedIcon = categoryMappings[normalizedCategory];
  return mappedIcon ? TAX_TABLE_ICONS[mappedIcon] : TAX_TABLE_ICONS.table; // Fallback to table icon
};

/**
 * Color mapping for different categories (exact from toolhubx-live)
 */
export const TAX_COLORS = {
  // Taxes and deductions (red)
  taxes: 'text-red-400',
  corporationTax: 'text-red-400',
  totalTaxDue: 'text-red-400',
  incomeTax: 'text-red-400',
  taxBands: 'text-red-400',

  // National Insurance (yellow)
  nationalInsurance: 'text-yellow-400',
  employerNI: 'text-yellow-400',

  // Pension (purple)
  pension: 'text-purple-400',
  hmrcRelief: 'text-purple-400',

  // Net pay and positive amounts (green)
  netPay: 'text-green-400',
  netProfit: 'text-green-400',
  marriageAllowance: 'text-green-400',

  // Employer costs (gray)
  employersNI: 'text-gray-400',

  // Year-over-year changes (blue)
  netChange: 'text-blue-400',

  // VAT and other taxes (orange)
  vat: 'text-orange-400',

  // Allowances (teal)
  allowancesDeductions: 'text-teal-400',

  // Default categories (white)
  default: 'text-white',
} as const;

/**
 * Get color class for category
 */
export const getColorForCategory = (category: string): string => {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z]/g, '');

  // Category to color mapping
  if (
    normalizedCategory.includes('tax') &&
    !normalizedCategory.includes('free') &&
    !normalizedCategory.includes('taxable')
  ) {
    return TAX_COLORS.taxes;
  }

  if (
    normalizedCategory.includes('nationalinsurance') ||
    normalizedCategory.includes('employerni')
  ) {
    return TAX_COLORS.nationalInsurance;
  }

  if (normalizedCategory.includes('pension')) {
    return normalizedCategory.includes('hmrc') ? TAX_COLORS.hmrcRelief : TAX_COLORS.pension;
  }

  if (normalizedCategory.includes('netpay') || normalizedCategory.includes('netprofit')) {
    return TAX_COLORS.netPay;
  }

  if (normalizedCategory.includes('employersni')) {
    return TAX_COLORS.employersNI;
  }

  if (normalizedCategory.includes('netchange')) {
    return TAX_COLORS.netChange;
  }

  if (normalizedCategory.includes('vat')) {
    return TAX_COLORS.vat;
  }

  if (normalizedCategory.includes('allowances') || normalizedCategory.includes('deductions')) {
    return TAX_COLORS.allowancesDeductions;
  }

  if (normalizedCategory.includes('marriage')) {
    return TAX_COLORS.marriageAllowance;
  }

  return TAX_COLORS.default;
};
