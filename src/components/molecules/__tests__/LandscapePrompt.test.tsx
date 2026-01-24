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

    // Should show the prompt with updated messaging
    expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();
    expect(screen.getByText('Turn your device sideways for easier viewing')).toBeInTheDocument();
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
    expect(prompt).toHaveAttribute('aria-label', 'Rotate device for better viewing of results');

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

  describe('Visibility Conditions', () => {
    it('should show ONLY when all conditions are met: mobile + portrait + not dismissed', () => {
      // Mock mobile portrait, not dismissed
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 768px)') {
          return createMatchMediaMock(true)(query); // ✅ Mobile
        }
        if (query === '(orientation: portrait)') {
          return createMatchMediaMock(true)(query); // ✅ Portrait
        }
        return createMatchMediaMock(false)(query);
      });
      // ✅ Not dismissed (localStorage clear)

      render(<LandscapePrompt />);

      // ASSERT: Should be visible
      expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss landscape prompt')).toBeInTheDocument();
    });

    it('should NOT show when on desktop (even if portrait)', () => {
      // Mock desktop portrait
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 768px)') {
          return createMatchMediaMock(false)(query); // ❌ Desktop (>768px)
        }
        if (query === '(orientation: portrait)') {
          return createMatchMediaMock(true)(query); // Portrait
        }
        return createMatchMediaMock(false)(query);
      });

      render(<LandscapePrompt />);

      // ASSERT: Should NOT be visible
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
    });

    it('should NOT show when in landscape (even on mobile)', () => {
      // Mock mobile landscape
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 768px)') {
          return createMatchMediaMock(true)(query); // Mobile
        }
        if (query === '(orientation: portrait)') {
          return createMatchMediaMock(false)(query); // ❌ Landscape
        }
        return createMatchMediaMock(false)(query);
      });

      render(<LandscapePrompt />);

      // ASSERT: Should NOT be visible
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
    });

    it('should NOT show when previously dismissed (even if mobile portrait)', () => {
      // Pre-set dismissed state
      localStorageMock.setItem('landscape-prompt-dismissed', 'true'); // ❌ Dismissed

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

      // ASSERT: Should NOT be visible
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
    });

    it('should show on tablet portrait (e.g., iPad Mini: 768px)', () => {
      // Mock exactly at breakpoint (768px) in portrait
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 768px)') {
          return createMatchMediaMock(true)(query); // ✅ At breakpoint
        }
        if (query === '(orientation: portrait)') {
          return createMatchMediaMock(true)(query); // ✅ Portrait
        }
        return createMatchMediaMock(false)(query);
      });

      render(<LandscapePrompt />);

      // ASSERT: Should be visible (<=768px is mobile)
      expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();
    });

    it('should NOT show on tablet landscape (e.g., iPad Mini rotated)', () => {
      // Mock tablet at breakpoint in landscape
      window.matchMedia = jest.fn().mockImplementation((query) => {
        if (query === '(max-width: 768px)') {
          return createMatchMediaMock(true)(query); // Mobile size
        }
        if (query === '(orientation: portrait)') {
          return createMatchMediaMock(false)(query); // ❌ Landscape
        }
        return createMatchMediaMock(false)(query);
      });

      render(<LandscapePrompt />);

      // ASSERT: Should NOT be visible (already in landscape!)
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
    });
  });

  describe('Dismissal Behavior', () => {
    it('should persist dismissal across re-renders', () => {
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

      const { unmount, rerender } = render(<LandscapePrompt />);

      // Should be visible initially
      expect(screen.getByText('Rotate for Better View')).toBeInTheDocument();

      // Dismiss it
      const dismissButton = screen.getByLabelText('Dismiss landscape prompt');
      fireEvent.click(dismissButton);

      // Should immediately hide
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();

      // Re-render the component
      rerender(<LandscapePrompt />);

      // ASSERT: Should STILL be hidden (localStorage persists)
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
      expect(localStorageMock.getItem('landscape-prompt-dismissed')).toBe('true');

      // Even unmount and re-mount should keep it hidden
      unmount();
      render(<LandscapePrompt />);
      expect(screen.queryByText('Rotate for Better View')).not.toBeInTheDocument();
    });

    it('should call onDismiss callback when dismissed', () => {
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

      const mockDismiss = jest.fn();
      render(<LandscapePrompt onDismiss={mockDismiss} />);

      // Dismiss
      const dismissButton = screen.getByLabelText('Dismiss landscape prompt');
      fireEvent.click(dismissButton);

      // ASSERT: Callback should be called exactly once
      expect(mockDismiss).toHaveBeenCalledTimes(1);
      expect(mockDismiss).toHaveBeenCalledWith();
    });
  });

  describe('Animated Icon', () => {
    it('should render phone icon with animation class', () => {
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

      const { container } = render(<LandscapePrompt />);

      // Find the phone icon (Smartphone component from lucide-react)
      // It should have the wiggle animation class
      const animatedIcon = container.querySelector('[class*="animate-"]');
      expect(animatedIcon).toBeInTheDocument();
    });
  });
});
