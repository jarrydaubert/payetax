/**
 * Mounted main-calculator regressions for amount-field integrity, using the real store, the real
 * input fields and the real tax engine.
 *
 * Covers the defect where additional income `1234.56` became £123,456, negative amounts became
 * positive and malformed text became 0, and checks that rejected text never leaves results for
 * the previous amount on screen or lets Calculate use it.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CURRENCY_INPUT_ERRORS } from '@/lib/currencyInput';
import { useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorContainer } from '../CalculatorContainer';

type User = ReturnType<typeof userEvent.setup>;

const typeInto = async (user: User, input: HTMLElement, text: string) => {
  await user.click(input);
  await user.clear(input);
  // Paste avoids user-event treating characters such as `{` specially and mirrors pasted amounts.
  await user.paste(text);
  await user.tab();
};

const calculate = (user: User) => user.click(screen.getByTestId('calculate-button'));

const resultsShown = () => screen.queryByTestId('tax-results') !== null;

const addIncomeSource = async (user: User) => {
  await user.click(screen.getByRole('button', { name: /Additional Income Sources/i }));
  await user.click(screen.getByTestId('add-income-source'));
  return screen.getByRole('spinbutton', { name: 'Income source 1 amount' });
};

describe('Main calculator amount integrity (mounted)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCalculatorStore.getState().reset();
  });

  it.each([
    ['1234.56'],
    ['£1,234.56'],
  ])('keeps pence in additional income %j instead of scaling it to £123,456', async (text) => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);

    await typeInto(user, screen.getByTestId('salary-input'), '30000');
    const incomeAmount = await addIncomeSource(user);
    await typeInto(user, incomeAmount, text);

    expect(incomeAmount).toHaveValue('1,234.56');
    expect(useCalculatorStore.getState().input.incomeSources[0]?.amount).toBe(1234.56);

    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));
    expect(useCalculatorStore.getState().results?.incomeBreakdown?.total).toBeCloseTo(31234.56, 2);
  });

  it('rejects a negative salary visibly, removes the old results and refuses to calculate', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    const salary = screen.getByTestId('salary-input');

    await typeInto(user, salary, '30000');
    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));

    await typeInto(user, salary, '-500');

    expect(salary).toHaveValue('-500');
    expect(salary).toHaveAccessibleDescription(CURRENCY_INPUT_ERRORS.negative);
    await waitFor(() => expect(resultsShown()).toBe(false));
    expect(useCalculatorStore.getState().input.salary).toBe(30000);

    await calculate(user);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Correct the invalid amount in Salary before calculating.',
    );
    expect(resultsShown()).toBe(false);
    expect(useCalculatorStore.getState().results).toBeNull();

    // Recovery: a corrected amount clears the error and calculates normally.
    await typeInto(user, salary, '40000');
    expect(salary).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));
    expect(useCalculatorStore.getState().results?.grossSalary.annually).toBe(40000);
  });

  it.each([
    ['non-taxable-allowances-input', 'abc', CURRENCY_INPUT_ERRORS.malformed],
    ['non-taxable-allowances-input', '1.2.3', CURRENCY_INPUT_ERRORS.malformed],
    [
      'pension-input',
      '-5',
      'Enter a percentage of 0% or more. Negative percentages are not supported.',
    ],
  ])('rejects %s text %j instead of committing another amount', async (testId, text, error) => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await typeInto(user, screen.getByTestId('salary-input'), '30000');
    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));
    const before = { ...useCalculatorStore.getState().input };

    const field = screen.getByTestId(testId);
    await typeInto(user, field, text);

    expect(field).toHaveValue(text);
    expect(field).toHaveAccessibleDescription(error);
    await waitFor(() => expect(resultsShown()).toBe(false));
    expect(useCalculatorStore.getState().input.allowancesDeductions).toBe(
      before.allowancesDeductions,
    );
    expect(useCalculatorStore.getState().input.pensionContribution).toBe(
      before.pensionContribution,
    );

    await calculate(user);
    expect(screen.getByRole('alert')).toHaveTextContent('before calculating');
    expect(resultsShown()).toBe(false);
  });

  it('keeps a rejected income amount visible, and stops blocking once that source is removed', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await typeInto(user, screen.getByTestId('salary-input'), '30000');
    const incomeAmount = await addIncomeSource(user);
    await typeInto(user, incomeAmount, '-500');
    expect(incomeAmount).toHaveAccessibleDescription(CURRENCY_INPUT_ERRORS.negative);

    // Collapsing the list must not hide the rejected amount.
    await user.click(screen.getByRole('button', { name: /Additional Income Sources/i }));
    expect(screen.getByRole('spinbutton', { name: 'Income source 1 amount' })).toHaveValue('-500');

    await calculate(user);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Correct the invalid amount in Additional Income Sources before calculating.',
    );

    await user.click(screen.getByRole('button', { name: 'Remove income source 1' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));
  });

  it('does not block on a rejected partner wage once the partner field no longer applies', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await typeInto(user, screen.getByTestId('salary-input'), '30000');
    const married = screen.getByRole('checkbox', { name: /Married/i });
    await user.click(married);
    const partnerWage = screen.getByTestId('partner-salary-input');
    await typeInto(user, partnerWage, 'abc');

    await calculate(user);
    expect(resultsShown()).toBe(false);
    expect(within(screen.getByTestId('calculator-section')).getByRole('alert')).toHaveTextContent(
      "Partner's Gross Wage",
    );

    await user.click(married);
    await calculate(user);
    await waitFor(() => expect(resultsShown()).toBe(true));

    // Re-ticking shows the committed wage, not the discarded text beside those results.
    await user.click(married);
    const shownAgain = screen.getByTestId('partner-salary-input');
    expect(shownAgain).toHaveValue('0.00');
    expect(shownAgain).not.toHaveAttribute('aria-invalid');
    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });

  it('counts each rejected amount in the Calculate message', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    await typeInto(user, screen.getByTestId('salary-input'), '30000');
    const first = await addIncomeSource(user);
    await typeInto(user, first, '-1');
    await user.click(screen.getByTestId('add-income-source'));
    await typeInto(user, screen.getByRole('spinbutton', { name: 'Income source 2 amount' }), 'x');

    await calculate(user);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Correct the invalid amounts in Additional Income Sources before calculating.',
    );
  });

  it('keeps the income list open while one of its amounts is rejected', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    const amount = await addIncomeSource(user);
    await typeInto(user, amount, '-5');

    await user.click(screen.getByRole('button', { name: /Additional Income Sources/i }));
    await typeInto(user, amount, '5');

    // The close request made while the amount was rejected is not replayed after correction.
    expect(screen.getByRole('spinbutton', { name: 'Income source 1 amount' })).toHaveValue('5.00');
  });

  describe('while the field is still being edited (no blur)', () => {
    /** Calculate £30,000, then put the caret back in Salary and type without leaving it. */
    const calculateThenEditSalary = async (user: User, keys: string) => {
      render(<CalculatorContainer />);
      const salary = screen.getByTestId('salary-input');
      await typeInto(user, salary, '30000');
      await calculate(user);
      await waitFor(() => expect(resultsShown()).toBe(true));
      expect(emailAction()).toBeInTheDocument();

      await user.click(salary);
      await user.clear(salary);
      await user.keyboard(keys);
      expect(salary).toHaveFocus();
      return salary;
    };

    /** Activate Calculate without moving focus first, so the field receives no blur. */
    const clickCalculateWithoutBlur = () => fireEvent.click(screen.getByTestId('calculate-button'));

    const emailAction = () =>
      screen.queryByRole('button', { name: 'Email tax calculation results' });

    it.each(['-500', 'abc'])('removes results and email as soon as %j is typed', async (keys) => {
      const user = userEvent.setup();
      const salary = await calculateThenEditSalary(user, keys);

      expect(salary).toHaveFocus();
      expect(useCalculatorStore.getState().inputErrors.salary?.text).toBe(keys);
      expect(useCalculatorStore.getState().results).toBeNull();
      await waitFor(() => expect(resultsShown()).toBe(false));
      expect(emailAction()).not.toBeInTheDocument();
      // The committed amount is unchanged; it is just not usable.
      expect(useCalculatorStore.getState().input.salary).toBe(30000);
    });

    it.each([
      ['-500', CURRENCY_INPUT_ERRORS.negative],
      ['abc', CURRENCY_INPUT_ERRORS.malformed],
    ])('refuses a direct Calculate click with %j still in the field', async (keys, error) => {
      const user = userEvent.setup();
      const salary = await calculateThenEditSalary(user, keys);

      clickCalculateWithoutBlur();

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Correct the invalid amount in Salary before calculating.',
      );
      expect(useCalculatorStore.getState().results).toBeNull();
      expect(resultsShown()).toBe(false);
      expect(emailAction()).not.toBeInTheDocument();
      expect(salary).toHaveValue(keys);
      expect(salary).toHaveAccessibleDescription(error);
    });

    it('does not revive the old result when the text is corrected before leaving the field', async () => {
      const user = userEvent.setup();
      const salary = await calculateThenEditSalary(user, '-500');

      await user.clear(salary);
      await user.keyboard('40000');
      expect(salary).toHaveFocus();
      // Valid but uncommitted text: still blocked, results still gone.
      expect(useCalculatorStore.getState().inputErrors.salary).toBeDefined();
      expect(useCalculatorStore.getState().results).toBeNull();
      expect(resultsShown()).toBe(false);

      clickCalculateWithoutBlur();

      // Calculate commits the field first, then calculates from the amount shown.
      await waitFor(() => expect(resultsShown()).toBe(true));
      expect(useCalculatorStore.getState().inputErrors).toEqual({});
      expect(useCalculatorStore.getState().input.salary).toBe(40000);
      expect(useCalculatorStore.getState().results?.grossSalary.annually).toBe(40000);
      expect(salary).toHaveValue('40,000.00');
    });

    it('calculates from a valid edited amount, never the previous one', async () => {
      const user = userEvent.setup();
      await calculateThenEditSalary(user, '50000');

      clickCalculateWithoutBlur();

      await waitFor(() => expect(resultsShown()).toBe(true));
      expect(useCalculatorStore.getState().results?.grossSalary.annually).toBe(50000);
    });
  });

  it('rejects amounts the calculator would otherwise silently drop', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    const salary = screen.getByTestId('salary-input');

    await typeInto(user, salary, '20000000');

    expect(salary).toHaveAccessibleDescription('Enter an amount no more than £10,000,000.');
    expect(useCalculatorStore.getState().input.salary).toBe(0);
  });

  it('Reset clears rejected text and its error', async () => {
    const user = userEvent.setup();
    render(<CalculatorContainer />);
    const salary = screen.getByTestId('salary-input');
    await typeInto(user, salary, 'abc');
    expect(salary).toHaveAttribute('aria-invalid', 'true');

    await user.click(screen.getByRole('button', { name: /Reset/i }));

    expect(salary).not.toHaveAttribute('aria-invalid');
    expect(salary).toHaveValue('0.00');
    expect(useCalculatorStore.getState().inputErrors).toEqual({});
  });
});
