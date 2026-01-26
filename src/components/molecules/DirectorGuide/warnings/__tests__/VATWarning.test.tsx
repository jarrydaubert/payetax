// src/components/molecules/DirectorGuide/warnings/__tests__/VATWarning.test.tsx
import { render, screen } from '@testing-library/react';
import { VATWarning } from '../VATWarning';

describe('VATWarning', () => {
  it('should render the title', () => {
    render(<VATWarning revenue={88000} />);
    expect(screen.getByText('VAT Registration')).toBeInTheDocument();
  });

  describe('Below threshold (£85k-£90k)', () => {
    it('should show "getting close" message', () => {
      render(<VATWarning revenue={88000} />);
      expect(screen.getByText(/getting close/i)).toBeInTheDocument();
    });

    it('should mention £90,000 threshold', () => {
      render(<VATWarning revenue={88000} />);
      expect(screen.getByText(/£90,000/)).toBeInTheDocument();
    });

    it('should suggest planning', () => {
      render(<VATWarning revenue={88000} />);
      expect(screen.getByText(/start planning/i)).toBeInTheDocument();
    });
  });

  describe('Above threshold (>=£90k)', () => {
    it('should show "required" message', () => {
      render(<VATWarning revenue={95000} />);
      expect(screen.getByText(/required to register/i)).toBeInTheDocument();
    });

    it('should mention current registration status', () => {
      render(<VATWarning revenue={92000} />);
      expect(screen.getByText(/not registered yet/i)).toBeInTheDocument();
    });
  });

  describe('Boundary cases', () => {
    it('should treat exactly £90,000 as above threshold', () => {
      render(<VATWarning revenue={90000} />);
      expect(screen.getByText(/required to register/i)).toBeInTheDocument();
    });

    it('should treat £89,999 as below threshold', () => {
      render(<VATWarning revenue={89999} />);
      expect(screen.getByText(/getting close/i)).toBeInTheDocument();
    });

    it('should handle revenue at lower boundary (£85,000)', () => {
      render(<VATWarning revenue={85000} />);
      expect(screen.getByText(/getting close/i)).toBeInTheDocument();
    });
  });

  it('should render with custom className', () => {
    const { container } = render(<VATWarning revenue={88000} className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
