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
});
