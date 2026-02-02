/**
 * @jest-environment jsdom
 */
// src/components/pages/__tests__/HomePageContent.test.tsx
// Simplified: Only renders calculator section
// Hero and landing sections are server-rendered in page.tsx

import { render, screen } from '@testing-library/react';
import HomePageContent from '../HomePageContent';

// Mock child components
jest.mock('@/components/organisms/CalculatorContainer', () => ({
  CalculatorContainer: () => (
    <div data-testid='mock-calculator-container'>Calculator Container</div>
  ),
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

  it('should render calculator container', () => {
    render(<HomePageContent />);

    expect(screen.getByTestId('mock-calculator-container')).toBeInTheDocument();
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

  it('should render calculator section with padding', () => {
    const { container } = render(<HomePageContent />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toHaveClass('py-16', 'md:py-20', 'lg:py-24');
  });

  it('should have z-index for layering above background', () => {
    const { container } = render(<HomePageContent />);

    const calculatorSection = container.querySelector('#tax-calculator');
    expect(calculatorSection).toHaveClass('z-[1]');
  });
});
