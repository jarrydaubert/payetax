// src/components/ui/__tests__/CookieBanner.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CookieBanner from '../CookieBanner';

// Mock cookieUtils
jest.mock('@/lib/cookieUtils', () => ({
  getCookieConsent: jest.fn(() => null),
  isConsentExpired: jest.fn(() => false),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CookieBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render banner when consent not given', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);

      // Fast-forward timer to show banner
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/Cookie preferences/i)).toBeInTheDocument();
      });
    });

    it('should render accept and decline buttons', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Essential Only/i })).toBeInTheDocument();
      });
    });

    it('should not render when consent already given', () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue('accepted');
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      expect(screen.queryByText(/Cookie preferences/i)).not.toBeInTheDocument();
    });
  });

  describe('Accept Button', () => {
    it('should hide banner after accepting', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept All/i });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(screen.queryByText(/Cookie preferences/i)).not.toBeInTheDocument();
      });
    });

    it('should save consent to localStorage', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept All/i });
      fireEvent.click(acceptButton);

      expect(localStorage.getItem('cookie-consent')).toBe('accepted');
      expect(localStorage.getItem('cookie-consent-timestamp')).toBeTruthy();
    });
  });

  describe('Decline Button', () => {
    it('should hide banner after declining', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Essential Only/i })).toBeInTheDocument();
      });

      const declineButton = screen.getByRole('button', { name: /Essential Only/i });
      fireEvent.click(declineButton);

      await waitFor(() => {
        expect(screen.queryByText(/Cookie preferences/i)).not.toBeInTheDocument();
      });
    });

    it('should save declined consent to localStorage', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Essential Only/i })).toBeInTheDocument();
      });

      const declineButton = screen.getByRole('button', { name: /Essential Only/i });
      fireEvent.click(declineButton);

      expect(localStorage.getItem('cookie-consent')).toBe('declined');
      expect(localStorage.getItem('cookie-consent-timestamp')).toBeTruthy();
    });
  });

  describe('Privacy Policy Link', () => {
    it('should render privacy policy link', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeInTheDocument();
      });

      const link = screen.getByRole('link', { name: /Privacy Policy/i });
      expect(link).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', async () => {
      const { getCookieConsent, isConsentExpired } = require('@/lib/cookieUtils');
      getCookieConsent.mockReturnValue(null);
      isConsentExpired.mockReturnValue(false);

      render(<CookieBanner />);
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /Accept All/i });
      const declineButton = screen.getByRole('button', { name: /Essential Only/i });

      expect(acceptButton).toBeInTheDocument();
      expect(declineButton).toBeInTheDocument();
    });
  });
});
