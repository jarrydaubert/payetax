/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useIsMobile, useIsSmallMobile, useIsTouch, useMediaQuery } from '../useMediaQuery';

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  it('returns the initial media query match', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('cleans up the media query listener on unmount', () => {
    const removeEventListener = jest.fn();

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener,
      dispatchEvent: jest.fn(),
    }));

    const { unmount } = renderHook(() => useMediaQuery('(hover: none)'));
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('exposes the preset hooks through useMediaQuery', () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' || query === '(hover: none)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    expect(renderHook(() => useIsMobile()).result.current).toBe(true);
    expect(renderHook(() => useIsTouch()).result.current).toBe(true);
    expect(renderHook(() => useIsSmallMobile()).result.current).toBe(false);
  });
});
