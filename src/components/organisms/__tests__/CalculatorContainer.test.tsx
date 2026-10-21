import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorContainer } from '../CalculatorContainer';

describe('Calculator workspace', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    window.localStorage.clear();
    useCalculatorStore.getState().reset();
    useCalculatorStore.getState().setSalary(60000);
  });

  it('starts with pay inputs and an explanation rather than results', () => {
    render(<CalculatorContainer />);
    expect(screen.getByRole('form', { name: 'Your pay calculator' })).toBeInTheDocument();
    expect(screen.queryByTestId('tax-results')).not.toBeInTheDocument();
  });

  it('shows a statement, opens comparison and keeps the selected result period through recalculation', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    await waitFor(() => expect(screen.getByTestId('pay-statement')).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox', { name: 'View by' }), 'weekly');
    await user.click(screen.getByRole('button', { name: 'Compare all 7 periods' }));
    expect(screen.getByTestId('period-comparison')).toBeVisible();
    act(() => useCalculatorStore.getState().setSalary(70000));
    expect(screen.queryByTestId('tax-results')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('calculate-button'));
    expect(screen.getByRole('combobox', { name: 'View by' })).toHaveValue('weekly');
  });

  it('commits an amount and calculates once when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    const salary = screen.getByTestId('salary-input');
    await user.clear(salary);
    await user.type(salary, '60000{Enter}');
    expect(await screen.findByTestId('take-home-amount')).toBeVisible();
    expect(useCalculatorStore.getState().input.salary).toBe(60000);
  });

  it.each([
    ['K100ABC', /Tax code format not recognized/],
    ['NONCUM', /Tax code format not recognized/],
    ['1257L M1', /Emergency tax code detected/],
    ['S1257L', /takes precedence over the selected England region/],
  ])('preserves the tax-code disclosure for %s', async (code, warning) => {
    useCalculatorStore.setState((state) => ({ input: { ...state.input, taxCode: code } }));
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    expect(await screen.findByText(warning)).toBeInTheDocument();
  });

  it('opens email from the current result and removes it on a valid input edit', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    await user.click(screen.getByRole('button', { name: 'Email tax calculation results' }));
    expect(
      within(screen.getByRole('dialog')).getByLabelText(/Email address for results/),
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.clear(screen.getByTestId('salary-input'));
    await user.type(screen.getByTestId('salary-input'), '70000');
    expect(
      screen.queryByRole('button', { name: 'Email tax calculation results' }),
    ).not.toBeInTheDocument();
  });
});
