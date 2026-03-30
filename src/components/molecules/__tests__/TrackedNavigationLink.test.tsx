/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { trackSEOAction } from '@/lib/analytics';
import { TrackedNavigationLink } from '../TrackedNavigationLink';

jest.mock('@/lib/analytics', () => ({
  trackSEOAction: jest.fn(),
}));

describe('TrackedNavigationLink', () => {
  const mockTrackSEOAction = trackSEOAction as jest.MockedFunction<typeof trackSEOAction>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks navigation clicks with source and target metadata', () => {
    render(
      <TrackedNavigationLink
        href='/blog/example-post'
        source='blog_related_articles'
        target='example-post'
        destination='Tax Tips'
      >
        Example post
      </TrackedNavigationLink>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Example post' }));

    expect(mockTrackSEOAction).toHaveBeenCalledWith('navigation', {
      source: 'blog_related_articles',
      target: 'example-post',
      destination: 'Tax Tips',
    });
  });
});
