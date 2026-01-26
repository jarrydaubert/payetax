// src/components/molecules/DirectorGuide/warnings/__tests__/OtherIncomeWarning.test.tsx
import { render, screen } from '@testing-library/react';
import { OtherIncomeWarning } from '../OtherIncomeWarning';

describe('OtherIncomeWarning', () => {
  it('should render the title', () => {
    render(<OtherIncomeWarning />);
    expect(screen.getByText(/indicated other income/i)).toBeInTheDocument();
  });

  it('should explain tax will be higher', () => {
    render(<OtherIncomeWarning />);
    expect(screen.getByText(/higher/i)).toBeInTheDocument();
  });

  it('should mention "only income" assumption', () => {
    render(<OtherIncomeWarning />);
    expect(screen.getByText(/only income/i)).toBeInTheDocument();
  });

  it('should suggest using as baseline', () => {
    render(<OtherIncomeWarning />);
    expect(screen.getByText(/rough baseline/i)).toBeInTheDocument();
  });

  it('should show accountant CTA button', () => {
    render(<OtherIncomeWarning />);
    expect(screen.getByRole('button', { name: /talk to an accountant/i })).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(<OtherIncomeWarning className='test-class' />);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
