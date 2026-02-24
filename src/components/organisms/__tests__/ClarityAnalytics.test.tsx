import { render, waitFor } from '@/test/testing-library';

const mockAreCookiesAccepted = jest.fn();

jest.mock('@/lib/cookieUtils', () => ({
  areCookiesAccepted: () => mockAreCookiesAccepted(),
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <script {...props}>{children}</script>,
}));

import { ClarityAnalytics } from '../ClarityAnalytics';

describe('ClarityAnalytics', () => {
  afterEach(() => {
    mockAreCookiesAccepted.mockReset();
  });

  it('does not render without consent', () => {
    mockAreCookiesAccepted.mockReturnValue(false);

    const { container } = render(<ClarityAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders clarity bootstrap script when consented and id is set', async () => {
    mockAreCookiesAccepted.mockReturnValue(true);

    const { container } = render(<ClarityAnalytics />);

    await waitFor(() => {
      const script = container.querySelector('script#microsoft-clarity');
      expect(script).toBeInTheDocument();
      expect(script?.textContent).toContain('https://www.clarity.ms/tag/');
      expect(script?.textContent).toContain('vmbk1d0ng2');
    });
  });
});
