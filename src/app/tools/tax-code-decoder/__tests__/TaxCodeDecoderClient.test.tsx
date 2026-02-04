import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaxCodeDecoderClient } from '../TaxCodeDecoderClient';

describe('TaxCodeDecoderClient', () => {
  it('decodes an example tax code', async () => {
    const user = userEvent.setup();

    render(<TaxCodeDecoderClient />);

    await user.click(screen.getByRole('button', { name: '1257L' }));

    expect(await screen.findByText('Standard personal allowance')).toBeInTheDocument();
    expect(screen.getByText('Personal Allowance')).toBeInTheDocument();
  });
});
