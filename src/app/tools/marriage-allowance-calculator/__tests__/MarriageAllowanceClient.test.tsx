import { render, screen, within } from '@testing-library/react';
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

      const ruk = screen.getByRole('region', { name: 'England, Wales and Northern Ireland' });
      expect(within(ruk).getByText('Eligible on these incomes')).toBeVisible();
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
      const resultHeading = 'Estimated annual household impact';

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

  it('shows the transferor tax and household saving at the Scottish allowance boundary', async () => {
    const user = userEvent.setup();
    render(<MarriageAllowanceClient />);
    const lower = screen.getByRole('textbox', { name: /Lower Earner/ });

    await user.type(screen.getByRole('textbox', { name: /Higher Earner/ }), '40,000');
    await user.type(lower, '12,570.01');
    await user.click(screen.getByRole('button', { name: 'Check Eligibility' }));

    const scotland = within(screen.getByRole('region', { name: 'Scotland' }));
    expect(scotland.getByText('Eligible on these incomes')).toBeVisible();
    expect(scotland.getByText('Recipient tax relief').parentElement).toHaveTextContent('£252.00');
    expect(scotland.getByText('Transferor additional tax').parentElement).toHaveTextContent(
      '£239.40',
    );
    expect(scotland.getByText('Net household saving').parentElement).toHaveTextContent('£12.60');
  });

  it('clears results on edit and checks the rUK recipient limit to the penny', async () => {
    const user = userEvent.setup();
    render(<MarriageAllowanceClient />);
    const higher = screen.getByRole('textbox', { name: /Higher Earner/ });
    const submit = screen.getByRole('button', { name: 'Check Eligibility' });
    const ruk = () =>
      within(screen.getByRole('region', { name: 'England, Wales and Northern Ireland' }));

    await user.type(screen.getByRole('textbox', { name: /Lower Earner/ }), '0');
    await user.type(higher, '50270');
    await user.click(submit);
    expect(ruk().getByText('Eligible on these incomes')).toBeVisible();

    await user.type(higher, '.01');
    expect(
      screen.queryByRole('region', { name: 'England, Wales and Northern Ireland' }),
    ).toBeNull();
    await user.click(submit);
    expect(ruk().getByText('Ineligible on these incomes')).toBeVisible();
  });
});
