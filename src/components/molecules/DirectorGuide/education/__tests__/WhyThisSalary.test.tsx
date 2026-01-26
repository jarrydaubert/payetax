// src/components/molecules/DirectorGuide/education/__tests__/WhyThisSalary.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WhyThisSalary } from '../WhyThisSalary';

describe('WhyThisSalary', () => {
  it('should render collapsed by default', () => {
    render(<WhyThisSalary />);
    expect(screen.getByText('Why this salary amount?')).toBeInTheDocument();
    expect(screen.queryByText(/£12,570\/year/)).not.toBeInTheDocument();
  });

  it('should expand when clicked', () => {
    render(<WhyThisSalary />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/£12,570\/year/)).toBeInTheDocument();
  });

  it('should collapse when clicked again', () => {
    render(<WhyThisSalary />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/£12,570\/year/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/£12,570\/year/)).not.toBeInTheDocument();
  });

  it('should have correct aria-expanded state', () => {
    render(<WhyThisSalary />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should explain Personal Allowance', () => {
    render(<WhyThisSalary />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Personal Allowance/i)).toBeInTheDocument();
    expect(screen.getByText(/tax-free/i)).toBeInTheDocument();
  });

  it('should explain State Pension qualification', () => {
    render(<WhyThisSalary />);
    fireEvent.click(screen.getByRole('button'));
    // State Pension appears multiple times
    expect(screen.getAllByText(/State Pension/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/£6,725/)).toBeInTheDocument();
  });

  it('should explain why not higher salary', () => {
    render(<WhyThisSalary />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Why not higher/i)).toBeInTheDocument();
    expect(screen.getByText(/43%/)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<WhyThisSalary className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
