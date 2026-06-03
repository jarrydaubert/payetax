import { describe, expect, it } from '@jest/globals';
import {
  PayeEmailInputSchema,
  SendDirectorResultsRequestSchema,
  SendResultsRequestSchema,
  TaxYearStringSchema,
} from '../emailValidation';

const validPayeInput = {
  salary: 75000,
  payPeriod: 'annually' as const,
  taxYear: '2025-2026' as const,
  taxCode: '1257L',
  isScottish: false,
  isMarried: false,
  partnerGrossWage: 0,
  isBlind: false,
  payNoNI: false,
  pensionContribution: 0,
  pensionContributionType: 'percentage' as const,
  studentLoanPlans: 'none' as const,
  niCategory: 'A' as const,
  hoursPerWeek: 37.5,
  allowancesDeductions: 0,
};

const validDirectorInput = {
  region: 'rUK' as const,
  revenue: 100000,
  includesVat: false,
  expenses: 20000,
};

describe('TaxYearStringSchema', () => {
  it('accepts optional or valid tax-year strings', () => {
    expect(TaxYearStringSchema.safeParse(undefined).success).toBe(true);
    expect(TaxYearStringSchema.safeParse('2025-2026').success).toBe(true);
    expect(TaxYearStringSchema.safeParse('2025-26').success).toBe(true);
  });

  it('rejects malformed or injection-like values', () => {
    expect(TaxYearStringSchema.safeParse('2025/2026').success).toBe(false);
    expect(TaxYearStringSchema.safeParse('2025-2026<script>alert(1)</script>').success).toBe(false);
  });
});

describe('PayeEmailInputSchema', () => {
  it('accepts valid PAYE input payloads', () => {
    expect(PayeEmailInputSchema.safeParse(validPayeInput).success).toBe(true);
  });

  it('rejects duplicate student loan plans', () => {
    const result = PayeEmailInputSchema.safeParse({
      ...validPayeInput,
      studentLoanPlans: ['plan2', 'plan2'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than two student loan plans', () => {
    const result = PayeEmailInputSchema.safeParse({
      ...validPayeInput,
      studentLoanPlans: ['plan1', 'plan2', 'postgrad'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid tax years and non-finite salary values', () => {
    expect(
      PayeEmailInputSchema.safeParse({
        ...validPayeInput,
        taxYear: '2022-2023',
      }).success,
    ).toBe(false);
    expect(
      PayeEmailInputSchema.safeParse({
        ...validPayeInput,
        salary: Number.POSITIVE_INFINITY,
      }).success,
    ).toBe(false);
  });

  it('rejects oversized income source arrays', () => {
    const incomeSources = Array.from({ length: 11 }, (_, index) => ({
      id: `src-${index}`,
      type: 'employment' as const,
      amount: 1000,
      period: 'annually' as const,
    }));
    const result = PayeEmailInputSchema.safeParse({
      ...validPayeInput,
      incomeSources,
    });
    expect(result.success).toBe(false);
  });
});

describe('SendResultsRequestSchema', () => {
  it('accepts valid request bodies', () => {
    expect(
      SendResultsRequestSchema.safeParse({
        email: 'valid@example.com',
        input: validPayeInput,
      }).success,
    ).toBe(true);
  });

  it('rejects unknown root keys (strict schema)', () => {
    const result = SendResultsRequestSchema.safeParse({
      email: 'valid@example.com',
      input: validPayeInput,
      unexpected: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('SendDirectorResultsRequestSchema', () => {
  it('accepts valid request bodies', () => {
    expect(
      SendDirectorResultsRequestSchema.safeParse({
        email: 'director@example.com',
        input: validDirectorInput,
        taxYear: '2025-2026',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid tax year and invalid month boundaries', () => {
    expect(
      SendDirectorResultsRequestSchema.safeParse({
        email: 'director@example.com',
        input: validDirectorInput,
        taxYear: '2023-2024',
      }).success,
    ).toBe(false);

    expect(
      SendDirectorResultsRequestSchema.safeParse({
        email: 'director@example.com',
        input: { ...validDirectorInput, contractStartMonth: 13 },
      }).success,
    ).toBe(false);
  });
});
