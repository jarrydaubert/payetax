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
              : worker
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
      await first.addScriptTag({ content: legacyBootstrap });
      await first.evaluate(() => window.dispatchEvent(new Event('load')));
      await first.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        await new Promise<void>((resolve) => {
          const channel = new MessageChannel();
          channel.port1.onmessage = () => {
            channel.port1.close();
            resolve();
          };
          registration?.waiting?.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
        });
      });
      expect(await controllerVersion(first)).toBe('payetax-v5.1.4');
      expect(await controllerVersion(second)).toBe('payetax-v5.1.4');
      await expect(first.getByTestId('salary-input')).toHaveValue('43000.');
      await expect(second.getByTestId('salary-input')).toHaveValue('9999.');
      expect(await first.evaluate(() => performance.timeOrigin)).toBe(initialDocument);
      expect(await second.evaluate(() => performance.timeOrigin)).toBe(secondDocument);
      await first.close();
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

  test('late registration and a waiting update preserve an unblurred calculator draft and allow Later', async ({
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
      await page.reload();
      await expect.poll(() => controllerVersion(page)).toBe('payetax-v5.1.4-pwa1');
      await enterDraft(page, '7777.invalid');
      const initialDocument = await page.evaluate(() => performance.timeOrigin);
      // An older worker installed as a waiting update exercises the same notification path.
      legacy = true;
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
      await expect(page.locator('#sw-update-notification')).toBeVisible();
      await expect(page.locator('#sw-update-notification')).toContainText('close all PayeTax');
      await expect(page.getByTestId('salary-input')).toHaveValue('7777.invalid');
      await page.screenshot({ path: testInfo.outputPath('waiting-update-mobile.png') });
      await page.getByRole('button', { name: 'Later', exact: true }).click();
      await expect(page.locator('#sw-update-notification')).toHaveCount(0);
      await expect(page.getByTestId('salary-input')).toHaveValue('7777.invalid');
      await page.screenshot({ path: testInfo.outputPath('update-dismissed-mobile.png') });
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(initialDocument);
      expect(await controllerVersion(page)).toBe('payetax-v5.1.4-pwa1');
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});
