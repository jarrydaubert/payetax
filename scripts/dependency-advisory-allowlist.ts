/**
 * Temporary allowlist for transitive dependency advisories.
 *
 * Keep this list as small as possible and remove entries once upstream fixes land.
 */
export const DEPENDENCY_ADVISORY_ALLOWLIST = [
  {
    id: 'GHSA-3PPC-4F35-3M26',
    package: 'minimatch',
    via: '@sentry/node + Jest toolchain transitive dependency chain',
    reason:
      'Transitive advisory currently unresolved in upstream dependency chain; tracked monthly.',
    removeAfter: '2026-06-30',
  },
] as const;
