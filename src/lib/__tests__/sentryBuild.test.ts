/** @jest-environment node */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { handleSentryBuildError, verifySentryCleanup } from '../../../scripts/sentry-build';

it.each(['SentryCliAdapter.uploadSourcemaps', 'uploadSourcemaps'])(
  'allows the verified Node/Bun adapter frame %s without logging raw CLI details',
  (frame) => {
    const error = Object.assign(new Error('credential=SECRET_CANARY'), {
      name: 'SentryError',
      exitCode: 1,
      stderr: 'credential=SECRET_CANARY',
      stack: `SentryError\n at async ${frame} (/app/node_modules/@sentry/bundler-plugins/build/cjs/core/cli.js:82:9)`,
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(() => handleSentryBuildError(error)).not.toThrow();
      expect(warn).toHaveBeenCalledWith(
        '[Sentry] Source-map upload failed (CLI exit 1); continuing build.',
      );
      error.stack = 'at uploadSourcemaps (/app/unrelated/cli.js:82:9)';
      expect(() => handleSentryBuildError(error)).toThrow('Unexpected build integration failure');
      error.stack = 'at SentryCliAdapter.injectDebugIds';
      expect(() => handleSentryBuildError(error)).toThrow('Unexpected build integration failure');
      expect(() => handleSentryBuildError(new Error('Options were not set correctly'))).toThrow(
        'Unexpected build integration failure',
      );
      expect(() => handleSentryBuildError(new TypeError('SECRET_CANARY'))).toThrow(
        'Unexpected build integration failure',
      );
    } finally {
      warn.mockRestore();
    }
  },
);

describe('public source-map cleanup gate', () => {
  let distDir: string;
  beforeEach(async () => {
    distDir = await mkdtemp(path.join(tmpdir(), 'payetax-sentry-'));
    await mkdir(path.join(distDir, 'static/chunks'), { recursive: true });
    await writeFile(path.join(distDir, 'static/chunks/test.js.map'), '{}');
  });
  afterEach(async () => {
    await rm(distDir, { recursive: true, force: true });
  });

  it('accepts successful cleanup', async () => {
    const hook = verifySentryCleanup(async () => {
      await rm(path.join(distDir, 'static/chunks/test.js.map'));
    });
    await expect(hook({ distDir, projectDir: distDir })).resolves.toBeUndefined();
  });

  it('rejects a cleanup failure even when the SDK swallows the deletion error', async () => {
    const hook = verifySentryCleanup(async () => {});
    await expect(hook({ distDir, projectDir: distDir })).rejects.toThrow(
      'Public source maps remain',
    );
  });

  it('rejects an unrelated hook failure without exposing its private details', async () => {
    await rm(path.join(distDir, 'static/chunks/test.js.map'));
    const hook = verifySentryCleanup(() => {
      throw new Error('PRIVATE_CANARY');
    });
    await expect(hook({ distDir, projectDir: distDir })).rejects.toThrow(
      '[Sentry] Production compilation hook failed; refusing to continue.',
    );
  });

  it('fails closed when the public asset tree cannot be inspected', async () => {
    await rm(path.join(distDir, 'static'), { recursive: true });
    const hook = verifySentryCleanup(async () => {});
    await expect(hook({ distDir, projectDir: distDir })).rejects.toThrow(
      'Cannot verify public source-map cleanup',
    );
  });
});
