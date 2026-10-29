/** @jest-environment jsdom */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { waitFor } from '@testing-library/react';

const script = readFileSync(join(process.cwd(), 'public/register-sw.js'), 'utf8');

function harness(readyState = 'complete', standalone = false) {
  const windowEvents = new Map<string, () => void>();
  const documentEvents = new Map<string, () => void>();
  const registrationEvents = new Map<string, () => void>();
  const workerEvents = new Map<string, () => void>();
  const worker = {
    postMessage: jest.fn(),
    state: 'installing',
    addEventListener: jest.fn((name, callback) => workerEvents.set(name, callback)),
  };
  const registration = {
    waiting: worker as typeof worker | null,
    installing: null as typeof worker | null,
    update: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn((name, callback) => registrationEvents.set(name, callback)),
  };
  const register = jest.fn().mockResolvedValue(registration);
  const reload = jest.fn();
  const serviceWorker = { register, controller: {} as object | null, addEventListener: jest.fn() };
  const fakeWindow = {
    location: { hostname: 'localhost', search: '?pwa=1', reload },
    navigator: { serviceWorker, standalone },
    matchMedia: () => ({ matches: standalone }),
    addEventListener: (name: string, callback: () => void) => windowEvents.set(name, callback),
  };
  const fakeDocument = {
    get readyState() {
      return readyState;
    },
    visibilityState: 'visible',
    addEventListener: (name: string, callback: () => void) => documentEvents.set(name, callback),
    createElement: document.createElement.bind(document),
    getElementById: document.getElementById.bind(document),
    body: document.body,
  };
  function run() {
    runInNewContext(script, {
      window: fakeWindow,
      document: fakeDocument,
      navigator: fakeWindow.navigator,
      URLSearchParams,
      setTimeout,
    });
  }
  return {
    run,
    windowEvents,
    documentEvents,
    registrationEvents,
    workerEvents,
    registration,
    worker,
    register,
    reload,
    serviceWorker,
    fakeWindow,
    fakeDocument,
  };
}

describe('register-sw script', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not bypass the app-owned analytics consent gate', () => {
    expect(script).not.toContain('window.gtag');
    expect(script).not.toContain("localStorage.getItem('cookie-consent')");
  });

  it.each([
    'loading',
    'interactive',
    'complete',
  ])('registers once when loaded during document state %s, including lazyOnload', async (state) => {
    const h = harness(state);
    h.run();
    if (state !== 'complete') {
      expect(h.register).not.toHaveBeenCalled();
      h.windowEvents.get('load')?.();
      h.windowEvents.get('load')?.();
    }
    await waitFor(() => expect(h.register).toHaveBeenCalledTimes(1));
    expect(h.register).toHaveBeenCalledWith('/sw.js', { scope: '/', updateViaCache: 'none' });
  });

  it.each([
    false,
    true,
  ])('notifies without activation/reload or input mutation (standalone=%s)', async (standalone) => {
    document.body.innerHTML =
      '<input id="draft" value="1234.invalid"><input id="email" value="unfinished@">';
    const h = harness('complete', standalone);
    h.run();
    await waitFor(() =>
      expect(document.getElementById('sw-update-notification')).toBeInTheDocument(),
    );
    expect(document.getElementById('sw-update-notification')).toHaveTextContent(
      'close all PayeTax tabs and app windows',
    );
    expect(document.getElementById('sw-update-btn')).not.toBeInTheDocument();
    jest.advanceTimersByTime(60000);
    expect(document.getElementById('sw-update-notification')).toBeInTheDocument();
    expect(document.getElementById('draft')).toHaveValue('1234.invalid');
    expect(document.getElementById('email')).toHaveValue('unfinished@');
    document.getElementById('sw-dismiss-btn')?.click();
    expect(document.getElementById('sw-update-notification')).not.toBeInTheDocument();
    expect(h.worker.postMessage).not.toHaveBeenCalled();
    expect(h.reload).not.toHaveBeenCalled();
    expect(h.serviceWorker.addEventListener).not.toHaveBeenCalledWith(
      'controllerchange',
      expect.anything(),
    );
  });

  it.each([
    false,
    true,
  ])('observes an already-installing or newly discovered worker (already installing=%s)', async (alreadyInstalling) => {
    const h = harness();
    h.registration.waiting = null;
    if (alreadyInstalling) h.registration.installing = h.worker;
    h.run();
    await waitFor(() => expect(h.registrationEvents.has('updatefound')).toBe(true));
    if (!alreadyInstalling) {
      h.registration.installing = h.worker;
      h.registrationEvents.get('updatefound')?.();
    }
    h.registration.waiting = h.worker;
    h.worker.state = 'installed';
    h.workerEvents.get('statechange')?.();
    h.workerEvents.get('statechange')?.();
    expect(document.querySelectorAll('#sw-update-notification')).toHaveLength(1);
    expect(h.worker.postMessage).not.toHaveBeenCalled();
  });

  it('does not show an update notification on first installation', async () => {
    const h = harness();
    h.serviceWorker.controller = null;
    h.registration.waiting = null;
    h.registration.installing = h.worker;
    h.run();
    await waitFor(() => expect(h.workerEvents.has('statechange')).toBe(true));
    h.worker.state = 'installed';
    h.workerEvents.get('statechange')?.();
    expect(document.getElementById('sw-update-notification')).not.toBeInTheDocument();
  });

  it('catches asynchronous update failures on reconnect and resume without changing drafts', async () => {
    const h = harness();
    h.registration.update.mockRejectedValue(new Error('offline'));
    h.run();
    await waitFor(() => expect(h.documentEvents.has('visibilitychange')).toBe(true));
    h.documentEvents.get('visibilitychange')?.();
    h.windowEvents.get('online')?.();
    await waitFor(() => expect(h.registration.update).toHaveBeenCalledTimes(2));
    h.fakeDocument.visibilityState = 'hidden';
    h.documentEvents.get('visibilitychange')?.();
    expect(h.registration.update).toHaveBeenCalledTimes(2);
    expect(h.reload).not.toHaveBeenCalled();
  });

  it('contains registration failure without reloading', async () => {
    const h = harness();
    h.register.mockRejectedValue(new Error('privacy settings'));
    h.run();
    await Promise.resolve();
    expect(h.reload).not.toHaveBeenCalled();
    expect(document.getElementById('sw-update-notification')).not.toBeInTheDocument();
  });

  it('retries a failed initial registration when connectivity returns', async () => {
    const h = harness('loading');
    h.register.mockRejectedValueOnce(new Error('offline'));
    h.run();
    await h.windowEvents.get('load')?.();
    h.windowEvents.get('online')?.();
    await waitFor(() => expect(h.register).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(document.getElementById('sw-update-notification')).toBeInTheDocument(),
    );
    expect(h.worker.postMessage).not.toHaveBeenCalled();
    expect(h.reload).not.toHaveBeenCalled();
  });

  it.each([
    '',
    '?pwa=10',
    '?other=pwa=1',
  ])('leaves local development uncontrolled unless explicitly opted in: %s', (search) => {
    const h = harness();
    h.fakeWindow.location.search = search;
    h.run();
    expect(h.register).not.toHaveBeenCalled();
  });
});
