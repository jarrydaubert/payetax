// src/components/atoms/__tests__/TaxYearSelect.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TaxYearSelect from '../TaxYearSelect';

describe('TaxYearSelect Component', () => {
  const mockOnChange = jest.fn();
  const defaultTaxYear = '2024-2025';

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with default label', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);
      expect(screen.getByText('Tax Year')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(
        <TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} label='Select Tax Year' />
      );
      expect(screen.getByText('Select Tax Year')).toBeInTheDocument();
    });

    it('should render selected value', () => {
      render(<TaxYearSelect value='2025-2026' onChange={mockOnChange} />);
      expect(screen.getByText('2025-2026')).toBeInTheDocument();
    });

    it('should hide label when hideLabel is true', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} hideLabel={true} />);
      const label = screen.getByText('Tax Year');
      expect(label).toHaveClass('sr-only');
    });

    it('should show label when hideLabel is false', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} hideLabel={false} />);
      const label = screen.getByText('Tax Year');
      expect(label).not.toHaveClass('sr-only');
    });

    it('should render calendar icon', () => {
      const { container } = render(
        <TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />
      );
      const calendarIcon = container.querySelector('svg');
      expect(calendarIcon).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should show dropdown options when opened', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const selectButton = screen.getByRole('button');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(selectButton).toHaveAttribute('aria-expanded', 'true');
      });

      // Verify options are visible
      const options = await screen.findAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('Selection Changes', () => {
    it('should call onChange when a tax year is selected', async () => {
      render(<TaxYearSelect value='2024-2025' onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });

      // Find and click the 2025-2026 option
      const option = await screen.findByRole('option', { name: /2025-2026/i });
      fireEvent.click(option);

      expect(mockOnChange).toHaveBeenCalledWith('2025-2026');
    });

    it('should display selected value after change', () => {
      const { rerender } = render(<TaxYearSelect value='2024-2025' onChange={mockOnChange} />);

      expect(screen.getByText('2024-2025')).toBeInTheDocument();

      rerender(<TaxYearSelect value='2025-2026' onChange={mockOnChange} />);

      expect(screen.getByText('2025-2026')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should not open dropdown when disabled', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);

      // Should remain closed
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have disabled styling when disabled', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should not call onChange when disabled', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} disabled={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on button', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have unique ID for accessibility', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} id='test-select' />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'test-select');
    });

    it('should associate label with button', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} id='test-select' />);

      const label = screen.getByText('Tax Year');
      const button = screen.getByRole('button');

      expect(label).toHaveAttribute('for', 'test-select');
      expect(button).toHaveAttribute('id', 'test-select');
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(
        <TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />
      );

      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} className='custom-class' />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should have glassmorphic styling classes', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('glass-input');
      expect(button).toHaveClass('backdrop-blur-glass-sm');
    });

    it('should have focus ring styles', () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-1');
      expect(button).toHaveClass('focus:ring-primary');
    });
  });

  describe('Edge Cases', () => {
    it('should handle being unmounted', () => {
      const { unmount } = render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      expect(() => unmount()).not.toThrow();
    });

    it('should handle being unmounted while open', async () => {
      const { unmount } = render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should render with all available tax years', async () => {
      render(<TaxYearSelect value={defaultTaxYear} onChange={mockOnChange} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });

      // Check that all 3 tax year options appear (2023-2024, 2024-2025, 2025-2026)
      const yearOptions = await screen.findAllByRole('option');
      expect(yearOptions.length).toBe(3);
    });
  });
});
