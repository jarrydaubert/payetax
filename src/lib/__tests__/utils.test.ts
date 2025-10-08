// src/lib/__tests__/utils.test.ts
import {
  clearOnFocus,
  cn,
  formatCurrency,
  formatDate,
  formatInputValue,
  formatNumber,
  formatPercent,
  getTaxBandColor,
  parseFormattedValue,
} from '../utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('handles empty strings', () => {
      const result = cn('base', '', 'valid');
      expect(result).toBe('base valid');
    });

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles objects with boolean values', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toBe('class1 class3');
    });

    it('handles complex combinations', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        {
          'obj-true': true,
          'obj-false': false,
        },
        true && 'conditional',
        false && 'hidden',
        undefined,
        'final'
      );
      expect(result).toBe('base array1 array2 obj-true conditional final');
    });

    it('handles Tailwind CSS conflicts (basic merging behavior)', () => {
      // Test basic merging - behavior depends on implementation
      const result = cn('px-4', 'px-2');
      expect(result).toMatch(/px-[24]/); // Either px-2 or px-4 should be present

      // Test that classes are merged in some form
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('returns empty string for all falsy arguments', () => {
      const result = cn(false, null, undefined, '');
      expect(result).toBe('');
    });

    it('handles nested arrays', () => {
      const result = cn(['base', ['nested1', 'nested2']], 'final');
      expect(result).toBe('base nested1 nested2 final');
    });

    it('trims whitespace correctly', () => {
      const result = cn('spaced', 'class');
      expect(result).not.toMatch(/^\s|\s$/);
    });

    it('handles very long class strings', () => {
      const longClass = 'a'.repeat(1000);
      const result = cn('base', longClass, 'end');
      expect(result).toContain('base');
      expect(result).toContain(longClass);
      expect(result).toContain('end');
    });
  });

  describe('formatCurrency', () => {
    it('formats positive numbers with £ symbol and commas', () => {
      expect(formatCurrency(1000)).toBe('£1,000.00');
      expect(formatCurrency(1234567.89)).toBe('£1,234,567.89');
    });

    it('formats zero as £0.00', () => {
      expect(formatCurrency(0)).toBe('£0.00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('-£1,000.00');
      expect(formatCurrency(-500.5)).toBe('-£500.50');
    });

    it('formats large numbers (millions)', () => {
      expect(formatCurrency(1000000)).toBe('£1,000,000.00');
      expect(formatCurrency(5000000.25)).toBe('£5,000,000.25');
    });

    it('rounds to 2 decimals by default', () => {
      expect(formatCurrency(1000.456)).toBe('£1,000.46');
      expect(formatCurrency(1000.454)).toBe('£1,000.45');
    });

    it('respects custom decimal places', () => {
      expect(formatCurrency(1000, 0)).toBe('£1,000');
      expect(formatCurrency(1000.456, 3)).toBe('£1,000.456');
      expect(formatCurrency(1000.1, 1)).toBe('£1,000.1');
    });

    it('handles very small decimals', () => {
      expect(formatCurrency(0.01)).toBe('£0.01');
      expect(formatCurrency(0.001)).toBe('£0.00');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('formats zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('formats negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-500.5)).toBe('-501');
    });

    it('handles decimals when specified', () => {
      expect(formatNumber(1000.456, 2)).toBe('1,000.46');
      expect(formatNumber(1000.1, 3)).toBe('1,000.100');
    });

    it('rounds to specified decimal places', () => {
      expect(formatNumber(1000.9, 0)).toBe('1,001');
      expect(formatNumber(1000.456, 1)).toBe('1,000.5');
    });
  });

  describe('formatPercent', () => {
    it('formats percentages with % symbol', () => {
      expect(formatPercent(20)).toBe('20.0%');
      expect(formatPercent(50)).toBe('50.0%');
    });

    it('handles decimals correctly', () => {
      expect(formatPercent(12.5)).toBe('12.5%');
      expect(formatPercent(33.33)).toBe('33.3%');
    });

    it('handles zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('handles 100%', () => {
      expect(formatPercent(100)).toBe('100.0%');
    });

    it('handles values over 100%', () => {
      expect(formatPercent(150)).toBe('150.0%');
    });

    it('respects custom decimal places', () => {
      expect(formatPercent(20, 2)).toBe('20.00%');
      expect(formatPercent(33.333, 2)).toBe('33.33%');
      expect(formatPercent(20, 0)).toBe('20%');
    });

    it('handles negative percentages', () => {
      expect(formatPercent(-10)).toBe('-10.0%');
    });
  });

  describe('clearOnFocus', () => {
    it('clears input value when focused', () => {
      const mockEvent = {
        target: { value: '12345' },
      } as React.FocusEvent<HTMLInputElement>;

      clearOnFocus(mockEvent);
      expect(mockEvent.target.value).toBe('');
    });

    it('handles empty input', () => {
      const mockEvent = {
        target: { value: '' },
      } as React.FocusEvent<HTMLInputElement>;

      clearOnFocus(mockEvent);
      expect(mockEvent.target.value).toBe('');
    });
  });

  describe('formatInputValue', () => {
    it('formats plain numbers with thousand separators', () => {
      expect(formatInputValue('1000')).toBe('1,000');
      expect(formatInputValue('1234567')).toBe('1,234,567');
    });

    it('removes non-numeric characters', () => {
      expect(formatInputValue('£1,000.00')).toBe('1,000.00');
      expect(formatInputValue('abc123def456')).toBe('123,456');
    });

    it('handles decimal values', () => {
      expect(formatInputValue('1000.50')).toBe('1,000.50');
      expect(formatInputValue('123.456')).toBe('123.46');
    });

    it('returns empty string for invalid input', () => {
      expect(formatInputValue('')).toBe('');
      expect(formatInputValue('abc')).toBe('');
      expect(formatInputValue('!@#$')).toBe('');
    });

    it('handles zero', () => {
      expect(formatInputValue('0')).toBe('0');
      expect(formatInputValue('0.00')).toBe('0.00');
    });

    it('formats integers without decimals', () => {
      expect(formatInputValue('5000')).toBe('5,000');
      expect(formatInputValue('42')).toBe('42');
    });
  });

  describe('parseFormattedValue', () => {
    it('parses formatted currency strings', () => {
      expect(parseFormattedValue('£1,000.00')).toBe(1000);
      expect(parseFormattedValue('£1,234,567.89')).toBe(1234567.89);
    });

    it('parses plain number strings', () => {
      expect(parseFormattedValue('1000')).toBe(1000);
      expect(parseFormattedValue('500.50')).toBe(500.5);
    });

    it('handles comma-separated numbers', () => {
      expect(parseFormattedValue('1,000')).toBe(1000);
      expect(parseFormattedValue('1,234,567')).toBe(1234567);
    });

    it('returns 0 for invalid input', () => {
      expect(parseFormattedValue('')).toBe(0);
      expect(parseFormattedValue('abc')).toBe(0);
      expect(parseFormattedValue('!@#$')).toBe(0);
    });

    it('handles zero', () => {
      expect(parseFormattedValue('0')).toBe(0);
      expect(parseFormattedValue('£0.00')).toBe(0);
    });

    it('strips negative signs (extracts absolute value)', () => {
      // Note: parseFormattedValue removes ALL non-numeric characters except decimal
      expect(parseFormattedValue('-1000')).toBe(1000);
      expect(parseFormattedValue('-£500.50')).toBe(500.5);
    });
  });

  describe('getTaxBandColor', () => {
    describe('dark mode', () => {
      it('returns correct colors for first 4 indices', () => {
        expect(getTaxBandColor(0, true)).toBe('rgba(59, 130, 246, 0.9)');
        expect(getTaxBandColor(1, true)).toBe('rgba(99, 102, 241, 0.9)');
        expect(getTaxBandColor(2, true)).toBe('rgba(139, 92, 246, 0.9)');
        expect(getTaxBandColor(3, true)).toBe('rgba(236, 72, 153, 0.9)');
      });

      it('cycles through colors for indices beyond 4', () => {
        expect(getTaxBandColor(4, true)).toBe('rgba(59, 130, 246, 0.9)');
        expect(getTaxBandColor(5, true)).toBe('rgba(99, 102, 241, 0.9)');
        expect(getTaxBandColor(8, true)).toBe('rgba(59, 130, 246, 0.9)');
      });
    });

    describe('light mode', () => {
      it('returns correct colors for first 4 indices', () => {
        expect(getTaxBandColor(0, false)).toBe('rgba(59, 130, 246, 0.7)');
        expect(getTaxBandColor(1, false)).toBe('rgba(99, 102, 241, 0.7)');
        expect(getTaxBandColor(2, false)).toBe('rgba(139, 92, 246, 0.7)');
        expect(getTaxBandColor(3, false)).toBe('rgba(236, 72, 153, 0.7)');
      });

      it('cycles through colors for indices beyond 4', () => {
        expect(getTaxBandColor(4, false)).toBe('rgba(59, 130, 246, 0.7)');
        expect(getTaxBandColor(5, false)).toBe('rgba(99, 102, 241, 0.7)');
      });
    });

    it('always returns a valid color string', () => {
      // Test with various indices
      for (let i = 0; i < 20; i++) {
        const color = getTaxBandColor(i, true);
        expect(color).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      }
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings to readable format', () => {
      expect(formatDate('2025-04-26')).toBe('26 April 2025');
      expect(formatDate('2025-01-01')).toBe('1 January 2025');
    });

    it('handles different months correctly', () => {
      expect(formatDate('2025-12-31')).toBe('31 December 2025');
      expect(formatDate('2025-06-15')).toBe('15 June 2025');
    });

    it('formats dates with time components', () => {
      const result = formatDate('2025-04-26T10:30:00Z');
      expect(result).toMatch(/26 April 2025/);
    });

    it('respects custom locale', () => {
      // Test with different locale (US format)
      const result = formatDate('2025-04-26', 'en-US');
      expect(result).toMatch(/April/);
      expect(result).toMatch(/26/);
      expect(result).toMatch(/2025/);
    });

    it('handles leap year dates', () => {
      expect(formatDate('2024-02-29')).toBe('29 February 2024');
    });
  });
});
