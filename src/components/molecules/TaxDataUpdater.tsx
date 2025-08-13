'use client';

import { useEffect } from 'react';
import { SCOTTISH_PREFIX, SCOTTISH_TAX_RATES, TAX_RATES, type TaxYear } from '@/constants/taxRates';
import { useCalculatorStore } from '@/store/calculatorStore';

/**
 * Component to ensure tax data is correctly loaded and updated in the calculator store
 * This keeps the UI components in sync with the latest tax rates
 */
export default function TaxDataUpdater() {
  const { input, updateTaxRates, updateScottishRates, updateNIRates } = useCalculatorStore();

  // Update tax rates whenever the tax year or Scottish status changes
  useEffect(() => {
    if (!input.taxYear) return;

    const currentYear = input.taxYear as TaxYear;

    // Determine if using Scottish rates
    const isScottish = input.isScottish || input.taxCode.startsWith(SCOTTISH_PREFIX);

    // Get appropriate rates
    const taxRates = isScottish ? SCOTTISH_TAX_RATES[currentYear] : TAX_RATES[currentYear];

    const niRates = TAX_RATES[currentYear].nationalInsurance;

    // Update general tax rates
    updateTaxRates({
      personalAllowance: taxRates.personalAllowance,
      personalAllowanceReductionThreshold: taxRates.personalAllowanceReductionThreshold,
      personalAllowanceReductionRate: taxRates.personalAllowanceReductionRate,
      marriageAllowance: TAX_RATES[currentYear].marriageAllowance,
      blindPersonsAllowance: TAX_RATES[currentYear].blindPersonsAllowance,
    });

    // Update Scottish rates if applicable
    if (isScottish) {
      updateScottishRates(taxRates.bands);
    } else {
      // Update standard rates
      updateTaxRates({
        bands: TAX_RATES[currentYear].bands,
      });
    }

    // Update NI rates
    if (niRates?.employee?.[input.niCategory]) {
      updateNIRates(niRates.employee[input.niCategory]);
    }
  }, [
    input.taxYear,
    input.isScottish,
    input.taxCode,
    input.niCategory,
    updateTaxRates,
    updateScottishRates,
    updateNIRates,
  ]);

  // This component doesn't render anything visible
  return null;
}
