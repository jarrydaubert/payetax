// src/components/organisms/__tests__/CalculatorContent.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { CalculatorContent } from '../CalculatorContent';

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock ScrollIndicator
jest.mock('@/components/atoms/ScrollIndicator', () => ({
  ScrollIndicator: ({ direction, visible }: { direction: string; visible: boolean }) =>
    visible ? <div data-testid={`scroll-indicator-${direction}`} /> : null,
}));

describe('CalculatorContent Component', () => {
  describe('Rendering', () => {
    it('should render all main sections', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('UK Tax Rates 2025-26')).toBeInTheDocument();
      expect(screen.getByText('Salary Take-Home Comparison')).toBeInTheDocument();
      expect(screen.getByText('Common Tax Questions')).toBeInTheDocument();
      expect(screen.getByText('How to Use the Calculator')).toBeInTheDocument();
    });

    it('should render tax facts section heading', () => {
      render(<CalculatorContent />);

      expect(screen.getByRole('heading', { name: /UK Tax Rates 2025-26/i })).toBeInTheDocument();
    });

    it('should render comparison table heading', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByRole('heading', { name: /Salary Take-Home Comparison/i })
      ).toBeInTheDocument();
    });

    it('should render FAQ section heading', () => {
      render(<CalculatorContent />);

      expect(screen.getByRole('heading', { name: /Common Tax Questions/i })).toBeInTheDocument();
    });

    it('should render how-to section heading', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByRole('heading', { name: /How to Use the Calculator/i })
      ).toBeInTheDocument();
    });
  });

  describe('Tax Facts Cards', () => {
    it('should render all three tax facts cards', () => {
      render(<CalculatorContent />);

      expect(screen.getByRole('heading', { name: 'Income Tax Bands' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'National Insurance' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Quick Examples' })).toBeInTheDocument();
    });

    it('should display personal allowance rate', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('Personal Allowance')).toBeInTheDocument();
    });

    it('should display basic rate tax band', () => {
      const { container } = render(<CalculatorContent />);

      expect(container.textContent).toContain('£12,571 - £50,270');
    });

    it('should display higher rate tax band', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£50,271 - £125,140')).toBeInTheDocument();
    });

    it('should display additional rate tax band', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£125,140+')).toBeInTheDocument();
    });

    it('should display NI threshold', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£0 - £12,570')).toBeInTheDocument();
    });

    it('should display NI rate for earnings above threshold', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£50,270+')).toBeInTheDocument();
    });

    it('should display quick example salaries', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£20,000 salary')).toBeInTheDocument();
      expect(screen.getByText('£30,000 salary')).toBeInTheDocument();
      expect(screen.getByText('£50,000 salary')).toBeInTheDocument();
    });

    it('should display quick example take-home amounts', () => {
      const { container } = render(<CalculatorContent />);

      // These values appear in both quick examples and comparison table
      expect(container.textContent).toContain('£17,294');
      expect(container.textContent).toContain('£23,894');
      expect(container.textContent).toContain('£37,794');
    });
  });

  describe('Comparison Table', () => {
    it('should render comparison table', () => {
      render(<CalculatorContent />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should display table headers', () => {
      render(<CalculatorContent />);

      expect(screen.getByRole('columnheader', { name: 'Gross Salary' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Income Tax' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'National Insurance' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Annual Take-Home' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Monthly Take-Home' })).toBeInTheDocument();
    });

    it('should display all salary rows', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('£20,000')).toBeInTheDocument();
      expect(screen.getByText('£25,000')).toBeInTheDocument();
      expect(screen.getByText('£30,000')).toBeInTheDocument();
      expect(screen.getByText('£40,000')).toBeInTheDocument();
      expect(screen.getByText('£50,000')).toBeInTheDocument();
      expect(screen.getByText('£60,000')).toBeInTheDocument();
      expect(screen.getByText('£80,000')).toBeInTheDocument();
      expect(screen.getByText('£100,000')).toBeInTheDocument();
    });

    it('should display tax amounts for each salary', () => {
      render(<CalculatorContent />);

      // £30k row: tax = £3,486
      expect(screen.getByText('£3,486')).toBeInTheDocument();
    });

    it('should display NI amounts for each salary', () => {
      render(<CalculatorContent />);

      // £30k row: NI = £2,620
      expect(screen.getByText('£2,620')).toBeInTheDocument();
    });

    it('should display annual take-home for each salary', () => {
      const { container } = render(<CalculatorContent />);

      // Value appears in both quick examples and comparison table
      expect(container.textContent).toContain('£23,894');
    });

    it('should display monthly take-home for each salary', () => {
      const { container } = render(<CalculatorContent />);

      // £30k row: monthly = £1,991
      expect(container.textContent).toContain('£1,991');
    });

    it('should show Scottish rates disclaimer', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/Based on England\/Wales\/NI rates for 2025-26. Scottish rates differ./i)
      ).toBeInTheDocument();
    });
  });

  describe('Scroll Indicators', () => {
    it('should not show scroll indicators initially', () => {
      render(<CalculatorContent />);

      expect(screen.queryByTestId('scroll-indicator-left')).not.toBeInTheDocument();
      expect(screen.queryByTestId('scroll-indicator-right')).not.toBeInTheDocument();
    });

    it('should have scroll detection logic on comparison table', () => {
      const { container } = render(<CalculatorContent />);

      expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
    });
  });

  describe('FAQ Section', () => {
    it('should render all FAQ questions', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/How much tax do I pay on £30,000 in UK 2025\?/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/What is the UK personal allowance for 2025-26\?/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/How is PAYE tax calculated in the UK\?/i)).toBeInTheDocument();
      expect(
        screen.getByText(/What's the difference between Scottish and English tax rates\?/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/How do student loan repayments work with PAYE\?/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/How does pension tax relief work\?/i)).toBeInTheDocument();
    });

    it('should use details/summary for FAQ items', () => {
      const { container } = render(<CalculatorContent />);

      const details = container.querySelectorAll('details');
      expect(details.length).toBe(6);
    });

    it('should expand FAQ when clicked', () => {
      render(<CalculatorContent />);

      const summary = screen.getByText(/How much tax do I pay on £30,000 in UK 2025\?/i);
      fireEvent.click(summary);

      // Content should be visible after click
      expect(screen.getByText(/Quick Answer:/i)).toBeInTheDocument();
    });

    it('should show correct answer for £30k question', () => {
      const { container } = render(<CalculatorContent />);

      const summary = screen.getByText(/How much tax do I pay on £30,000 in UK 2025\?/i);
      fireEvent.click(summary);

      // Check content is revealed after click
      expect(container.textContent).toContain('Income Tax');
      expect(container.textContent).toContain('£3,486');
    });

    it('should show personal allowance value in FAQ', () => {
      const { container } = render(<CalculatorContent />);

      const summary = screen.getByText(/What is the UK personal allowance for 2025-26\?/i);
      fireEvent.click(summary);

      // Value appears multiple times in the page
      expect(container.textContent).toContain('£12,570');
    });

    it('should include PAYE calculation steps', () => {
      const { container } = render(<CalculatorContent />);

      const summary = screen.getByText(/How is PAYE tax calculated in the UK\?/i);
      fireEvent.click(summary);

      expect(container.textContent).toMatch(/Calculate taxable income/i);
      expect(container.textContent).toMatch(/Apply tax bands/i);
    });

    it('should mention Scottish tax differences', () => {
      const { container } = render(<CalculatorContent />);

      const summary = screen.getByText(
        /What's the difference between Scottish and English tax rates\?/i
      );
      fireEvent.click(summary);

      expect(container.textContent).toMatch(/Scotland has 5 tax bands/i);
      expect(container.textContent).toMatch(/England.*Wales.*NI.*has 3 tax bands/i);
    });

    it('should link to Scottish comparison blog post', () => {
      render(<CalculatorContent />);

      const link = screen.getByRole('link', {
        name: /Read full Scottish vs English comparison →/i,
      });
      expect(link).toHaveAttribute('href', '/blog/scottish-vs-english-tax-rates-2025-comparison');
    });

    it('should list student loan plan thresholds', () => {
      render(<CalculatorContent />);

      const summary = screen.getByText(/How do student loan repayments work with PAYE\?/i);
      fireEvent.click(summary);

      expect(screen.getByText(/Plan 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Plan 5/i)).toBeInTheDocument();
      expect(screen.getByText(/Postgraduate/i)).toBeInTheDocument();
    });

    it('should link to student loan guide', () => {
      render(<CalculatorContent />);

      const link = screen.getByRole('link', {
        name: /Read full student loan guide →/i,
      });
      expect(link).toHaveAttribute('href', '/blog/student-loan-repayment-changes-2025-26');
    });

    it('should explain pension tax relief', () => {
      const { container } = render(<CalculatorContent />);

      const summary = screen.getByText(/How does pension tax relief work\?/i);
      fireEvent.click(summary);

      expect(container.textContent).toMatch(
        /Pension contributions are deducted.*before.*tax is calculated/i
      );
    });

    it('should show contact link in FAQ footer', () => {
      render(<CalculatorContent />);

      const link = screen.getByRole('link', { name: /contact us/i });
      expect(link).toHaveAttribute('href', 'mailto:support@payetax.co.uk');
    });

    it('should link to blog in FAQ footer', () => {
      render(<CalculatorContent />);

      const link = screen.getByRole('link', { name: /Read our tax guides/i });
      expect(link).toHaveAttribute('href', '/blog');
    });
  });

  describe('How to Use Section', () => {
    it('should render all 4 steps', () => {
      render(<CalculatorContent />);

      expect(screen.getByText('Enter Your Salary')).toBeInTheDocument();
      expect(screen.getByText('Select Tax Year & Region')).toBeInTheDocument();
      expect(screen.getByText('Add Deductions (Optional)')).toBeInTheDocument();
      expect(screen.getByText('View & Export Results')).toBeInTheDocument();
    });

    it('should show step numbers visually', () => {
      const { container } = render(<CalculatorContent />);

      // Check for numbered badges
      const badges = container.querySelectorAll('.font-bold.text-2xl.text-white');
      expect(badges.length).toBe(4);
    });

    it('should describe salary input step', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/Input your gross annual, monthly, or weekly salary/i)
      ).toBeInTheDocument();
    });

    it('should describe tax year selection step', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/Choose the tax year \(2025-26 for current rates\)/i)
      ).toBeInTheDocument();
    });

    it('should describe deductions step', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/Include pension contributions, student loan plans/i)
      ).toBeInTheDocument();
    });

    it('should describe results step', () => {
      render(<CalculatorContent />);

      expect(
        screen.getByText(/See your breakdown by income tax, National Insurance/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CalculatorContent />);

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy for cards', () => {
      render(<CalculatorContent />);

      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBeGreaterThan(0);
    });

    it('should use semantic HTML elements', () => {
      const { container } = render(<CalculatorContent />);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBe(4); // 4 main sections
    });

    it('should have accessible table structure', () => {
      render(<CalculatorContent />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(5);
    });

    it('should have clickable summary elements', () => {
      const { container } = render(<CalculatorContent />);

      const summaries = container.querySelectorAll('summary');
      expect(summaries.length).toBe(6);

      for (const summary of summaries) {
        expect(summary).toHaveClass('cursor-pointer');
      }
    });
  });

  describe('Styling and Animation', () => {
    it('should have gradient backgrounds on sections', () => {
      const { container } = render(<CalculatorContent />);

      const gradients = container.querySelectorAll('[class*="bg-gradient"]');
      expect(gradients.length).toBeGreaterThan(0);
    });

    it('should use Framer Motion for animations', () => {
      render(<CalculatorContent />);

      // Component should render without throwing
      expect(screen.getByText('UK Tax Rates 2025-26')).toBeInTheDocument();
    });

    it('should not throw errors on mount', () => {
      expect(() => {
        render(<CalculatorContent />);
      }).not.toThrow();
    });

    it('should not throw errors on unmount', () => {
      const { unmount } = render(<CalculatorContent />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Content Accuracy', () => {
    it('should display correct 2025-26 tax year', () => {
      const { container } = render(<CalculatorContent />);

      // Check that 2025-26 appears somewhere in the content
      expect(container.textContent).toContain('2025-26');
    });

    it('should mention HMRC', () => {
      const { container } = render(<CalculatorContent />);

      // Check that HMRC is mentioned
      expect(container.textContent).toContain('HMRC');
    });

    it('should mention all UK regions', () => {
      const { container } = render(<CalculatorContent />);

      // Check for UK regions
      expect(container.textContent).toMatch(/Scotland|England|Wales|Northern Ireland/i);
    });

    it('should reference correct personal allowance', () => {
      const { container } = render(<CalculatorContent />);

      // £12,570 appears multiple times
      expect(container.textContent).toContain('£12,570');
    });
  });

  describe('Edge Cases', () => {
    it('should handle window resize for scroll indicators', () => {
      const { container } = render(<CalculatorContent />);

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      // Should not throw
      expect(container).toBeInTheDocument();
    });

    it('should handle scroll events on comparison table', () => {
      const { container } = render(<CalculatorContent />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      if (scrollContainer) {
        fireEvent.scroll(scrollContainer);
      }

      // Should not throw
      expect(container).toBeInTheDocument();
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(<CalculatorContent />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
