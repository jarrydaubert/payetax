import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { NextConfig } from 'next';

export function handleSentryBuildError(error: Error): void {
  // Sentry 11.10.0 supplies no operation argument. Fail closed unless the
  // installed CLI's typed failure came through its source-map upload adapter.
  const exitCode = 'exitCode' in error ? error.exitCode : undefined;
  if (
    error.name === 'SentryError' &&
    typeof exitCode === 'number' &&
    Number.isInteger(exitCode) &&
    exitCode > 0 &&
    /^\s*at (?:async )?(?:SentryCliAdapter\.)?uploadSourcemaps \([^\r\n)]*[\\/]@sentry[\\/]bundler-plugins[\\/]build[\\/](?:cjs|esm)[\\/]core[\\/]cli\.js:\d+:\d+\)/m.test(
      error.stack ?? '',
    )
  ) {
    console.warn(`[Sentry] Source-map upload failed (CLI exit ${exitCode}); continuing build.`);
    return;
  }

  // CLI messages, stderr, stacks and causes can contain credentials/arguments.
  throw new Error('[Sentry] Unexpected build integration failure; refusing to continue.');
}

type CompileHook = NonNullable<NonNullable<NextConfig['compiler']>['runAfterProductionCompile']>;

export function verifySentryCleanup(hook: CompileHook): CompileHook {
  return async (context) => {
    let hookFailed = false;
    try {
      await hook(context);
    } catch {
      hookFailed = true;
    }
    let files: string[];
    try {
      files = await readdir(path.join(context.distDir, 'static'), { recursive: true });
    } catch {
      throw new Error('[Sentry] Cannot verify public source-map cleanup; refusing to continue.');
    }
    // Sentry 11 swallows per-file deletion errors; its resolved hook is insufficient proof.
    if (files.some((file) => file.endsWith('.map'))) {
      throw new Error('[Sentry] Public source maps remain after cleanup; refusing to continue.');
    }
    if (hookFailed) {
      throw new Error('[Sentry] Production compilation hook failed; refusing to continue.');
    }
  };
}
