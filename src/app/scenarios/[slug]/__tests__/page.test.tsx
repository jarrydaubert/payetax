import { getAllScenarioSlugs, getScenarioBySlug } from '@/data/scenarios';
import { generateMetadata, generateStaticParams } from '../page';

describe('ScenarioPage metadata', () => {
  it('generates static params for all scenarios', () => {
    const params = generateStaticParams();
    const slugs = getAllScenarioSlugs();

    expect(params).toEqual(slugs.map((slug) => ({ slug })));
  });

  it('returns noindex metadata for an unknown scenario', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'unknown-scenario' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('returns scenario metadata for a known slug', async () => {
    const slugs = getAllScenarioSlugs();
    const slug = slugs[0];
    if (!slug) throw new Error('Missing scenario slug');
    const scenario = getScenarioBySlug(slug);
    if (!scenario) throw new Error('Missing scenario fixture');

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    if (typeof metadata.title === 'string') {
      expect(metadata.title).toContain(scenario.title);
    } else {
      expect(metadata.title?.default).toContain(scenario.title);
    }
  });
});
