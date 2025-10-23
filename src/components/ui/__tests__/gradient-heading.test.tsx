// src/components/ui/__tests__/gradient-heading.test.tsx

import { render, screen } from '@testing-library/react';
import { GradientHeading } from '../gradient-heading';

describe('GradientHeading', () => {
  describe('rendering', () => {
    it('should render with default props (h2)', () => {
      render(<GradientHeading>Test Heading</GradientHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Heading');
    });

    it('should render h1 when level="h1"', () => {
      render(<GradientHeading level='h1'>H1 Heading</GradientHeading>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('H1 Heading');
    });

    it('should render h3 when level="h3"', () => {
      render(<GradientHeading level='h3'>H3 Heading</GradientHeading>);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('H3 Heading');
    });

    it('should render h4 when level="h4"', () => {
      render(<GradientHeading level='h4'>H4 Heading</GradientHeading>);

      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('H4 Heading');
    });
  });

  describe('styling', () => {
    it('should apply gradient classes', () => {
      render(<GradientHeading>Gradient Text</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('bg-gradient-to-r');
      expect(heading).toHaveClass('from-brand-gradient-start');
      expect(heading).toHaveClass('to-brand-gradient-end');
      expect(heading).toHaveClass('bg-clip-text');
      expect(heading).toHaveClass('text-transparent');
    });

    it('should apply accent gradient when gradient="accent"', () => {
      render(<GradientHeading gradient='accent'>Accent Gradient</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('via-brand-accent');
    });

    it('should apply custom className', () => {
      render(<GradientHeading className='custom-class'>Custom</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('custom-class');
    });

    it('should apply default spacing (mb-3)', () => {
      render(<GradientHeading>With Spacing</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('mb-3');
    });

    it('should apply no spacing when spacing="none"', () => {
      render(<GradientHeading spacing='none'>No Spacing</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).not.toHaveClass('mb-3');
      expect(heading).not.toHaveClass('mb-4');
      expect(heading).not.toHaveClass('mb-6');
    });

    it('should apply medium spacing when spacing="md"', () => {
      render(<GradientHeading spacing='md'>Medium Spacing</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('mb-4');
    });

    it('should apply large spacing when spacing="lg"', () => {
      render(<GradientHeading spacing='lg'>Large Spacing</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('mb-6');
    });
  });

  describe('responsive sizing', () => {
    it('should apply h1 responsive sizing', () => {
      render(<GradientHeading level='h1'>H1</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('sm:text-5xl');
      expect(heading).toHaveClass('md:text-6xl');
    });

    it('should apply h2 responsive sizing', () => {
      render(<GradientHeading level='h2'>H2</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('md:text-5xl');
    });

    it('should apply h3 responsive sizing', () => {
      render(<GradientHeading level='h3'>H3</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('md:text-4xl');
    });

    it('should apply h4 responsive sizing', () => {
      render(<GradientHeading level='h4'>H4</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('md:text-3xl');
    });
  });

  describe('accessibility', () => {
    it('should be accessible by role', () => {
      render(<GradientHeading level='h1'>Accessible Heading</GradientHeading>);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<GradientHeading aria-label='Custom Label'>Visual Text</GradientHeading>);

      const heading = screen.getByLabelText('Custom Label');
      expect(heading).toBeInTheDocument();
    });

    it('should support id attribute', () => {
      const testId = 'test-heading-unique-id';
      render(<GradientHeading id={testId}>With ID</GradientHeading>);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveAttribute('id', testId);
    });
  });

  describe('combinations', () => {
    it('should combine all props correctly', () => {
      render(
        <GradientHeading level='h1' gradient='accent' spacing='lg' className='extra-class'>
          Full Props
        </GradientHeading>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-4xl'); // h1 sizing
      expect(heading).toHaveClass('via-brand-accent'); // accent gradient
      expect(heading).toHaveClass('mb-6'); // large spacing
      expect(heading).toHaveClass('extra-class'); // custom class
    });
  });
});
