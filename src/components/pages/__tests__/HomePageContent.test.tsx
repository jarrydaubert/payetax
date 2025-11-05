/**
 * @jest-environment jsdom
 */
// src/components/pages/__tests__/HomePageContent.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

jest.mock('@/components/molecules/SimpleHero', () => ({
  __esModule: true,
  default: ({ onScrollToCalculator }: any) => (
    <div data-testid='mock-simple-hero'>
      <button type='button' onClick={onScrollToCalculator} data-testid='scroll-button'>
        Scroll to Calculator
      </button>
    </div>
  ),
}));

// Mock calculator store
const mockInit = jest.fn();
jest.mock('@/store/calculatorStore', () => ({
  useCalculatorStore: {
    getState: () => ({
      init: mockInit,
    }),
  },
}));

describe('HomePageContent Component', () => {
  beforeEach(() => {
    mockInit.mockClear();
  });

  it('should render all main sections', () => {
    render(<HomePageContent />);

    expect(screen.getByTestId('mock-simple-hero')).toBeInTheDocument();
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

  it('should scroll to calculator when hero button clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<HomePageContent />);

    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn();
    const calculatorSection = container.querySelector('#tax-calculator') as HTMLElement;
    calculatorSection.scrollIntoView = scrollIntoViewMock;

    const scrollButton = screen.getByTestId('scroll-button');
    await user.click(scrollButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should render main element with proper structure', () => {
    const { container } = render(<HomePageContent />);

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col');
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

  it('should only scroll if calculator ref exists', async () => {
    const user = userEvent.setup();
    const { container } = render(<HomePageContent />);

    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn();
    const calculatorSection = container.querySelector('#tax-calculator') as HTMLElement;
    calculatorSection.scrollIntoView = scrollIntoViewMock;

    const scrollButton = screen.getByTestId('scroll-button');

    // Click should work and scroll should be called
    await user.click(scrollButton);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
