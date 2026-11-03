// Exercise the real installed CLI SDK against a loopback-only failing API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');
process.chdir(root);
process.env.SENTRY_CLI_NO_TELEMETRY = '1';
process.env.SENTRY_AUTH_TOKEN = 'synthetic-offline-token';

async function main() {
  const outputRoot = path.join(root, 'audit-outputs');
  fs.mkdirSync(outputRoot, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(outputRoot, 'real-sentry-cli-'));
  let requests = 0;
  const server = http.createServer((_request, response) => {
    requests++;
    response.writeHead(401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ detail: 'Synthetic upload rejection' }));
  });
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  const warnings = [];
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    globalThis.fetch = (input, init) => {
      const url = typeof input === 'string' || input instanceof URL ? new URL(input) : new URL(input.url);
      assert.equal(url.origin, origin, 'CLI verification must not contact an external service');
      return originalFetch(input, init);
    };
    console.warn = (message) => warnings.push(message);
    fs.writeFileSync(path.join(fixture, 'probe.js'), 'throw new Error("synthetic");\n//# sourceMappingURL=probe.js.map');
    fs.writeFileSync(path.join(fixture, 'probe.js.map'), JSON.stringify({
      version: 3, sources: ['probe.ts'], names: [], mappings: 'AAAA',
      sourcesContent: ['throw new Error("synthetic");'],
    }));
    const { transpileConfig } = require('next/dist/build/next-config-ts/transpile-config');
    const { handleSentryBuildError } = await transpileConfig({
      nextConfigPath: path.join(root, 'scripts/sentry-build.ts'), dir: root,
    });
    const sdkDir = path.dirname(require.resolve('@sentry/bundler-plugins/core'));
    const { SentryCliAdapter } = require(path.join(sdkDir, 'cli.js'));
    const cli = new SentryCliAdapter({
      org: 'synthetic', project: 'synthetic', url: origin,
      authToken: 'synthetic-offline-token', release: { name: 'synthetic' },
    });
    await cli.injectDebugIds([fixture]);
    let failure;
    try {
      await cli.uploadSourcemaps('synthetic', [{ directory: fixture }]);
    } catch (error) {
      failure = error;
    }
    assert.ok(failure, 'The local API must reject the real CLI upload');
    assert.equal(failure.name, 'SentryError');
    assert.ok(requests > 0, 'The real CLI must reach the local API');
    handleSentryBuildError(failure);
    assert.equal(warnings.length, 1);
    assert.ok(!warnings[0].includes('synthetic-offline-token'));
    console.log(JSON.stringify({
      result: 'PASS', runtime: process.versions.bun ? `Bun ${process.versions.bun}` : process.version,
      localApiRequests: requests, errorType: failure.name, exitCode: failure.exitCode,
      uploadFailureRecognised: true,
    }));
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    await new Promise((resolve) => server.close(resolve));
    assert.equal(path.dirname(fixture), outputRoot);
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error('Offline CLI verification failed:', error.name);
  process.exitCode = 1;
});
