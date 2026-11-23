'use client';

import { useDirectorGuideStore } from '@/store/directorGuideStore';
import {
  type ActiveDirectorScenario,
  useActiveDirectorScenario,
} from './calculator/useActiveDirectorScenario';

/** Interim guard for the existing email, which always reports the original recommendation. */
export function useDirectorEmailUnavailableReason(
  noCurrentResultsReason = 'Email is paused until results have updated from complete, valid inputs.',
  recommendationOnly = false,
): string | null {
  const { comparison, activeScenario, selectedStrategy, exploration, isCustomSalary } =
    useActiveDirectorScenario();
  const mode = useDirectorGuideStore((state) => state.formData.mode);

  if (!comparison) return noCurrentResultsReason;
  if (mode === 'monthly') {
    return 'Email is unavailable in monthly mode because the report does not reproduce the cash-aware monthly draw. Use annual mode to email matching results.';
  }
  if (!activeScenario) {
    return 'Email is unavailable for the survival plan because the email reports a pay strategy.';
  }
  // Keep the existing email restriction for non-baseline recommendations during containment.
  if (recommendationOnly && comparison.recommended !== 'optimalMix') {
    return 'Email is unavailable for this setup.';
  }
  if (exploration?.profitWhatIfPercent) {
    return 'Email is unavailable for a what-if company profit. Reset the profit scenario to email results.';
  }
  if (exploration?.objective === 'minimizeNI') {
    return 'Email does not include the selected objective. Choose Maximize take-home to email results.';
  }
  if (isCustomSalary) {
    return 'Email does not include this what-if salary. Select the recommended strategy to email matching results.';
  }
  if (selectedStrategy !== comparison.recommended) {
    if (comparison.recommended !== 'optimalMix') {
      return 'This salary scenario differs from the email report. Email is unavailable for this setup.';
    }
    return 'Email reports the recommended strategy. Select that strategy to email matching results.';
  }

  const reported = comparison.strategies[comparison.recommended];
  const matches = (Object.keys(activeScenario) as (keyof ActiveDirectorScenario)[]).every(
    (key) => Number.isFinite(activeScenario[key]) && activeScenario[key] === reported[key],
  );
  if (!matches) {
    if (comparison.recommended !== 'optimalMix') {
      return 'This salary scenario differs from the email report. Email is unavailable for this setup.';
    }
    return 'Email does not include this what-if salary. Select the recommended strategy to email matching results.';
  }
  return null;
}
