import { render, screen } from '@testing-library/react';
import { directorGuideFaqItems } from '../faq';
import DirectorGuidePage from '../page';

jest.mock('@/components/organisms/DirectorGuide', () => ({
  DirectorDashboard: () => <div>Director dashboard shell</div>,
}));

describe('DirectorGuidePage', () => {
  it('renders FAQ schema copy as visible page text', () => {
    render(<DirectorGuidePage />);

    expect(screen.getByText('Director dashboard shell')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Common director pay questions/i }),
    ).toBeInTheDocument();

    for (const item of directorGuideFaqItems) {
      expect(screen.getByRole('heading', { name: item.question })).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }
  });
});
