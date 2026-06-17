export const SITE_CONTACT_EMAIL = 'support@payetax.co.uk';
export const SITE_CONTACT_MAILTO = `mailto:${SITE_CONTACT_EMAIL}` as const;
export const RESULTS_EMAIL_FROM = `PayeTax <${SITE_CONTACT_EMAIL}>`;

export function contactMailto(subject?: string): `mailto:${string}` {
  if (!subject) {
    return SITE_CONTACT_MAILTO;
  }

  return `${SITE_CONTACT_MAILTO}?subject=${encodeURIComponent(subject)}`;
}
