import { render, waitFor } from '@/test/testing-library';

const mockAreCookiesAccepted = jest.fn();
let mockPathname = '/';

jest.mock('@/lib/cookieUtils', () => ({
  areCookiesAccepted: () => mockAreCookiesAccepted(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('next/script', () => ({
  __esModule: true,
  default: (props: { src: string; 'data-key': string }) => <script {...props} />,
}));

import { AhrefsAnalytics } from '../AhrefsAnalytics';

describe('AhrefsAnalytics', () => {
  afterEach(() => {
    mockAreCookiesAccepted.mockReset();
    mockPathname = '/';
  });

  it('does not render on homepage even when consented', () => {
    mockAreCookiesAccepted.mockReturnValue(true);
    mockPathname = '/';

    const { container } = render(<AhrefsAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not render without consent', () => {
    mockAreCookiesAccepted.mockReturnValue(false);
    mockPathname = '/blog';

    const { container } = render(<AhrefsAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders script when consented and key set on non-home routes', async () => {
    mockAreCookiesAccepted.mockReturnValue(true);
    mockPathname = '/blog';

    const { container } = render(<AhrefsAnalytics />);

    await waitFor(() => {
      const script = container.querySelector('script#ahrefs-analytics');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('src', 'https://analytics.ahrefs.com/analytics.js');
      expect(script).toHaveAttribute('data-key', 'ahrefs-test-key');
    });
  });
});
