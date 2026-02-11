import { shouldMarkPostAsAnnounced } from '../broadcastPolicy';

describe('shouldMarkPostAsAnnounced', () => {
  it('returns true for full successful non-dry-run send', () => {
    expect(
      shouldMarkPostAsAnnounced({
        dryRun: false,
        sent: 12,
        failed: 0,
        expectedRecipients: 12,
      }),
    ).toBe(true);
  });

  it('returns false for dry-run sends', () => {
    expect(
      shouldMarkPostAsAnnounced({
        dryRun: true,
        sent: 12,
        failed: 0,
        expectedRecipients: 12,
      }),
    ).toBe(false);
  });

  it('returns false if any sends failed', () => {
    expect(
      shouldMarkPostAsAnnounced({
        dryRun: false,
        sent: 11,
        failed: 1,
        expectedRecipients: 12,
      }),
    ).toBe(false);
  });

  it('returns false if recipient count does not match sent count', () => {
    expect(
      shouldMarkPostAsAnnounced({
        dryRun: false,
        sent: 11,
        failed: 0,
        expectedRecipients: 12,
      }),
    ).toBe(false);
  });
});
