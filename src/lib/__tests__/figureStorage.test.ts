import {
  clearFigures,
  FIGURE_PREFERENCE_KEY,
  rememberFigures,
  syncFigureStorage,
  useFigureStorage,
} from '@/lib/figureStorage';
import { useCalculatorStore as paye } from '@/store/calculatorStore';
import { useDirectorGuideStore as director } from '@/store/directorGuideStore';

const PAYE = 'tax-calculator-storage';
const DIRECTOR = 'director-guide-storage';
const DAY = 86_400_000;

function legacy(key = PAYE, savedAt = Date.now()) {
  localStorage.setItem(
    key,
    JSON.stringify({
      state: { input: { salary: 54321.98 }, formData: { revenue: 87654.32 }, _savedAt: savedAt },
      version: key === PAYE ? 0 : 4,
    }),
  );
}

describe('financial storage opt-in and erasure', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    syncFigureStorage();
    clearFigures();
  });

  it('never saves figures without opt-in, including after calculate and reset', () => {
    paye.getState().setSalary(54321.98);
    paye.getState().calculate();
    director.getState().setRevenue(87654.32);
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(localStorage.getItem(DIRECTOR)).toBeNull();
    expect(useFigureStorage.getState().enabled).toBe(false);
  });

  it('quarantines both legacy snapshots through edits and rehydration until explicitly restored', async () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    syncFigureStorage();
    legacy();
    legacy(DIRECTOR);
    await paye.persist.rehydrate();
    await director.persist.rehydrate();
    expect(paye.getState().input.salary).toBe(0);
    expect(director.getState().formData.revenue).toBeUndefined();
    paye.getState().setSalary(123);
    expect(JSON.parse(localStorage.getItem(PAYE) ?? '').state.input.salary).toBe(54321.98);
    expect(useFigureStorage.getState().legacy).toBe(true);
    rememberFigures(true);
    expect(paye.getState().input.salary).toBe(54321.98);
    expect(director.getState().formData.revenue).toBe(87654.32);
    expect(paye.getState().results).toBeNull();
    expect(useFigureStorage.getState().enabled).toBe(true);
  });

  it('preserves the other calculator’s live inputs on a one-sided restore', () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    syncFigureStorage();
    director.getState().setRevenue(12345.67);
    legacy(PAYE);
    rememberFigures(true);
    expect(paye.getState().input.salary).toBe(54321.98);
    expect(director.getState().formData.revenue).toBe(12345.67);
    expect(localStorage.getItem(DIRECTOR)).toBeNull();
  });

  it('preserves the live PAYE calculation when only Director figures are restored', () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    syncFigureStorage();
    paye.getState().setSalary(54321.98);
    paye.getState().calculate();
    const result = paye.getState().results;
    expect(result).not.toBeNull();

    legacy(DIRECTOR);
    rememberFigures(true);
    expect(director.getState().formData.revenue).toBe(87654.32);
    expect(paye.getState().input.salary).toBe(54321.98);
    expect(paye.getState().results).toBe(result);
    expect(localStorage.getItem(PAYE)).toBeNull();
  });

  it('keeps remembering off when writing the opt-in fails after migration', async () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    syncFigureStorage();
    legacy();
    const set = Storage.prototype.setItem;
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === FIGURE_PREFERENCE_KEY) throw new DOMException('Full', 'QuotaExceededError');
      set.call(this, key, value);
    });

    await rememberFigures(true);
    expect(useFigureStorage.getState().enabled).toBe(false);
    expect(useFigureStorage.getState().unavailable).toBe(true);
    expect(paye.getState().input.salary).toBe(0);
    expect(localStorage.getItem(FIGURE_PREFERENCE_KEY)).toBeNull();
    await paye.persist.rehydrate();
    expect(paye.getState().input.salary).toBe(0);
  });

  it('can erase snapshots when the browser lacks cross-tab locking', async () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'locks');
    if (!descriptor) throw new Error('Missing lock test stub');
    Object.defineProperty(navigator, 'locks', { value: undefined });
    try {
      paye.getState().reset();
      await paye.persist.rehydrate();
      expect(paye.getState().input.salary).toBe(0);
      await clearFigures();
      expect(useFigureStorage.getState().enabled).toBe(false);
      expect(useFigureStorage.getState().unavailable).toBe(true);
      expect(localStorage.getItem(PAYE)).toBeNull();
    } finally {
      Object.defineProperty(navigator, 'locks', descriptor);
    }
  });

  it('restores opted-in pennies on reload but never persists results', async () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    paye.getState().calculate();
    const saved = localStorage.getItem(PAYE) ?? '';
    expect(JSON.parse(saved).state).not.toHaveProperty('results');
    paye.getState().reset();
    localStorage.setItem(PAYE, saved);
    await paye.persist.rehydrate();
    expect(paye.getState().input.salary).toBe(54321.98);
    expect(paye.getState().results).toBeNull();
  });

  it('clears committed inputs, rejected drafts, every result and both saved snapshots without changing analytics', () => {
    localStorage.setItem('cookie-consent', '{"analytics":true}');
    localStorage.setItem('cookie-consent-timestamp', new Date().toISOString());
    rememberFigures();
    paye.getState().setSalary(54321.98);
    paye.getState().calculate();
    director.getState().setRevenue(87654.32);
    paye.getState().setInputError('salary', { text: 'bad', error: 'invalid' });
    const revision = paye.getState().inputRevision;
    clearFigures();
    expect(paye.getState().input.salary).toBe(0);
    expect(paye.getState().inputErrors).toEqual({});
    expect(paye.getState().inputRevision).toBeGreaterThan(revision);
    expect(paye.getState().results).toBeNull();
    expect(paye.getState().previousYearResults).toBeNull();
    expect(paye.getState().whatIfResults).toBeNull();
    expect(director.getState().formData.revenue).toBeUndefined();
    expect(director.getState().strategyComparison).toBeNull();
    expect(director.getState().calculatedFormData).toBeNull();
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(localStorage.getItem(DIRECTOR)).toBeNull();
    expect(localStorage.getItem('cookie-consent')).toBe('{"analytics":true}');
    expect(localStorage.getItem('cookie-consent-timestamp')).not.toBeNull();
    paye.getState().setSalary(123);
    expect(localStorage.getItem(PAYE)).toBeNull();
  });

  it('checks remote revocation before a stale tab can write, even before the storage event arrives', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    localStorage.setItem(
      FIGURE_PREFERENCE_KEY,
      JSON.stringify({ version: 1, id: 'remote-clear', enabled: false }),
    );
    localStorage.removeItem(PAYE);
    paye.getState().setSalary(11111);
    expect(paye.getState().input.salary).toBe(0);
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(useFigureStorage.getState().enabled).toBe(false);
  });

  it('preserves active input when another tab opts in without an intervening clear', () => {
    paye.getState().setSalary(54321.98);
    const previous = JSON.parse(localStorage.getItem(FIGURE_PREFERENCE_KEY) ?? '{}');
    localStorage.setItem(
      FIGURE_PREFERENCE_KEY,
      JSON.stringify({ ...previous, id: 'remote-opt-in', enabled: true }),
    );
    window.dispatchEvent(new StorageEvent('storage', { key: FIGURE_PREFERENCE_KEY }));
    expect(paye.getState().input.salary).toBe(54321.98);
    paye.getState().setSalary(22222.12);
    expect(JSON.parse(localStorage.getItem(PAYE) ?? '{}').state.input.salary).toBe(22222.12);
  });

  it('cannot miss erasure when another tab clears and opts back in before events arrive', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    localStorage.removeItem(PAYE);
    localStorage.setItem(
      FIGURE_PREFERENCE_KEY,
      JSON.stringify({ version: 1, id: 're-enabled', enabled: true, erasureId: 'missed-clear' }),
    );
    paye.getState().setSalary(22222.12);
    expect(paye.getState().input.salary).toBe(0);
    expect(localStorage.getItem(PAYE)).toBeNull();
  });

  it('cannot recreate a snapshot removed by another tab on expiry, before its storage event arrives', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    localStorage.removeItem(PAYE);
    paye.getState().setSalary(22222.12);
    expect(paye.getState().input.salary).toBe(0);
    expect(localStorage.getItem(PAYE)).toBeNull();
  });

  it('resets drafts, result references and revisions when explicitly restoring valid saved figures', () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    syncFigureStorage();
    paye.getState().setInputError('salary', { text: 'bad', error: 'invalid' });
    director.getState().setInputError('revenue', { text: 'bad', error: 'invalid' });
    const revision = paye.getState().inputRevision;
    legacy();
    legacy(DIRECTOR);
    rememberFigures(true);
    expect(paye.getState().input.salary).toBe(54321.98);
    expect(paye.getState().inputErrors).toEqual({});
    expect(paye.getState().inputRevision).toBeGreaterThan(revision);
    expect(director.getState().inputErrors).toEqual({});
    expect(director.getState().calculatedFormData).toBeNull();
  });

  it('clears even when randomUUID is unavailable', () => {
    paye.getState().setSalary(54321.98);
    jest.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new Error('unavailable');
    });
    expect(() => clearFigures()).not.toThrow();
    expect(paye.getState().input.salary).toBe(0);
  });

  it('does not leave an enabled preference to revive after reload when quota blocks its first write', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    clearFigures();
    expect(JSON.parse(localStorage.getItem(FIGURE_PREFERENCE_KEY) ?? '{}').enabled).toBe(false);
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(useFigureStorage.getState().erasureFailed).toBe(false);
  });

  it('removes a stale opt-in when all writes are blocked but removals still work', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    clearFigures();
    expect(localStorage.getItem(FIGURE_PREFERENCE_KEY)).toBeNull();
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(useFigureStorage.getState().enabled).toBe(false);
    expect(useFigureStorage.getState().erasureFailed).toBe(false);
    paye.getState().setSalary(22222.12);
    syncFigureStorage();
    expect(paye.getState().input.salary).toBe(22222.12);
  });

  it.each([
    [PAYE, 30],
    [DIRECTOR, 7],
  ] as const)(
    'physically removes expired %s and cannot rewrite it from stale memory',
    (key, days) => {
      rememberFigures();
      paye.getState().setSalary(54321.98);
      director.getState().setRevenue(87654.32);
      const value = JSON.parse(localStorage.getItem(key) ?? '');
      value.state._savedAt = Date.now() - days * DAY;
      localStorage.setItem(key, JSON.stringify(value));
      if (key === PAYE) paye.getState().setSalary(123);
      else director.getState().setRevenue(123);
      expect(localStorage.getItem(key)).toBeNull();
      expect(
        key === PAYE ? paye.getState().input.salary : director.getState().formData.revenue,
      ).toBe(key === PAYE ? 0 : undefined);
    },
  );

  it('erases a snapshot across calendar tax-year rollover before using its figures again', () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    const value = JSON.parse(localStorage.getItem(PAYE) ?? '');
    value.state._calendarYear -= 1;
    localStorage.setItem(PAYE, JSON.stringify(value));
    syncFigureStorage();
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(paye.getState().input.salary).toBe(0);
  });

  it('does not treat an expired legacy snapshot as permission to save it again', () => {
    localStorage.removeItem(FIGURE_PREFERENCE_KEY);
    legacy(PAYE, Date.now() - 31 * DAY);
    syncFigureStorage();
    expect(localStorage.getItem(PAYE)).toBeNull();
    expect(useFigureStorage.getState().enabled).toBe(false);
    expect(useFigureStorage.getState().legacy).toBe(false);
  });

  it('retries a failed save without resetting live figures or rotating consent', async () => {
    await rememberFigures();
    paye.getState().setSalary(54321.98);
    const consent = localStorage.getItem(FIGURE_PREFERENCE_KEY);
    const saved = localStorage.getItem(PAYE);
    const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });

    paye.getState().setSalary(40000);
    await Promise.resolve();
    paye.getState().calculate();
    director.getState().setRevenue(87654.32);
    const results = paye.getState().results;
    expect(results).not.toBeNull();
    await rememberFigures();
    expect(useFigureStorage.getState()).toMatchObject({ enabled: false, unavailable: true });
    expect(localStorage.getItem(PAYE)).toBe(saved);

    write.mockRestore();
    syncFigureStorage();
    expect(useFigureStorage.getState().enabled).toBe(false);
    await rememberFigures();
    expect(useFigureStorage.getState()).toMatchObject({ enabled: true, unavailable: false });
    expect(localStorage.getItem(FIGURE_PREFERENCE_KEY)).toBe(consent);
    expect(JSON.parse(localStorage.getItem(PAYE) ?? '{}').state.input.salary).toBe(40000);
    expect(JSON.parse(localStorage.getItem(DIRECTOR) ?? '{}').state.formData.revenue).toBe(
      87654.32,
    );
    expect(paye.getState().results).toBe(results);
  });

  it('retries when the first opt-in saved consent but the Director snapshot failed', async () => {
    director.getState().setRevenue(87654.32);
    const set = Storage.prototype.setItem;
    const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (key === DIRECTOR) throw new DOMException('Full', 'QuotaExceededError');
      set.call(this, key, value);
    });

    await rememberFigures();
    const consent = localStorage.getItem(FIGURE_PREFERENCE_KEY);
    expect(JSON.parse(consent ?? '{}').enabled).toBe(true);
    expect(useFigureStorage.getState()).toMatchObject({ enabled: false, unavailable: true });
    expect(localStorage.getItem(DIRECTOR)).toBeNull();
    expect(director.getState().formData.revenue).toBe(87654.32);

    write.mockRestore();
    await rememberFigures();
    expect(useFigureStorage.getState()).toMatchObject({ enabled: true, unavailable: false });
    expect(localStorage.getItem(FIGURE_PREFERENCE_KEY)).toBe(consent);
    expect(JSON.parse(localStorage.getItem(DIRECTOR) ?? '{}').state.formData.revenue).toBe(
      87654.32,
    );
  });

  it('keeps session inputs usable when writes become blocked, and reports incomplete erasure', async () => {
    rememberFigures();
    paye.getState().setSalary(54321.98);
    const saved = localStorage.getItem(PAYE);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    paye.getState().setSalary(22222.12);
    expect(paye.getState().input.salary).toBe(22222.12);
    await Promise.resolve();
    expect(useFigureStorage.getState().enabled).toBe(false);
    paye.getState().setSalary(33333.13);
    expect(paye.getState().input.salary).toBe(33333.13);
    clearFigures();
    expect(paye.getState().input.salary).toBe(0);
    expect(useFigureStorage.getState().erasureFailed).toBe(true);
    expect(localStorage.getItem(PAYE)).toBe(saved);
    paye.getState().setSalary(44444.14);
    syncFigureStorage();
    expect(paye.getState().input.salary).toBe(44444.14);
    jest.restoreAllMocks();
    syncFigureStorage();
    expect(useFigureStorage.getState().enabled).toBe(false);
    expect(localStorage.getItem(PAYE)).toBeNull();
  });
});
