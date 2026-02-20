import { CURRENT_TAX_YEAR, formatTaxYearDisplay, TAX_YEAR_SOURCES } from '@/constants/taxRates';

export const CURRENT_TAX_YEAR_DISPLAY_SHORT = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
  separator: '-',
  shortEndYear: true,
});

export const CURRENT_TAX_YEAR_DISPLAY_LONG = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
  separator: '-',
});

export const RATES_LAST_VERIFIED = TAX_YEAR_SOURCES[CURRENT_TAX_YEAR].verifiedOn;

export function formatIsoDateForDisplay(isoDate: string): string {
  const value = `${isoDate}T00:00:00Z`;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return isoDate;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
