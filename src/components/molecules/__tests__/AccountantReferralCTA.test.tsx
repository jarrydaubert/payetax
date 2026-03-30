import { fireEvent, render, screen, waitFor } from '@/test/testing-library';

import { AccountantReferralCTA } from '../AccountantReferralCTA';

const mockTrackEvent = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

describe('AccountantReferralCTA', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockTrackEvent.mockReset();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('does not render for non-complex situations', () => {
    const { container } = render(
      <AccountantReferralCTA
        situation={{ salary: 50000, isScottish: false, effectiveTaxRate: 20 }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders tax trap CTA and allows dismissal', () => {
    render(
      <AccountantReferralCTA
        situation={{ salary: 110000, isScottish: false, effectiveTaxRate: 35 }}
      />,
    );

    expect(screen.getByText("You're in the £100k Tax Trap")).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Dismiss recommendation/i }));

    expect(screen.queryByText("You're in the £100k Tax Trap")).not.toBeInTheDocument();
  });

  it('shows the lead form and submits successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    render(
      <AccountantReferralCTA
        situation={{ salary: 130000, isScottish: false, effectiveTaxRate: 38 }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /talk to an expert/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'director@example.com' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: /get advice/i }).closest('form') as Element,
    );

    await waitFor(() => {
      expect(screen.getByText(/request received/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/referral/lead',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(mockTrackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'referral_lead_submitted' }),
    );
  });

  it('shows a rate-limit error when the API returns 429', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429 });

    render(
      <AccountantReferralCTA
        situation={{ salary: 105000, isScottish: false, effectiveTaxRate: 34 }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /talk to an expert/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'director@example.com' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: /get advice/i }).closest('form') as Element,
    );

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('renders the Scottish high earner variant', () => {
    render(
      <AccountantReferralCTA
        situation={{ salary: 90000, isScottish: true, effectiveTaxRate: 27 }}
      />,
    );

    expect(screen.getByText(/Scottish High Earner/i)).toBeInTheDocument();
  });
});
