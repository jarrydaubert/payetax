/**
 * Masks email addresses before logging.
 *
 * Examples:
 * - a@domain.com -> a*@domain.com
 * - ab@domain.com -> a*@domain.com
 * - alex@domain.com -> al***@domain.com
 */
export function maskEmailForLogs(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!(localPart && domain)) return email;
  if (localPart.length <= 2) return `${localPart[0] ?? '*'}*@${domain}`;
  return `${localPart.slice(0, 2)}***@${domain}`;
}
