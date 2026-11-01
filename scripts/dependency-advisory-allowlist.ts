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
    id: 'GHSA-3G3M-2FJR-6PW4',
    package: 'glob',
    via: 'jest (jest-config, jest-runtime, @jest/reporters, test-exclude) and the @sentry/nextjs webpack/bundler plugin',
    reason:
      'Fixed only in glob 14.0.2+; the latest Jest (30.5.2) and Sentry bundler plugins still require glob ^13.0.6, and glob 14 changes ignore-pattern and matching semantics. Build/test tooling only: no glob code is traced into or bundled with the deployed app, no caller passes the AbortSignal the advisory concerns, and patterns come from repository configuration.',
    lastChecked: '2026-10-31',
    reviewCadenceDays: 7,
    removeAfter: '2026-11-14',
  },
  {
    id: 'GHSA-G3HV-75WG-M249',
    package: 'minimatch',
    via: 'glob (Jest test/coverage tooling and the @sentry/nextjs webpack/bundler plugin)',
    reason:
      'Fixed only in minimatch 11.0.1+, which glob 13 (^10.2.2) and glob 10 (^9.0.4) do not accept. Build/test tooling only: no minimatch code is traced into or bundled with the deployed app, and match patterns come from repository configuration rather than user input.',
    lastChecked: '2026-10-31',
    reviewCadenceDays: 7,
    removeAfter: '2026-11-14',
  },
];
