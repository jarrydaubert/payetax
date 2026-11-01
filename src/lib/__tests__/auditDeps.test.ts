import { runDependencyAudit } from '../../../scripts/audit-deps';
import {
  DEPENDENCY_ADVISORY_ALLOWLIST,
  type DependencyAdvisoryAllowlistEntry,
} from '../../../scripts/dependency-advisory-allowlist';

const ENTRY: DependencyAdvisoryAllowlistEntry = {
  id: 'GHSA-1111-2222-3333',
  package: 'example-package',
  via: 'example-parent@1.0.0',
  reason: 'Temporary exception while waiting for an upstream patch.',
  lastChecked: '2026-07-01',
  reviewCadenceDays: 30,
  removeAfter: '2026-07-31',
};

const MATCHING_AUDIT = {
  [ENTRY.package]: [
    {
      url: `https://github.com/advisories/${ENTRY.id}`,
      title: 'Example advisory',
      severity: 'high',
    },
  ],
};

function auditCommand(payload: object, status: number) {
  return () => ({
    status,
    stdout: `${JSON.stringify(payload)}\n`,
    stderr: '',
  });
}

function reportedErrors(spy: jest.SpiedFunction<typeof console.error>): string {
  return spy.mock.calls.flat().join('\n');
}

describe('dependency audit allowlist enforcement', () => {
  let consoleError: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fails when a matching allowlist entry is expired', () => {
    const exitCode = runDependencyAudit(
      auditCommand(MATCHING_AUDIT, 1),
      [ENTRY],
      new Date('2026-08-01T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('expired after 2026-07-31');
  });

  it('fails when an allowlist entry no longer matches the audit', () => {
    const exitCode = runDependencyAudit(
      auditCommand({}, 0),
      [ENTRY],
      new Date('2026-07-22T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('does not match a current audit advisory');
  });

  it('fails when an allowlist removal date is malformed', () => {
    const malformedEntry = { ...ENTRY, removeAfter: 'not-a-date' };
    const exitCode = runDependencyAudit(
      auditCommand(MATCHING_AUDIT, 1),
      [malformedEntry],
      new Date('2026-07-22T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('invalid removeAfter date: not-a-date');
  });

  it('reports policy issues and non-allowlisted advisories together', () => {
    const otherAdvisory = {
      'other-package': [
        {
          url: 'https://github.com/advisories/GHSA-4444-5555-6666',
          title: 'Other advisory',
          severity: 'critical',
        },
      ],
    };
    const exitCode = runDependencyAudit(
      auditCommand({ ...MATCHING_AUDIT, ...otherAdvisory }, 1),
      [ENTRY],
      new Date('2026-08-01T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('expired after 2026-07-31');
    expect(reportedErrors(consoleError)).toContain('Non-allowlisted dependency advisories found');
    expect(reportedErrors(consoleError)).toContain('other-package (GHSA-4444-5555-6666)');
  });

  it('fails on an unrelated advisory even when every allowlist entry is valid', () => {
    const otherAdvisory = {
      'other-package': [
        {
          url: 'https://github.com/advisories/GHSA-4444-5555-6666',
          title: 'Other advisory',
          severity: 'moderate',
        },
      ],
    };
    const exitCode = runDependencyAudit(
      auditCommand({ ...MATCHING_AUDIT, ...otherAdvisory }, 1),
      [ENTRY],
      new Date('2026-07-22T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('other-package (GHSA-4444-5555-6666)');
  });
});

describe('temporary glob and minimatch advisory exceptions', () => {
  const GLOB = 'GHSA-3g3m-2fjr-6pw4';
  const MINIMATCH = 'GHSA-g3hv-75wg-m249';
  const advisory = (id: string) => ({
    url: `https://github.com/advisories/${id}`,
    title: 'Example advisory',
    severity: 'moderate',
  });
  const CURRENT_AUDIT = { glob: [advisory(GLOB)], minimatch: [advisory(MINIMATCH)] };
  let consoleError: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is limited to the two approved advisories with weekly review and a 14 November expiry', () => {
    expect(
      DEPENDENCY_ADVISORY_ALLOWLIST.map(
        ({ id, package: name, reviewCadenceDays, removeAfter }) => ({
          id,
          name,
          reviewCadenceDays,
          removeAfter,
        }),
      ),
    ).toEqual([
      { id: GLOB.toUpperCase(), name: 'glob', reviewCadenceDays: 7, removeAfter: '2026-11-14' },
      {
        id: MINIMATCH.toUpperCase(),
        name: 'minimatch',
        reviewCadenceDays: 7,
        removeAfter: '2026-11-14',
      },
    ]);
  });

  it('accepts the current audit through the end of 14 November (UTC)', () => {
    expect(
      runDependencyAudit(
        auditCommand(CURRENT_AUDIT, 1),
        DEPENDENCY_ADVISORY_ALLOWLIST,
        new Date('2026-11-14T23:59:59Z'),
      ),
    ).toBe(0);
  });

  it('fails from 15 November (UTC) while the advisories remain', () => {
    const exitCode = runDependencyAudit(
      auditCommand(CURRENT_AUDIT, 1),
      DEPENDENCY_ADVISORY_ALLOWLIST,
      new Date('2026-11-15T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain(
      'glob (GHSA-3G3M-2FJR-6PW4) expired after 2026-11-14',
    );
    expect(reportedErrors(consoleError)).toContain(
      'minimatch (GHSA-G3HV-75WG-M249) expired after 2026-11-14',
    );
  });

  it('fails when either advisory is resolved so its exception must be removed', () => {
    const exitCode = runDependencyAudit(
      auditCommand({ minimatch: [advisory(MINIMATCH)] }, 1),
      DEPENDENCY_ADVISORY_ALLOWLIST,
      new Date('2026-11-01T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain(
      'glob (GHSA-3G3M-2FJR-6PW4) does not match a current audit advisory',
    );
  });

  it('still fails on any other advisory, including the same id on another package', () => {
    const exitCode = runDependencyAudit(
      auditCommand(
        {
          ...CURRENT_AUDIT,
          'brace-expansion': [advisory(GLOB)],
          next: [{ ...advisory('GHSA-7777-8888-9999'), severity: 'high' }],
        },
        1,
      ),
      DEPENDENCY_ADVISORY_ALLOWLIST,
      new Date('2026-11-01T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('brace-expansion (GHSA-3G3M-2FJR-6PW4)');
    expect(reportedErrors(consoleError)).toContain('next (GHSA-7777-8888-9999)');
    expect(reportedErrors(consoleError)).not.toContain('glob (GHSA-3G3M-2FJR-6PW4)');
  });
});
