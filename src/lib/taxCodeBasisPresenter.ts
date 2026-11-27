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
        ? 'Monthly free pay uses the tax-code number and HMRC Tables A.'
        : '';

  if (basis.kind !== 'supplied-code') {
    const estimate =
      basis.kind === 'policy-derived'
        ? 'Basis: policy-derived PAYE estimate. No code was supplied, so PayeTax estimated Income Tax using the income you entered. The tax-free amount is based on the selected year, adjusted net income and your allowance answers.'
        : 'Basis: policy-derived fallback. The supplied code was not usable, so PayeTax estimated Income Tax using the income you entered. The tax-free amount is based on the selected year, adjusted net income and your allowance answers.';
    const marriageAllowance = basis.marriageAllowanceAdjustment
      ? 'This PAYE estimate assumes an approved Marriage Allowance transfer. Payroll withholding can differ from the annual tax reduction, especially when estimated coding changes at a band boundary. Enter your HMRC tax code for an estimate based on that code.'
      : '';
    return [estimate, marriageAllowance, tablesACopy].filter(Boolean).join(' ');
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
  if (basis.payeScope === 'primary-employment') {
    parts.push(
      'We assume this code belongs to your primary job. Taxable pay, tax bands and PAYE cover that job, and the cap uses its relevant payment after salary sacrifice or allowable net-pay pension contributions. Take-home includes your other income before any separate income tax on it, including tax another payer may withhold. Other income can also affect student loan repayments.',
    );
  }
  return parts.join(' ');
}
