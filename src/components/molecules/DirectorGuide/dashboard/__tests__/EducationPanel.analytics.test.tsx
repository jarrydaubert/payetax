import { render } from '@testing-library/react';
import { trackWarningShown } from '@/lib/directorGuideAnalytics';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { EducationPanel } from '../EducationPanel';

jest.mock('@/lib/directorGuideAnalytics', () => {
  const actual = jest.requireActual('@/lib/directorGuideAnalytics');
  return {
    ...actual,
    trackWarningShown: jest.fn(),
  };
});

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

  test('fires guide_warning_shown for a rendered VAT warning', () => {
    setDirectorGuideState({
      strategyComparison: null,
      formData: { ...useDirectorGuideStore.getState().formData, revenue: 91000 },
    });

    render(<EducationPanel />);

    expect(trackWarningShown).toHaveBeenCalledWith('vat-mandatory');
  });
});
