/**
 * Safe localStorage wrapper that handles SecurityError and other storage exceptions
 *
 * This is needed because localStorage access can throw SecurityError when:
 * - User has cookies/storage blocked in browser settings
 * - Page is loaded in an iframe with restricted permissions
 * - Browser is in private/incognito mode with storage disabled
 * - Third-party context restrictions (cross-origin iframes)
 *
 * @module lib/safeStorage
 */

import type { StateStorage } from 'zustand/middleware';

/**
 * Check if localStorage is available and accessible
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Cache the availability check result
let storageAvailable: boolean | null = null;

function checkStorageAvailable(): boolean {
  if (storageAvailable === null) {
    storageAvailable = isLocalStorageAvailable();
  }
  return storageAvailable;
}

/**
 * Safe localStorage getItem - returns null if storage is unavailable
 */
export function safeGetItem(key: string): string | null {
  if (!checkStorageAvailable()) return null;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safe localStorage setItem - silently fails if storage is unavailable
 */
export function safeSetItem(key: string, value: string): void {
  if (!checkStorageAvailable()) return;

  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail - storage quota exceeded or access denied
  }
}

/**
 * Safe localStorage removeItem - silently fails if storage is unavailable
 */
export function safeRemoveItem(key: string): void {
  if (!checkStorageAvailable()) return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Zustand-compatible StateStorage that safely handles localStorage errors
 * Use this with Zustand's persist middleware to prevent SecurityError crashes
 *
 * @example
 * ```ts
 * import { safeStorage } from '@/lib/safeStorage';
 *
 * const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     {
 *       name: 'store-name',
 *       storage: safeStorage,
 *     }
 *   )
 * );
 * ```
 */
export const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return safeGetItem(name);
  },
  setItem: (name: string, value: string): void => {
    safeSetItem(name, value);
  },
  removeItem: (name: string): void => {
    safeRemoveItem(name);
  },
};
