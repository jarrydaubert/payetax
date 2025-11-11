/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { LandscapePrompt } from '../LandscapePrompt';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

describe('LandscapePrompt', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render on mobile portrait mode', () => {
    // Mock mobile portrait
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query); // Mobile
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(true)(query); // Portrait
      }
      return createMatchMediaMock(false)(query);
    });

    render(<LandscapePrompt />);

    // Should show the prompt
    expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();
    expect(
      screen.getByText('Turn your device sideways to see charts in full detail')
    ).toBeInTheDocument();
  });

  it('should not render on desktop', () => {
    // Mock desktop
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(false)(query); // Desktop
      }
      return createMatchMediaMock(true)(query);
    });

    render(<LandscapePrompt />);

    // Should not show
    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('should not render in landscape mode', () => {
    // Mock mobile landscape
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query); // Mobile
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(false)(query); // Landscape
      }
      return createMatchMediaMock(false)(query);
    });

    render(<LandscapePrompt />);

    // Should not show
    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('should dismiss and save to localStorage', () => {
    // Mock mobile portrait
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query);
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(true)(query);
      }
      return createMatchMediaMock(false)(query);
    });

    const onDismiss = jest.fn();
    render(<LandscapePrompt onDismiss={onDismiss} />);

    // Click dismiss button
    const dismissButton = screen.getByLabelText('Dismiss landscape prompt');
    fireEvent.click(dismissButton);

    // Should call onDismiss
    expect(onDismiss).toHaveBeenCalledTimes(1);

    // Should save to localStorage
    expect(localStorageMock.getItem('landscape-prompt-dismissed')).toBe('true');
  });

  it('should not render if previously dismissed', () => {
    // Set localStorage
    localStorageMock.setItem('landscape-prompt-dismissed', 'true');

    // Mock mobile portrait
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query);
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(true)(query);
      }
      return createMatchMediaMock(false)(query);
    });

    render(<LandscapePrompt />);

    // Should not show
    expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    // Mock mobile portrait
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query);
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(true)(query);
      }
      return createMatchMediaMock(false)(query);
    });

    render(<LandscapePrompt />);

    const prompt = screen.getByRole('status');
    expect(prompt).toHaveAttribute('aria-live', 'polite');
    expect(prompt).toHaveAttribute('aria-label', 'Rotate device for better chart viewing');

    const dismissButton = screen.getByLabelText('Dismiss landscape prompt');
    expect(dismissButton).toHaveAttribute('type', 'button');
  });

  it('should apply custom className', () => {
    // Mock mobile portrait
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)') {
        return createMatchMediaMock(true)(query);
      }
      if (query === '(orientation: portrait)') {
        return createMatchMediaMock(true)(query);
      }
      return createMatchMediaMock(false)(query);
    });

    const { container } = render(<LandscapePrompt className='custom-class' />);

    const promptWrapper = container.querySelector('.custom-class');
    expect(promptWrapper).toBeInTheDocument();
  });
});
