/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/TaxTrapInlineAlert.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { TaxTrapInlineAlert } from '../TaxTrapInlineAlert';

describe('TaxTrapInlineAlert', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  describe('Rendering and Content', () => {
    it('should render the alert with tax trap message', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      expect(screen.getByText('Tax Trap Alert')).toBeInTheDocument();
      expect(screen.getByText(/You're losing/)).toBeInTheDocument();
      expect(screen.getByText(/60% tax trap/)).toBeInTheDocument();
    });

    it('should display correct personal allowance lost for £110k salary', () => {
      // £110k - £100k = £10k excess
      // Allowance lost = £10k / 2 = £5,000
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      expect(screen.getByText(/£5,000/)).toBeInTheDocument();
      expect(screen.getByText(/in personal allowance/)).toBeInTheDocument();
    });

    it('should display correct personal allowance lost for £120k salary', () => {
      // £120k - £100k = £20k excess
      // Allowance lost = £20k / 2 = £10,000
      render(<TaxTrapInlineAlert salary={120000} suggestedPension={20000} />);

      expect(screen.getByText(/£10,000/)).toBeInTheDocument();
    });

    it('should display suggested pension amount in description when callback provided', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={110000}
          suggestedPension={12500}
          onApplyPension={mockCallback}
        />,
      );

      expect(screen.getByText(/Add £12,500 to your pension/)).toBeInTheDocument();
    });

    it('should display suggested pension amount in button', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={110000}
          suggestedPension={15000}
          onApplyPension={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /Add £15,000 to Pension/i })).toBeInTheDocument();
    });

    it('should NOT show pension suggestion when no callback provided', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      expect(screen.queryByRole('button', { name: /Add.*to Pension/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/Add.*to your pension/)).not.toBeInTheDocument();
    });
  });

  describe('Personal Allowance Calculations', () => {
    it('should calculate allowance lost correctly at £100k (£0 lost)', () => {
      render(<TaxTrapInlineAlert salary={100000} suggestedPension={0} />);

      // At exactly £100k, no allowance is lost yet
      expect(screen.getByText(/£0/)).toBeInTheDocument();
    });

    it('should calculate allowance lost correctly at £105k (£2,500 lost)', () => {
      // £105k - £100k = £5k excess
      // Lost = £5k / 2 = £2,500
      render(<TaxTrapInlineAlert salary={105000} suggestedPension={5000} />);

      expect(screen.getByText(/£2,500/)).toBeInTheDocument();
    });

    it('should cap allowance lost at full Personal Allowance (£12,570)', () => {
      // £125k+ loses entire PA
      // £125k - £100k = £25k excess
      // Lost would be £12.5k, but capped at £12,570
      render(<TaxTrapInlineAlert salary={125140} suggestedPension={25140} />);

      expect(screen.getByText(/£12,570/)).toBeInTheDocument();
    });

    it('should handle very high salary (£150k)', () => {
      // Should still cap at £12,570
      render(<TaxTrapInlineAlert salary={150000} suggestedPension={50000} />);

      expect(screen.getByText(/£12,570/)).toBeInTheDocument();
    });
  });

  describe('Pension Button Interaction', () => {
    it('should call onApplyPension with correct amount when button clicked', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={110000}
          suggestedPension={12000}
          onApplyPension={mockCallback}
        />,
      );

      const button = screen.getByRole('button', { name: /Add £12,000 to Pension/i });
      fireEvent.click(button);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(12000);
    });

    it('should call onApplyPension with different amount', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={115000}
          suggestedPension={18500}
          onApplyPension={mockCallback}
        />,
      );

      const button = screen.getByRole('button', { name: /Add £18,500 to Pension/i });
      fireEvent.click(button);

      expect(mockCallback).toHaveBeenCalledWith(18500);
    });
  });

  describe('Dismiss Functionality', () => {
    it('should render dismiss button', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss tax trap alert/i });
      expect(dismissButton).toBeInTheDocument();
    });

    it('should hide alert when dismiss button is clicked', () => {
      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss tax trap alert/i });
      fireEvent.click(dismissButton);

      // Alert should be removed from DOM
      expect(container.firstChild).toBeNull();
    });

    it('should save dismissal to localStorage', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss tax trap alert/i });
      fireEvent.click(dismissButton);

      expect(localStorageMock.getItem('taxTrapAlertDismissed')).toBe('true');
    });

    it('should not render if already dismissed (from localStorage)', () => {
      // Pre-set localStorage as if user previously dismissed
      localStorageMock.setItem('taxTrapAlertDismissed', 'true');

      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      // Alert should not render
      expect(container.firstChild).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockGetItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: mockGetItem },
        writable: true,
      });

      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      // Should still render (graceful fallback)
      expect(container.firstChild).not.toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('localStorage unavailable'),
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should dismiss in UI even if localStorage.setItem fails', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockSetItem = jest.fn(() => {
        throw new Error('localStorage full');
      });
      Object.defineProperty(window, 'localStorage', {
        value: {
          ...localStorageMock,
          setItem: mockSetItem,
        },
        writable: true,
      });

      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss tax trap alert/i });
      fireEvent.click(dismissButton);

      // Should still dismiss in UI
      expect(container.firstChild).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Icons and Styling', () => {
    it('should render AlertTriangle icon', () => {
      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      // AlertTriangle has aria-hidden
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should use warning variant for Alert', () => {
      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const alert = container.querySelector('[role="status"]');
      expect(alert).toHaveClass('border-2');
    });

    it('should apply warning styling on pension button', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={110000}
          suggestedPension={10000}
          onApplyPension={mockCallback}
        />,
      );

      const button = screen.getByRole('button', { name: /Add.*to Pension/i });
      expect(button).toHaveClass('border-warning/40');
      expect(button).toHaveClass('bg-card');
      expect(button).toHaveClass('text-warning');
    });
  });

  describe('Tax Year Support', () => {
    it('should use default tax year when not specified', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      // Should use 2025-2026 rates
      expect(screen.getByText('Tax Trap Alert')).toBeInTheDocument();
    });

    it('should support custom tax year', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} taxYear='2024-2025' />);

      // Should still render correctly
      expect(screen.getByText('Tax Trap Alert')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle £0 suggested pension', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert salary={110000} suggestedPension={0} onApplyPension={mockCallback} />,
      );

      expect(screen.getByRole('button', { name: /Add £0 to Pension/i })).toBeInTheDocument();
    });

    it('should handle very large suggested pension', () => {
      const mockCallback = jest.fn();
      render(
        <TaxTrapInlineAlert
          salary={150000}
          suggestedPension={60000}
          onApplyPension={mockCallback}
        />,
      );

      expect(screen.getByRole('button', { name: /Add £60,000 to Pension/i })).toBeInTheDocument();
    });

    it('should format allowance lost with no decimals', () => {
      // £102,345 - £100k = £2,345 excess
      // Lost = £1,172.50 (but should show £1,173 rounded)
      render(<TaxTrapInlineAlert salary={102345} suggestedPension={2345} />);

      // formatCurrency with 0 decimals
      expect(screen.getByText(/£1,173/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on dismiss button', () => {
      render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss tax trap alert/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss tax trap alert');
    });

    it('should have role="status" on the Alert component (non-destructive)', () => {
      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const alert = container.querySelector('[role="status"]');
      expect(alert).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<TaxTrapInlineAlert salary={110000} suggestedPension={10000} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
