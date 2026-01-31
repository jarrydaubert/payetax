/**
 * Accessibility Tests for Atoms Components
 * Uses jest-axe to check for WCAG violations
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { InputTooltip } from '../InputTooltip';
import { LabelTooltip } from '../LabelTooltip';
import { PeriodCheckbox } from '../PeriodCheckbox';
import { ScrollIndicator } from '../ScrollIndicator';

expect.extend(toHaveNoViolations);

describe('Atoms Components - Accessibility', () => {
  describe('InputTooltip', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <InputTooltip fieldName='salary'>
          <input type='number' aria-label='Gross Salary' data-testid='salary-input' />
        </InputTooltip>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with custom content', async () => {
      const { container } = render(
        <InputTooltip
          fieldName='salary'
          customContent={{
            title: 'Custom Title',
            description: 'Custom description',
            hmrc: 'Custom HMRC guidance',
          }}
        >
          <input type='number' aria-label='Custom Input' />
        </InputTooltip>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('LabelTooltip', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <div>
            <span>Test Label</span>
            <LabelTooltip fieldName='salary' />
          </div>
          <input type='text' aria-label='Test input' />
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with multiple tooltips', async () => {
      const { container } = render(
        <div>
          <div>
            <label htmlFor='salary'>Salary</label>
            <LabelTooltip fieldName='salary' />
          </div>
          <div>
            <label htmlFor='taxCode'>Tax Code</label>
            <LabelTooltip fieldName='taxCode' />
          </div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // NumberInput and TaxYearSelect have their own comprehensive tests
  // Skipping here to avoid import issues with complex components

  describe('PeriodCheckbox', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PeriodCheckbox period='monthly' checked={false} onChange={() => {}} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when checked', async () => {
      const { container } = render(
        <PeriodCheckbox period='weekly' checked={true} onChange={() => {}} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with multiple checkboxes', async () => {
      const { container } = render(
        <fieldset>
          <legend>Select periods</legend>
          <PeriodCheckbox period='yearly' checked={true} onChange={() => {}} />
          <PeriodCheckbox period='monthly' checked={true} onChange={() => {}} />
          <PeriodCheckbox period='weekly' checked={false} onChange={() => {}} />
        </fieldset>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ScrollIndicator', () => {
    it('should have no accessibility violations when visible', async () => {
      const { container } = render(
        <div style={{ position: 'relative' }}>
          <ScrollIndicator direction='left' visible={true} />
          <div>Scrollable content</div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations when hidden', async () => {
      const { container } = render(
        <div style={{ position: 'relative' }}>
          <ScrollIndicator direction='right' visible={false} />
          <div>Scrollable content</div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with both indicators', async () => {
      const { container } = render(
        <div style={{ position: 'relative' }}>
          <ScrollIndicator direction='left' visible={true} />
          <ScrollIndicator direction='right' visible={true} />
          <div>Scrollable content</div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // TaxYearSelect uses Headless UI which has built-in accessibility
  // and is tested in the component's own test file

  describe('Combined Atoms - Simple Form', () => {
    it('should have no violations with tooltips and checkboxes', async () => {
      const { container } = render(
        <form aria-label='Period Selection Form'>
          <div>
            <div>
              <span>Test Field</span>
              <LabelTooltip fieldName='salary' />
            </div>
            <InputTooltip fieldName='salary'>
              <input type='number' aria-label='Test input' />
            </InputTooltip>
          </div>

          <fieldset>
            <legend>Display Periods</legend>
            <PeriodCheckbox period='yearly' checked={true} onChange={() => {}} />
            <PeriodCheckbox period='monthly' checked={true} onChange={() => {}} />
          </fieldset>
        </form>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
