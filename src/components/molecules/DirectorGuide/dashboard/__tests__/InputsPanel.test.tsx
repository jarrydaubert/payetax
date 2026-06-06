import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
    expect(screen.queryByLabelText('Monthly Contract Income')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));

    expect(useDirectorGuideStore.getState().formData.mode).toBe('monthly');
    expect(screen.getByLabelText('Monthly Contract Income')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly Business Expenses')).toBeInTheDocument();
    expect(screen.queryByLabelText('Annual Revenue')).not.toBeInTheDocument();
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
});
