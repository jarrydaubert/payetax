import { fireEvent, render, screen } from '@/test/testing-library';

import { AccountantReferralCTA } from '../AccountantReferralCTA';

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AccountantReferralCTA', () => {
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
});
