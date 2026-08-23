import { render, screen } from '@testing-library/react';
import { getTaxCodeBasisExplanation, TaxCodeBasisNotice } from '../TaxCodeBasisNotice';

describe('TaxCodeBasisNotice', () => {
  it('discloses a material difference between a supplied code and policy-only taper', () => {
    const text = getTaxCodeBasisExplanation({
      kind: 'supplied-code',
      appliedCode: '1257L',
      suppliedTaxFreeAmount: 12_570,
      policyDerivedTaxFreeAmount: 7_570,
      periodAdjustment: 'free-pay',
      ignoredAdjustments: [],
    });

    expect(text).toContain('supplied HMRC code 1257L');
    expect(text).toContain('code assigns £12,570');
    expect(text).toContain('policy-only amount');
    expect(text).toContain('£7,570');
    expect(text).toContain('HMRC Tables A');
  });

  it('names separate allowance answers that were deliberately not added twice', () => {
    render(
      <TaxCodeBasisNotice
        basis={{
          kind: 'supplied-code',
          appliedCode: '1257L',
          suppliedTaxFreeAmount: 12_570,
          policyDerivedTaxFreeAmount: 16_900,
          periodAdjustment: 'free-pay',
          ignoredAdjustments: ['blind-persons-allowance', 'marriage-allowance'],
        }}
      />,
    );

    expect(screen.getByRole('note')).toHaveTextContent("Blind Person's Allowance");
    expect(screen.getByRole('note')).toHaveTextContent('Marriage Allowance');
    expect(screen.getByRole('note')).toHaveTextContent('not added again');
  });

  it('explains a blank code as a policy-derived estimate', () => {
    render(
      <TaxCodeBasisNotice
        basis={{
          kind: 'policy-derived',
          appliedCode: null,
          policyDerivedTaxFreeAmount: 7_570,
          periodAdjustment: 'free-pay',
          ignoredAdjustments: [],
        }}
      />,
    );

    expect(screen.getByRole('note')).toHaveTextContent('No code was supplied');
    expect(screen.getByRole('note')).toHaveTextContent('adjusted net income');
  });

  it('describes K-code period adjustment as additional pay, not free pay', () => {
    const text = getTaxCodeBasisExplanation({
      kind: 'supplied-code',
      appliedCode: 'K475',
      policyDerivedTaxFreeAmount: 12_570,
      periodAdjustment: 'additional-pay',
      ignoredAdjustments: [],
    });

    expect(text).toContain('monthly additional pay uses HMRC Tables A');
    expect(text).not.toContain('monthly free pay');
  });
});
