import { getLatestContentDate } from '../contentDates';

describe('getLatestContentDate', () => {
  it('returns the latest valid calendar date regardless of input order', () => {
    expect(
      getLatestContentDate(['2026-08-01T18:30:00Z', '2026-01-01', '2026-07-31T09:00:00Z']),
    ).toBe('2026-08-01');
  });

  it('ignores malformed and impossible calendar dates', () => {
    expect(
      getLatestContentDate([
        'not-a-date',
        '2026-02-30',
        '2026-02-30T09:00:00Z',
        undefined,
        '2026-02-28T09:00:00Z',
      ]),
    ).toBe('2026-02-28');
    expect(getLatestContentDate(['2026-02-30', undefined])).toBeUndefined();
  });
});
