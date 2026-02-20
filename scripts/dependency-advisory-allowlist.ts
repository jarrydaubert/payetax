/**
 * Temporary allowlist for transitive dependency advisories.
 *
 * Keep this list as small as possible and remove entries once upstream fixes land.
 */
export interface DependencyAdvisoryAllowlistEntry {
  id: string;
  package: string;
  via: string;
  reason: string;
  /**
   * ISO date (`YYYY-MM-DD`) for last manual upstream re-check.
   * Update this when dependency versions are reviewed.
   */
  lastChecked: string;
  /**
   * Soft review cadence in days before audit warns.
   */
  reviewCadenceDays: number;
  /**
   * Target date to remove allowlist entry if upstream resolves.
   */
  removeAfter: string;
}

export const DEPENDENCY_ADVISORY_ALLOWLIST: readonly DependencyAdvisoryAllowlistEntry[] = [
  {
    id: 'GHSA-3PPC-4F35-3M26',
    package: 'minimatch',
    via: '@sentry/node + Jest toolchain transitive dependency chain',
    reason:
      'Transitive advisory currently unresolved in upstream dependency chain; tracked monthly.',
    lastChecked: '2026-02-20',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
] as const;
