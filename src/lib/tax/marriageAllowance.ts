import type { TaxBand, TaxYear } from '@/constants/taxRates';
import { sliceRukTaxableIncome } from './rukIncomeTax';
import { sliceScottishTaxableIncome } from './scottishIncomeTax';
import { selectTaxPolicy } from './taxPolicy';
import { roundToPence } from './utils';

export type MarriageAllowanceRegion = 'rUK' | 'scotland';

function getPolicy(taxYear: TaxYear, region: MarriageAllowanceRegion) {
  const { ruk, scottish } = selectTaxPolicy(taxYear);
  const { bands } = region === 'scotland' ? scottish : ruk;
  const basicBand = bands.find((band) => band.name === 'Basic rate');
  const lastEligibleBand =
    region === 'scotland' ? bands.find((band) => band.name === 'Intermediate rate') : basicBand;

  if (!(basicBand && lastEligibleBand)) {
    throw new Error('Marriage Allowance policy requires the eligible income tax bands');
  }

  return {
    bands,
    basicRate: basicBand.rate,
    eligibleTaxableLimit: lastEligibleBand.threshold,
    personalAllowance: ruk.personalAllowance,
    transferAmount: ruk.marriageAllowance,
    maxRecipientRelief: roundToPence((ruk.marriageAllowance * basicBand.rate) / 100),
  };
}

export function getMarriageAllowanceAmounts(taxYear: TaxYear) {
  const { personalAllowance, transferAmount, maxRecipientRelief } = getPolicy(taxYear, 'rUK');
  return { personalAllowance, transferAmount, maxRecipientRelief };
}

function getEligibility(
  recipientTaxable: number,
  transferorTaxableAfter: number,
  eligibleTaxableLimit: number,
) {
  if (recipientTaxable > eligibleTaxableLimit) return 'recipient-higher-rate';
  if (transferorTaxableAfter > eligibleTaxableLimit) return 'transferor-higher-rate';
  return 'eligible';
}

function calculateIncomeTax(
  taxableIncome: number,
  bands: TaxBand[],
  region: MarriageAllowanceRegion,
): number {
  const sliceBands = bands.map((band) => ({
    name: band.name,
    rate: band.rate,
    taxableIncomeUpperBound: band.threshold,
  }));

  return region === 'scotland'
    ? sliceScottishTaxableIncome(taxableIncome, sliceBands).incomeTax
    : sliceRukTaxableIncome(taxableIncome, sliceBands).incomeTax;
}

export interface MarriageAllowanceNetSavingInput {
  recipientIncome: number;
  transferorIncome: number;
  taxYear: TaxYear;
  region?: MarriageAllowanceRegion;
  recipientTaxFreeAmount?: number;
}

export interface MarriageAllowanceNetSavingResult {
  eligibility: ReturnType<typeof getEligibility>;
  netSaving: number;
  recipientSaving: number;
  transferorAdditionalTax: number;
}

export function calculateMarriageAllowanceNetSaving(
  input: MarriageAllowanceNetSavingInput,
): MarriageAllowanceNetSavingResult {
  const { region = 'rUK', recipientIncome, transferorIncome, taxYear } = input;
  const policy = getPolicy(taxYear, region);
  const { bands, personalAllowance, transferAmount, maxRecipientRelief, eligibleTaxableLimit } =
    policy;
  const recipientTaxable = Math.max(
    0,
    recipientIncome - (input.recipientTaxFreeAmount ?? personalAllowance),
  );
  const transferorTaxableBefore = Math.max(0, transferorIncome - personalAllowance);
  const transferorTaxableAfter = Math.max(
    0,
    transferorIncome - (personalAllowance - transferAmount),
  );
  const eligibility = getEligibility(
    recipientTaxable,
    transferorTaxableAfter,
    eligibleTaxableLimit,
  );

  if (eligibility !== 'eligible') {
    return { eligibility, netSaving: 0, recipientSaving: 0, transferorAdditionalTax: 0 };
  }

  // ITA 2007 ss29 and 55B: the basic-rate credit can reduce existing tax to zero.
  const recipientTax = calculateIncomeTax(recipientTaxable, bands, region);
  const recipientSaving = roundToPence(Math.min(recipientTax, maxRecipientRelief));
  const transferorAdditionalTax = roundToPence(
    calculateIncomeTax(transferorTaxableAfter, bands, region) -
      calculateIncomeTax(transferorTaxableBefore, bands, region),
  );

  return {
    eligibility,
    netSaving: roundToPence(recipientSaving - transferorAdditionalTax),
    recipientSaving,
    transferorAdditionalTax,
  };
}

/** Estimate the free-pay addition on the assumption that HMRC codes the transfer. */
export function estimateMarriageAllowanceCodingAdjustment(
  input: MarriageAllowanceNetSavingInput,
): number {
  const { region = 'rUK', recipientIncome, transferorIncome, taxYear } = input;
  if (!(transferorIncome >= 0 && transferorIncome < recipientIncome)) return 0;

  // Only assume a claim from the wage inputs when it benefits the household.
  // Annual statutory savings determine whether to model a claim; PAYE sizing is separate.
  if (calculateMarriageAllowanceNetSaving(input).netSaving <= 0) return 0;

  const { personalAllowance, transferAmount, basicRate, bands } = getPolicy(taxYear, region);
  const recipientTaxable = recipientIncome - (input.recipientTaxFreeAmount ?? personalAllowance);

  // Model HMRC's highest-rate examples (PAYE100035) using the pre-transfer
  // annual band and rounding the addition up to a pound. The payroll routine
  // applies its own rounding and chooses the band after applying free pay.
  const band = bands.find((band) => recipientTaxable <= band.threshold);
  return band ? Math.ceil((transferAmount * basicRate) / band.rate) : 0;
}
