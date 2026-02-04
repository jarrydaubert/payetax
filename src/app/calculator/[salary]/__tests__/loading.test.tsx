import { render, screen } from '@/test/testing-library';

import Loading from '../loading';

describe('Calculator loading', () => {
  it('renders loading state with aria busy', () => {
    render(<Loading />);

    const output = screen.getByText('Loading calculator results...').closest('output');
    expect(output).toHaveAttribute('aria-busy', 'true');
  });
});
