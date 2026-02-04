import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScottishTaxCalculatorClient } from '../ScottishTaxCalculatorClient';

describe('ScottishTaxCalculatorClient', () => {
  it('compares Scottish and English tax for a sample salary', async () => {
    const user = userEvent.setup();

    render(<ScottishTaxCalculatorClient />);

    await user.click(screen.getByRole('button', { name: '£50,000' }));

    expect(await screen.findByText('Scottish Tax')).toBeInTheDocument();
    expect(screen.getByText('English Tax')).toBeInTheDocument();
  });
});
