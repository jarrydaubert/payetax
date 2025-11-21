/**
 * TaxRatesOverview Component Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for the UK Tax Rates overview section:
 * - Income Tax bands display
 * - National Insurance rates
 * - Quick salary examples
 * - Animation variants (motion preference)
 * - Scottish tax link
 */

import { render, screen } from '@testing-library/react';
import { TaxRatesOverview } from '../TaxRatesOverview';

// Mock useMotionPreference hook
jest.mock('@/hooks/useMotionPreference', () => ({
  useMotionPreference: jest.fn(),
}));

import { useMotionPreference } from '@/hooks/useMotionPreference';

const mockUseMotionPreference = useMotionPreference as jest.Mock;

describe('TaxRatesOverview', () => {
  beforeEach(() => {
    mockUseMotionPreference.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the section', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should render the main heading with correct year', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('UK Tax Rates 2025-26')).toBeInTheDocument();
    });

    it('should render the subheading', () => {
      render(<TaxRatesOverview />);
      expect(
        screen.getByText('Quick reference for current tax year rates and thresholds')
      ).toBeInTheDocument();
    });
  });

  describe('Income Tax Card', () => {
    it('should render Income Tax Bands card', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('Income Tax Bands')).toBeInTheDocument();
    });

    it('should display Personal Allowance', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('Personal Allowance')).toBeInTheDocument();
    });

    it('should display basic rate band', () => {
      render(<TaxRatesOverview />);
      // Band appears in both Income Tax and NI cards
      expect(screen.getAllByText('£12,571 - £50,270').length).toBeGreaterThan(0);
      // 20% appears in the Income Tax card
      expect(screen.getAllByText('20%').length).toBeGreaterThan(0);
    });

    it('should display higher rate band', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('£50,271 - £125,140')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should display additional rate', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('£125,140+')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  describe('National Insurance Card', () => {
    it('should render National Insurance card', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('National Insurance')).toBeInTheDocument();
    });

    it('should display NI thresholds', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('£0 - £12,570')).toBeInTheDocument();
      expect(screen.getByText('£50,270+')).toBeInTheDocument();
    });

    it('should display NI rates', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('12%')).toBeInTheDocument();
      expect(screen.getByText('2%')).toBeInTheDocument();
    });

    it('should display Class 1 footer note', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('Class 1 contributions for employees')).toBeInTheDocument();
    });
  });

  describe('Quick Examples Card', () => {
    it('should render Quick Examples card', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('Quick Examples')).toBeInTheDocument();
    });

    it('should display salary examples', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('£20,000 salary')).toBeInTheDocument();
      expect(screen.getByText('£30,000 salary')).toBeInTheDocument();
      expect(screen.getByText('£50,000 salary')).toBeInTheDocument();
    });

    it('should display take-home amounts', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('£17,294')).toBeInTheDocument();
      expect(screen.getByText('£23,894')).toBeInTheDocument();
      expect(screen.getByText('£37,794')).toBeInTheDocument();
    });

    it('should display take-home footer note', () => {
      render(<TaxRatesOverview />);
      expect(screen.getByText('Annual take-home after tax & NI')).toBeInTheDocument();
    });
  });

  describe('Scottish Tax Link', () => {
    it('should render the Scottish tax link', () => {
      render(<TaxRatesOverview />);
      const link = screen.getByRole('link', { name: /scottish taxpayers/i });
      expect(link).toBeInTheDocument();
    });

    it('should link to Scottish comparison blog post', () => {
      render(<TaxRatesOverview />);
      const link = screen.getByRole('link', { name: /scottish taxpayers/i });
      expect(link).toHaveAttribute('href', '/blog/scottish-vs-english-tax-rates-2025-comparison');
    });
  });

  describe('Animation / Motion Preference', () => {
    it('should render with animations when motion is allowed', () => {
      mockUseMotionPreference.mockReturnValue(false);
      const { container } = render(<TaxRatesOverview />);
      // Component renders with animation enabled
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render without animations when reduced motion is preferred', () => {
      mockUseMotionPreference.mockReturnValue(true);
      const { container } = render(<TaxRatesOverview />);
      // Component still renders when animations are disabled
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should call useMotionPreference hook', () => {
      render(<TaxRatesOverview />);
      expect(mockUseMotionPreference).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have gradient background', () => {
      const { container } = render(<TaxRatesOverview />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
    });

    it('should have padding', () => {
      const { container } = render(<TaxRatesOverview />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-16');
    });

    it('should render three cards in a grid', () => {
      render(<TaxRatesOverview />);
      // Should have 3 TaxRateCards
      expect(screen.getByText('Income Tax Bands')).toBeInTheDocument();
      expect(screen.getByText('National Insurance')).toBeInTheDocument();
      expect(screen.getByText('Quick Examples')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<TaxRatesOverview />);
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('UK Tax Rates 2025-26');
    });

    it('should have accessible link', () => {
      render(<TaxRatesOverview />);
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName();
    });
  });
});
