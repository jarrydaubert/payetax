/**
 * @jest-environment node
 *
 * Bug class: SEO-DATA-INTEGRITY
 * What bug will this test find?
 * - Missing or malformed public tax-rates dataset payload
 * - Non-finite thresholds breaking JSON consumers
 * - Cache header regressions on the public dataset endpoint
 */

import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { getCrawlableSalaryExamples } from '@/lib/crawlableTaxFacts';
import { GET } from './route';

describe('/api/tax-rates GET', () => {
  it('returns the public tax-rates dataset payload', async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.dataset).toBe('uk-tax-rates');
    expect(json.currentTaxYear).toBe(CURRENT_TAX_YEAR);
    expect(json.rates[CURRENT_TAX_YEAR]).toBeDefined();
    expect(json.takeHomeExamples).toEqual(getCrawlableSalaryExamples(CURRENT_TAX_YEAR));
  });

  it('serializes non-finite thresholds as null', async () => {
    const response = await GET();
    const json = await response.json();

    expect(json.rates[CURRENT_TAX_YEAR].bands[2].threshold).toBeNull();
  });

  it('sets cache headers for stable dataset delivery', async () => {
    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');

    expect(cacheControl).toContain('s-maxage=86400');
    expect(cacheControl).toContain('stale-while-revalidate=604800');
  });
});
