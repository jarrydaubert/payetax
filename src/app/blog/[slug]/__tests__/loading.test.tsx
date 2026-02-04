import { render, screen } from '@/test/testing-library';

import Loading from '../loading';

describe('Blog post loading', () => {
  it('renders loading state with aria busy', () => {
    render(<Loading />);

    const output = screen.getByText('Loading article...').closest('output');
    expect(output).toHaveAttribute('aria-busy', 'true');
  });
});
