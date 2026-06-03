import * as validation from '../index';

describe('validation barrel exports', () => {
  it('re-exports core schemas and helpers', () => {
    expect(validation.CategoryFilterSchema).toBeDefined();
    expect(validation.WarningTypeSchema).toBeDefined();
    expect(validation.TaxYearSchema).toBeDefined();

    const categoryResult = validation.validateCategoryFilter({
      selectedCategory: 'tax-basics',
    });
    expect(categoryResult.success).toBe(true);

    const taxYearResult = validation.validateTaxYear('2025-2026');
    expect(taxYearResult.success).toBe(true);
  });
});
