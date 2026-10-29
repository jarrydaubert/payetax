'use client';

import { shallow } from 'zustand/shallow';
import { useDirectorGuideStore, useHasDirectorInputErrors } from '@/store/directorGuideStore';
import {
  type ActiveDirectorScenario,
  useActiveDirectorScenario,
} from './calculator/useActiveDirectorScenario';

/** Interim guard for the existing email, which always reports the original recommendation. */
export function useDirectorEmailUnavailableReason(): string | null {
  const { baseComparison, activeScenario, selectedStrategy, profitWhatIfPercent } =
    useActiveDirectorScenario();
  const hasInputErrors = useHasDirectorInputErrors();
  const isCurrent = useDirectorGuideStore(
    (state) =>
      shallow(state.calculatedFormData, state.formData) && !state.isCalculating && !state.error,
  );
  const objective = useDirectorGuideStore((state) => state.objective);
  const mode = useDirectorGuideStore((state) => state.formData.mode);

  if (!baseComparison || hasInputErrors || !isCurrent) {
    return 'Email is paused until results have updated from complete, valid inputs.';
  }
  if (mode === 'monthly') {
    return 'Email is unavailable in monthly mode because the report does not reproduce the cash-aware monthly draw. Use annual mode to email matching results.';
  }
  if (!activeScenario) {
    return 'Email is unavailable for the survival plan because the email reports a pay strategy.';
  }
  if (profitWhatIfPercent !== 0) {
    return 'Email is unavailable for a what-if company profit. Reset the profit scenario to email results.';
  }
  if (objective !== 'maximizeTakeHome') {
    return 'Email does not include the selected objective. Choose Maximize take-home to email results.';
  }
  if (selectedStrategy !== baseComparison.recommended) {
    if (baseComparison.recommended !== 'optimalMix') {
      return 'This salary scenario differs from the email report. Email is unavailable for this setup.';
    }
    return 'Email reports the recommended strategy. Select that strategy to email matching results.';
  }

  const reported = baseComparison.strategies[baseComparison.recommended];
  const matches = (Object.keys(activeScenario) as (keyof ActiveDirectorScenario)[]).every(
    (key) => Number.isFinite(activeScenario[key]) && activeScenario[key] === reported[key],
  );
  if (!matches) {
    if (baseComparison.recommended !== 'optimalMix') {
      return 'This salary scenario differs from the email report. Email is unavailable for this setup.';
    }
    return 'Email does not include this what-if salary. Select the recommended strategy to email matching results.';
  }
  return null;
}
