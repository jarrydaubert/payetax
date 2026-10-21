import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import {
  runSecretCheck,
  scanPassed,
  trackedEnvironmentFiles,
} from '../../../scripts/check-secrets';

jest.mock('node:child_process', () => ({ spawnSync: jest.fn() }));

const spawn = jest.mocked(spawnSync);

describe('tracked environment-file policy', () => {
  it('allows only the root template and normal source files', () => {
    expect(trackedEnvironmentFiles(['.env.template', 'src/env.ts', 'docs/environment.md'])).toEqual(
      [],
    );
  });

  it.each([
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
    '.env.development.local',
    '.env.test.local',
    '.envrc',
    'nested/.env',
    'nested/.env.preview',
    'nested/.env.template',
    '.env.template.backup',
    '.ENV.LOCAL',
    'nested/.env/values',
    'directory with spaces/.env.local',
    'directory\nwith-newline/.env.local',
  ])('rejects %j without reading its contents', (path) => {
    expect(trackedEnvironmentFiles([path])).toEqual([path]);
  });
});

describe('redacted scanner result handling', () => {
  let error: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('passes only a successful scan with no findings', () => {
    expect(scanPassed(0, [])).toBe(true);
    expect(error).not.toHaveBeenCalled();
  });

  it('fails without printing source or credential fields, even when the scanner exits zero', () => {
    const finding = { Secret: 'synthetic-sensitive-value', Match: 'synthetic-source-context' };
    for (const status of [0, 1]) expect(scanPassed(status, [finding])).toBe(false);
    const output = error.mock.calls.flat().join('\n');
    expect(output).toContain('1 finding(s)');
    expect(output).not.toContain(finding.Secret);
    expect(output).not.toContain(finding.Match);
  });

  it.each([null, 1, 2])('fails closed on scanner failure %j', (status) => {
    expect(scanPassed(status, [])).toBe(false);
  });

  it.each([undefined, null, {}, 'scanner error'])('rejects unusable reports %j', (report) => {
    expect(scanPassed(0, report)).toBe(false);
  });
});

describe('secret check orchestration', () => {
  beforeEach(() => {
    spawn.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  function commandResult(status: number | null, stdout = '') {
    return { status, stdout, stderr: 'sensitive-child-diagnostics' } as ReturnType<
      typeof spawnSync
    >;
  }

  it.each([
    'nested/.env.local\0',
    '.gitleaksignore\0',
    '.GITLEAKSIGNORE\0',
  ])('rejects forbidden path %j before export', (paths) => {
    spawn.mockReturnValue(commandResult(0, paths));
    expect(runSecretCheck()).toBe(1);
    expect(spawn).toHaveBeenCalledTimes(1);
  });

  it('checks names without invoking the scanner in environment-only mode', () => {
    spawn.mockReturnValue(commandResult(0, '.env.template\0src/env.ts\0'));
    expect(runSecretCheck(true)).toBe(0);
    expect(spawn).toHaveBeenCalledTimes(1);
  });

  it('fails closed on Git errors without echoing child diagnostics', () => {
    spawn.mockReturnValue(commandResult(1));
    expect(runSecretCheck()).toBe(1);
    expect(jest.mocked(console.error).mock.calls.flat().join(' ')).not.toContain('sensitive-child');
  });

  it.each([0, 1])('enforces redaction and rejects findings even with exit status %d', (status) => {
    spawn.mockImplementation((command, args) => {
      if (command === 'git') return commandResult(0, 'src/config.ts\0');
      const options = args as string[];
      expect(options).toContain('--redact=100');
      expect(options).toContain('--ignore-gitleaks-allow');
      const reportPath = options[options.indexOf('--report-path') + 1];
      if (!reportPath) throw new Error('Missing report path');
      writeFileSync(reportPath, JSON.stringify([{ Secret: 'synthetic-sensitive-value' }]));
      return commandResult(status);
    });
    expect(runSecretCheck()).toBe(1);
    expect(jest.mocked(console.error).mock.calls.flat().join(' ')).not.toContain(
      'synthetic-sensitive',
    );
  });

  it('fails closed when the scanner is unavailable or produces no report', () => {
    spawn.mockImplementation((command) =>
      commandResult(command === 'git' ? 0 : null, 'src/a.ts\0'),
    );
    expect(runSecretCheck()).toBe(1);
  });
});
