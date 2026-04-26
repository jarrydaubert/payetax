import { generateMetadata, generateStaticParams } from '../page';

describe('salary page indexation metadata', () => {
  it('keeps curated salary pages canonical and indexable', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ salary: '30000-after-tax' }),
    });

    expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/calculator/30000-after-tax');
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: true,
        follow: true,
      }),
    );
  });

  it('keeps GSC common salary pages canonical and indexable', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ salary: '57000-after-tax' }),
    });

    expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/calculator/57000-after-tax');
    expect(metadata.robots).toEqual(
      expect.objectContaining({
        index: true,
        follow: true,
      }),
    );
  });

  it('canonicalises supported non-canonical salary URL variants in metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ salary: '30k' }),
    });

    expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/calculator/30000-after-tax');
  });

  it('marks non-curated salary pages as noindex crawl-budget controls', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ salary: '365000-after-tax' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('keeps supported but non-priority salary pages usable and noindex', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ salary: '275000-after-tax' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('does not pre-render non-curated GSC noindex salary examples', () => {
    const params = generateStaticParams();

    expect(params).toContainEqual({ salary: '30000-after-tax' });
    expect(params).toContainEqual({ salary: '57000-after-tax' });
    expect(params).not.toContainEqual({ salary: '275000-after-tax' });
    expect(params).not.toContainEqual({ salary: '365000-after-tax' });
    expect(params).not.toContainEqual({ salary: '440000-after-tax' });
  });
});
