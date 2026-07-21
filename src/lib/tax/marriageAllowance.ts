import { SCOTTISH_TAX_RATES, TAX_RATES, type TaxBand, type TaxYear } from '@/constants/taxRates';
import { sliceRukTaxableIncome } from './rukIncomeTax';
import { sliceScottishTaxableIncome } from './scottishIncomeTax';

export type MarriageAllowanceRegion = 'rUK' | 'scotland';

interface TaxRateContext {
  personalAllowance: number;
  marriageAllowance: number;
  bands: TaxBand[];
  higherRateThreshold: number;
}

function getRateContext(taxYear: TaxYear, region: MarriageAllowanceRegion): TaxRateContext | null {
  const rates = region === 'scotland' ? SCOTTISH_TAX_RATES[taxYear] : TAX_RATES[taxYear];
  if (!rates) return null;

  const higherBandIndex = rates.bands.findIndex((band) => band.rate >= 40);
  const preHigherBand = higherBandIndex > 0 ? rates.bands[higherBandIndex - 1] : rates.bands[0];
  if (!preHigherBand) return null;

  return {
    personalAllowance: rates.personalAllowance,
    marriageAllowance: rates.marriageAllowance,
    bands: rates.bands,
    higherRateThreshold: rates.personalAllowance + preHigherBand.threshold,
  };
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
}

export interface MarriageAllowanceNetSavingResult {
  netSaving: number;
  recipientSaving: number;
  transferorAdditionalTax: number;
  transferAmount: number;
  personalAllowance: number;
  higherRateThreshold: number;
}

export function calculateMarriageAllowanceNetSaving(
  input: MarriageAllowanceNetSavingInput,
): MarriageAllowanceNetSavingResult | null {
  const region: MarriageAllowanceRegion = input.region ?? 'rUK';
  const context = getRateContext(input.taxYear, region);
  if (!context) return null;

  const recipientIncome = Math.max(0, input.recipientIncome);
  const transferorIncome = Math.max(0, input.transferorIncome);

  const transferAmount = context.marriageAllowance;
  const personalAllowance = context.personalAllowance;

  const recipientTaxBefore = calculateIncomeTax(
    Math.max(0, recipientIncome - personalAllowance),
    context.bands,
    region,
  );
  const recipientTaxAfter = calculateIncomeTax(
    Math.max(0, recipientIncome - (personalAllowance + transferAmount)),
    context.bands,
    region,
  );
  const recipientSaving = Math.max(0, recipientTaxBefore - recipientTaxAfter);

  const transferorTaxBefore = calculateIncomeTax(
    Math.max(0, transferorIncome - personalAllowance),
    context.bands,
    region,
  );
  const transferorTaxAfter = calculateIncomeTax(
    Math.max(0, transferorIncome - Math.max(0, personalAllowance - transferAmount)),
    context.bands,
    region,
  );
  const transferorAdditionalTax = Math.max(0, transferorTaxAfter - transferorTaxBefore);

  const netSaving = Math.max(0, recipientSaving - transferorAdditionalTax);

  return {
    netSaving,
    recipientSaving,
    transferorAdditionalTax,
    transferAmount,
    personalAllowance,
    higherRateThreshold: context.higherRateThreshold,
  };
}
