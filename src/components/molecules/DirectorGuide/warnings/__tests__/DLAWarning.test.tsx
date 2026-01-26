// src/components/molecules/DirectorGuide/warnings/__tests__/DLAWarning.test.tsx
import { render, screen } from '@testing-library/react';
import { DLAWarning } from '../DLAWarning';

describe('DLAWarning', () => {
  it('should render the title', () => {
    render(<DLAWarning />);
    expect(screen.getByText(/Possible Director's Loan/i)).toBeInTheDocument();
  });

  it('should mention tax implications', () => {
    render(<DLAWarning />);
    expect(screen.getByText(/tax implications/i)).toBeInTheDocument();
  });

  it('should mention 33.75% tax charge', () => {
    render(<DLAWarning />);
    expect(screen.getByText(/33.75%/)).toBeInTheDocument();
  });

  it('should mention 9 month repayment window', () => {
    render(<DLAWarning />);
    expect(screen.getByText(/9 months/i)).toBeInTheDocument();
  });

  it('should recommend accountant', () => {
    render(<DLAWarning />);
    expect(screen.getByText(/Talk to an accountant/i)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<DLAWarning className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
