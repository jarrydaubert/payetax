'use client';

import { useMemo } from 'react';
import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { roundToPence } from '@/lib/tax';
import {
  calculateSalaryScenario,
  calculateStrategyComparison,
  type SalaryScenarioResult,
  type StrategyComparison,
} from '@/lib/tax/strategyComparison';
import {
  type DirectorStrategyKey,
  useDirectorFormSlice,
  useDirectorGuideStore,
  useProfitWhatIfPercent,
  useSelectedStrategy,
  useSliderSalary,
  useStrategyComparison,
} from '@/store/directorGuideStore';

const TAX_YEAR = CURRENT_TAX_YEAR;

export type ActiveDirectorScenario = SalaryScenarioResult;

interface UseActiveDirectorScenarioResult {
  selectedStrategy: DirectorStrategyKey | null;
  sliderSalary: number | null;
  profitWhatIfPercent: number;
  isProfitWhatIfActive: boolean;
  baseComparison: StrategyComparison | null;
  comparison: StrategyComparison | null;
  baseGrossProfitBeforePension: number;
  scenarioGrossProfitBeforePension: number;
  activeScenario: ActiveDirectorScenario | null;
}

export function useActiveDirectorScenario(submittedOnly = false): UseActiveDirectorScenarioResult {
  const baseComparison = useStrategyComparison();
  const calculatedStrategy = useDirectorGuideStore((state) => state.calculatedStrategy);
  const storedStrategy = useSelectedStrategy();
  const storedSalary = useSliderSalary();
  const storedProfitPercent = useProfitWhatIfPercent();
  // The dashboard contains what-if output until strategy controls have an explicit submission.
  const selectedStrategy = submittedOnly
    ? baseComparison
      ? calculatedStrategy
      : null
    : storedStrategy;
  const sliderSalary = submittedOnly ? null : storedSalary;
  const profitWhatIfPercent = submittedOnly ? 0 : storedProfitPercent;
  const formData = useDirectorFormSlice((state) => ({
    region: state.region,
    otherIncome: state.otherIncome,
    hasEmploymentAllowance: state.hasEmploymentAllowance,
    studentLoanPlans: state.studentLoanPlans,
    pensionContribution: state.pensionContribution,
    isPensionAlreadyDeducted: state.isPensionAlreadyDeducted,
    companyCarBIK: state.companyCarBIK,
    associatedCompaniesCount: state.associatedCompaniesCount,
    hasOtherPAYEEmployment: state.hasOtherPAYEEmployment,
    lossesBroughtForward: state.lossesBroughtForward,
    minimumSalaryRequirement: state.minimumSalaryRequirement,
    ytdSalary: state.ytdSalary,
    ytdDividends: state.ytdDividends,
    ytdDrawings: state.ytdDrawings,
    yourSetupSalary: state.yourSetupSalary,
    yourSetupDividends: state.yourSetupDividends,
  }));

  const comparison = useMemo(() => {
    if (!(baseComparison && formData.region) || profitWhatIfPercent === 0) {
      return baseComparison;
    }

    // The what-if control scales the current pre-pension gross profit so users can explore
    // "company makes more/less" without changing all raw inputs.
    const scenarioGrossProfitBeforePension = roundToPence(
      Math.max(0, baseComparison.grossProfit * (1 + profitWhatIfPercent / 100)),
    );

    return calculateStrategyComparison(
      {
        region: formData.region,
        revenue: scenarioGrossProfitBeforePension,
        includesVat: false,
        expenses: 0,
        lossesBroughtForward: formData.lossesBroughtForward,
        otherIncome: formData.otherIncome,
        employmentAllowance: formData.hasEmploymentAllowance,
        studentLoanPlans:
          formData.studentLoanPlans.length > 0 ? formData.studentLoanPlans : undefined,
        pensionContribution: formData.isPensionAlreadyDeducted ? 0 : formData.pensionContribution,
        companyCarBIK: formData.companyCarBIK,
        associatedCompaniesCount: formData.associatedCompaniesCount,
        minimumSalaryRequirement: formData.minimumSalaryRequirement,
        hasOtherPAYEEmployment: formData.hasOtherPAYEEmployment,
        ytdSalary: formData.ytdSalary,
        ytdDividends: formData.ytdDividends,
        ytdDrawings: formData.ytdDrawings,
        yourSetupSalary: formData.yourSetupSalary,
        yourSetupDividends: formData.yourSetupDividends,
      },
      TAX_YEAR,
    );
  }, [baseComparison, formData, profitWhatIfPercent]);

  const activeScenario = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0 || selectedStrategy === null) return null;

    if (sliderSalary !== null) {
      return calculateSalaryScenario({
        targetSalary: sliderSalary,
        grossProfit: comparison.grossProfitAfterPension ?? comparison.grossProfit,
        region: formData.region ?? 'rUK',
        taxYear: TAX_YEAR,
        otherIncome: formData.otherIncome,
        hasEmploymentAllowance: formData.hasEmploymentAllowance,
        studentLoanPlans: formData.studentLoanPlans,
        pension: formData.isPensionAlreadyDeducted ? 0 : formData.pensionContribution,
        companyCarBIK: formData.companyCarBIK,
        associatedCompaniesCount: formData.associatedCompaniesCount,
        hasOtherPAYE: formData.hasOtherPAYEEmployment,
        lossesBroughtForward: formData.lossesBroughtForward,
        minimumSalary: formData.minimumSalaryRequirement ?? 0,
      });
    }

    const { name: _name, ...scenario } = comparison.strategies[selectedStrategy];
    return scenario;
  }, [comparison, formData, selectedStrategy, sliderSalary]);

  return {
    selectedStrategy,
    sliderSalary,
    profitWhatIfPercent,
    isProfitWhatIfActive: profitWhatIfPercent !== 0,
    baseComparison,
    comparison,
    baseGrossProfitBeforePension: baseComparison?.grossProfit ?? 0,
    scenarioGrossProfitBeforePension: comparison?.grossProfit ?? 0,
    activeScenario,
  };
}
