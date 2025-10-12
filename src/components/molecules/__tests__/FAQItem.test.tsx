// src/components/molecules/__tests__/FAQItem.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQItem } from '../FAQItem';

describe('FAQItem', () => {
  it('renders question text', () => {
    render(
      <FAQItem question='What is PAYE?'>
        <p>Pay As You Earn</p>
      </FAQItem>
    );

    expect(screen.getByText('What is PAYE?')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <FAQItem question='Question'>
        <p>This is the answer</p>
      </FAQItem>
    );

    expect(screen.getByText('This is the answer')).toBeInTheDocument();
  });

  it('starts collapsed by default', () => {
    const { container } = render(
      <FAQItem question='Question'>
        <p>Answer content</p>
      </FAQItem>
    );

    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
  });

  it('expands when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FAQItem question='Question'>
        <p>Answer content</p>
      </FAQItem>
    );

    const summary = screen.getByText('Question');
    await user.click(summary);

    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
  });

  it('renders complex children with multiple elements', () => {
    render(
      <FAQItem question='Complex Question'>
        <p>Paragraph 1</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <p>Paragraph 2</p>
      </FAQItem>
    );

    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <FAQItem question='Styled Question'>
        <p>Answer</p>
      </FAQItem>
    );

    const details = container.querySelector('details');
    expect(details).toHaveClass('group', 'overflow-hidden', 'rounded-xl', 'border-2');

    const summary = container.querySelector('summary');
    expect(summary).toHaveClass('cursor-pointer', 'font-bold', 'text-foreground', 'text-lg');
  });
});
