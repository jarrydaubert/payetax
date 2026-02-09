import { metadata } from '../layout';

describe('best-uk-tax-calculators layout metadata', () => {
  it('includes explicit Open Graph and Twitter images', () => {
    expect(metadata.openGraph?.images).toEqual([
      'https://payetax.co.uk/best-uk-tax-calculators/opengraph-image',
    ]);
    expect(metadata.twitter?.images).toEqual([
      'https://payetax.co.uk/best-uk-tax-calculators/opengraph-image',
    ]);
  });
});
