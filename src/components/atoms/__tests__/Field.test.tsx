/**
 * Field Component Tests
 * Phase 4: Fix coverage threshold violations
 *
 * Tests all Field compound components:
 * - FieldSet
 * - FieldLegend
 * - FieldGroup
 * - Field (with orientation variants)
 * - FieldContent
 * - FieldLabel
 * - FieldTitle
 * - FieldDescription
 * - FieldSeparator
 * - FieldError
 */

import { render, screen } from '@testing-library/react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '../Field';

describe('Field Components', () => {
  describe('FieldSet', () => {
    it('should render with default styles', () => {
      render(<FieldSet>Fieldset content</FieldSet>);

      const element = screen.getByText('Fieldset content');
      expect(element).toHaveAttribute('data-slot', 'field-set');
      expect(element).toHaveClass('flex', 'flex-col');
    });

    it('should apply custom className', () => {
      render(<FieldSet className='custom-fieldset'>Content</FieldSet>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('custom-fieldset');
    });
  });

  describe('FieldLegend', () => {
    it('should render with default legend variant', () => {
      render(<FieldLegend>Legend text</FieldLegend>);

      const element = screen.getByText('Legend text');
      expect(element).toHaveAttribute('data-slot', 'field-legend');
      expect(element).toHaveAttribute('data-variant', 'legend');
      expect(element).toHaveClass('font-medium');
    });

    it('should render with label variant', () => {
      render(<FieldLegend variant='label'>Label legend</FieldLegend>);

      const element = screen.getByText('Label legend');
      expect(element).toHaveAttribute('data-variant', 'label');
    });

    it('should apply custom className', () => {
      render(<FieldLegend className='legend-custom'>Legend</FieldLegend>);

      const element = screen.getByText('Legend');
      expect(element).toHaveClass('legend-custom');
    });
  });

  describe('FieldGroup', () => {
    it('should render with default styles', () => {
      render(<FieldGroup>Group content</FieldGroup>);

      const element = screen.getByText('Group content');
      expect(element).toHaveAttribute('data-slot', 'field-group');
      expect(element).toHaveClass('flex', 'w-full', 'flex-col');
    });

    it('should apply custom className', () => {
      render(<FieldGroup className='group-custom'>Group</FieldGroup>);

      const element = screen.getByText('Group');
      expect(element).toHaveClass('group-custom');
    });
  });

  describe('Field', () => {
    it('should render with vertical orientation by default', () => {
      render(<Field>Field content</Field>);

      const element = screen.getByText('Field content');
      expect(element).toHaveAttribute('data-slot', 'field');
      expect(element).toHaveAttribute('data-orientation', 'vertical');
      expect(element).toHaveClass('flex-col');
    });

    it('should render with horizontal orientation', () => {
      render(<Field orientation='horizontal'>Horizontal field</Field>);

      const element = screen.getByText('Horizontal field');
      expect(element).toHaveAttribute('data-orientation', 'horizontal');
      expect(element).toHaveClass('flex-row', 'items-center');
    });

    it('should render with responsive orientation', () => {
      render(<Field orientation='responsive'>Responsive field</Field>);

      const element = screen.getByText('Responsive field');
      expect(element).toHaveAttribute('data-orientation', 'responsive');
    });

    it('should apply custom className', () => {
      render(<Field className='field-custom'>Field</Field>);

      const element = screen.getByText('Field');
      expect(element).toHaveClass('field-custom');
    });
  });

  describe('FieldContent', () => {
    it('should render with default styles', () => {
      render(<FieldContent>Content</FieldContent>);

      const element = screen.getByText('Content');
      expect(element).toHaveAttribute('data-slot', 'field-content');
      expect(element).toHaveClass('flex', 'flex-1', 'flex-col');
    });

    it('should apply custom className', () => {
      render(<FieldContent className='content-custom'>Content</FieldContent>);

      const element = screen.getByText('Content');
      expect(element).toHaveClass('content-custom');
    });
  });

  describe('FieldLabel', () => {
    it('should render with default styles', () => {
      render(<FieldLabel>Label text</FieldLabel>);

      const element = screen.getByText('Label text');
      expect(element).toHaveAttribute('data-slot', 'field-label');
      expect(element).toHaveClass('flex', 'w-fit');
    });

    it('should apply custom className', () => {
      render(<FieldLabel className='label-custom'>Label</FieldLabel>);

      const element = screen.getByText('Label');
      expect(element).toHaveClass('label-custom');
    });
  });

  describe('FieldTitle', () => {
    it('should render with default styles', () => {
      render(<FieldTitle>Title text</FieldTitle>);

      const element = screen.getByText('Title text');
      expect(element).toHaveAttribute('data-slot', 'field-label');
      expect(element).toHaveClass('flex', 'font-medium', 'text-sm');
    });

    it('should apply custom className', () => {
      render(<FieldTitle className='title-custom'>Title</FieldTitle>);

      const element = screen.getByText('Title');
      expect(element).toHaveClass('title-custom');
    });
  });

  describe('FieldDescription', () => {
    it('should render with default styles', () => {
      render(<FieldDescription>Description text</FieldDescription>);

      const element = screen.getByText('Description text');
      expect(element).toHaveAttribute('data-slot', 'field-description');
      expect(element).toHaveClass('text-muted-foreground', 'text-sm');
    });

    it('should apply custom className', () => {
      render(<FieldDescription className='desc-custom'>Description</FieldDescription>);

      const element = screen.getByText('Description');
      expect(element).toHaveClass('desc-custom');
    });
  });

  describe('FieldSeparator', () => {
    it('should render without children', () => {
      render(<FieldSeparator data-testid='separator' />);

      const element = screen.getByTestId('separator');
      expect(element).toHaveAttribute('data-slot', 'field-separator');
      expect(element).toHaveAttribute('data-content', 'false');
    });

    it('should render with children', () => {
      render(<FieldSeparator>OR</FieldSeparator>);

      const element = screen.getByText('OR');
      expect(element).toHaveAttribute('data-slot', 'field-separator-content');
    });

    it('should apply custom className', () => {
      render(<FieldSeparator className='sep-custom' data-testid='separator' />);

      const element = screen.getByTestId('separator');
      expect(element).toHaveClass('sep-custom');
    });
  });

  describe('FieldError', () => {
    it('should render nothing when no errors or children', () => {
      const { container } = render(<FieldError />);

      expect(container.querySelector('[data-slot="field-error"]')).not.toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(<FieldError>Custom error message</FieldError>);

      const element = screen.getByRole('alert');
      expect(element).toHaveAttribute('data-slot', 'field-error');
      expect(element).toHaveTextContent('Custom error message');
      expect(element).toHaveClass('text-destructive');
    });

    it('should render single error message', () => {
      render(<FieldError errors={[{ message: 'Email is required' }]} />);

      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    });

    it('should render multiple errors as list', () => {
      render(
        <FieldError
          errors={[{ message: 'Error 1' }, { message: 'Error 2' }, { message: 'Error 3' }]}
        />
      );

      const list = screen.getByRole('list');
      const items = screen.getAllByRole('listitem');
      expect(list).toBeInTheDocument();
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Error 1');
      expect(items[1]).toHaveTextContent('Error 2');
      expect(items[2]).toHaveTextContent('Error 3');
    });

    it('should filter out undefined errors', () => {
      render(
        <FieldError errors={[{ message: 'Valid error' }, undefined, { message: undefined }]} />
      );

      // Should only render the valid error
      expect(screen.getByRole('alert')).toHaveTextContent('Valid error');
    });

    it('should apply custom className', () => {
      render(<FieldError className='error-custom'>Error</FieldError>);

      expect(screen.getByRole('alert')).toHaveClass('error-custom');
    });

    it('should prefer children over errors', () => {
      render(<FieldError errors={[{ message: 'Error from errors' }]}>Children content</FieldError>);

      expect(screen.getByRole('alert')).toHaveTextContent('Children content');
      expect(screen.queryByText('Error from errors')).not.toBeInTheDocument();
    });
  });

  describe('Compound Component Usage', () => {
    it('should render complete form field composition', () => {
      render(
        <FieldSet>
          <FieldLegend>Personal Information</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <input type='email' data-testid='email-input' />
                <FieldDescription>We&apos;ll never share your email.</FieldDescription>
              </FieldContent>
            </Field>
            <FieldSeparator />
            <Field orientation='horizontal'>
              <FieldLabel>Terms</FieldLabel>
              <input type='checkbox' data-testid='terms-checkbox' />
            </Field>
          </FieldGroup>
        </FieldSet>
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByText(/never share your email/)).toBeInTheDocument();
      expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument();
    });

    it('should render field with error state', () => {
      render(
        <Field data-invalid='true'>
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <input type='email' data-testid='email-input' />
            <FieldError errors={[{ message: 'Invalid email format' }]} />
          </FieldContent>
        </Field>
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
    });
  });
});
