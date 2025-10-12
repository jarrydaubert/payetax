// src/components/molecules/__tests__/HowToStepCard.test.tsx
import { render, screen } from '@testing-library/react';
import { HowToStepCard } from '../HowToStepCard';

describe('HowToStepCard', () => {
  it('renders step number', () => {
    render(
      <HowToStepCard
        step={1}
        title='Enter Your Salary'
        description='Input your gross annual salary'
      />
    );

    // Step number should appear twice (large background and badge)
    const stepNumbers = screen.getAllByText('1');
    expect(stepNumbers.length).toBeGreaterThanOrEqual(1);
  });

  it('renders title', () => {
    render(
      <HowToStepCard
        step={1}
        title='Enter Your Salary'
        description='Input your gross annual salary'
      />
    );

    expect(screen.getByText('Enter Your Salary')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <HowToStepCard
        step={1}
        title='Enter Your Salary'
        description='Input your gross annual salary'
      />
    );

    expect(screen.getByText('Input your gross annual salary')).toBeInTheDocument();
  });

  it('renders different step numbers correctly', () => {
    const { rerender } = render(
      <HowToStepCard step={1} title='Step 1' description='Description 1' />
    );

    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);

    rerender(<HowToStepCard step={2} title='Step 2' description='Description 2' />);
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);

    rerender(<HowToStepCard step={3} title='Step 3' description='Description 3' />);
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);

    rerender(<HowToStepCard step={4} title='Step 4' description='Description 4' />);
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <HowToStepCard step={1} title='Title' description='Description' />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('group', 'relative', 'overflow-hidden', 'border-2');
  });

  it('renders with long description', () => {
    const longDescription =
      'This is a very long description that spans multiple lines and contains detailed information about the step to help users understand what they need to do.';

    render(<HowToStepCard step={1} title='Long Description Step' description={longDescription} />);

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });
});
