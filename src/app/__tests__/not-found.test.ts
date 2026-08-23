import { metadata } from '../not-found';

describe('not-found metadata', () => {
  it('clears inherited homepage discovery metadata', () => {
    expect(metadata.title).toEqual({ absolute: 'Page Not Found | PayeTax' });
    expect(metadata.description).toBe('The requested PayeTax page could not be found.');
    expect(metadata.alternates).toEqual({ canonical: null });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toBeNull();
    expect(metadata.twitter).toBeNull();
  });
});
