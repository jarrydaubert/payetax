/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { LandscapePrompt } from '../LandscapePrompt';

const DISMISS_KEY = 'landscapePrompt:dismissed:v1';

// Minimal localStorage mock used by safeStorage helpers.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
    writable: true,
  });
}

describe('LandscapePrompt', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Default to desktop landscape to avoid test bleed.
    setViewport(1024, 768);
  });

  it('renders on mobile portrait', () => {
    setViewport(375, 812); // portrait + < md
    render(<LandscapePrompt />);

    expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();
    expect(screen.getByText('Turn your device sideways for easier viewing')).toBeInTheDocument();
  });

  it('does not render on desktop', () => {
    setViewport(1280, 800);
    render(<LandscapePrompt />);

    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('does not render in landscape orientation', () => {
    setViewport(812, 375); // landscape
    render(<LandscapePrompt />);

    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('dismisses and persists dismissal to localStorage', () => {
    setViewport(375, 812);
    const onDismiss = jest.fn();

    render(<LandscapePrompt onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss landscape prompt' });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(localStorageMock.getItem(DISMISS_KEY)).toBe('true');
    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();

    // Re-render should stay hidden.
    render(<LandscapePrompt />);
    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('renders with accessibility basics', () => {
    setViewport(375, 812);
    render(<LandscapePrompt />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('button', { name: 'Dismiss landscape prompt' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('applies custom className on wrapper', () => {
    setViewport(375, 812);
    render(<LandscapePrompt className='custom-class' />);

    expect(document.body.querySelector('.custom-class')).toBeInTheDocument();
  });
});
