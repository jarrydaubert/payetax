'use client';

import { useMemo } from 'react';
import type { SalaryScenarioResult } from '@/lib/tax';
import { useDirectorGuideStore, useStrategyComparison } from '@/store/directorGuideStore';

export type ActiveDirectorScenario = SalaryScenarioResult;

export function useActiveDirectorScenario() {
  const comparison = useStrategyComparison();
  const calculatedStrategy = useDirectorGuideStore((state) => state.calculatedStrategy);
  const calculatedExploration = useDirectorGuideStore((state) => state.calculatedExploration);
  const draftStrategy = useDirectorGuideStore(
    (state) => state.calculatedDraftScenario?.selectedStrategy,
  );
  const selectedStrategy = comparison ? calculatedStrategy : null;
  const exploration = comparison ? calculatedExploration : null;
  const customSalaryScenario = exploration?.customSalaryScenario ?? null;
  const profitWhatIfPercent = exploration?.profitWhatIfPercent ?? 0;

  const activeScenario = useMemo(() => {
    if (!comparison || comparison.grossProfit <= 0 || selectedStrategy === null) return null;
    if (customSalaryScenario) return customSalaryScenario;

    const { name: _name, ...scenario } = comparison.strategies[selectedStrategy];
    return scenario;
  }, [comparison, customSalaryScenario, selectedStrategy]);

  return {
    selectedStrategy,
    exploration,
    isCustomSalary: customSalaryScenario !== null,
    isRecommended:
      comparison !== null &&
      selectedStrategy === comparison.recommended &&
      customSalaryScenario === null &&
      profitWhatIfPercent === 0 &&
      draftStrategy === null,
    profitWhatIfPercent,
    isProfitWhatIfActive: profitWhatIfPercent !== 0,
    comparison,
    activeScenario,
  };
}
