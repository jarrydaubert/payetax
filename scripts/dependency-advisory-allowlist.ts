/**
 * Temporary allowlist for transitive dependency advisories.
 *
 * Keep this list as small as possible and remove entries once upstream fixes land.
 */
export const DEPENDENCY_ADVISORY_ALLOWLIST = [
  {
    id: 'CVE-2025-69873',
    package: 'ajv',
    via: 'webpack > schema-utils > ajv',
    reason:
      'Transitive build-time advisory; tracked until webpack/schema-utils ship a patched chain.',
    removeAfter: '2026-06-30',
  },
] as const;
