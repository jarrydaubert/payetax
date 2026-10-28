import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCalculatorStore } from '@/store/calculatorStore';
import { CalculatorContainer } from '../CalculatorContainer';

describe('Submitted pay period presentation (mounted)', () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  beforeEach(() => {
    localStorage.clear();
    useCalculatorStore.getState().reset();
  });

  it.each([
    ['annually', 'monthly'],
    ['monthly', 'monthly'],
    ['fourWeekly', 'fourWeekly'],
    ['fortnightly', 'fortnightly'],
    ['weekly', 'weekly'],
    ['daily', 'daily'],
    ['hourly', 'hourly'],
  ] as const)('starts %s input in %s using engine period values', async (inputPeriod, displayed) => {
    const user = userEvent.setup();
    useCalculatorStore.getState().setInput({
      salary: inputPeriod === 'hourly' ? 23.45 : 1234.56,
      payPeriod: inputPeriod,
      hoursPerWeek: 32,
    });
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    const results = useCalculatorStore.getState().results;
    if (!results) throw new Error('Calculate did not publish results');
    expect(screen.getByTestId('mobile-take-home')).toHaveTextContent(
      new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
        results.netPay[displayed],
      ),
    );
    expect(screen.getByTestId('mobile-take-home-context')).toHaveTextContent(
      `${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(results.netPay.annually)} per year`,
    );
  });

  it('switches only the presentation, resets on Calculate and hides stale values after edits', async () => {
    const user = userEvent.setup();
    useCalculatorStore.getState().setInput({ salary: 3000, payPeriod: 'monthly' });
    render(<CalculatorContainer />);
    await user.click(screen.getByTestId('calculate-button'));
    const snapshot = useCalculatorStore.getState();
    const selector = () => screen.getByRole('combobox', { name: 'Take-home pay period' });

    expect(
      screen.getByRole('region', { name: 'Tax calculation summary results' }),
    ).not.toContainElement(selector());
    const announcement = screen.getByTestId('mobile-take-home').parentElement;
    expect(announcement).toHaveAttribute('aria-live', 'polite');
    expect(announcement).toHaveAttribute('aria-atomic', 'true');
    expect(announcement).not.toContainElement(selector());

    act(() => selector().focus());
    await user.keyboard('{ArrowDown}{Home}{Enter}');
    expect(selector()).toHaveTextContent('Yearly');
    expect(screen.getByTestId('mobile-take-home-context')).toHaveTextContent('per month');
    expect(useCalculatorStore.getState().results).toBe(snapshot.results);

    act(() => selector().focus());
    await user.keyboard('{ArrowDown}{End}{Enter}');
    expect(selector()).toHaveTextContent('Hourly');
    expect(useCalculatorStore.getState().results).toBe(snapshot.results);
    expect(useCalculatorStore.getState().previousYearResults).toBe(snapshot.previousYearResults);
    expect(useCalculatorStore.getState().whatIfResults).toBe(snapshot.whatIfResults);
    expect(useCalculatorStore.getState().inputRevision).toBe(snapshot.inputRevision);
    expect(useCalculatorStore.getState().input).toBe(snapshot.input);

    // A fresh Calculate reapplies the submitted period even without an input edit.
    await user.click(screen.getByTestId('calculate-button'));
    expect(selector()).toHaveTextContent('Monthly');
    expect(useCalculatorStore.getState().results).not.toBe(snapshot.results);

    act(() => useCalculatorStore.getState().setPayPeriod('fortnightly'));
    expect(screen.queryByTestId('mobile-take-home')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Calculate again');
    await user.click(screen.getByTestId('calculate-button'));
    expect(selector()).toHaveTextContent('Fortnightly');
    await user.click(screen.getByRole('button', { name: /Reset/ }));
    await waitFor(() => expect(screen.queryByTestId('mobile-take-home')).toBeNull());
    expect(useCalculatorStore.getState().results).toBeNull();
  });
});
