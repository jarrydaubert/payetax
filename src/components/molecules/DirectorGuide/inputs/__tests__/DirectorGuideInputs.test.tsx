import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { AlreadyTakenInputs } from '../AlreadyTakenInputs';
import { CompanyCarInput } from '../CompanyCarInput';
import { CoreInputs } from '../CoreInputs';
import { EmploymentAllowanceInput } from '../EmploymentAllowanceInput';
import { OtherIncomeInput } from '../OtherIncomeInput';
import { PensionInput } from '../PensionInput';
import { StudentLoanInputs } from '../StudentLoanInputs';

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('Director Intelligence input components', () => {
  beforeEach(() => {
    const current = useDirectorGuideStore.getState();
    setStoreState({
      ...current,
      formData: {
        ...current.formData,
        region: undefined,
        revenue: undefined,
        expenses: undefined,
        includesVat: false,
        accountingPeriodEnd: '',
        ytdSalary: 0,
        ytdDividends: 0,
        ytdDrawings: 0,
        otherIncome: 0,
        pensionContribution: 0,
        companyCarBIK: 0,
        hasEmploymentAllowance: false,
        studentLoanPlans: [],
      },
    });
  });

  it('updates core inputs and accepts an explicit accounting period end', () => {
    render(<CoreInputs />);

    fireEvent.change(screen.getByLabelText('Annual Revenue'), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText('Business Expenses'), { target: { value: '20000' } });

    expect(useDirectorGuideStore.getState().formData.revenue).toBe(100000);
    expect(useDirectorGuideStore.getState().formData.expenses).toBe(20000);

    fireEvent.click(screen.getByLabelText('Revenue includes VAT (warnings only)'));
    expect(useDirectorGuideStore.getState().formData.includesVat).toBe(true);

    fireEvent.click(screen.getByText('Scotland'));
    expect(useDirectorGuideStore.getState().formData.region).toBe('scotland');

    const periodEnd = screen.getByLabelText('Company Accounting Period End');
    expect(periodEnd).toHaveValue('');
    fireEvent.change(periodEnd, {
      target: { value: '2026-06-30' },
    });
    expect(useDirectorGuideStore.getState().formData.accountingPeriodEnd).toBe('2026-06-30');

    fireEvent.change(periodEnd, { target: { value: '' } });
    expect(useDirectorGuideStore.getState().formData.accountingPeriodEnd).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Help for Company Accounting Period End' }));
    expect(
      screen.getByRole('region', { name: 'Help for Company Accounting Period End' }),
    ).toHaveTextContent(/HMRC business tax account/i);
  });

  it('updates already taken values', () => {
    render(<AlreadyTakenInputs />);

    fireEvent.change(screen.getByLabelText('YTD Salary'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('YTD Dividends'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('Other Drawings'), { target: { value: '1000' } });

    const state = useDirectorGuideStore.getState().formData;
    expect(state.ytdSalary).toBe(5000);
    expect(state.ytdDividends).toBe(2000);
    expect(state.ytdDrawings).toBe(1000);
  });

  it('updates company car BIK, other income, and pension values', () => {
    render(
      <div>
        <CompanyCarInput />
        <OtherIncomeInput />
        <PensionInput />
      </div>,
    );

    fireEvent.change(screen.getByLabelText('Company Car (BIK Value)'), {
      target: { value: '3600' },
    });
    fireEvent.change(screen.getByLabelText('Other Personal Income'), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText('Employer Pension Contribution'), {
      target: { value: '5000' },
    });

    const state = useDirectorGuideStore.getState().formData;
    expect(state.companyCarBIK).toBe(3600);
    expect(state.otherIncome).toBe(12000);
    expect(state.pensionContribution).toBe(5000);
  });

  it('toggles employment allowance and student loan plans', () => {
    render(
      <div>
        <EmploymentAllowanceInput />
        <StudentLoanInputs />
      </div>,
    );

    fireEvent.click(screen.getByLabelText('Company claims Employment Allowance'));
    expect(useDirectorGuideStore.getState().formData.hasEmploymentAllowance).toBe(true);

    fireEvent.click(screen.getByLabelText(/Plan 1/));
    expect(useDirectorGuideStore.getState().formData.studentLoanPlans).toContain('plan1');
  });
});
