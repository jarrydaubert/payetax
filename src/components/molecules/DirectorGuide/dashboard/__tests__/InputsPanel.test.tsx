import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { getTooltipContent } from '@/config/inputTooltips';
import { CURRENCY_INPUT_ERRORS } from '@/lib/currencyInput';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { InputsPanel } from '../InputsPanel';

jest.mock('@/components/atoms/LabelTooltip', () => ({
  LabelTooltip: () => null,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (value: boolean) => void;
  }) => (
    <input
      id={id}
      type='checkbox'
      checked={Boolean(checked)}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    id,
    checked,
    onCheckedChange,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (value: boolean) => void;
  }) => (
    <input
      id={id}
      type='checkbox'
      checked={Boolean(checked)}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

jest.mock('@/components/ui/select', () => {
  const SelectContext = React.createContext<{ onValueChange?: (value: string) => void } | null>(
    null,
  );

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string;
      onValueChange?: (value: string) => void;
      children: React.ReactNode;
    }) => (
      <SelectContext.Provider value={{ onValueChange }}>
        <div data-testid='select' data-value={value}>
          {children}
        </div>
      </SelectContext.Provider>
    ),
    SelectTrigger: ({ id, children }: { id?: string; children: React.ReactNode }) => (
      <button id={id} type='button'>
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => {
      const ctx = React.useContext(SelectContext);
      return (
        <button type='button' onClick={() => ctx?.onValueChange?.(value)}>
          {children}
        </button>
      );
    },
  };
});

function setStoreState(partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>) {
  useDirectorGuideStore.setState(partial as never);
}

describe('DirectorGuide InputsPanel', () => {
  beforeEach(() => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      ...current,
      inputErrors: {},
      formData: {
        ...current.formData,
        mode: 'annual',
        region: 'rUK',
        revenue: undefined,
        expenses: undefined,
        monthlyIncome: undefined,
        monthlyExpenses: undefined,
        contractStartMonth: 4,
        cashInBank: 0,
        minimumMonthlyDraw: 0,
        runwayMonths: 3,
      },
    });
  });

  it('shows annual fields by default and switches to monthly fields', () => {
    render(<InputsPanel />);

    expect(screen.getByLabelText('Annual Revenue')).toBeInTheDocument();
    expect(screen.getByLabelText('Business Expenses')).toBeInTheDocument();
    expect(screen.getByText('Total invoiced before expenses')).toBeInTheDocument();
    expect(
      screen.getByText('Excluding modelled director salary and employer NI'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Monthly Contract Income')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));

    expect(useDirectorGuideStore.getState().formData.mode).toBe('monthly');
    expect(screen.getByLabelText('Monthly Contract Income')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly Business Expenses')).toBeInTheDocument();
    expect(screen.getByText('Typical gross invoicing per month')).toBeInTheDocument();
    expect(
      screen.getByText('Excluding modelled director salary and employer NI'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Annual Revenue')).not.toBeInTheDocument();
  });

  it('identifies an employer pension already included in business expenses', () => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      formData: { ...current.formData, pensionContribution: 2500, isPensionAlreadyDeducted: false },
    });
    render(<InputsPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Full Inputs' }));
    fireEvent.click(screen.getByRole('button', { name: 'Advanced Options' }));

    const included = screen.getByRole('checkbox', {
      name: 'Already included in business expenses',
    });
    expect(included).not.toBeChecked();
    expect(getTooltipContent('directorPensionDeducted')?.description).toContain(
      'Business Expenses or Monthly Business Expenses',
    );
    expect(getTooltipContent('directorPensionDeducted')?.description).not.toMatch(/profit figure/);
    fireEvent.click(included);
    expect(useDirectorGuideStore.getState().formData.isPensionAlreadyDeducted).toBe(true);
  });

  it('uses quick start by default and reveals full sections on demand', () => {
    render(<InputsPanel />);

    expect(screen.queryByText('Already Taken This Year')).not.toBeInTheDocument();
    expect(screen.getByText('Add More Detail')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Full Inputs' }));

    expect(screen.getByText('Already Taken This Year')).toBeInTheDocument();
    expect(screen.getByText('Your Situation')).toBeInTheDocument();
    expect(screen.getByText('Compare My Setup')).toBeInTheDocument();
  });

  it('shows hidden detailed inputs when quick start would hide active values', () => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      formData: {
        ...current.formData,
        otherIncome: 5000,
        studentLoanPlans: ['plan1'],
        pensionContribution: 2500,
      },
    });

    render(<InputsPanel />);

    expect(screen.getByText(/Saved detailed inputs are still active/)).toBeInTheDocument();
    expect(screen.getByText(/other income/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear Details' }));

    const state = useDirectorGuideStore.getState().formData;
    expect(state.otherIncome).toBe(0);
    expect(state.studentLoanPlans).toEqual([]);
    expect(state.pensionContribution).toBe(0);
  });

  it('reveals a custom date field when company year-end is other', () => {
    render(<InputsPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Other' }));

    const input = screen.getByLabelText('Custom Year-End Date');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '06-30' } });
    expect(useDirectorGuideStore.getState().formData.yearEndCustom).toBe('06-30');
  });

  it('updates monthly mode values, including contract month selection', () => {
    const store = useDirectorGuideStore.getState();
    store.setMode('monthly');

    render(<InputsPanel />);

    fireEvent.change(screen.getByLabelText('Monthly Contract Income'), {
      target: { value: '3250' },
    });
    fireEvent.change(screen.getByLabelText('Monthly Business Expenses'), {
      target: { value: '1200' },
    });
    fireEvent.click(screen.getByText('October'));
    fireEvent.change(screen.getByLabelText('Cash In Bank'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('Minimum Monthly Draw'), {
      target: { value: '900' },
    });
    fireEvent.change(screen.getByLabelText('Runway Target (months)'), {
      target: { value: '5' },
    });

    const state = useDirectorGuideStore.getState().formData;
    expect(state.monthlyIncome).toBe(3250);
    expect(state.monthlyExpenses).toBe(1200);
    expect(state.contractStartMonth).toBe(10);
    expect(state.cashInBank).toBe(5000);
    expect(state.minimumMonthlyDraw).toBe(900);
    expect(state.runwayMonths).toBe(5);
  });

  it('clears annual core inputs back to undefined', () => {
    render(<InputsPanel />);

    fireEvent.change(screen.getByLabelText('Annual Revenue'), { target: { value: '125000' } });
    fireEvent.change(screen.getByLabelText('Business Expenses'), { target: { value: '24000' } });
    fireEvent.change(screen.getByLabelText('Annual Revenue'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Business Expenses'), { target: { value: '' } });

    const state = useDirectorGuideStore.getState().formData;
    expect(state.revenue).toBeUndefined();
    expect(state.expenses).toBeUndefined();
  });

  it('clears monthly core inputs back to undefined', () => {
    const store = useDirectorGuideStore.getState();
    store.setMode('monthly');

    render(<InputsPanel />);

    fireEvent.change(screen.getByLabelText('Monthly Contract Income'), {
      target: { value: '3250' },
    });
    fireEvent.change(screen.getByLabelText('Monthly Business Expenses'), {
      target: { value: '1200' },
    });
    fireEvent.change(screen.getByLabelText('Monthly Contract Income'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Monthly Business Expenses'), { target: { value: '' } });

    const state = useDirectorGuideStore.getState().formData;
    expect(state.monthlyIncome).toBeUndefined();
    expect(state.monthlyExpenses).toBeUndefined();
  });

  it('delegates reset to parent callback when onReset is provided', () => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      formData: {
        ...current.formData,
        revenue: 100000,
      },
    });
    const onReset = jest.fn();

    render(<InputsPanel onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(useDirectorGuideStore.getState().formData.revenue).toBe(100000);
  });

  it('resets store directly when onReset is not provided', () => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      formData: {
        ...current.formData,
        revenue: 100000,
      },
    });

    render(<InputsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(useDirectorGuideStore.getState().formData.revenue).toBeUndefined();
  });

  it('uses explicit apply/reset/clear controls for Compare My Setup', () => {
    render(<InputsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Full Inputs' }));

    fireEvent.change(screen.getByLabelText('Your Current Salary'), { target: { value: '12000' } });
    fireEvent.change(screen.getByLabelText('Your Current Dividends'), {
      target: { value: '18000' },
    });

    // Draft edits should not update the store until Apply is clicked.
    let form = useDirectorGuideStore.getState().formData;
    expect(form.yourSetupSalary).toBeUndefined();
    expect(form.yourSetupDividends).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    form = useDirectorGuideStore.getState().formData;
    expect(form.yourSetupSalary).toBe(12000);
    expect(form.yourSetupDividends).toBe(18000);

    fireEvent.change(screen.getByLabelText('Your Current Salary'), { target: { value: '13000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Draft' }));
    expect(screen.getByLabelText('Your Current Salary')).toHaveValue('£12,000');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    form = useDirectorGuideStore.getState().formData;
    expect(form.yourSetupSalary).toBeUndefined();
    expect(form.yourSetupDividends).toBeUndefined();
  });

  describe('currency fields (DI-01)', () => {
    const revenueInput = () => screen.getByLabelText('Annual Revenue') as HTMLInputElement;
    const expensesInput = () => screen.getByLabelText('Business Expenses') as HTMLInputElement;
    const formData = () => useDirectorGuideStore.getState().formData;

    it('preserves pence typed into the live annual revenue field', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.type(revenueInput(), '1234.56');
      expect(formData().revenue).toBe(1234.56);
      // Not reformatted while editing.
      expect(revenueInput()).toHaveValue('1234.56');

      await user.tab();
      expect(revenueInput()).toHaveValue('£1,234.56');
      expect(formData().revenue).toBe(1234.56);
    });

    it.each([
      ['1234.56'],
      ['1,234.56'],
      ['£1,234.56'],
    ])('resolves pasted %j to £1,234.56', async (pasted) => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.click(expensesInput());
      await user.paste(pasted);
      expect(formData().expenses).toBe(1234.56);

      await user.tab();
      expect(expensesInput()).toHaveValue('£1,234.56');
    });

    it('rejects an unsupported negative amount with a specific, associated error', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setRevenue(5000);
      render(<InputsPanel />);

      const input = revenueInput();
      await user.type(input, '-500', { initialSelectionStart: 0, initialSelectionEnd: 6 });

      // Never converted into another amount: the store keeps its last valid value and the field
      // is flagged invalid so results are invalidated.
      expect(formData().revenue).toBe(5000);
      expect(useDirectorGuideStore.getState().inputErrors.revenue).toEqual({
        text: '-500',
        error: CURRENCY_INPUT_ERRORS.negative,
      });

      await user.tab();
      expect(input).toHaveValue('-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const error = screen.getByText(CURRENCY_INPUT_ERRORS.negative);
      expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual(
        expect.arrayContaining([error.id, `${input.id}-hint`]),
      );
    });

    it.each([
      ['12a', CURRENCY_INPUT_ERRORS.malformed],
      ['1,23', CURRENCY_INPUT_ERRORS.commas],
      ['10.999', CURRENCY_INPUT_ERRORS.decimals],
    ])('explains malformed input %j instead of transforming it', async (text, message) => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.click(expensesInput());
      await user.paste(text);
      await user.tab();

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(expensesInput()).toHaveValue(text);
      // No amount is derived from the text; the field is flagged so results are invalidated.
      expect(formData().expenses).toBeUndefined();
      expect(useDirectorGuideStore.getState().inputErrors.expenses).toEqual({
        text,
        error: message,
      });
    });

    it('recovers when invalid text is corrected', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.type(revenueInput(), '-1');
      await user.tab();
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();

      await user.clear(revenueInput());
      await user.type(revenueInput(), '750.5');
      await user.tab();

      expect(screen.queryByText(CURRENCY_INPUT_ERRORS.negative)).not.toBeInTheDocument();
      expect(revenueInput()).not.toHaveAttribute('aria-invalid');
      expect(revenueInput()).toHaveValue('£750.50');
      expect(formData().revenue).toBe(750.5);
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({});
    });

    it('keeps an empty field distinct from zero', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.type(revenueInput(), '0');
      await user.tab();
      expect(formData().revenue).toBe(0);
      expect(revenueInput()).toHaveValue('£0');

      await user.clear(revenueInput());
      await user.tab();
      expect(formData().revenue).toBeUndefined();
      expect(revenueInput()).toHaveValue('');
    });

    it('does not move the caret or rewrite text during a mid-string edit', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);
      const input = revenueInput();

      await user.type(input, '1234.56');
      await user.type(input, '9', { initialSelectionStart: 2, initialSelectionEnd: 2 });

      expect(input).toHaveValue('12934.56');
      expect(input.selectionStart).toBe(3);
      expect(formData().revenue).toBe(12934.56);
    });

    it('keeps the caret on the same digit when focus switches to edit text', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setRevenue(1234.5);
      render(<InputsPanel />);
      const input = revenueInput();
      expect(input).toHaveValue('£1,234.50');

      // Caret after "£1,2" (position 4) maps to after "12" in the edit text.
      act(() => {
        input.focus();
        input.setSelectionRange(4, 4);
      });
      await waitFor(() => expect(input).toHaveValue('1234.50'));
      expect(input.selectionStart).toBe(2);

      await user.type(input, '9', {
        skipClick: true,
        initialSelectionStart: 2,
        initialSelectionEnd: 2,
      });
      expect(input).toHaveValue('12934.50');
      expect(input.selectionStart).toBe(3);
      expect(formData().revenue).toBe(12934.5);
    });

    it('exposes a decimal keypad on every currency field', () => {
      render(<InputsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Full Inputs' }));
      fireEvent.click(screen.getByRole('button', { name: 'Advanced Options' }));

      for (const label of [
        'Annual Revenue',
        'Business Expenses',
        'YTD Salary',
        'YTD Dividends',
        'Other Drawings',
        'Other Personal Income',
        'Employer Pension',
        'Company Car BIK',
        'Losses Brought Forward',
        'Minimum Salary',
        'Your Current Salary',
        'Your Current Dividends',
      ]) {
        expect(screen.getByLabelText(label)).toHaveAttribute('inputmode', 'decimal');
      }
    });

    it('preserves pence in optional amounts and treats a cleared optional amount as £0', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);
      await user.click(screen.getByRole('button', { name: 'Full Inputs' }));

      const ytdSalary = screen.getByLabelText('YTD Salary');
      await user.clear(ytdSalary);
      await user.paste('£1,500.25');
      expect(formData().ytdSalary).toBe(1500.25);

      await user.clear(ytdSalary);
      expect(formData().ytdSalary).toBe(0);
    });

    it('preserves pence in monthly mode fields', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setMode('monthly');
      render(<InputsPanel />);

      await user.type(screen.getByLabelText('Monthly Contract Income'), '3,250.75');
      await user.type(screen.getByLabelText('Monthly Business Expenses'), '1200.10');
      const cash = screen.getByLabelText('Cash In Bank');
      await user.clear(cash);
      await user.type(cash, '5000.99');

      expect(formData().monthlyIncome).toBe(3250.75);
      expect(formData().monthlyExpenses).toBe(1200.1);
      expect(formData().cashInBank).toBe(5000.99);
    });

    it('keeps invalid text when the field is unmounted, e.g. by closing the mobile drawer', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setRevenue(30000);
      const { unmount } = render(<InputsPanel />);

      await user.type(revenueInput(), '-500', { initialSelectionStart: 0, initialSelectionEnd: 7 });
      unmount();

      // The rejected text must not be replaced by the last valid amount behind the person's back.
      expect(useDirectorGuideStore.getState().inputErrors.revenue).toEqual({
        text: '-500',
        error: CURRENCY_INPUT_ERRORS.negative,
      });

      render(<InputsPanel />);
      expect(revenueInput()).toHaveValue('-500');
      expect(revenueInput()).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();
    });

    it('keeps annual text across a mode switch without sharing it with monthly fields', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.type(revenueInput(), '-1');
      await user.click(screen.getByRole('button', { name: 'Monthly' }));

      // The monthly field in the same position must not inherit the annual field's text.
      expect(screen.getByLabelText('Monthly Contract Income')).toHaveValue('');
      expect(screen.queryByText(CURRENCY_INPUT_ERRORS.negative)).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Annual' }));
      expect(revenueInput()).toHaveValue('-1');
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();
    });

    it('keeps invalid hidden detail amounts visible from Quick Start', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);
      await user.click(screen.getByRole('button', { name: 'Full Inputs' }));

      await user.type(screen.getByLabelText('YTD Salary'), '-250', {
        initialSelectionStart: 0,
        initialSelectionEnd: 2,
      });
      await user.click(screen.getByRole('button', { name: 'Quick Start' }));

      expect(useDirectorGuideStore.getState().inputErrors.ytdSalary?.text).toBe('-250');
      expect(screen.getByTestId('director-hidden-input-error')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Review Details' }));
      expect(screen.getByLabelText('YTD Salary')).toHaveValue('-250');
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();
    });

    it('opens Advanced Options for a held invalid amount and keeps it open once corrected', async () => {
      const user = userEvent.setup();
      // As after closing and reopening the mobile drawer: held text, fresh panel state.
      useDirectorGuideStore.getState().setInputError('pensionContribution', {
        text: '5000x',
        error: CURRENCY_INPUT_ERRORS.malformed,
      });
      render(<InputsPanel />);
      await user.click(screen.getByRole('button', { name: 'Full Inputs' }));

      const toggle = screen.getByRole('button', { name: 'Advanced Options' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const pension = screen.getByLabelText('Employer Pension');
      expect(pension).toHaveValue('5000x');

      await user.type(pension, '{Backspace}', { initialSelectionStart: 5, initialSelectionEnd: 5 });

      expect(useDirectorGuideStore.getState().formData.pensionContribution).toBe(5000);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByLabelText('Employer Pension')).toHaveFocus();
    });

    it('keeps two mounted panels (desktop and mobile drawer) in sync', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setRevenue(30000);
      render(
        <>
          <div data-testid='desktop'>
            <InputsPanel />
          </div>
          <div data-testid='drawer'>
            <InputsPanel />
          </div>
        </>,
      );
      const [desktop, drawer] = screen.getAllByLabelText('Annual Revenue') as HTMLInputElement[];

      await user.type(drawer, 'abc', { initialSelectionStart: 0, initialSelectionEnd: 7 });
      await user.tab();
      expect(desktop).toHaveValue('abc');
      expect(desktop).toHaveAttribute('aria-invalid', 'true');

      await user.type(drawer, '{Backspace}{Backspace}{Backspace}45000');
      await user.tab();
      expect(formData().revenue).toBe(45000);
      expect(desktop).toHaveValue('£45,000');
      expect(desktop).not.toHaveAttribute('aria-invalid');
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({});
    });

    it('switches a formatted amount to plain edit text on focus so digits can be added or removed', async () => {
      const user = userEvent.setup();
      useDirectorGuideStore.getState().setRevenue(30000);
      render(<InputsPanel />);
      const input = revenueInput();
      expect(input).toHaveValue('£30,000');

      await user.click(input);
      await waitFor(() => expect(input).toHaveValue('30000'));

      await user.type(input, '0', {
        skipClick: true,
        initialSelectionStart: 5,
        initialSelectionEnd: 5,
      });
      expect(input).toHaveValue('300000');
      expect(formData().revenue).toBe(300000);

      await user.type(input, '{Backspace}{Backspace}', {
        skipClick: true,
        initialSelectionStart: 6,
        initialSelectionEnd: 6,
      });
      expect(input).toHaveValue('3000');
      expect(formData().revenue).toBe(3000);
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({});

      await user.tab();
      expect(input).toHaveValue('£3,000');
    });

    it('discards unparsed text on reset', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);

      await user.type(revenueInput(), 'abc');
      await user.tab();
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.malformed)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(revenueInput()).toHaveValue('');
      expect(screen.queryByText(CURRENCY_INPUT_ERRORS.malformed)).not.toBeInTheDocument();
      expect(useDirectorGuideStore.getState().inputErrors).toEqual({});
    });

    it('disables Apply in Compare My Setup while a draft amount is invalid', async () => {
      const user = userEvent.setup();
      render(<InputsPanel />);
      await user.click(screen.getByRole('button', { name: 'Full Inputs' }));

      const salary = screen.getByLabelText('Your Current Salary');
      await user.type(salary, '12,570.50');
      expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();

      await user.clear(salary);
      await user.type(salary, '-12');
      await user.tab();
      expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
      expect(screen.getByText(CURRENCY_INPUT_ERRORS.negative)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Reset Draft' }));
      expect(screen.getByLabelText('Your Current Salary')).toHaveValue('');
      expect(screen.queryByText(CURRENCY_INPUT_ERRORS.negative)).not.toBeInTheDocument();

      await user.type(screen.getByLabelText('Your Current Salary'), '12570.5');
      await user.click(screen.getByRole('button', { name: 'Apply' }));
      expect(formData().yourSetupSalary).toBe(12570.5);
    });
  });
});
