import { runDependencyAudit } from '../../../scripts/audit-deps';
import type { DependencyAdvisoryAllowlistEntry } from '../../../scripts/dependency-advisory-allowlist';

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
});
