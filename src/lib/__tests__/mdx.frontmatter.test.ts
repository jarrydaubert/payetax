jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));
jest.mock('rehype-pretty-code', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('rehype-slug', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/components/molecules/mdx-components', () => ({
  mdxComponents: {},
}));

import { getPostBySlug } from '@/lib/mdx';

describe('repository MDX frontmatter', () => {
  it('parses representative arrays and booleans through gray-matter', () => {
    const post = getPostBySlug('beginners-guide-to-uk-taxation');

    expect(post).toMatchObject({
      slug: 'beginners-guide-to-uk-taxation',
      featured: true,
    });
    expect(post?.tags).toEqual(expect.arrayContaining([expect.any(String)]));
  });
});
