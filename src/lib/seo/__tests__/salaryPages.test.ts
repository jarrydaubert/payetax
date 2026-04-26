import {
  getCanonicalSalaryParam,
  getSalaryComparisonLinks,
  INDEXABLE_SALARY_SET,
} from '../salaryPages';

describe('salary page SEO policy', () => {
  it('keeps GSC common salary URLs in the indexable cohort', () => {
    for (const salary of [33000, 39000, 57000, 66000, 78000, 190000]) {
      expect(INDEXABLE_SALARY_SET.has(salary)).toBe(true);
    }
  });

  it('does not promote high-tail GSC noise into the indexable cohort', () => {
    for (const salary of [335000, 355000, 370000, 380000, 425000, 480000]) {
      expect(INDEXABLE_SALARY_SET.has(salary)).toBe(false);
    }
  });

  it('builds canonical salary URL params consistently', () => {
    expect(getCanonicalSalaryParam(57000)).toBe('57000-after-tax');
  });

  it('uses only indexable salaries for nearby comparison links', () => {
    const links = getSalaryComparisonLinks(57000);

    expect(links).toHaveLength(4);
    expect(links.map((link) => link.amount)).toEqual([50000, 55000, 60000, 65000]);
  });
});
