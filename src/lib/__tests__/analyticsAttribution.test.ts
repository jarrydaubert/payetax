import { getApprovedCampaignParameters } from '@/lib/analyticsAttribution';

describe('approved GA campaign attribution', () => {
  it.each([
    ['results_email', 'email', 'results_followup'],
    ['director_results_email', 'email', 'director_recalculate'],
  ])('preserves the existing %s email campaign without unrelated query data', (source, medium, name) => {
    expect(
      getApprovedCampaignParameters(
        `?utm_source=${source}&utm_medium=${medium}&utm_campaign=${name}&salary=73123&gclid=click73123&utm_term=73123&utm_content=73123`,
      ),
    ).toEqual({ campaign_source: source, campaign_medium: medium, campaign_name: name });
  });

  it.each([
    '',
    '?utm_source=results_email&utm_medium=email',
    '?utm_source=results_email&utm_medium=email&utm_campaign=salary_73123',
    '?utm_source=director_results_email&utm_medium=email&utm_campaign=results_followup',
    '?utm_source=results_email&utm_medium=cpc&utm_campaign=results_followup',
    '?utm_source=results_email&utm_source=73123&utm_medium=email&utm_campaign=results_followup',
    '?utm_source=73123%40example.test&utm_medium=email&utm_campaign=results_followup',
  ])('discards unknown, partial or ambiguous attribution %s', (search) => {
    expect(getApprovedCampaignParameters(search)).toEqual({});
  });
});
