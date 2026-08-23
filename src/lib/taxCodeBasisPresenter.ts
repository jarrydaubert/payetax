import type { TaxCodeCalculationBasis } from '@/lib/types/calculator';

function pounds(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTaxCodeBasisExplanation(basis: TaxCodeCalculationBasis): string {
  const tablesACopy =
    basis.periodAdjustment === 'additional-pay'
      ? 'The annual amount is the code-number basis; monthly additional pay uses HMRC Tables A, not annual ÷ 12.'
      : basis.periodAdjustment === 'free-pay'
        ? 'The annual amount is the code-number basis; monthly free pay uses HMRC Tables A, not annual ÷ 12.'
        : '';

  if (basis.kind === 'policy-derived') {
    return `Basis: policy-derived PAYE estimate. No code was supplied, so PayeTax estimated the tax-free amount from the selected year, adjusted net income and allowance answers. ${tablesACopy}`;
  }

  if (basis.kind === 'invalid-code-fallback') {
    return `Basis: policy-derived fallback. The supplied code was not usable, so PayeTax estimated the tax-free amount from the selected year, adjusted net income and allowance answers. ${tablesACopy}`;
  }

  const parts = [
    `Basis: supplied HMRC code ${basis.appliedCode ?? ''}. The calculator used that source-specific code instead of adding PayeTax's separate allowance estimate.`,
  ];

  if (
    basis.suppliedTaxFreeAmount !== undefined &&
    Math.abs(basis.suppliedTaxFreeAmount - basis.policyDerivedTaxFreeAmount) >= 10
  ) {
    parts.push(
      `The code assigns ${pounds(basis.suppliedTaxFreeAmount)}, while the policy-only amount from the entered income and allowance answers is ${pounds(basis.policyDerivedTaxFreeAmount)}. A difference can reflect HMRC coding adjustments or a code that needs updating; it is not a final annual tax assessment.`,
    );
  }

  if (basis.ignoredAdjustments.length > 0) {
    const labels = basis.ignoredAdjustments.map((adjustment) =>
      adjustment === 'blind-persons-allowance' ? "Blind Person's Allowance" : 'Marriage Allowance',
    );
    parts.push(
      `The separate ${labels.join(' and ')} ${labels.length === 1 ? 'answer was' : 'answers were'} not added again because the supplied HMRC code is the payroll instruction and already reflects HMRC's coding calculation.`,
    );
  }

  if (tablesACopy) parts.push(tablesACopy);
  return parts.join(' ');
}
