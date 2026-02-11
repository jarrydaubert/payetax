import { maskEmailForLogs } from '../maskEmail';

describe('maskEmailForLogs', () => {
  it('masks long local parts', () => {
    expect(maskEmailForLogs('alexander@payetax.co.uk')).toBe('al***@payetax.co.uk');
  });

  it('masks one and two-character local parts', () => {
    expect(maskEmailForLogs('a@payetax.co.uk')).toBe('a*@payetax.co.uk');
    expect(maskEmailForLogs('ab@payetax.co.uk')).toBe('a*@payetax.co.uk');
  });

  it('returns input unchanged when it is not a valid email shape', () => {
    expect(maskEmailForLogs('not-an-email')).toBe('not-an-email');
  });
});
