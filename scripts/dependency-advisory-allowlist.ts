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
    id: 'GHSA-H67P-54HQ-RP68',
    package: 'js-yaml',
    via: 'gray-matter@4.0.3 and Jest coverage tooling',
    reason:
      'gray-matter still depends on the js-yaml 3 API and calls safeLoad during blog frontmatter parsing; forcing js-yaml 4 breaks production page-data builds. The runtime path parses trusted repository MDX frontmatter, not user-supplied YAML.',
    lastChecked: '2026-06-17',
    reviewCadenceDays: 30,
    removeAfter: '2026-07-17',
  },
];
