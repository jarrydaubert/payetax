import type { DependencyAdvisoryAllowlistEntry } from '../../../scripts/dependency-advisory-allowlist';
import { findDependencyAdvisoryAllowlistIssues } from '../../../scripts/dependency-advisory-policy';

const ENTRY: DependencyAdvisoryAllowlistEntry = {
  id: 'GHSA-1111-2222-3333',
  package: 'example-package',
  via: 'example-parent@1.0.0',
  reason: 'Temporary exception while waiting for an upstream patch.',
  lastChecked: '2026-07-01',
  reviewCadenceDays: 30,
  removeAfter: '2026-07-31',
};

const MATCHING_ADVISORY = {
  id: ENTRY.id,
  packageName: ENTRY.package,
};

describe('dependency advisory allowlist policy', () => {
  it('accepts a current entry that matches an audit advisory', () => {
    expect(
      findDependencyAdvisoryAllowlistIssues(
        [MATCHING_ADVISORY],
        [ENTRY],
        new Date('2026-07-22T12:00:00Z'),
      ),
    ).toEqual([]);
  });

  it('keeps a matching entry valid through its removal date', () => {
    expect(
      findDependencyAdvisoryAllowlistIssues(
        [MATCHING_ADVISORY],
        [ENTRY],
        new Date('2026-07-31T23:59:59Z'),
      ),
    ).toEqual([]);
  });

  it('accepts an empty allowlist', () => {
    expect(findDependencyAdvisoryAllowlistIssues([], [], new Date('2026-07-22T12:00:00Z'))).toEqual(
      [],
    );
  });

  it('rejects an entry after its removal date', () => {
    expect(
      findDependencyAdvisoryAllowlistIssues(
        [MATCHING_ADVISORY],
        [ENTRY],
        new Date('2026-08-01T00:00:00Z'),
      ),
    ).toEqual([{ kind: 'expired', entry: ENTRY }]);
  });

  it('rejects an entry that no longer matches a current audit advisory', () => {
    expect(
      findDependencyAdvisoryAllowlistIssues([], [ENTRY], new Date('2026-07-22T12:00:00Z')),
    ).toEqual([{ kind: 'unmatched', entry: ENTRY }]);
  });

  it('rejects an invalid removal date', () => {
    const invalidEntry = { ...ENTRY, removeAfter: '2026-02-31' };

    expect(
      findDependencyAdvisoryAllowlistIssues(
        [MATCHING_ADVISORY],
        [invalidEntry],
        new Date('2026-07-22T12:00:00Z'),
      ),
    ).toEqual([{ kind: 'invalid-remove-after', entry: invalidEntry }]);
  });

  it('rejects a removal date with the wrong format', () => {
    const invalidEntry = { ...ENTRY, removeAfter: '2026/07/31' };

    expect(
      findDependencyAdvisoryAllowlistIssues(
        [MATCHING_ADVISORY],
        [invalidEntry],
        new Date('2026-07-22T12:00:00Z'),
      ),
    ).toEqual([{ kind: 'invalid-remove-after', entry: invalidEntry }]);
  });
});
