import { describe, expect, it } from '@jest/globals';
import {
  getAvailableDirectorStudentLoanPlans,
  isDirectorStudentLoanPlanAvailable,
  sanitizeDirectorStudentLoanPlans,
} from '../studentLoanPlans';

describe('studentLoanPlans', () => {
  it('returns tax-year-specific available plans for director guide', () => {
    expect(getAvailableDirectorStudentLoanPlans('2025-2026')).toEqual([
      'plan1',
      'plan2',
      'plan4',
      'postgrad',
    ]);
  });

  it('flags unavailable plans for the selected tax year', () => {
    expect(isDirectorStudentLoanPlanAvailable('plan1', '2025-2026')).toBe(true);
    expect(isDirectorStudentLoanPlanAvailable('plan5', '2025-2026')).toBe(false);
  });

  it('sanitizes persisted/legacy plan selections by tax year', () => {
    expect(sanitizeDirectorStudentLoanPlans(['plan1', 'plan5'], '2025-2026')).toEqual(['plan1']);
  });
});
