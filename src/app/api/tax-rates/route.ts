import { NextResponse } from 'next/server';
import { CURRENT_TAX_YEAR, TAX_RATES, TAX_YEARS } from '@/constants/taxRates';

export const revalidate = 86400;

function toJsonSafeValue<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === 'number' && !Number.isFinite(nestedValue)) {
        return null;
      }
      return nestedValue;
    }),
  ) as T;
}

const [startYear, endYear] = CURRENT_TAX_YEAR.split('-');
const temporalCoverage = `${startYear}-04-06/${endYear}-04-05`;

const TAX_RATES_DATASET = {
  dataset: 'uk-tax-rates',
  currentTaxYear: CURRENT_TAX_YEAR,
  taxYears: TAX_YEARS,
  temporalCoverage,
  rates: toJsonSafeValue(TAX_RATES),
};

export function GET() {
  return NextResponse.json(TAX_RATES_DATASET, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
