export interface BroadcastOutcome {
  dryRun: boolean;
  sent: number;
  failed: number;
  expectedRecipients: number;
}

/**
 * A post is marked announced only when a real run completes with zero failures
 * and all expected recipients were sent successfully.
 */
export function shouldMarkPostAsAnnounced({
  dryRun,
  sent,
  failed,
  expectedRecipients,
}: BroadcastOutcome): boolean {
  if (dryRun) return false;
  if (failed > 0) return false;
  if (expectedRecipients <= 0) return false;
  return sent === expectedRecipients;
}
