'use client';

import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { resolveTaxYear } from '@/lib/tax';

export const FIGURE_PREFERENCE_KEY = 'payetax-remember-figures';
const KEYS = ['tax-calculator-storage', 'director-guide-storage'] as const;
type FigureKey = (typeof KEYS)[number];
type Preference = { id: string; enabled: boolean; erasureId?: string };
type Snapshot = { state: Record<string, unknown>; version?: number };
const DAY = 24 * 60 * 60 * 1000;

export const useFigureStorage = create(() => ({
  enabled: false,
  legacy: false,
  unavailable: false,
  erasureFailed: false,
}));

type FigureStore = { clear: () => void; restore: () => void; snapshot: () => Snapshot };
const stores = new Map<FigureKey, FigureStore>();
let preference: Preference | null = null;
let initialized = false;
let listening = false;
let disabledAfterFailure = false;
const revokedIds = new Set<string>();
// Retain only authority tokens, never an extra in-memory copy of saved financial figures.
const knownSnapshots = new Map<FigureKey, string>();
const revisions = new Map<FigureKey, number>();
let suppressWrites = false;
let channel: BroadcastChannel | undefined;

function newId() {
  try {
    if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* Clearing must still work without secure-context UUID support. */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function calendarYear(date = new Date()) {
  return (
    date.getFullYear() -
    (date.getMonth() < 3 || (date.getMonth() === 3 && date.getDate() < 6) ? 1 : 0)
  );
}

function readPreference(): Preference | null {
  const raw = localStorage.getItem(FIGURE_PREFERENCE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return value?.version === 1 &&
      typeof value.id === 'string' &&
      typeof value.enabled === 'boolean'
      ? {
          id: value.id,
          enabled: value.enabled,
          erasureId: typeof value.erasureId === 'string' ? value.erasureId : undefined,
        }
      : null;
  } catch {
    return null;
  }
}

function readSnapshot(key: FigureKey): Snapshot | null | undefined {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.state && typeof value.state === 'object' && !Array.isArray(value.state))
      return value;
  } catch {
    /* Remove corrupt financial storage rather than repeatedly attempting restoration. */
  }
  return undefined;
}

function expired(key: FigureKey, snapshot: Snapshot) {
  const { _savedAt, _calendarYear } = snapshot.state;
  const days = key === KEYS[0] ? 30 : 7;
  return (
    (typeof _savedAt === 'number' &&
      (_savedAt > Date.now() || Date.now() - _savedAt >= days * DAY)) ||
    (key === KEYS[1] &&
      typeof snapshot.state._taxYear === 'string' &&
      snapshot.state._taxYear !== resolveTaxYear()) ||
    (snapshot.state._rememberId !== undefined &&
      (typeof _savedAt !== 'number' ||
        !Number.isFinite(_savedAt) ||
        _savedAt <= 0 ||
        typeof _calendarYear !== 'number')) ||
    (typeof _calendarYear === 'number' && _calendarYear !== calendarYear()) ||
    (_calendarYear === undefined &&
      typeof _savedAt === 'number' &&
      calendarYear(new Date(_savedAt)) !== calendarYear())
  );
}

function withoutSaving(action: () => void) {
  const previous = suppressWrites;
  suppressWrites = true;
  try {
    action();
  } finally {
    suppressWrites = previous;
  }
}

function clearMemory(key?: FigureKey) {
  withoutSaving(() => {
    for (const name of key ? [key] : KEYS) {
      revisions.set(name, (revisions.get(name) ?? 0) + 1);
      stores.get(name)?.clear();
    }
  });
}

function storageFailed(erasureFailed = useFigureStorage.getState().erasureFailed) {
  disabledAfterFailure = true;
  useFigureStorage.setState({ enabled: false, unavailable: true, erasureFailed });
}

// All read-modify-write operations share one origin-wide lock. Storage events alone
// cannot serialize an erasure with a save or a legacy restore in another tab.
function withFigureLock(action: () => void, onFailure = () => storageFailed()) {
  try {
    const locks = navigator.locks;
    if (locks) return locks.request(FIGURE_PREFERENCE_KEY, action).catch(onFailure);
  } catch {
    onFailure();
    return;
  }
  onFailure();
}

export function syncFigureStorage() {
  if (typeof window !== 'undefined') withFigureLock(() => refreshStorage());
}

// Synchronous Zustand hydration only observes storage. Cleanup requires the lock.
function refreshStorage(cleanup = true) {
  try {
    const savedPreference = readPreference();
    const next =
      savedPreference && revokedIds.has(savedPreference.id)
        ? { ...savedPreference, enabled: false }
        : savedPreference;
    // Enabling remembering does not replace another tab's active session. Erasure gets
    // its own generation so a tab cannot miss a clear followed quickly by a new opt-in.
    const revoked =
      initialized &&
      !(savedPreference && revokedIds.has(savedPreference.id)) &&
      (next?.erasureId !== preference?.erasureId ||
        (preference?.enabled && (next?.id !== preference.id || !next.enabled)));
    preference = next;
    initialized = true;
    if (revoked) clearMemory();
    let legacy = false;
    for (const key of KEYS) {
      const snapshot = readSnapshot(key);
      if (!snapshot) {
        if (snapshot === undefined && cleanup) localStorage.removeItem(key);
        const knownId = knownSnapshots.get(key);
        knownSnapshots.delete(key);
        if (knownId && knownId === next?.id && next.enabled) {
          clearMemory(key);
        }
        continue;
      }
      const isExpired = expired(key, snapshot);
      const stale =
        isExpired ||
        (snapshot.state._rememberId !== undefined && snapshot.state._rememberId !== next?.id) ||
        (next !== null && !next.enabled);
      if (stale) {
        if (cleanup) localStorage.removeItem(key);
        knownSnapshots.delete(key);
        if (isExpired && snapshot.state._rememberId !== undefined) {
          clearMemory(key);
        }
      } else if (!next?.enabled || snapshot.state._rememberId !== next.id) {
        legacy = true;
      } else {
        knownSnapshots.set(key, next.id);
      }
    }
    useFigureStorage.setState({
      enabled: Boolean(next?.enabled && !disabledAfterFailure),
      legacy,
      unavailable: disabledAfterFailure,
    });
    return true;
  } catch {
    storageFailed();
    return false;
  }
}

function startListening() {
  if (typeof window === 'undefined' || listening) return;
  listening = true;
  syncFigureStorage();
  window.addEventListener('storage', (event) => {
    try {
      if (event.storageArea && event.storageArea !== localStorage) return;
    } catch {
      storageFailed();
      return;
    }
    if (
      event.key === null ||
      event.key === FIGURE_PREFERENCE_KEY ||
      KEYS.includes(event.key as FigureKey)
    ) {
      if (event.key === null) clearMemory();
      syncFigureStorage();
    }
  });
  window.addEventListener('focus', syncFigureStorage);
  window.addEventListener('pageshow', syncFigureStorage);
  document.addEventListener('visibilitychange', syncFigureStorage);
  window.setInterval(syncFigureStorage, 60_000);
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(FIGURE_PREFERENCE_KEY);
    } catch {
      return;
    }
    channel.onmessage = (event) => {
      if (event.data?.type === 'clear') {
        if (preference?.id === event.data.revokedId || !preference?.enabled) clearMemory();
        if (typeof event.data.revokedId === 'string') revokedIds.add(event.data.revokedId);
      }
      syncFigureStorage();
    };
  }
}

export function registerFigureStore(key: FigureKey, store: FigureStore) {
  stores.set(key, store);
}

export const figureStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    startListening();
    try {
      if (!navigator.locks) return null;
      if (!(refreshStorage(false) && preference?.enabled) || disabledAfterFailure) return null;
      const key = name as FigureKey;
      const snapshot = readSnapshot(key);
      if (snapshot?.state._rememberId !== preference.id || expired(key, snapshot)) return null;
      return JSON.stringify(snapshot);
    } catch {
      storageFailed();
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined' || suppressWrites) return;
    startListening();
    const id = preference?.id;
    if (!(id && preference?.enabled) || disabledAfterFailure) return;
    const key = name as FigureKey;
    const revision = revisions.get(key);
    return withFigureLock(() => {
      if (
        !(refreshStorage() && preference?.enabled) ||
        preference.id !== id ||
        revisions.get(key) !== revision ||
        disabledAfterFailure ||
        useFigureStorage.getState().legacy
      )
        return;
      writeSnapshot(key, JSON.parse(value), id);
    });
  },
  removeItem: (name) =>
    withFigureLock(
      () => {
        localStorage.removeItem(name);
        knownSnapshots.delete(name as FigureKey);
      },
      () => storageFailed(true),
    ),
};

function writeSnapshot(key: FigureKey, snapshot: Snapshot, id: string) {
  snapshot.state._rememberId = id;
  snapshot.state._calendarYear = calendarYear();
  localStorage.setItem(key, JSON.stringify(snapshot));
  knownSnapshots.set(key, id);
}

/** One explicit preference covers both calculators; changing it never touches analytics keys. */
export function rememberFigures(restoreLegacy = false) {
  startListening();
  const observedId = preference?.id;
  return withFigureLock(() => {
    if (
      !refreshStorage() ||
      preference?.id !== observedId ||
      useFigureStorage.getState().legacy !== restoreLegacy
    )
      return;

    // Retry under the existing consent so other tabs keep their live figures.
    const retry = preference?.enabled && !restoreLegacy ? preference : null;
    if (retry && !disabledAfterFailure) return;

    const next: Preference = retry ?? {
      id: newId(),
      enabled: true,
      // Other open tabs must drop drafts from the quarantine period.
      erasureId: restoreLegacy ? newId() : preference?.erasureId,
    };
    const migrated: FigureKey[] = [];
    if (restoreLegacy) {
      for (const key of KEYS) {
        const snapshot = readSnapshot(key);
        if (!snapshot) continue;
        snapshot.state._rememberId = next.id;
        snapshot.state._calendarYear = calendarYear();
        snapshot.state._savedAt ??= Date.now();
        localStorage.setItem(key, JSON.stringify(snapshot));
        migrated.push(key);
      }
    }
    if (!retry) {
      // Publish consent after migration. Interrupted migration cannot authorize its snapshots.
      localStorage.setItem(FIGURE_PREFERENCE_KEY, JSON.stringify({ ...next, version: 1 }));
      preference = next;
    }
    if (!restoreLegacy) {
      for (const [key, store] of stores) writeSnapshot(key, store.snapshot(), next.id);
    }
    disabledAfterFailure = false;
    useFigureStorage.setState({
      enabled: true,
      legacy: false,
      unavailable: false,
      erasureFailed: false,
    });
    if (restoreLegacy) {
      withoutSaving(() => {
        for (const key of migrated) stores.get(key)?.restore();
      });
    }
  });
}

export function clearFigures() {
  startListening();
  clearMemory();
  // A browser without Web Locks never writes snapshots, but can erase old data.
  return withFigureLock(
    () => eraseSavedFigures(true),
    () => eraseSavedFigures(false),
  );
}

function eraseSavedFigures(lockAvailable: boolean) {
  let revokedId = preference?.id;
  try {
    revokedId = readPreference()?.id ?? revokedId;
  } catch {
    // Even if storage is blocked, revoke the consent last observed by this tab.
  }
  if (revokedId) revokedIds.add(revokedId);
  preference = { id: newId(), enabled: false, erasureId: newId() };
  useFigureStorage.setState({ enabled: false, legacy: false, erasureFailed: false });
  let failed = false;
  let savedPreference = false;
  try {
    localStorage.setItem(FIGURE_PREFERENCE_KEY, JSON.stringify({ ...preference, version: 1 }));
    savedPreference = true;
  } catch {
    // Quota can block writes while removals still work. Remove the old opt-in immediately
    // so reloading cannot silently restore it, then retry the erasure marker after freeing space.
    try {
      localStorage.removeItem(FIGURE_PREFERENCE_KEY);
      if (localStorage.getItem(FIGURE_PREFERENCE_KEY) !== null) failed = true;
    } catch {
      failed = true;
    }
  }
  for (const key of KEYS) {
    try {
      localStorage.removeItem(key);
      if (localStorage.getItem(key) !== null) failed = true;
    } catch {
      failed = true;
    }
  }
  if (!savedPreference) {
    try {
      localStorage.setItem(FIGURE_PREFERENCE_KEY, JSON.stringify({ ...preference, version: 1 }));
      savedPreference = true;
    } catch {
      // An absent preference also fails closed after reload; snapshot removal was checked above.
      if (!failed) preference = null;
    }
  }
  clearMemory();
  try {
    if (!(savedPreference && lockAvailable)) channel?.postMessage({ type: 'clear', revokedId });
  } catch {
    // The storage event still propagates a successfully saved erasure marker.
  }
  if (failed) storageFailed(true);
  else {
    disabledAfterFailure = false;
    useFigureStorage.setState({ unavailable: !lockAvailable });
  }
}
