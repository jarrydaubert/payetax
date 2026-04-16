/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useHorizontalScrollIndicator } from '../useHorizontalScrollIndicator';

describe('useHorizontalScrollIndicator', () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    window.requestAnimationFrame = jest
      .fn()
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });
    window.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    jest.restoreAllMocks();
  });

  function buildScrollableRef() {
    const container = document.createElement('div');
    const content = document.createElement('div');
    container.appendChild(content);
    let scrollLeft = 0;

    Object.defineProperty(container, 'clientWidth', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(container, 'scrollWidth', {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (value: number) => {
        scrollLeft = value;
      },
    });

    return { current: container };
  }

  it('shows the right indicator when content overflows initially', () => {
    const ref = buildScrollableRef();
    const { result } = renderHook(() => useHorizontalScrollIndicator(ref));

    expect(result.current.showLeftIndicator).toBe(false);
    expect(result.current.showRightIndicator).toBe(true);
  });

  it('registers and removes scroll listeners', () => {
    const ref = buildScrollableRef();
    const addEventListener = jest.spyOn(ref.current, 'addEventListener');
    const removeEventListener = jest.spyOn(ref.current, 'removeEventListener');

    const { unmount } = renderHook(() => useHorizontalScrollIndicator(ref));

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
