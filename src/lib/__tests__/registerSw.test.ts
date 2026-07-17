/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { waitFor } from '@testing-library/react';

function executeRegisterSwScript() {
  const script = readFileSync(join(process.cwd(), 'public/register-sw.js'), 'utf8');
  runInNewContext(script, {
    window,
    document,
    navigator: window.navigator,
    localStorage: window.localStorage,
    setTimeout,
    clearTimeout,
    Event,
    console,
  });
}

function captureLoadHandler() {
  let loadHandler: ((event: Event) => void) | null = null;

  jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
    if (type === 'load') {
      loadHandler = listener as (event: Event) => void;
    }
  });

  return () => {
    if (!loadHandler) {
      throw new Error('Expected register-sw script to attach a load handler');
    }
    loadHandler(new Event('load'));
  };
}

describe('register-sw script', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.localStorage.clear();
    window.history.pushState({}, '', '/?pwa=1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not bypass the app-owned analytics consent gate', () => {
    const script = readFileSync(join(process.cwd(), 'public/register-sw.js'), 'utf8');

    expect(script).not.toContain('window.gtag');
    expect(script).not.toContain("localStorage.getItem('cookie-consent')");
  });

  it('auto-activates waiting updates in standalone PWA mode', async () => {
    const waitingWorker = { postMessage: jest.fn() };
    const registration = {
      waiting: waitingWorker,
      installing: null,
      addEventListener: jest.fn(),
      update: jest.fn(),
    };
    const register = jest.fn().mockResolvedValue(registration);
    const addEventListener = jest.fn();

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        addEventListener,
        controller: {},
      },
    });

    jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const runLoadHandler = captureLoadHandler();
    executeRegisterSwScript();
    runLoadHandler();

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    });

    await waitFor(() => {
      expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });

    expect(document.getElementById('sw-update-notification')).not.toBeInTheDocument();
  });

  it('shows update banner instead of auto-activating in browser tab mode', async () => {
    const waitingWorker = { postMessage: jest.fn() };
    const registration = {
      waiting: waitingWorker,
      installing: null,
      addEventListener: jest.fn(),
      update: jest.fn(),
    };
    const register = jest.fn().mockResolvedValue(registration);
    const addEventListener = jest.fn();

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        addEventListener,
        controller: {},
      },
    });

    jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const runLoadHandler = captureLoadHandler();
    executeRegisterSwScript();
    runLoadHandler();

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    });

    await waitFor(() => {
      expect(document.getElementById('sw-update-notification')).toBeInTheDocument();
    });

    expect(waitingWorker.postMessage).not.toHaveBeenCalled();
  });
});
