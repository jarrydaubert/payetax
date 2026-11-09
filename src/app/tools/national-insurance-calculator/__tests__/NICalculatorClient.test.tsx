import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { acceptedToolSalaries, rejectedToolSalaries } from '@/test/toolSalaryCases';
import { NICalculatorClient } from '../NICalculatorClient';

describe('NICalculatorClient', () => {
  it.each(acceptedToolSalaries)(
    'calculates the annual NI for $text on submit',
    async ({ text, employeeNI }) => {
      const user = userEvent.setup();
      render(<NICalculatorClient />);

      await user.type(screen.getByRole('textbox', { name: 'Annual salary' }), text);
      await user.click(screen.getByRole('button', { name: 'Calculate' }));

      expect(screen.getByText(employeeNI)).toBeVisible();
    },
  );

  it.each(rejectedToolSalaries)(
    'rejects $text on submit and category change',
    async ({ text, message }) => {
      const user = userEvent.setup();
      render(<NICalculatorClient />);
      const salary = screen.getByRole('textbox', { name: 'Annual salary' });

      await user.click(screen.getByRole('button', { name: '£25,000' }));
      await user.clear(salary);
      if (text) await user.type(salary, text);
      expect(screen.queryByText('Your NI (Employee)')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Category M' }));
      expect(screen.queryByText('Your NI (Employee)')).not.toBeInTheDocument();
      if (text) expect(salary).toHaveAccessibleDescription(message);

      await user.click(screen.getByRole('button', { name: 'Calculate' }));
      expect(salary).toHaveAttribute('aria-invalid', 'true');
      expect(salary).toHaveAccessibleDescription(message);
      expect(screen.queryByText('Your NI (Employee)')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '£25,000' }));
      expect(salary).not.toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Your NI (Employee)')).toBeVisible();
    },
  );

  it('clears results on a valid edit and recalculates a zero salary on category change', async () => {
    const user = userEvent.setup();
    render(<NICalculatorClient />);

    await user.click(screen.getByRole('button', { name: '£25,000' }));
    const salary = screen.getByRole('textbox', { name: 'Annual salary' });
    await user.clear(salary);
    await user.type(salary, '0');
    expect(screen.queryByText('Your NI (Employee)')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Category M' }));
    expect(screen.getByText('Your NI (Employee)').parentElement).toHaveTextContent('£0');
  });

  it('runs a quick example calculation', async () => {
    const user = userEvent.setup();

    render(<NICalculatorClient />);

    await user.click(screen.getByRole('button', { name: '£25,000' }));

    expect(await screen.findByText('Your NI (Employee)')).toBeInTheDocument();
    expect(screen.getByText('Total NI Cost')).toBeInTheDocument();
  });
});
