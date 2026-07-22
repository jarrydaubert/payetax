import type { DependencyAdvisoryAllowlistEntry } from './dependency-advisory-allowlist';

export type DependencyAdvisoryIdentity = {
  packageName: string;
  id: string | null;
};

export type DependencyAdvisoryAllowlistIssue =
  | {
      kind: 'invalid-remove-after';
      entry: DependencyAdvisoryAllowlistEntry;
    }
  | {
      kind: 'expired';
      entry: DependencyAdvisoryAllowlistEntry;
    }
  | {
      kind: 'unmatched';
      entry: DependencyAdvisoryAllowlistEntry;
    };

export function dependencyAdvisoryMatchesEntry(
  advisory: DependencyAdvisoryIdentity,
  entry: DependencyAdvisoryAllowlistEntry,
): boolean {
  return (
    advisory.id === entry.id && advisory.packageName.toLowerCase() === entry.package.toLowerCase()
  );
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function findDependencyAdvisoryAllowlistIssues(
  advisories: readonly DependencyAdvisoryIdentity[],
  allowlist: readonly DependencyAdvisoryAllowlistEntry[],
  now = new Date(),
): DependencyAdvisoryAllowlistIssue[] {
  const today = now.toISOString().slice(0, 10);
  const issues: DependencyAdvisoryAllowlistIssue[] = [];

  for (const entry of allowlist) {
    if (!isValidIsoDate(entry.removeAfter)) {
      issues.push({ kind: 'invalid-remove-after', entry });
      continue;
    }

    if (entry.removeAfter < today) {
      issues.push({ kind: 'expired', entry });
    }

    const hasMatchingAdvisory = advisories.some((advisory) =>
      dependencyAdvisoryMatchesEntry(advisory, entry),
    );

    if (!hasMatchingAdvisory) {
      issues.push({ kind: 'unmatched', entry });
    }
  }

  return issues;
}
