// src/lib/__tests__/theme.test.tsx
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../theme';

describe('theme', () => {
  let mockLocalStorage: Record<string, string>;
  let mockMatchMedia: jest.Mock;
  let mockGtag: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Storage.prototype.getItem = jest.fn((key: string) => mockLocalStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    // Mock matchMedia
    mockMatchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Mock gtag
    mockGtag = jest.fn();
    Object.defineProperty(window, 'gtag', {
      writable: true,
      value: mockGtag,
      configurable: true,
    });

    // Clear document classes
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (window as Window & { gtag?: unknown }).gtag = undefined;
  });

  describe('ThemeProvider', () => {
    it('renders children', () => {
      render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('initializes with dark theme by default', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Updated: Default theme is now 'dark' instead of 'system'
      expect(result.current.theme).toBe('dark');
    });

    it('loads theme from localStorage if available', async () => {
      mockLocalStorage.theme = 'light';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });

    it('applies dark theme to document when system prefers dark', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('applies dark theme to document by default (not system light)', async () => {
      // System prefers light, but our default is dark theme
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        // Updated: Since default theme is 'dark' (not 'system'), it should be dark
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });
  });

  describe('useTheme', () => {
    it('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('returns theme context when used within ThemeProvider', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('cycleTheme');
      expect(result.current).toHaveProperty('resolvedTheme');
    });
  });

  describe('setTheme', () => {
    it('updates theme state', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });

    it('saves theme to localStorage', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('applies theme to document', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.style.colorScheme).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });

    it('resolves system theme to actual theme', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // System prefers dark
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('tracks theme change in GA4', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('event', 'theme_toggle', {
          event_category: 'engagement',
          event_label: 'dark',
          value: 'dark',
        });
      });
    });

    it('tracks system theme value in GA4 when theme is system', async () => {
      mockMatchMedia.mockReturnValue({
        matches: false, // System prefers light
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('system');
      });

      await waitFor(() => {
        expect(mockGtag).toHaveBeenCalledWith('event', 'theme_toggle', {
          event_category: 'engagement',
          event_label: 'system',
          value: 'light',
        });
      });
    });

    it('does not track when gtag is unavailable', async () => {
      (window as Window & { gtag?: unknown }).gtag = undefined;

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
      // Should not throw error
    });
  });

  describe('cycleTheme', () => {
    it('cycles from dark to system (new default is dark)', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Default is now 'dark', cycling should go dark → system
      act(() => {
        result.current.cycleTheme();
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
      });
    });

    it('cycles from light to dark', async () => {
      mockLocalStorage.theme = 'light';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      act(() => {
        result.current.cycleTheme();
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });

    it('cycles from dark to system', async () => {
      mockLocalStorage.theme = 'dark';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      act(() => {
        result.current.cycleTheme();
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
      });
    });
  });

  describe('System theme detection', () => {
    it('detects dark system preference', async () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark');
      });
    });

    it('detects light system preference only when theme is system', async () => {
      // Set localStorage to use 'system' theme
      mockLocalStorage.theme = 'system';

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        // Now it should respect system preference since theme is 'system'
        expect(result.current.theme).toBe('system');
        expect(result.current.resolvedTheme).toBe('light');
      });
    });

    it('listens for system theme changes when theme is system', async () => {
      // Set localStorage to use 'system' theme
      mockLocalStorage.theme = 'system';

      let mediaQueryListener: ((e: { matches: boolean }) => void) | null = null;
      const addEventListenerMock = jest.fn((event, handler) => {
        if (event === 'change') {
          mediaQueryListener = handler;
        }
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.resolvedTheme).toBe('light');
      });

      // Simulate system theme change to dark
      act(() => {
        if (mediaQueryListener) {
          mockMatchMedia.mockReturnValue({
            ...mockMatchMedia(),
            matches: true,
          });
          mediaQueryListener({ matches: true });
        }
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark');
      });
    });

    it('only updates on system change when theme is system', async () => {
      let mediaQueryListener: ((e: { matches: boolean }) => void) | null = null;
      const addEventListenerMock = jest.fn((event, handler) => {
        if (event === 'change') {
          mediaQueryListener = handler;
        }
      });

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: addEventListenerMock,
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      // Set explicit light theme (not system)
      act(() => {
        result.current.setTheme('light');
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Simulate system theme change - should not affect explicit light theme
      act(() => {
        if (mediaQueryListener) {
          mockMatchMedia.mockReturnValue({
            ...mockMatchMedia(),
            matches: true,
          });
          mediaQueryListener({ matches: true });
        }
      });

      // Theme should still be light (not affected by system change)
      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  describe('Cross-tab synchronization', () => {
    it('sets up storage event listener', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      });

      addEventListenerSpy.mockRestore();
    });

    it('ignores storage events for other keys', async () => {
      mockLocalStorage.theme = 'light';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Simulate storage event for different key
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'other-key',
          newValue: 'value',
        });
        window.dispatchEvent(storageEvent);
      });

      // Theme should remain unchanged
      expect(result.current.theme).toBe('light');
    });

    it('ignores storage events with no new value', async () => {
      mockLocalStorage.theme = 'dark';

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      // Simulate storage event with null newValue
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'theme',
          newValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      // Theme should remain unchanged
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeMediaListener = jest.fn();
      const removeStorageListener = jest.fn();

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: removeMediaListener,
      });

      jest.spyOn(window, 'removeEventListener').mockImplementation(removeStorageListener);

      const { unmount } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      unmount();

      expect(removeMediaListener).toHaveBeenCalled();
      expect(removeStorageListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });
  });
});
