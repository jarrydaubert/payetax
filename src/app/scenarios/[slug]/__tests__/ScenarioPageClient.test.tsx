// src/app/scenarios/[slug]/__tests__/ScenarioPageClient.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Scenario } from '@/data/scenarios';
import { ScenarioPageClient } from '../ScenarioPageClient';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => true,
}));

// Mock next/link for jsdom
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function getAfterValueText(): string {
  // The "After (+ Pension)" label is stable; the value is the next <p> in the same column.
  const afterLabel = screen.getByText('After (+ Pension)');
  const afterCol = afterLabel.parentElement;
  if (!afterCol) throw new Error('After column not found');
  const valueEl = afterCol.querySelector('p:nth-of-type(2)');
  if (!valueEl) throw new Error('After value element not found');
  return valueEl.textContent ?? '';
}

describe('ScenarioPageClient', () => {
  it('keeps optimization comparison in sync with current calculator inputs (e.g., Scottish toggle)', async () => {
    const user = userEvent.setup();

    const scenario: Scenario = {
      slug: 'test-tax-trap',
      title: 'Test Tax Trap',
      category: 'tax-trap',
      salary: 110000,
      description: 'Test',
      searchIntent: [],
      defaults: {
        salary: 110000,
        pensionPercent: 0,
        studentLoan: undefined,
        scottish: false,
      },
      explanation: 'Test',
      optimization: 'Test',
      relatedBlogSlugs: [],
      faqs: [],
      heroStatLabel: 'Annual Tax Savings',
      highPriority: false,
    };

    render(<ScenarioPageClient scenario={scenario} />);

    // Wait for the optimization comparison to appear.
    await screen.findByText('With Pension Optimization');
    const beforeAfterInitial = getAfterValueText();

    // Toggle Scottish rates in the embedded calculator.
    const scottishToggle = screen.getByRole('switch', { name: /Scottish Income Tax Rates/i });
    await user.click(scottishToggle);

    // Optimized comparison should update (previously it was stuck on the scenario defaults).
    await waitFor(() => {
      expect(getAfterValueText()).not.toEqual(beforeAfterInitial);
    });
  });
});
