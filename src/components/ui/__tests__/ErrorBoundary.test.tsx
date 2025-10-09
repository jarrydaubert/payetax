// src/components/ui/__tests__/ErrorBoundary.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Component that throws error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary Component', () => {
  describe('Normal Rendering', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors and render fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Oops! Something Went Wrong/i)).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(
        screen.getByText(/Don't worry - even the best tax calculators have their off days!/i)
      ).toBeInTheDocument();
    });

    it('should show what user can do section', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/What can you do\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Try refreshing the page/i)).toBeInTheDocument();
    });
  });

  describe('Error State Management', () => {
    it('should generate event ID when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for "Error Reference:" text
      expect(screen.getByText(/Error Reference:/i)).toBeInTheDocument();
    });

    it('should provide reset functionality', () => {
      let shouldThrow = true;
      const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error boundary shows fallback
      expect(screen.getByText(/Oops! Something Went Wrong/i)).toBeInTheDocument();

      // Click "Try Again" button
      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });

      // After reset, don't throw error
      shouldThrow = false;
      fireEvent.click(tryAgainButton);

      // Rerender to show the reset
      rerender(
        <ErrorBoundary>
          <div>Content after reset</div>
        </ErrorBoundary>
      );

      // Should show content now
      expect(screen.getByText('Content after reset')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should accept custom fallback component', () => {
      const CustomFallback = () => <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should pass error info to custom fallback', () => {
      const CustomFallback = ({ error }: { error: Error | null }) => (
        <div>Error: {error?.message}</div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should render Go Home link', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeLink = screen.getByRole('link', { name: /Go Home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render Report Issue link', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reportLink = screen.getByRole('link', { name: /Report Issue/i });
      expect(reportLink).toBeInTheDocument();
      expect(reportLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      expect(tryAgainButton).toBeInTheDocument();
    });

    it('should have accessible links', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeLink = screen.getByRole('link', { name: /Go Home/i });
      expect(homeLink).toBeInTheDocument();
    });
  });
});
