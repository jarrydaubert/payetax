/**
 * Tests for UI Component Validation Schemas
 * PAYTAX-65 Phase 4
 */

import { describe, expect, it } from '@jest/globals';
import {
  CheckboxSchema,
  CookieConsentSchema,
  EmailInputSchema,
  NumberInputSchema,
  SelectInputSchema,
  TextAreaSchema,
  TextInputSchema,
  validateCookieConsent,
  validateEmail,
  validateNumber,
  validateRequiredCheckbox,
  validateSelect,
  validateTextInput,
} from '../uiValidation';

describe('EmailInputSchema', () => {
  it('should accept valid email', () => {
    const result = EmailInputSchema.safeParse({ value: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('should accept empty string for optional emails', () => {
    const result = EmailInputSchema.safeParse({ value: '' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = EmailInputSchema.safeParse({ value: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject email without domain', () => {
    const result = EmailInputSchema.safeParse({ value: 'user@' });
    expect(result.success).toBe(false);
  });
});

describe('NumberInputSchema', () => {
  it('should accept valid number', () => {
    const result = NumberInputSchema.safeParse({ value: 42 });
    expect(result.success).toBe(true);
  });

  it('should accept undefined value (optional)', () => {
    const result = NumberInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject infinite values', () => {
    const result = NumberInputSchema.safeParse({ value: Number.POSITIVE_INFINITY });
    expect(result.success).toBe(false);
  });

  it('should reject NaN', () => {
    const result = NumberInputSchema.safeParse({ value: Number.NaN });
    expect(result.success).toBe(false);
  });
});

describe('TextInputSchema', () => {
  it('should accept valid text', () => {
    const result = TextInputSchema.safeParse({ value: 'Valid text' });
    expect(result.success).toBe(true);
  });

  it('should trim whitespace', () => {
    const result = TextInputSchema.safeParse({ value: '  text  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe('text');
    }
  });

  it('should reject empty string', () => {
    const result = TextInputSchema.safeParse({ value: '' });
    expect(result.success).toBe(false);
  });

  it('should reject text exceeding 500 chars', () => {
    const result = TextInputSchema.safeParse({ value: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('should accept text at max length (500)', () => {
    const result = TextInputSchema.safeParse({ value: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });
});

describe('TextAreaSchema', () => {
  it('should accept valid textarea content', () => {
    const result = TextAreaSchema.safeParse({
      value: 'This is a longer text with at least 10 characters',
    });
    expect(result.success).toBe(true);
  });

  it('should reject text under 10 characters', () => {
    const result = TextAreaSchema.safeParse({ value: 'Short' });
    expect(result.success).toBe(false);
  });

  it('should accept text at minimum length (10)', () => {
    const result = TextAreaSchema.safeParse({ value: '1234567890' });
    expect(result.success).toBe(true);
  });

  it('should reject text exceeding 5000 chars', () => {
    const result = TextAreaSchema.safeParse({ value: 'a'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('should accept text at max length (5000)', () => {
    const result = TextAreaSchema.safeParse({ value: 'a'.repeat(5000) });
    expect(result.success).toBe(true);
  });
});

describe('SelectInputSchema', () => {
  it('should accept valid option', () => {
    const TaxYearSchema = SelectInputSchema(['2024-25', '2025-26'] as const);
    const result = TaxYearSchema.safeParse({ value: '2024-25' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid option', () => {
    const TaxYearSchema = SelectInputSchema(['2024-25', '2025-26'] as const);
    const result = TaxYearSchema.safeParse({ value: '2023-24' });
    expect(result.success).toBe(false);
  });

  it('should work with single option', () => {
    const SingleSchema = SelectInputSchema(['only-option'] as const);
    const result = SingleSchema.safeParse({ value: 'only-option' });
    expect(result.success).toBe(true);
  });
});

describe('CheckboxSchema', () => {
  it('should accept checked optional checkbox', () => {
    const result = CheckboxSchema.safeParse({ checked: true, required: false });
    expect(result.success).toBe(true);
  });

  it('should accept unchecked optional checkbox', () => {
    const result = CheckboxSchema.safeParse({ checked: false, required: false });
    expect(result.success).toBe(true);
  });

  it('should accept checked required checkbox', () => {
    const result = CheckboxSchema.safeParse({ checked: true, required: true });
    expect(result.success).toBe(true);
  });

  it('should reject unchecked required checkbox', () => {
    const result = CheckboxSchema.safeParse({ checked: false, required: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('This field must be checked');
    }
  });

  it('should treat checkbox as optional when required is undefined', () => {
    const result = CheckboxSchema.safeParse({ checked: false });
    expect(result.success).toBe(true);
  });
});

describe('CookieConsentSchema', () => {
  it('should accept valid accepted consent', () => {
    const result = CookieConsentSchema.safeParse({
      consent: 'accepted',
      timestamp: '2025-11-04T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid declined consent', () => {
    const result = CookieConsentSchema.safeParse({
      consent: 'declined',
      timestamp: '2025-11-04T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid consent choice', () => {
    const result = CookieConsentSchema.safeParse({
      consent: 'maybe',
      timestamp: '2025-11-04T12:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid timestamp format', () => {
    const result = CookieConsentSchema.safeParse({
      consent: 'accepted',
      timestamp: '2025-11-04 12:00:00',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('validateEmail', () => {
  it('should validate correct email', () => {
    const result = validateEmail('test@example.com');
    expect(result.success).toBe(true);
  });

  it('should allow empty email', () => {
    const result = validateEmail('');
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = validateEmail('invalid');
    expect(result.success).toBe(false);
  });
});

describe('validateTextInput', () => {
  it('should validate with default constraints', () => {
    const result = validateTextInput('Hello');
    expect(result.success).toBe(true);
  });

  it('should validate with custom min', () => {
    const result = validateTextInput('Hi', 5, 100);
    expect(result.success).toBe(false);
  });

  it('should validate with custom max', () => {
    const result = validateTextInput('Long text', 1, 5);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace', () => {
    const result = validateTextInput('  text  ', 1, 100);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('text');
    }
  });
});

describe('validateSelect', () => {
  it('should validate valid option', () => {
    const result = validateSelect('option1', ['option1', 'option2'] as const);
    expect(result.success).toBe(true);
  });

  it('should reject invalid option', () => {
    const result = validateSelect('option3', ['option1', 'option2'] as const);
    expect(result.success).toBe(false);
  });
});

describe('validateNumber', () => {
  it('should validate number without bounds', () => {
    const result = validateNumber(42);
    expect(result.success).toBe(true);
  });

  it('should validate number with min bound', () => {
    const result = validateNumber(5, 10);
    expect(result.success).toBe(false);
  });

  it('should validate number with max bound', () => {
    const result = validateNumber(15, undefined, 10);
    expect(result.success).toBe(false);
  });

  it('should validate number within bounds', () => {
    const result = validateNumber(50, 0, 100);
    expect(result.success).toBe(true);
  });

  it('should reject infinite numbers', () => {
    const result = validateNumber(Number.POSITIVE_INFINITY);
    expect(result.success).toBe(false);
  });
});

describe('validateRequiredCheckbox', () => {
  it('should accept checked checkbox', () => {
    const result = validateRequiredCheckbox(true);
    expect(result.success).toBe(true);
  });

  it('should reject unchecked checkbox', () => {
    const result = validateRequiredCheckbox(false);
    expect(result.success).toBe(false);
  });
});

describe('validateCookieConsent', () => {
  it('should validate accepted consent with valid timestamp', () => {
    const result = validateCookieConsent('accepted', new Date().toISOString());
    expect(result.success).toBe(true);
  });

  it('should validate declined consent', () => {
    const result = validateCookieConsent('declined', '2025-11-04T12:00:00.000Z');
    expect(result.success).toBe(true);
  });

  it('should reject invalid timestamp', () => {
    const result = validateCookieConsent('accepted', 'invalid-date');
    expect(result.success).toBe(false);
  });
});
