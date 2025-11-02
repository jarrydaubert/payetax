// src/lib/__tests__/__mocks__/next-mdx-remote.mock.tsx
/**
 * Mock for next-mdx-remote/rsc
 * Used to test MDX rendering without actual MDX compilation
 */

export const MDXRemote = ({ source, components }: any) => {
  // Simple mock that renders test content
  return <div data-testid='mdx-mock'>{source || 'Mock MDX Content'}</div>;
};

export const compileMDX = (source: string) => {
  return Promise.resolve({
    content: <div>{source}</div>,
    frontmatter: {},
  });
};
