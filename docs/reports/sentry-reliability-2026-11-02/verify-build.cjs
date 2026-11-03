// Reproduce the installed SDK contract without credentials or Sentry requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const calls = [];
let failureMode = 'upload';
const cliPath = require.resolve('sentry');
const { SentryError } = require('sentry');
process.env.SENTRY_AUTH_TOKEN = 'synthetic-offline-token';
process.env.PAYETAX_ENABLE_SENTRY_SOURCEMAPS = 'true';
process.env.VERCEL = '1';
process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_TARGET_ENV = 'preview';
process.env.VERCEL_URL = 'synthetic-preview.invalid';
process.env.PAYETAX_DISABLE_GOOGLE_FONTS = '1';
const originalRm = fs.promises.rm;
fs.promises.rm = async (file, options) => {
  if (failureMode === 'cleanup' && String(file).endsWith('.map')) {
    throw Object.assign(new Error('Synthetic private cleanup context'), { code: 'EACCES' });
  }
  return originalRm(file, options);
};
require.cache[cliPath] = {
  id: cliPath,
  filename: cliPath,
  loaded: true,
  exports: {
    createSentrySDK: () => ({
      release: new Proxy({}, {
        get: (_target, name) => async () => {
          calls.push(`release:${String(name)}`);
          throw new Error(`Unexpected release-management call: ${String(name)}`);
        },
      }),
      sourcemap: {
        inject: async () => {
          calls.push('inject');
          if (failureMode === 'inject') throw new SentryError('Synthetic PRIVATE_CANARY', 1, 'PRIVATE_CANARY');
        },
        upload: async ({ directory }) => {
          calls.push(directory);
          if (failureMode === 'upload') throw new SentryError('Synthetic HTTP 502 PRIVATE_CANARY', 1, 'PRIVATE_CANARY');
          if (failureMode === 'unrelated') throw new TypeError('PRIVATE_CANARY');
        },
      },
    }),
  },
};

async function main() {
  const { transpileConfig } = require('next/dist/build/next-config-ts/transpile-config');
  const { default: config, sentryConfigOptions } = await transpileConfig({
    nextConfigPath: path.join(root, 'next.config.ts'),
    dir: root,
  });
  const sdkRoot = path.dirname(require.resolve('@sentry/nextjs/package.json'));
  const { getBuildPluginOptions } = require(path.join(sdkRoot, 'build/cjs/config/getBuildPluginOptions.js'));
  const options = {
    ...sentryConfigOptions,
    authToken: 'synthetic-offline-token',
    silent: false,
    useRunAfterProductionCompileHook: true,
    widenClientFileUpload: true,
    sourcemaps: { deleteSourcemapsAfterUpload: true },
  };
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(message);
  const outputRoot = path.join(root, 'audit-outputs');
  fs.mkdirSync(outputRoot, { recursive: true });
  try {
    for (const mode of ['success', 'upload', 'cleanup', 'inject', 'unrelated']) {
      failureMode = mode;
      calls.length = 0;
      warnings.length = 0;
      const distDir = fs.mkdtempSync(path.join(outputRoot, 'sentry-sdk-'));
      try {
        for (const directory of ['server', 'static/chunks']) {
          fs.mkdirSync(path.join(distDir, directory), { recursive: true });
          fs.writeFileSync(path.join(distDir, directory, 'test.js'), 'throw new Error("synthetic");');
          fs.writeFileSync(path.join(distDir, directory, 'test.js.map'), '{}');
        }
        for (const buildTool of ['webpack-nodejs', 'webpack-edge', 'webpack-client']) {
          const plugin = getBuildPluginOptions({
            sentryBuildOptions: options,
            releaseName: options.release.name,
            distDirAbsPath: distDir,
            buildTool,
            useRunAfterProductionCompileHook: true,
          });
          assert.equal(plugin.sourcemaps.disable, true);
          assert.equal(plugin.release.create, false);
          assert.equal(plugin.release.finalize, false);
          assert.equal(plugin.release.setCommits, false);
          assert.equal(plugin.release.deploy, false);
          assert.equal(plugin.sourcemaps.filesToDeleteAfterUpload, undefined);
        }
        assert.equal(config.env._sentryRelease, options.release.name);
        assert.equal(typeof config.compiler.runAfterProductionCompile, 'function');
        const build = config.compiler.runAfterProductionCompile({ distDir, projectDir: root });
        if (['cleanup', 'inject', 'unrelated'].includes(mode)) {
          await assert.rejects(build, (error) => {
            assert.match(error.message, /\[Sentry\].*refusing to continue/);
            assert.ok(!error.message.includes('PRIVATE_CANARY'));
            return true;
          });
          console.log(`PASS: ${mode} failure rejects the production hook; output cannot be deployed`);
          continue;
        }
        await build;
        assert.equal(calls[0], 'inject');
        assert.equal(calls.length, mode === 'upload' ? 2 : 3);
        assert.equal(warnings.length, mode === 'upload' ? 1 : 0);
        assert.ok(!JSON.stringify(warnings).includes('PRIVATE_CANARY'));
        assert.equal(fs.existsSync(path.join(distDir, 'static/chunks/test.js.map')), false);
        assert.equal(fs.existsSync(path.join(distDir, 'static/chunks/test.js')), true);
        assert.equal(fs.existsSync(path.join(distDir, 'server/test.js')), true);
        assert.equal(fs.existsSync(path.join(distDir, 'server/test.js.map')), true);
        console.log(`PASS: ${mode}; hook resolves, browser maps removed, bundles retained`);
      } finally {
        // Only this test's own mkdtemp directory inside audit-outputs is removed.
        assert.equal(path.dirname(distDir), outputRoot);
        fs.rmSync(distDir, { recursive: true, force: true });
      }
    }
    failureMode = 'success';
    const { createSentryBuildPluginManager } = require('@sentry/bundler-plugins/core');
    calls.length = 0;
    const withoutDeployOptOut = createSentryBuildPluginManager({
      ...options,
      release: { ...options.release, deploy: undefined },
    }, { buildTool: 'webpack', loggerPrefix: '[offline regression]' });
    assert.equal(withoutDeployOptOut.normalizedOptions.release.deploy.env, 'preview');
    await assert.rejects(withoutDeployOptOut.createRelease(), /Unexpected build integration failure/);
    assert.deepEqual(calls, ['release:deploy']);
    console.log('PASS: omitting deploy:false reproduces the unexpected Vercel release.deploy call');
    assert.throws(() => createSentryBuildPluginManager({
      ...options,
      release: { ...options.release, setCommits: { auto: false } },
    }, { buildTool: 'webpack', loggerPrefix: '[offline test]' }), /Unexpected build integration failure/);
    console.log('PASS: invalid plugin configuration rejects; no raw CLI diagnostic is logged');
  } finally {
    console.warn = originalWarn;
    fs.promises.rm = originalRm;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
} else {
  // `node --require ./.../verify-build.cjs .../next build --webpack` exercises
  // the complete release build with a synthetic token and a failing CLI stub.
  // These values exist only in this verification process and its children.
  failureMode = 'upload';
}
