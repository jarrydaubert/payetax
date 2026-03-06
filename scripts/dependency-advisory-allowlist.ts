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
    lastChecked: '2026-03-06',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
  {
    id: 'GHSA-7R86-CG39-JMMJ',
    package: 'minimatch',
    via: '@sentry/node + Jest toolchain transitive dependency chain',
    reason:
      'Transitive advisory currently unresolved in upstream dependency chain; tracked monthly.',
    lastChecked: '2026-03-06',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
  {
    id: 'GHSA-23C5-XMQV-RM74',
    package: 'minimatch',
    via: '@sentry/node + Jest toolchain transitive dependency chain',
    reason:
      'Transitive advisory currently unresolved in upstream dependency chain; tracked monthly.',
    lastChecked: '2026-03-06',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
  {
    id: 'GHSA-MW96-CPMX-2VGC',
    package: 'rollup',
    via: '@sentry/nextjs build tooling transitive dependency chain',
    reason:
      'Current Sentry build-tooling dependency chain resolves to a vulnerable Rollup version; tracked monthly pending upstream fix or safe override.',
    lastChecked: '2026-03-06',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
  {
    id: 'GHSA-5C6J-R48X-RMVQ',
    package: 'serialize-javascript',
    via: 'webpack + terser-webpack-plugin build toolchain',
    reason:
      'Current webpack build-tooling dependency chain resolves to a vulnerable serialize-javascript version; tracked monthly pending upstream fix or safe override.',
    lastChecked: '2026-03-06',
    reviewCadenceDays: 31,
    removeAfter: '2026-06-30',
  },
] as const;
