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
        monthlyIncome: 0,
        monthlyExpenses: 0,
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

    fireEvent.click(screen.getByRole('button', { name: 'Monthly (Variable)' }));

    expect(useDirectorGuideStore.getState().formData.mode).toBe('monthly');
    expect(screen.getByLabelText('Monthly Contract Income')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly Business Expenses')).toBeInTheDocument();
    expect(screen.queryByLabelText('Annual Revenue')).not.toBeInTheDocument();
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
});
