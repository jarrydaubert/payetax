import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { type BrowserContext, expect, type Page, test } from '@playwright/test';

// Serve two real worker generations over one origin. Forward application requests
// to the production build; routing mocks cannot reliably intercept worker updates.
const legacyWorker = readFileSync(join(__dirname, 'fixtures/pwa-v5.1.4/sw.js.txt'), 'utf8');
const legacyBootstrap = readFileSync(
  join(__dirname, 'fixtures/pwa-v5.1.4/register-sw.js.txt'),
  'utf8',
);
const worker = readFileSync(join(__dirname, '../public/sw.js'), 'utf8');
const bootstrap = readFileSync(join(__dirname, '../public/register-sw.js'), 'utf8');

// Test-origin instrumentation only. The probe waits for any activation request
// made by the preceding real legacy message, rather than racing that message.
const observedWorker = `
let testActivation;
const testSkipWaiting = self.skipWaiting.bind(self);
self.skipWaiting = () => (testActivation = testSkipWaiting());
${worker}
${
  ['1', 'delayed'].includes(process.env.PAYETAX_TEST_UNSAFE_PWA_WORKER ?? '')
    ? `
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(${
    process.env.PAYETAX_TEST_UNSAFE_PWA_WORKER === 'delayed'
      ? 'new Promise(resolve => setTimeout(resolve, 500)).then(() => self.skipWaiting())'
      : 'self.skipWaiting()'
  });
});`
    : ''
}
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'TEST_LEGACY_MESSAGE_PROCESSED') return;
  event.waitUntil(Promise.resolve(testActivation).then(() => {
    event.ports[0].postMessage({ skipWaitingCalled: Boolean(testActivation) });
  }));
});
`;

function controllerVersion(page: Page) {
  return page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          channel.port1.close();
          resolve(event.data.version);
        };
        navigator.serviceWorker.controller?.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
      }),
  );
}

async function enterDraft(page: Page, value: string) {
  const salary = page.getByTestId('salary-input');
  // The interactive calculator is lazy: wait for a real focus/typing round trip.
  await salary.scrollIntoViewIfNeeded();
  await salary.focus();
  await salary.press('ControlOrMeta+A');
  await salary.pressSequentially(value);
  await expect(salary).toHaveValue(value);
}

test.describe('PWA upgrade safety', () => {
  test.describe.configure({ mode: 'serial' });
  let server: Server;
  let origin: string;
  let legacy: boolean;

  test.beforeAll(async ({ baseURL }) => {
    server = createServer(async (request, response) => {
      const url = new URL(request.url ?? '/', baseURL);
      if (url.pathname === '/sw.js' || url.pathname === '/register-sw.js') {
        response.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-store',
        });
        response.end(
          url.pathname === '/sw.js'
            ? legacy
              ? legacyWorker
              : observedWorker
            : legacy
              ? legacyBootstrap
              : bootstrap,
        );
        return;
      }
      try {
        const upstream = await fetch(url, { redirect: 'manual' });
        const headers = Object.fromEntries(upstream.headers);
        for (const header of ['content-encoding', 'content-length', 'transfer-encoding'])
          delete headers[header];
        response.writeHead(upstream.status, headers);
        response.end(Buffer.from(await upstream.arrayBuffer()));
      } catch {
        response.writeHead(502);
        response.end('Test proxy unavailable');
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  test.afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });

  async function openCalculator(context: BrowserContext) {
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${origin}/?pwa=1`);
    // Consent is unrelated to this flow and must not obscure input/notification proof.
    const reject = page.getByTestId('cookie-reject-all');
    if (!(await page.evaluate(() => localStorage.getItem('cookie-consent')))) {
      await expect(reject).toBeVisible();
      await reject.click();
    }
    await expect(page.getByTestId('salary-input')).toBeVisible();
    return page;
  }

  test('v5.1.4 cached standalone bootstrap cannot replace either tab controller or erase unfinished amounts', async ({
    browser,
  }, testInfo) => {
    legacy = true;
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    try {
      const first = await openCalculator(context);
      await first.evaluate(async () => {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
      });
      await first.reload();
      await expect.poll(() => controllerVersion(first)).toBe('payetax-v5.1.4');
      const second = await openCalculator(context);
      const firstController = await first.evaluateHandle(() => navigator.serviceWorker.controller);
      const secondController = await second.evaluateHandle(
        () => navigator.serviceWorker.controller,
      );
      await enterDraft(first, '43000.');
      await enterDraft(second, '9999.');
      const initialDocument = await first.evaluate(() => performance.timeOrigin);
      const secondDocument = await second.evaluate(() => performance.timeOrigin);

      const workerReady = context.waitForEvent('serviceworker');
      legacy = false;
      await first.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
      const nextWorker = await workerReady;
      await expect
        .poll(() =>
          first.evaluate(
            async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state,
          ),
        )
        .toBe('installed');

      // Execute the exact old cached standalone code and its load handler. It sends
      // SKIP_WAITING automatically; the new worker must refuse that unsafe request.
      await first.evaluate(() =>
        Object.defineProperty(navigator, 'standalone', { value: true, configurable: true }),
      );
      const receipt = await first.evaluate(async (source) => {
        const registration = await navigator.serviceWorker.getRegistration();
        const waiting = registration?.waiting;
        const controller = navigator.serviceWorker.controller;
        if (waiting?.state !== 'installed') throw new Error('No installed waiting worker');
        const original = ServiceWorker.prototype.postMessage;
        try {
          return await new Promise<{
            skipWaitingCalled: boolean;
            waitingState: string;
            waitingUnchanged: boolean;
            controllerUnchanged: boolean;
          }>((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error('Legacy SKIP_WAITING receipt missing')),
              10000,
            );
            ServiceWorker.prototype.postMessage = function (
              message: { type?: string },
              transfer?: Transferable[] | StructuredSerializeOptions,
            ) {
              const send = original.bind(this);
              if (Array.isArray(transfer)) send(message, transfer);
              else send(message, transfer);
              if (this !== waiting || message?.type !== 'SKIP_WAITING') return;
              const channel = new MessageChannel();
              channel.port1.onmessage = (event) => {
                clearTimeout(timeout);
                channel.port1.close();
                resolve({
                  skipWaitingCalled: event.data.skipWaitingCalled,
                  waitingState: waiting.state,
                  waitingUnchanged: registration?.waiting === waiting,
                  controllerUnchanged: navigator.serviceWorker.controller === controller,
                });
              };
              // This is sent only AFTER the actual legacy SKIP_WAITING, to its
              // exact target. The worker acknowledges after its handler settles.
              send({ type: 'TEST_LEGACY_MESSAGE_PROCESSED' }, [channel.port2]);
            };
            const script = document.createElement('script');
            script.textContent = source;
            document.body.appendChild(script);
            window.dispatchEvent(new Event('load'));
          });
        } finally {
          ServiceWorker.prototype.postMessage = original;
        }
      }, legacyBootstrap);
      expect(receipt.waitingState, 'legacy SKIP_WAITING must not activate the waiting worker').toBe(
        'installed',
      );
      expect(receipt.waitingUnchanged).toBe(true);
      expect(receipt.controllerUnchanged).toBe(true);
      expect(receipt.skipWaitingCalled).toBe(false);
      // Observe in the worker so an unsafe legacy page reload cannot destroy the
      // check. This bounded window catches activation deferred by 500 ms too.
      expect(
        await nextWorker.evaluate(`new Promise(resolve => setTimeout(() => resolve({
          skipWaitingCalled: Boolean(testActivation),
          waitingState: self.registration.waiting?.state,
        }), 1000))`),
        'legacy SKIP_WAITING must remain harmless throughout the observation window',
      ).toEqual({ skipWaitingCalled: false, waitingState: 'installed' });
      expect(
        await first.evaluate(
          (controller) => navigator.serviceWorker.controller === controller,
          firstController,
        ),
      ).toBe(true);
      expect(
        await second.evaluate(
          (controller) => navigator.serviceWorker.controller === controller,
          secondController,
        ),
      ).toBe(true);
      expect(await controllerVersion(first)).toBe('payetax-v5.1.4');
      expect(await controllerVersion(second)).toBe('payetax-v5.1.4');
      await expect(first.getByTestId('salary-input')).toHaveValue('43000.');
      await expect(second.getByTestId('salary-input')).toHaveValue('9999.');
      expect(await first.evaluate(() => performance.timeOrigin)).toBe(initialDocument);
      expect(await second.evaluate(() => performance.timeOrigin)).toBe(secondDocument);
      await first.close();
      expect(
        await second.evaluate(
          async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state,
        ),
      ).toBe('installed');
      expect(
        await second.evaluate(
          (controller) => navigator.serviceWorker.controller === controller,
          secondController,
        ),
      ).toBe(true);
      expect(await controllerVersion(second)).toBe('payetax-v5.1.4');
      await expect(second.getByTestId('salary-input')).toHaveValue('9999.');
      await second.close();

      // Natural activation only after the last old controlled page closes.
      await expect
        .poll(
          () =>
            nextWorker.evaluate(async () =>
              (await caches.keys()).includes('payetax-static-v5.1.4'),
            ),
          { timeout: 15000 },
        )
        .toBe(false);
      const current = await openCalculator(context);
      await expect.poll(() => controllerVersion(current)).toBe('payetax-v5.1.4-pwa1');
      await expect
        .poll(() =>
          current.evaluate(async () => {
            const cache = await caches.open('payetax-static-v5.1.4-pwa1');
            return (await cache.keys()).filter((r) => r.url.includes('/_next/static/')).length;
          }),
        )
        .toBeGreaterThan(0);
      await current.screenshot({ path: testInfo.outputPath('upgraded-online.png') });
      await context.setOffline(true);
      const devtools = await context.newCDPSession(current);
      await devtools.send('Network.clearBrowserCache');
      await devtools.detach();
      const remainingCaches = await current.evaluate(async () => {
        await caches.delete('payetax-v5.1.4-pwa1');
        await caches.delete('payetax-static-v5.1.4-pwa1-runtime');
        return caches.keys();
      });
      expect(remainingCaches).toEqual(['payetax-static-v5.1.4-pwa1']);
      await current.goto(`${origin}/?pwa=1&offline=1`);
      await expect(current.getByTestId('salary-input')).toBeVisible();
      await enterDraft(current, '52000.');
      await current.screenshot({ path: testInfo.outputPath('offline-calculator.png') });
      await current.goto(`${origin}/never-visited-offline`);
      await expect(current.getByRole('heading', { name: /offline/i }).first()).toBeVisible();
      await current.screenshot({ path: testInfo.outputPath('offline-fallback.png') });
    } finally {
      await context.close();
    }
  });

  test('late registration and repeated update checks keep a waiting update quiet and preserve an unfinished draft', async ({
    browser,
  }, testInfo) => {
    legacy = false;
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    try {
      const page = await openCalculator(context);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      // This depends on the shipped lazyOnload bootstrap registering after load.
      await page.evaluate(async () => navigator.serviceWorker.ready);
      expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
      await page.reload();
      await expect.poll(() => controllerVersion(page)).toBe('payetax-v5.1.4-pwa1');
      await enterDraft(page, '7777.invalid');
      const initialDocument = await page.evaluate(() => performance.timeOrigin);
      const controller = await page.evaluateHandle(() => navigator.serviceWorker.controller);
      // An older worker installed as a waiting update exercises the same notification path.
      legacy = true;
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
      await expect
        .poll(() =>
          page.evaluate(
            async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state,
          ),
        )
        .toBe('installed');
      await page.evaluate(() => {
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new Event('online'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await expect(page.locator('#sw-update-notification')).toHaveCount(0);
      await expect(page.getByTestId('salary-input')).toHaveValue('7777.invalid');
      await page.screenshot({ path: testInfo.outputPath('quiet-waiting-update-mobile.png') });
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(initialDocument);
      expect(await controllerVersion(page)).toBe('payetax-v5.1.4-pwa1');
      expect(
        await page.evaluate(
          (original) => navigator.serviceWorker.controller === original,
          controller,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});
