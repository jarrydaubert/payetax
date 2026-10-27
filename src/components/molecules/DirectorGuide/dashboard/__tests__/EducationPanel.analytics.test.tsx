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

  test('shows a VAT warning without sending financial warning telemetry', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    render(<EducationPanel />);

    expect(screen.getByText('VAT Registration Required')).toBeVisible();
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
