import { render, screen } from '@testing-library/react';
import { trackEvent } from '@/lib/analytics';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

jest.mock('@/lib/analytics', () => ({ trackEvent: jest.fn() }));

function setDirectorGuideState(
  partial: Partial<ReturnType<typeof useDirectorGuideStore.getState>>,
) {
  useDirectorGuideStore.setState(partial as never);
}

describe('EducationPanel warning analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const current = useDirectorGuideStore.getState();
    setDirectorGuideState({
      strategyComparison: null,
      formData: {
        ...current.formData,
        revenue: undefined,
        expenses: undefined,
        includesVat: false,
      },
    });
  });

  test('shows VAT guidance without sending financial warning telemetry', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    const store = useDirectorGuideStore.getState();
    store.setRegion('rUK');
    store.setExpenses(91000);
    store.calculate();
    jest.clearAllMocks();

    render(<EducationPanel />);

    expect(screen.getByRole('link', { name: /VAT registration rules/i })).toBeVisible();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
