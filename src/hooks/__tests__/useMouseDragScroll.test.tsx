/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { useMouseDragScroll } from '../useMouseDragScroll';

function Harness() {
  const ref = React.useRef<HTMLDivElement>(null);
  useMouseDragScroll(ref);

  return (
    <div ref={ref} data-testid='scroll-container'>
      <button type='button'>Ignore Me</button>
    </div>
  );
}

describe('useMouseDragScroll', () => {
  function createPointerEvent(
    type: string,
    {
      button = 0,
      pageX,
      pageY,
      pointerId = 1,
    }: {
      button?: number;
      pageX: number;
      pageY: number;
      pointerId?: number;
    },
  ) {
    const event = new window.PointerEvent(type, {
      bubbles: true,
      button,
      clientX: pageX,
      clientY: pageY,
    });

    Object.defineProperties(event, {
      pageX: { configurable: true, value: pageX },
      pageY: { configurable: true, value: pageY },
      pointerId: { configurable: true, value: pointerId },
    });

    return event;
  }

  beforeEach(() => {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: MouseEvent,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrolls when dragging a non-interactive area', () => {
    render(<Harness />);

    const element = document.querySelector('[data-testid="scroll-container"]') as HTMLDivElement;
    const scrollTo = jest.fn();
    element.scrollTo = scrollTo;
    element.setPointerCapture = jest.fn();
    element.releasePointerCapture = jest.fn();
    element.scrollLeft = 0;
    element.scrollTop = 0;

    fireEvent(element, createPointerEvent('pointerdown', { button: 0, pageX: 100, pageY: 100 }));
    fireEvent(element, createPointerEvent('pointermove', { pageX: 70, pageY: 100 }));
    fireEvent(element, createPointerEvent('pointerup', { pageX: 70, pageY: 100 }));

    expect(element.setPointerCapture).toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith({
      left: 45,
      top: 0,
      behavior: 'auto',
    });
    expect(element.releasePointerCapture).toHaveBeenCalled();
  });

  it('ignores pointer down on interactive children', () => {
    render(<Harness />);

    const element = document.querySelector('[data-testid="scroll-container"]') as HTMLDivElement;
    const button = document.querySelector('button') as HTMLButtonElement;
    const scrollTo = jest.fn();
    element.scrollTo = scrollTo;
    element.setPointerCapture = jest.fn();

    fireEvent(button, createPointerEvent('pointerdown', { button: 0, pageX: 100, pageY: 100 }));
    fireEvent(element, createPointerEvent('pointermove', { pageX: 60, pageY: 100 }));

    expect(element.setPointerCapture).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
