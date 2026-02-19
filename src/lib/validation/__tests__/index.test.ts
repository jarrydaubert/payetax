import * as validation from '../index';

describe('validation barrel exports', () => {
  it('re-exports core schemas and helpers', () => {
    expect(validation.FeedbackFormSchema).toBeDefined();
    expect(validation.WarningTypeSchema).toBeDefined();
    expect(validation.TaxYearSchema).toBeDefined();

    const feedbackResult = validation.validateFeedbackForm({
      email: '',
      message: 'This feedback message is valid length.',
    });
    expect(feedbackResult.success).toBe(true);

    const taxYearResult = validation.validateTaxYear('2025-2026');
    expect(taxYearResult.success).toBe(true);
  });
});
