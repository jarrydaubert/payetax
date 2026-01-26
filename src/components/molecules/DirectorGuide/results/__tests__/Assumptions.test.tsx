// src/components/molecules/DirectorGuide/results/__tests__/Assumptions.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Assumptions } from '../Assumptions';

describe('Assumptions', () => {
  it('should render collapsed by default', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    expect(screen.getByText('Assumptions we made')).toBeInTheDocument();
    expect(screen.queryByText('Your company is your only income')).not.toBeInTheDocument();
  });

  it('should expand when clicked', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Your company is your only income')).toBeInTheDocument();
  });

  it('should collapse when clicked again', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Your company is your only income')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Your company is your only income')).not.toBeInTheDocument();
  });

  it('should show all assumptions when expanded', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Your company is your only income')).toBeInTheDocument();
    expect(screen.getByText('Standard 12-month accounting year')).toBeInTheDocument();
    expect(screen.getByText('No student loan repayments')).toBeInTheDocument();
    expect(screen.getByText(/Tax year 2025-2026/)).toBeInTheDocument();
  });

  it('should show Scottish rates note for Scotland', () => {
    render(<Assumptions region='scotland' taxYear='2025-2026' />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Scottish salary rates, UK dividend rates')).toBeInTheDocument();
  });

  it('should show UK rates note for rUK', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('UK tax rates for both salary and dividends')).toBeInTheDocument();
  });

  it('should have correct aria-expanded state', () => {
    render(<Assumptions region='rUK' taxYear='2025-2026' />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
