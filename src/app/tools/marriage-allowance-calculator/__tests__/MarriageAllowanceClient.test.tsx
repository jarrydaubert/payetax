import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { acceptedToolSalaries, rejectedToolSalaries } from '@/test/toolSalaryCases';
import { MarriageAllowanceClient } from '../MarriageAllowanceClient';

describe('MarriageAllowanceClient', () => {
  it.each(acceptedToolSalaries)(
    'shows eligibility with recipient income $text',
    async ({ text }) => {
      const user = userEvent.setup();

      render(<MarriageAllowanceClient />);

      await user.type(screen.getByLabelText(/Lower Earner's Income/i), '10000');
      await user.type(screen.getByLabelText(/Higher Earner's Income/i), text);
      await user.click(screen.getByRole('button', { name: /Check Eligibility/i }));

      expect(await screen.findByText('You Qualify for Marriage Allowance!')).toBeInTheDocument();
      expect(screen.getByText(/Your annual saving/i)).toBeInTheDocument();
    },
  );

  it.each(rejectedToolSalaries)(
    'rejects $text in either income field',
    async ({ text, message }) => {
      const user = userEvent.setup();
      render(<MarriageAllowanceClient />);
      const lower = screen.getByRole('textbox', { name: /Lower Earner/ });
      const higher = screen.getByRole('textbox', { name: /Higher Earner/ });
      const submit = screen.getByRole('button', { name: 'Check Eligibility' });
      const resultHeading = /You Qualify for Marriage Allowance|You Don't Qualify/;

      await user.type(lower, '10000');
      await user.type(higher, '30000');
      await user.click(submit);
      expect(screen.getByRole('heading', { name: resultHeading })).toBeVisible();

      await user.clear(lower);
      if (text) await user.type(lower, text);
      expect(screen.queryByRole('heading', { name: resultHeading })).not.toBeInTheDocument();
      await user.click(submit);
      expect(lower).toHaveAttribute('aria-invalid', 'true');
      expect(lower).toHaveAccessibleDescription(message);
      expect(lower).toHaveAccessibleDescription(/person who will transfer their allowance/);
      expect(higher).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.queryByRole('heading', { name: resultHeading })).not.toBeInTheDocument();

      await user.clear(lower);
      await user.type(lower, '10000');
      await user.clear(higher);
      if (text) await user.type(higher, text);
      await user.click(submit);
      expect(higher).toHaveAttribute('aria-invalid', 'true');
      expect(higher).toHaveAccessibleDescription(message);
      expect(higher).toHaveAccessibleDescription(/person who will receive the allowance/);
      expect(lower).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.queryByRole('heading', { name: resultHeading })).not.toBeInTheDocument();
    },
  );

  it('preserves the lower earner’s pence on either side of the Personal Allowance', async () => {
    const user = userEvent.setup();
    render(<MarriageAllowanceClient />);
    const lower = screen.getByRole('textbox', { name: /Lower Earner/ });
    const submit = screen.getByRole('button', { name: 'Check Eligibility' });

    await user.type(screen.getByRole('textbox', { name: /Higher Earner/ }), '30,000.50');
    await user.type(lower, '12,569.99');
    await user.click(submit);
    expect(
      screen.getByRole('heading', { name: 'You Qualify for Marriage Allowance!' }),
    ).toBeVisible();

    await user.clear(lower);
    await user.type(lower, '12,570.01');
    await user.click(submit);
    expect(screen.getByRole('heading', { name: "You Don't Qualify" })).toBeVisible();
    expect(screen.getByText(/The lower earner must earn less than/)).toBeVisible();
  });

  it('clears eligibility after a valid edit and uses pence at the existing recipient limit', async () => {
    const user = userEvent.setup();
    render(<MarriageAllowanceClient />);
    const higher = screen.getByRole('textbox', { name: /Higher Earner/ });
    const submit = screen.getByRole('button', { name: 'Check Eligibility' });

    await user.type(screen.getByRole('textbox', { name: /Lower Earner/ }), '0');
    await user.type(higher, '50270');
    await user.click(submit);
    expect(
      screen.getByRole('heading', { name: 'You Qualify for Marriage Allowance!' }),
    ).toBeVisible();

    await user.type(higher, '.01');
    expect(
      screen.queryByRole('heading', { name: 'You Qualify for Marriage Allowance!' }),
    ).toBeNull();
    await user.click(submit);
    expect(screen.getByRole('heading', { name: "You Don't Qualify" })).toBeVisible();
  });
});
