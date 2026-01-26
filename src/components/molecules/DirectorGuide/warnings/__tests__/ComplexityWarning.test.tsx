// src/components/molecules/DirectorGuide/warnings/__tests__/ComplexityWarning.test.tsx
import { render, screen } from '@testing-library/react';
import { ComplexityWarning } from '../ComplexityWarning';

describe('ComplexityWarning', () => {
  it('should render the title', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/getting interesting/i)).toBeInTheDocument();
  });

  it('should mention £250,000 threshold', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/£250,000/)).toBeInTheDocument();
  });

  it('should mention tax planning opportunities', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/tax planning opportunities/i)).toBeInTheDocument();
  });

  it('should mention pension contributions', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/pension contributions/i)).toBeInTheDocument();
  });

  it('should mention family member salaries', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/family member salaries/i)).toBeInTheDocument();
  });

  it('should recommend accountant', () => {
    render(<ComplexityWarning />);
    expect(screen.getByText(/accountant could save you serious money/i)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<ComplexityWarning className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
