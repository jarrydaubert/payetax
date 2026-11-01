import { getTaxCodeBasisExplanation } from '@/lib/taxCodeBasisPresenter';
import type { TaxCodeCalculationBasis } from '@/lib/types/calculator';

export { getTaxCodeBasisExplanation } from '@/lib/taxCodeBasisPresenter';

export function TaxCodeBasisNotice({ basis }: { basis?: TaxCodeCalculationBasis }) {
  if (!basis) return null;

  return (
    <div
      className='mb-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-primary text-sm'
      role='note'
      data-testid='tax-code-basis-notice'
    >
      {getTaxCodeBasisExplanation(basis)}
    </div>
  );
}
