import { render, waitFor } from '@/test/testing-library';

const mockAreCookiesAccepted = jest.fn();

jest.mock('@/lib/cookieUtils', () => ({
  areCookiesAccepted: () => mockAreCookiesAccepted(),
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: (props: { src: string; 'data-key': string }) => <script {...props} />,
}));

import { AhrefsAnalytics } from '../AhrefsAnalytics';

describe('AhrefsAnalytics', () => {
  afterEach(() => {
    mockAreCookiesAccepted.mockReset();
  });

  it('does not render without consent', async () => {
    mockAreCookiesAccepted.mockReturnValue(false);

    const { container } = render(<AhrefsAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders script when consented and key set', async () => {
    mockAreCookiesAccepted.mockReturnValue(true);

    const { container } = render(<AhrefsAnalytics />);

    await waitFor(() => {
      const script = container.querySelector('script#ahrefs-analytics');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('src', 'https://analytics.ahrefs.com/analytics.js');
      expect(script).toHaveAttribute('data-key', 'ahrefs-test-key');
    });
  });
});
