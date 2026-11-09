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

  it('accepts a matching exception through the end of its removal date in UTC', () => {
    expect(
      runDependencyAudit(
        auditCommand(MATCHING_AUDIT, 1),
        [ENTRY],
        new Date('2026-07-31T23:59:59Z'),
      ),
    ).toBe(0);
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

  it('fails on the same advisory ID for a different package even with a valid exception', () => {
    const otherAdvisory = { 'other-package': MATCHING_AUDIT[ENTRY.package] };

    const exitCode = runDependencyAudit(
      auditCommand({ ...MATCHING_AUDIT, ...otherAdvisory }, 1),
      [ENTRY],
      new Date('2026-07-22T00:00:00Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain(`other-package (${ENTRY.id})`);
    expect(reportedErrors(consoleError)).not.toContain(`${ENTRY.package} (${ENTRY.id})`);
  });

  it('rejects the retired glob and minimatch advisories before their old expiry', () => {
    const advisories = {
      glob: [{ url: 'https://github.com/advisories/GHSA-3g3m-2fjr-6pw4', severity: 'moderate' }],
      minimatch: [
        { url: 'https://github.com/advisories/GHSA-g3hv-75wg-m249', severity: 'moderate' },
      ],
    };

    const exitCode = runDependencyAudit(
      auditCommand(advisories, 1),
      undefined,
      new Date('2026-11-14T23:59:59Z'),
    );

    expect(exitCode).toBe(1);
    expect(reportedErrors(consoleError)).toContain('glob (GHSA-3G3M-2FJR-6PW4)');
    expect(reportedErrors(consoleError)).toContain('minimatch (GHSA-G3HV-75WG-M249)');
  });

  it('accepts a clean audit after the retired exceptions would have expired', () => {
    expect(DEPENDENCY_ADVISORY_ALLOWLIST).toEqual([]);
    expect(runDependencyAudit(auditCommand({}, 0), undefined, new Date('2026-11-15'))).toBe(0);
  });
});
