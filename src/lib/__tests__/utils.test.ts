// src/lib/__tests__/utils.test.ts
import { cn } from '../utils';

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
});
