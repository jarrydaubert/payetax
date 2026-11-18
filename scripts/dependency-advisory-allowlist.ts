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
   * Hard expiry date. After this date the entry must be removed or renewed
   * with current evidence, even if the advisory remains active.
   */
  removeAfter: string;
}

export const DEPENDENCY_ADVISORY_ALLOWLIST: readonly DependencyAdvisoryAllowlistEntry[] = [
  {
    id: 'GHSA-FC5Q-39XC-VJPF',
    package: 'picomatch',
    via: 'Standalone picomatch@4.0.7 in the lockfile via Sentry Rollup, Jest, and Knip',
    reason:
      'Time-limited exception for reviewed build and test paths. See docs/reports/picomatch-exception-2026-11-18.md.',
    lastChecked: '2026-11-18',
    reviewCadenceDays: 7,
    removeAfter: '2026-12-02',
  },
];
