import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as cookieUtils from '@/lib/cookieUtils';
import CookieBanner from '../CookieBanner';

jest.mock('@/lib/cookieUtils', () => ({
  clearCookieConsent: jest.fn(),
  getConsentPreferences: jest.fn(),
  isConsentExpired: jest.fn(),
  setConsentPreferences: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CookieBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (cookieUtils.getConsentPreferences as jest.Mock).mockReturnValue(null);
    (cookieUtils.isConsentExpired as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders compact banner when no consent exists', async () => {
    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByText(/Cookie Preferences/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Essential Only/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage Preferences/i })).toBeInTheDocument();
    expect(screen.getByTestId('cookie-banner')).toHaveClass('sm:left-auto');
  });

  it('stores accepted preferences from banner', async () => {
    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    const accept = await screen.findByRole('button', { name: /Accept All/i });
    fireEvent.click(accept);

    expect(cookieUtils.setConsentPreferences).toHaveBeenCalledWith({ analytics: true });
    await waitFor(() => {
      expect(screen.queryByText(/Cookie Preferences/i)).not.toBeInTheDocument();
    });
  });

  it('stores rejected preferences from banner', async () => {
    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    const reject = await screen.findByRole('button', { name: /Essential Only/i });
    fireEvent.click(reject);

    expect(cookieUtils.setConsentPreferences).toHaveBeenCalledWith({ analytics: false });
  });

  it('opens centered modal from manage preferences and saves toggle state', async () => {
    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    fireEvent.click(await screen.findByRole('button', { name: /Manage Preferences/i }));

    expect(await screen.findByText(/Privacy Overview/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Necessary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();

    const toggle = screen.getByRole('switch', { name: /Enable analytics cookies/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));

    expect(cookieUtils.setConsentPreferences).toHaveBeenCalledWith({ analytics: true });
  });

  it('supports modal reject all action', async () => {
    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    fireEvent.click(await screen.findByRole('button', { name: /Manage Preferences/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Reject All/i }));

    expect(cookieUtils.setConsentPreferences).toHaveBeenCalledWith({ analytics: false });
  });

  it('does not show floating reopen control and still opens modal via custom event', async () => {
    (cookieUtils.getConsentPreferences as jest.Mock).mockReturnValue({ analytics: true });

    render(<CookieBanner />);
    jest.advanceTimersByTime(600);

    expect(screen.queryByTestId('cookie-reopen-button')).not.toBeInTheDocument();
    document.dispatchEvent(new Event('openCookiePreferences'));

    expect(await screen.findByText(/Privacy Overview/i)).toBeInTheDocument();
  });
});
