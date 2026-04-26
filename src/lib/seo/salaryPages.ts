const HIGH_INTENT_GSC_SALARY_COHORT = [33000, 39000, 57000, 66000, 78000, 190000] as const;

export const PROGRAMMATIC_SALARIES = [
  // Entry-level and minimum wage bracket
  18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000,
  // Lower-mid range
  26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000,
  // Mid range
  36000, 37000, 38000, 39000, 40000, 41000, 42000, 43000, 44000, 45000, 46000, 47000, 48000, 49000,
  50000,
  // Upper-mid range
  51000, 52000, 53000, 54000, 55000, 56000, 57000, 58000, 59000, 60000, 61000, 62000, 63000, 64000,
  65000, 66000, 67000, 68000, 69000, 70000, 71000, 72000, 73000, 74000, 75000,
  // Higher earners
  76000, 77000, 78000, 79000, 80000, 82000, 85000, 87000, 90000, 92000, 95000, 97000, 100000,
  // Tax trap zone
  101000, 102000, 103000, 104000, 105000, 106000, 107000, 108000, 109000, 110000, 111000, 112000,
  113000, 114000, 115000, 116000, 117000, 118000, 119000, 120000, 121000, 122000, 123000, 124000,
  125000,
  // High earners
  130000, 135000, 140000, 145000, 150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000,
  190000, 195000, 200000,
  // Executive salaries
  210000, 220000, 225000, 230000, 240000, 250000, 275000, 300000, 325000, 350000, 375000, 400000,
  450000, 500000,
] as const;

export const INDEXABLE_SALARIES = [
  18000,
  20000,
  25000,
  30000,
  35000,
  40000,
  45000,
  50000,
  55000,
  60000,
  65000,
  70000,
  75000,
  80000,
  85000,
  90000,
  95000,
  100000,
  101000,
  105000,
  110000,
  115000,
  120000,
  125000,
  130000,
  140000,
  150000,
  175000,
  200000,
  250000,
  300000,
  500000,
  ...HIGH_INTENT_GSC_SALARY_COHORT,
] as const;

export const HIGH_PRIORITY_SALARIES = INDEXABLE_SALARIES;

export const PROGRAMMATIC_SALARY_SET = new Set<number>(PROGRAMMATIC_SALARIES);
export const INDEXABLE_SALARY_SET = new Set<number>(INDEXABLE_SALARIES);
export const HIGH_PRIORITY_SALARY_SET = new Set<number>(HIGH_PRIORITY_SALARIES);

export const SALARY_SEARCH_VOLUME_HINT: Record<number, number> = {
  80000: 620,
  90000: 530,
  70000: 480,
  100000: 450,
  60000: 390,
  50000: 350,
  40000: 320,
  30000: 280,
  35000: 250,
  45000: 230,
  55000: 210,
  65000: 190,
  75000: 180,
  105000: 170,
  115000: 170,
  85000: 160,
  95000: 150,
  125000: 140,
  110000: 130,
  120000: 120,
  57000: 110,
  66000: 100,
  78000: 100,
  39000: 90,
  33000: 80,
  190000: 60,
};

export function getCanonicalSalaryParam(salary: number): string {
  return `${salary}-after-tax`;
}

export function getSalaryComparisonLinks(
  salary: number,
  maxLinks = 4,
): Array<{ amount: number; label: string }> {
  return INDEXABLE_SALARIES.filter((amount) => amount !== salary)
    .map((amount) => ({
      amount,
      distance: Math.abs(amount - salary),
      direction: amount < salary ? -1 : 1,
    }))
    .sort((a, b) => a.distance - b.distance || a.direction - b.direction || a.amount - b.amount)
    .slice(0, maxLinks)
    .sort((a, b) => a.amount - b.amount)
    .map(({ amount }) => {
      const delta = amount - salary;
      const display = Math.abs(delta) / 1000;
      const label = Number.isInteger(display) ? display.toString() : display.toFixed(1);

      return {
        amount,
        label: `£${label}k ${delta < 0 ? 'less' : 'more'}`,
      };
    });
}
