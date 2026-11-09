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
  // JGF-9 keeps the original review schedule and expiry.
  // Sources: https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
  // https://github.com/advisories/GHSA-g3hv-75wg-m249 and https://registry.npmjs.org/
  {
    id: 'GHSA-3G3M-2FJR-6PW4',
    package: 'glob',
    via: 'jest (jest-config, jest-runtime, @jest/reporters, test-exclude)',
    reason:
      'Jest config, runtime, and reporters use glob 13.0.7, which backports the cancellation guards for directory traversal. The published advisory still includes 13.0.7. Sentry uses glob 14.0.3. The coverage dependency test-exclude 7.0.2 still resolves affected glob 10.5.0 via ^10.4.1. No fixed 10.x release is available as of 2026-11-09. The affected coverage callers use repository-controlled patterns without AbortSignal.',
    lastChecked: '2026-11-01',
    reviewCadenceDays: 7,
    removeAfter: '2026-11-14',
  },
  {
    id: 'GHSA-G3HV-75WG-M249',
    package: 'minimatch',
    via: 'glob and test-exclude (Jest test/coverage tooling)',
    reason:
      'Residual Jest/coverage tooling as of 2026-11-05: minimatch 10.2.5 and 9.0.9 remain affected; the fix starts at 11.0.1 (latest 11.0.4). Glob 13 requires ^10.2.2, glob 10 requires ^9.0.4, and test-exclude 7.0.2/8.0.0 requires ^10.2.2; available 10.2.6 is still affected. Sentry now uses glob 14 with patched minimatch ^11.0.2. Minimatch 11 changes the matching API used by glob 13, so a minimatch-only major override is unsafe. Remaining match patterns come from repository test configuration. Wait for compatible Jest/coverage releases; incompatible upgrades or renewal require maintainer approval.',
    lastChecked: '2026-11-01',
    reviewCadenceDays: 7,
    removeAfter: '2026-11-14',
  },
];
