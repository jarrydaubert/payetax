'use client';

import * as React from 'react';
import { MarriageAllowanceAlert } from '@/components/molecules/MarriageAllowanceAlert';
import { TaxTrapInlineAlert } from '@/components/molecules/TaxTrapInlineAlert';
import { calculateOptimalPension } from '@/lib/pensionOptimizer';
import { CURRENT_TAX_YEAR, parseTaxCode, TAX_RATES, type TaxYear } from '@/lib/tax';
import type { TaxCalculationResults } from '@/lib/types/calculator';

interface CalculatorInsightsProps {
  results: TaxCalculationResults;
  taxYear?: string;
  onApplyPensionOptimization?: (amount: number) => void;
  marriageAllowance?: {
    isMarried?: boolean;
    partnerGrossWage?: number;
    taxCode?: string;
    isScottish?: boolean;
  };
}

export function CalculatorInsights({
  results,
  taxYear,
  onApplyPensionOptimization,
  marriageAllowance,
}: CalculatorInsightsProps) {
  const {
    isMarried = false,
    partnerGrossWage = 0,
    taxCode = '1257L',
    isScottish = false,
  } = marriageAllowance ?? {};
  // Tax trap detection - pass current pension to check if trap is already avoided
  const taxTrapOptimization = React.useMemo(() => {
    return calculateOptimalPension(
      results.grossSalary.annually,
      results.pensionContribution.annually,
    );
  }, [results.grossSalary.annually, results.pensionContribution.annually]);

  // Marriage allowance eligibility check
  const marriageAllowanceEligible = React.useMemo(() => {
    // Must be married - partnerGrossWage can be 0 (that's a valid eligible case!)
    if (!isMarried) return false;
    if (partnerGrossWage == null) return false;

    // M and N both mean the code already reflects a Marriage Allowance transfer.
    // M1 is an unrelated non-cumulative marker and must not suppress this UI.
    const parsedTaxCode = parseTaxCode(taxCode, 0);
    const hasMarriageCode = parsedTaxCode.letter === 'M' || parsedTaxCode.letter === 'N';
    if (hasMarriageCode) return false;

    // Get tax constants for the current year
    const taxConstants = TAX_RATES[(taxYear || CURRENT_TAX_YEAR) as TaxYear];
    const basicBand = taxConstants?.bands[0];
    if (!(taxConstants && basicBand)) return false;
    const personalAllowance = taxConstants.personalAllowance;
    const basicRateUpper = personalAllowance + basicBand.threshold;

    // Partner must earn less than Personal Allowance
    if (partnerGrossWage >= personalAllowance) return false;

    // User must be a basic rate taxpayer
    const userSalary = results.grossSalary.annually;
    if (userSalary <= personalAllowance || userSalary > basicRateUpper) return false;

    // User is eligible!
    return true;
  }, [isMarried, partnerGrossWage, taxCode, results.grossSalary.annually, taxYear]);

  const insights = (
    <>
      {taxTrapOptimization && onApplyPensionOptimization && (
        <div className='mt-4'>
          <TaxTrapInlineAlert
            salary={results.grossSalary.annually}
            suggestedPension={taxTrapOptimization.suggested}
            onApplyPension={onApplyPensionOptimization}
            taxYear={taxYear as TaxYear}
          />
        </div>
      )}
      {marriageAllowanceEligible && (
        <div className='mt-4'>
          <MarriageAllowanceAlert
            userSalary={results.grossSalary.annually}
            partnerSalary={partnerGrossWage}
            hasMarriageCode={false}
            taxYear={taxYear as TaxYear}
            isScottish={isScottish}
          />
        </div>
      )}
    </>
  );
  return insights;
}
