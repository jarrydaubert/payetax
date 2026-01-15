/**
 * @jest-environment jsdom
 */
// src/components/pages/__tests__/HomePageContent.test.tsx
// Note: Hero is now server-rendered in page.tsx for LCP optimization

import { render, screen } from '@testing-library/react';
import HomePageContent from '../HomePageContent';

// Mock child components
jest.mock('@/components/organisms/CalculatorContainer', () => ({
  CalculatorContainer: () => (
    <div data-testid='mock-calculator-container'>Calculator Container</div>
  ),
}));

jest.mock('@/components/organisms/CalculatorContent', () => ({
  CalculatorContent: () => <div data-testid='mock-calculator-content'>Calculator Content</div>,
}));

// Mock calculator store
const mockInit = jest.fn();
jest.mock('@/store/calculatorStore', () => ({
  useCalculatorStore: (selector: (state: { init: jest.Mock }) => jest.Mock) =>
    selector({ init: mockInit }),
}));

describe('HomePageContent Component', () => {
  beforeEach(() => {
    mockInit.mockClear();
  });

  it('should render all main sections (hero is server-rendered separately)', () => {
    render(<HomePageContent />);

    // Hero is now rendered in page.tsx for LCP optimization
    expect(screen.getByTestId('mock-calculator-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-calculator-content')).toBeInTheDocument();
  });

  it('should initialize calculator store on mount', () => {
    render(<HomePageContent />);

    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('should have #tax-calculator ID on calculator section', () => {
    const { container } = render(<HomePageContent />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toBeInTheDocument();
    expect(calculatorSection?.tagName).toBe('SECTION');
  });

  it('should render main element with proper structure', () => {
    const { container } = render(<HomePageContent />);

    const mainDiv = container.querySelector('div.flex.flex-col');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('flex', 'flex-col');
  });

  it('should render calculator section with padding', () => {
    const { container } = render(<HomePageContent />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toHaveClass('py-12', 'md:py-16', 'lg:py-20');
  });

  it('should render content section in container', () => {
    const { container } = render(<HomePageContent />);

    const contentSection = container.querySelectorAll('section')[1];
    expect(contentSection).toHaveClass('container', 'mx-auto', 'px-4', 'md:px-6');
  });
});
