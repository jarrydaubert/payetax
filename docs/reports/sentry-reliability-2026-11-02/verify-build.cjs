// Reproduce the installed SDK contract without credentials or Sentry requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const calls = [];
let failUpload = true;
const cliPath = require.resolve('sentry');
require.cache[cliPath] = {
  id: cliPath,
  filename: cliPath,
  loaded: true,
  exports: {
    createSentrySDK: () => ({
      release: new Proxy({}, {
        get: (_target, name) => async () => {
          throw new Error(`Unexpected release-management call: ${String(name)}`);
        },
      }),
      sourcemap: {
        inject: async () => { calls.push('inject'); },
        upload: async ({ directory }) => {
          calls.push(directory);
          if (failUpload) throw new Error('Synthetic Sentry HTTP 502 / network failure');
        },
      },
    }),
  },
};

async function main() {
  const { transpileConfig } = require('next/dist/build/next-config-ts/transpile-config');
  const { sentryConfigOptions } = await transpileConfig({
    nextConfigPath: path.join(root, 'next.config.ts'),
    dir: root,
  });
  const { withSentryConfig } = require('@sentry/nextjs/config');
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
    for (const outage of [false, true]) {
      failUpload = outage;
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
          assert.equal(plugin.sourcemaps.filesToDeleteAfterUpload, undefined);
        }
        const config = withSentryConfig({}, options);
        assert.equal(config.env._sentryRelease, options.release.name);
        assert.equal(typeof config.compiler.runAfterProductionCompile, 'function');
        await config.compiler.runAfterProductionCompile({ distDir, projectDir: root });
        assert.equal(calls[0], 'inject');
        assert.equal(calls.length, outage ? 2 : 3);
        assert.equal(warnings.length, outage ? 1 : 0);
        assert.equal(fs.existsSync(path.join(distDir, 'static/chunks/test.js.map')), false);
        assert.equal(fs.existsSync(path.join(distDir, 'static/chunks/test.js')), true);
        assert.equal(fs.existsSync(path.join(distDir, 'server/test.js')), true);
        assert.equal(fs.existsSync(path.join(distDir, 'server/test.js.map')), true);
        console.log(`PASS: ${outage ? 'failed' : 'successful'} upload; hook resolves, browser maps removed, bundles retained`);
      } finally {
        // Only this test's own mkdtemp directory inside audit-outputs is removed.
        assert.equal(path.dirname(distDir), outputRoot);
        fs.rmSync(distDir, { recursive: true, force: true });
      }
    }
  } finally {
    console.warn = originalWarn;
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
  process.env.SENTRY_AUTH_TOKEN = 'synthetic-offline-token';
  process.env.PAYETAX_ENABLE_SENTRY_SOURCEMAPS = 'true';
}
