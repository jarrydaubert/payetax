import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { getAllUseCaseSlugs, getUseCaseBySlug } from '@/data/useCases';
import UseCasePage, { generateMetadata, generateStaticParams } from '../page';

describe('UseCasePage', () => {
  beforeEach(() => {
    (notFound as jest.Mock).mockReset();
  });

  it('generates static params for all use cases', () => {
    const slugs = getAllUseCaseSlugs();
    const params = generateStaticParams();

    expect(params).toEqual(slugs.map((slug) => ({ 'use-case': slug })));
  });

  it('builds metadata for a valid use case', async () => {
    const slugs = getAllUseCaseSlugs();
    const slug = slugs[0];
    if (!slug) throw new Error('Missing use case slug');
    const useCase = getUseCaseBySlug(slug);
    if (!useCase) throw new Error('Missing use case fixture');

    const metadata = await generateMetadata({
      params: Promise.resolve({ 'use-case': slug }),
    });

    expect(metadata.title).toBe(useCase.title);
    expect(metadata.alternates?.canonical).toContain(`/best-for/${slug}`);
  });

  it('renders use case content for a valid slug', async () => {
    const slugs = getAllUseCaseSlugs();
    const slug = slugs[0];
    if (!slug) throw new Error('Missing use case slug');
    const useCase = getUseCaseBySlug(slug);
    if (!useCase) throw new Error('Missing use case fixture');

    const element = await UseCasePage({
      params: Promise.resolve({ 'use-case': slug }),
    });

    render(element);

    expect(screen.getAllByText(useCase.audience, { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calculate Now')[0]).toBeInTheDocument();
  });

  it('calls notFound for an unknown use case', async () => {
    (notFound as jest.Mock).mockImplementation(() => {
      throw new Error('not found');
    });

    await expect(
      UseCasePage({
        params: Promise.resolve({ 'use-case': 'missing-slug' }),
      }),
    ).rejects.toThrow('not found');

    expect(notFound).toHaveBeenCalled();
  });
});
