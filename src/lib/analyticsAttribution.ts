// Only the campaign combinations emitted by our two results-email templates are approved.
// Syntax-only validation could still admit financial/identifying data in a campaign token.
const APPROVED_CAMPAIGNS = [
  { campaign_source: 'results_email', campaign_medium: 'email', campaign_name: 'results_followup' },
  {
    campaign_source: 'director_results_email',
    campaign_medium: 'email',
    campaign_name: 'director_recalculate',
  },
] as const;

type CampaignParameters = {
  campaign_source: string;
  campaign_medium: string;
  campaign_name: string;
};

export function getApprovedCampaignParameters(search: string): Partial<CampaignParameters> {
  const params = new URLSearchParams(search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign'];
  if (keys.some((key) => params.getAll(key).length !== 1)) return {};
  const approved = APPROVED_CAMPAIGNS.find(
    (campaign) =>
      campaign.campaign_source === params.get('utm_source') &&
      campaign.campaign_medium === params.get('utm_medium') &&
      campaign.campaign_name === params.get('utm_campaign'),
  );
  return approved ? { ...approved } : {};
}
