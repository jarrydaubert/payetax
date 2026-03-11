import { createHash } from 'node:crypto';
import { calculateStrategyComparison } from '@/lib/tax/strategyComparison';
import type { DirectorTaxYear } from '@/lib/validation/directorValidation';
import type { TaxPackArtifact, TaxPackOrder } from './types';

function buildStrategyInput(order: TaxPackOrder) {
  const input = order.input;
  return {
    region: input.region,
    revenue: input.revenue,
    includesVat: input.includesVat,
    expenses: input.expenses,
    lossesBroughtForward: input.lossesBroughtForward ?? 0,
    otherIncome: input.otherIncome ?? 0,
    employmentAllowance: input.employmentAllowance ?? false,
    studentLoanPlans: input.studentLoanPlans ?? [],
    pensionContribution: input.pensionContribution ?? 0,
    companyCarBIK: input.companyCarBIK ?? 0,
    associatedCompaniesCount: input.associatedCompaniesCount ?? 1,
    minimumSalaryRequirement: input.minimumSalaryRequirement ?? 0,
    hasOtherPAYEEmployment: input.hasOtherPAYEEmployment ?? false,
    ytdSalary: input.ytdSalary ?? 0,
    ytdDividends: input.ytdDividends ?? 0,
    ytdDrawings: input.ytdDrawings ?? 0,
    yourSetupSalary: input.yourSetupSalary ?? 0,
    yourSetupDividends: input.yourSetupDividends ?? 0,
  };
}

function getTaxYear(order: TaxPackOrder): DirectorTaxYear {
  return order.taxYear;
}

export function buildTaxPackArtifact(order: TaxPackOrder): TaxPackArtifact {
  const taxYear = getTaxYear(order);
  const comparison = calculateStrategyComparison(buildStrategyInput(order), taxYear);
  const generatedAt = new Date().toISOString();
  const content = JSON.stringify(
    {
      type: 'tax-pack-foundation',
      orderId: order.id,
      generatedAt,
      taxYear,
      summary: {
        grossProfit: comparison.grossProfitAfterPension,
        recommended: comparison.recommended,
        availableForExtraction: comparison.availableForExtraction,
      },
      strategies: comparison.strategies,
    },
    null,
    2,
  );
  const checksumSha256 = createHash('sha256').update(content).digest('hex');

  return {
    fileName: `tax-pack-${order.id}.json`,
    mimeType: 'application/json',
    checksumSha256,
    byteSize: Buffer.byteLength(content, 'utf8'),
    generatedAt,
    content,
  };
}
