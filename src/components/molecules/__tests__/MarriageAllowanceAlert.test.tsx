/**
 * @jest-environment jsdom
 */
// src/components/molecules/__tests__/MarriageAllowanceAlert.test.tsx

import { render, screen } from '@testing-library/react';
import { MarriageAllowanceAlert } from '../MarriageAllowanceAlert';

describe('MarriageAllowanceAlert', () => {
  describe('Eligibility Logic', () => {
    it('should show alert when user is basic rate taxpayer and partner earns below Personal Allowance', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
      expect(screen.getByText(/Based on your partner's income of £8,000/)).toBeInTheDocument();
    });

    it('should NOT show alert when user already has M code', () => {
      const { container } = render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={true} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should NOT show alert when user earns below Personal Allowance', () => {
      const { container } = render(
        <MarriageAllowanceAlert
          userSalary={10000} // Below £12,570
          partnerSalary={8000}
          hasMarriageCode={false}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should NOT show alert when user earns above higher rate threshold', () => {
      const { container } = render(
        <MarriageAllowanceAlert
          userSalary={60000} // Above £50,270
          partnerSalary={8000}
          hasMarriageCode={false}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should NOT show alert when partner earns at or above Personal Allowance', () => {
      const { container } = render(
        <MarriageAllowanceAlert
          userSalary={35000}
          partnerSalary={12570} // At PA threshold
          hasMarriageCode={false}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show alert when user earns exactly at Personal Allowance + £1', () => {
      render(
        <MarriageAllowanceAlert
          userSalary={12571} // Just above PA
          partnerSalary={8000}
          hasMarriageCode={false}
        />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });

    it('should show alert when user earns exactly at higher rate threshold', () => {
      render(
        <MarriageAllowanceAlert
          userSalary={50270} // Exactly at threshold
          partnerSalary={8000}
          hasMarriageCode={false}
        />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });

    it('should NOT show alert for Scottish user above higher rate threshold', () => {
      const { container } = render(
        <MarriageAllowanceAlert
          userSalary={50000} // Above Scottish higher rate threshold (~£43.7k)
          partnerSalary={8000}
          hasMarriageCode={false}
          isScottish={true}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show alert for Scottish user below higher rate threshold', () => {
      render(
        <MarriageAllowanceAlert
          userSalary={40000}
          partnerSalary={8000}
          hasMarriageCode={false}
          isScottish={true}
        />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });

    it('should show alert when partner earns £1 below Personal Allowance', () => {
      render(
        <MarriageAllowanceAlert
          userSalary={35000}
          partnerSalary={12569} // Just below PA
          hasMarriageCode={false}
        />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });
  });

  describe('Savings Calculations', () => {
    it('should display correct annual savings (£1,260 × 20% = £252)', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      // Marriage allowance = £1,260, basic rate = 20%, so net saving = £252/year
      expect(screen.getByText(/£252 per year/)).toBeInTheDocument();
    });

    it('should display correct monthly savings (£252 ÷ 12 = £21)', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      expect(screen.getByText(/£21\/month/)).toBeInTheDocument();
    });

    it('should reduce net saving when partner income is near Personal Allowance', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={12000} hasMarriageCode={false} />,
      );

      // Partner income near PA reduces net saving below £252
      expect(screen.getByText(/£114 per year/)).toBeInTheDocument();
    });

    it('should format partner income correctly', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={5432} hasMarriageCode={false} />,
      );

      expect(screen.getByText(/partner's income of £5,432/)).toBeInTheDocument();
    });
  });

  describe('Content and Links', () => {
    it('should explain the 10% Personal Allowance transfer', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      expect(
        screen.getByText(/Your partner can transfer 10% of their Personal Allowance/),
      ).toBeInTheDocument();
      expect(screen.getByText(/update your tax code to include an 'M' suffix/)).toBeInTheDocument();
    });

    it('should link to the Marriage Allowance calculator', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      const link = screen.getByRole('link', { name: /Open Marriage Allowance Calculator/i });
      expect(link).toHaveAttribute('href', '/tools/marriage-allowance-calculator');
    });

    it('should render Heart icon', () => {
      const { container } = render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      // Heart icon should be rendered (has aria-hidden)
      const heartIcon = container.querySelector('[aria-hidden="true"]');
      expect(heartIcon).toBeInTheDocument();
    });
  });

  describe('Styling and Accessibility', () => {
    it('should use Alert component with custom styling', () => {
      const { container } = render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      const alert = container.querySelector('[role="status"]');
      expect(alert).toHaveClass('border-pink-500/30');
    });

    it('should have AlertTitle and AlertDescription', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
      expect(screen.getByText(/Based on your partner's income/)).toBeInTheDocument();
    });
  });

  describe('Tax Year Support', () => {
    it('should use default tax year (2025-2026) when not specified', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={8000} hasMarriageCode={false} />,
      );

      // Should use 2025-2026 rates (PA: £12,570, MA: £1,260)
      expect(screen.getByText(/£252 per year/)).toBeInTheDocument();
    });

    it('should support custom tax year', () => {
      render(
        <MarriageAllowanceAlert
          userSalary={35000}
          partnerSalary={8000}
          hasMarriageCode={false}
          taxYear='2024-2025'
        />,
      );

      // Should still render the alert
      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle £0 partner salary', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={0} hasMarriageCode={false} />,
      );

      expect(screen.getByText(/partner's income of £0/)).toBeInTheDocument();
      expect(screen.getByText('You May Qualify for Marriage Allowance')).toBeInTheDocument();
    });

    it('should handle very low partner salary', () => {
      render(
        <MarriageAllowanceAlert userSalary={35000} partnerSalary={100} hasMarriageCode={false} />,
      );

      expect(screen.getByText(/partner's income of £100/)).toBeInTheDocument();
    });

    it('should handle user at exact £12,570 (should NOT show)', () => {
      const { container } = render(
        <MarriageAllowanceAlert userSalary={12570} partnerSalary={8000} hasMarriageCode={false} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle negative salaries gracefully', () => {
      const { container } = render(
        <MarriageAllowanceAlert userSalary={-1000} partnerSalary={-500} hasMarriageCode={false} />,
      );

      // Should not show for negative values (below PA)
      expect(container.firstChild).toBeNull();
    });
  });
});
