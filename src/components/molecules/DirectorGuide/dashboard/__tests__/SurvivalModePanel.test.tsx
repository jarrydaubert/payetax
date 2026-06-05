import { render, screen } from '@testing-library/react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { SurvivalModePanel } from '../SurvivalModePanel';

describe('DirectorGuide SurvivalModePanel', () => {
  beforeEach(() => {
    const current = useDirectorGuideStore.getState();
    useDirectorGuideStore.setState({
      strategyComparison: null,
      formData: {
        ...current.formData,
        revenue: 0,
        expenses: 0,
        pensionContribution: 0,
        isPensionAlreadyDeducted: false,
        hasOtherPAYEEmployment: false,
      },
    } as never);
  });

  test('renders recommendation when profit is zero', () => {
    useDirectorGuideStore.setState({ strategyComparison: { grossProfit: 0 } as never } as never);

    const { container } = render(<SurvivalModePanel />);

    expect(screen.getByTestId('director-survival-mode')).toBeInTheDocument();
    expect(screen.getByText('Survival Mode')).toBeInTheDocument();
    expect(container.querySelector('[class*="bg-gradient"]')).not.toBeInTheDocument();

    // 2026-27 LEL is £6,708.
    expect(screen.getAllByText(/£6,708/).length).toBeGreaterThan(0);

    // Employer NI threshold £5,000 @ 15% => ~£256.20 employer NI, so loss is ~£6,964 when starting from £0 profit.
    expect(screen.getByText(/£6,964/)).toBeInTheDocument();
  });

  test('does not render in normal mode (profit > 0)', () => {
    useDirectorGuideStore.setState({ strategyComparison: { grossProfit: 1 } as never } as never);

    const { container } = render(<SurvivalModePanel />);

    expect(container).toBeEmptyDOMElement();
  });
});
