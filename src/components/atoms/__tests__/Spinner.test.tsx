import { render, screen } from '@/test/testing-library';

import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders with status role and label', () => {
    render(<Spinner />);

    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
  });
});
