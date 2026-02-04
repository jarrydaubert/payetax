import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarriageAllowanceClient } from '../MarriageAllowanceClient';

describe('MarriageAllowanceClient', () => {
  it('shows eligibility result for qualifying incomes', async () => {
    const user = userEvent.setup();

    render(<MarriageAllowanceClient />);

    await user.type(screen.getByLabelText(/Lower Earner's Income/i), '10000');
    await user.type(screen.getByLabelText(/Higher Earner's Income/i), '30000');
    await user.click(screen.getByRole('button', { name: /Check Eligibility/i }));

    expect(await screen.findByText('You Qualify for Marriage Allowance!')).toBeInTheDocument();
    expect(screen.getByText(/Your annual saving/i)).toBeInTheDocument();
  });
});
