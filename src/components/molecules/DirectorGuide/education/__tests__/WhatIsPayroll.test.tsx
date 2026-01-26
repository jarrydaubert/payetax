// src/components/molecules/DirectorGuide/education/__tests__/WhatIsPayroll.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIsPayroll } from '../WhatIsPayroll';

describe('WhatIsPayroll', () => {
  it('should render collapsed by default', () => {
    render(<WhatIsPayroll />);
    expect(screen.getByText("What's payroll?")).toBeInTheDocument();
    expect(screen.queryByText(/system for paying employees/i)).not.toBeInTheDocument();
  });

  it('should expand when clicked', () => {
    render(<WhatIsPayroll />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/system for paying employees/i)).toBeInTheDocument();
  });

  it('should collapse when clicked again', () => {
    render(<WhatIsPayroll />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/system for paying employees/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(/system for paying employees/i)).not.toBeInTheDocument();
  });

  it('should have correct aria-expanded state', () => {
    render(<WhatIsPayroll />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should mention key payroll concepts when expanded', () => {
    render(<WhatIsPayroll />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/National Insurance/i)).toBeInTheDocument();
    // HMRC appears multiple times, so use getAllByText
    expect(screen.getAllByText(/HMRC/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/FreeAgent/i)).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<WhatIsPayroll className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
