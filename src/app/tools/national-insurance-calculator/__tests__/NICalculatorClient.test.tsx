import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NICalculatorClient } from '../NICalculatorClient';

describe('NICalculatorClient', () => {
  it('runs a quick example calculation', async () => {
    const user = userEvent.setup();

    render(<NICalculatorClient />);

    await user.click(screen.getByRole('button', { name: '£25,000' }));

    expect(await screen.findByText('Your NI (Employee)')).toBeInTheDocument();
    expect(screen.getByText('Total NI Cost')).toBeInTheDocument();
  });
});
