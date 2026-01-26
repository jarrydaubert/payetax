// src/components/molecules/DirectorGuide/education/__tests__/WhatAreDividends.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { WhatAreDividends } from '../WhatAreDividends';

describe('WhatAreDividends', () => {
  it('should render collapsed by default', () => {
    render(<WhatAreDividends />);
    expect(screen.getByText('What are dividends?')).toBeInTheDocument();
    expect(screen.queryByText(/payments from company profits/i)).not.toBeInTheDocument();
  });

  it('should expand when clicked', () => {
    render(<WhatAreDividends />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/payments from company profits/i)).toBeInTheDocument();
  });

  it('should collapse when clicked again', () => {
    render(<WhatAreDividends />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/payments from company profits/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/payments from company profits/i)).not.toBeInTheDocument();
  });

  it('should have correct aria-expanded state', () => {
    render(<WhatAreDividends />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should explain key dividend benefits when expanded', () => {
    render(<WhatAreDividends />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/No National Insurance/i)).toBeInTheDocument();
    expect(screen.getByText(/Lower tax rates/i)).toBeInTheDocument();
    expect(screen.getByText(/£500 tax-free/i)).toBeInTheDocument();
  });

  it('should mention dividend tax rate', () => {
    render(<WhatAreDividends />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/8\.75%/)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<WhatAreDividends className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
