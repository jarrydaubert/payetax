import { render, waitFor } from '@/test/testing-library';

import { BlogArticleAnalytics } from '../BlogArticleAnalytics';

const trackEventMock = jest.fn();

jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

describe('BlogArticleAnalytics', () => {
  beforeEach(() => {
    trackEventMock.mockReset();
  });

  it('tracks blog_article_read on mount', async () => {
    render(<BlogArticleAnalytics slug='uk-tax-guide' category='Tax Basics' />);

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith({
        action: 'blog_article_read',
        category: 'content',
        label: 'uk-tax-guide',
        custom_data: {
          slug: 'uk-tax-guide',
          category: 'Tax Basics',
        },
      });
    });
  });
});
