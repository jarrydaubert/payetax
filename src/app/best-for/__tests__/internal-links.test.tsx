import { render } from '@testing-library/react';
import { USE_CASES } from '@/data/useCases';
import ScenariosPage from '../../scenarios/page';
import ToolsPage from '../../tools/page';
import BestForPage from '../page';

const bestForPaths = USE_CASES.map((useCase) => `/best-for/${useCase.slug}`);

function expectBestForLinks(container: HTMLElement) {
  for (const path of bestForPaths) {
    expect(container.querySelector(`a[href="${path}"]`)).toBeInTheDocument();
  }
}

describe('best-for internal link coverage', () => {
  it('links every audience page from the best-for hub', () => {
    const { container } = render(<BestForPage />);

    expectBestForLinks(container);
  });

  it('links every audience page from the tools hub', () => {
    const { container } = render(<ToolsPage />);

    expectBestForLinks(container);
  });

  it('links every audience page from the scenarios hub', () => {
    const { container } = render(<ScenariosPage />);

    expectBestForLinks(container);
  });
});
