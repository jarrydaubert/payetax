import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScottishTaxCalculatorClient } from '../ScottishTaxCalculatorClient';

describe('ScottishTaxCalculatorClient', () => {
  it('compares annual Scottish and rest-of-UK Income Tax for a valid salary', async () => {
    const user = userEvent.setup();

    render(<ScottishTaxCalculatorClient />);

    await user.type(screen.getByRole('textbox', { name: 'Annual salary' }), '50,000');
    await user.click(screen.getByRole('button', { name: 'Compare' }));

    expect(screen.getByRole('textbox', { name: 'Annual salary' })).toHaveValue('50,000.00');
    expect(await screen.findByText('Scottish Tax')).toBeInTheDocument();
    expect(screen.getByText('Rest of UK Tax')).toBeInTheDocument();
    expect(screen.getByText('£8,982')).toBeInTheDocument();
    expect(screen.getByText('£7,486')).toBeInTheDocument();
    expect(screen.getByText('+£1,496/year')).toBeInTheDocument();
  });

  it.each([
    '50000.50',
    '50,000.50',
  ])('accepts and consistently formats a valid two-decimal salary %s', async (salary) => {
    const user = userEvent.setup();
    render(<ScottishTaxCalculatorClient />);

    const input = screen.getByRole('textbox', { name: 'Annual salary' });
    await user.type(input, salary);
    await user.click(screen.getByRole('button', { name: 'Compare' }));

    expect(input).toHaveValue('50,000.50');
    expect(await screen.findByText('Scottish Tax')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    '-50000',
    '50000.500',
    'salary',
    '£50,000',
    '£50,000.50',
    '50,00',
  ])('rejects malformed or unsupported salary input %s without showing a result', async (salary) => {
    const user = userEvent.setup();
    render(<ScottishTaxCalculatorClient />);

    const input = screen.getByRole('textbox', { name: 'Annual salary' });
    await user.type(input, salary);
    await user.click(screen.getByRole('button', { name: 'Compare' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter an annual salary from £0 to £10,000,000',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Scottish Tax')).not.toBeInTheDocument();
  });

  it('clears a previous result when the salary is edited', async () => {
    const user = userEvent.setup();
    render(<ScottishTaxCalculatorClient />);

    await user.click(screen.getByRole('button', { name: '£50,000' }));
    expect(await screen.findByText('Scottish Tax')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Annual salary' }), '.50');
    expect(screen.queryByText('Scottish Tax')).not.toBeInTheDocument();
  });

  it('presents the calculation scope, derived crossover and current official sources', () => {
    render(<ScottishTaxCalculatorClient />);

    expect(screen.getByText('Annual Income Tax only')).toBeInTheDocument();
    expect(
      screen.getByText(/National Insurance, Student Loans and take-home pay are excluded/),
    ).toBeInTheDocument();
    expect(screen.getByText(/approximately £33,493/)).toBeInTheDocument();
    expect(screen.getAllByText(/2026-27/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Scottish Government/ })).toHaveAttribute(
      'href',
      'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/',
    );
    expect(screen.getByRole('link', { name: /HMRC: .*rates and thresholds/ })).toHaveAttribute(
      'href',
      'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
    );
  });
});
