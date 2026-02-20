import {
  extractSalaryIntentCandidates,
  getNearestSalaryPageTarget,
  getSalaryIntentTargetFromTextValues,
} from '../salaryPageTargets';

describe('salaryPageTargets', () => {
  describe('extractSalaryIntentCandidates', () => {
    it('extracts currency-formatted salary values', () => {
      expect(extractSalaryIntentCandidates('How much tax do I pay on £52,000?')).toEqual([52000]);
    });

    it('extracts k-suffixed salary values', () => {
      expect(extractSalaryIntentCandidates('How does the 100k tax trap work?')).toEqual([100000]);
    });

    it('ignores non-salary tokens outside supported range', () => {
      expect(extractSalaryIntentCandidates('Tax code 1257L updates for 2025')).toEqual([]);
    });
  });

  describe('getNearestSalaryPageTarget', () => {
    it('maps to nearest curated salary page target', () => {
      expect(getNearestSalaryPageTarget(52000)).toBe(50000);
    });

    it('can exclude exact matches for "see also" links', () => {
      expect(getNearestSalaryPageTarget(30000, { excludeExact: true })).toBe(25000);
    });
  });

  describe('getSalaryIntentTargetFromTextValues', () => {
    it('uses title salary intent first', () => {
      expect(getSalaryIntentTargetFromTextValues(['How much tax on £52,000?', 'uk tax'])).toBe(
        50000,
      );
    });

    it('falls back to salary intent in tags', () => {
      expect(
        getSalaryIntentTargetFromTextValues(['Personal allowance explained', '100k tax trap']),
      ).toBe(100000);
    });

    it('returns null when no salary intent exists', () => {
      expect(
        getSalaryIntentTargetFromTextValues(['What does tax code 1257L mean?', 'tax codes']),
      ).toBeNull();
    });
  });
});
