const FIRST_CT_SELF_ASSESSMENT_PERIOD_END = '1999-07-01';

export function parseAccountingPeriodEnd(value: string): Date | null {
  // Keep the filing deadline and its exclusive calendar end within four-digit years.
  if (
    value.length !== 10 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < FIRST_CT_SELF_ASSESSMENT_PERIOD_END ||
    value > '9998-12-30'
  ) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month - 1)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function getCompanyDeadlines(value: string) {
  const periodEnd = parseAccountingPeriodEnd(value);
  if (!periodEnd) return null;

  const year = periodEnd.getUTCFullYear();
  const month = periodEnd.getUTCMonth();
  const day = periodEnd.getUTCDate();
  const isMonthEnd = day === daysInMonth(year, month);

  // HMRC CTM01800: month ends and missing corresponding days use the first of month ten.
  const payment =
    isMonthEnd || day > daysInMonth(year, month + 9)
      ? new Date(Date.UTC(year, month + 10, 1))
      : new Date(Date.UTC(year, month + 9, day + 1));

  // HMRC CTM93040: both 28 and 29 February month ends map to the following February's end.
  const filingDay = isMonthEnd ? daysInMonth(year + 1, month) : day;
  const filing = new Date(Date.UTC(year + 1, month, filingDay));

  return { periodEnd, payment, filing };
}
