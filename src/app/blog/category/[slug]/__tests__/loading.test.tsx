import { render, screen } from '@/test/testing-library';

import Loading from '../loading';

describe('Blog category loading', () => {
  it('renders loading state with aria busy', () => {
    render(<Loading />);

    const output = screen.getByText('Loading category articles...').closest('output');
    expect(output).toHaveAttribute('aria-busy', 'true');
  });
});
