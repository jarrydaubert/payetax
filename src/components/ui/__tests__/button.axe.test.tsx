/**
 * Accessibility tests for Button component using jest-axe
 *
 * These tests check for WCAG compliance violations using the axe-core engine.
 * Run with: npm test -- button.axe
 */

import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../button';

describe('Button - Accessibility (axe-core)', () => {
  it('should have no accessibility violations with default props', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations for all button variants', async () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('should have no violations for all button sizes', async () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    for (const size of sizes) {
      const { container } = render(<Button size={size}>Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('should have no violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations with custom aria attributes', async () => {
    const { container } = render(
      <Button aria-label='Custom label' aria-describedby='description'>
        Submit
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no violations in a form context', async () => {
    const { container } = render(
      <form>
        <label htmlFor='name'>Name</label>
        <input id='name' type='text' />
        <Button type='submit'>Submit Form</Button>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
