export const TEST_DEBT_ALLOWLIST = {
  totalMax: {
    skip: 0,
    todo: 0,
  },
  files: {
    'e2e/seo-blog.spec.ts': {
      skip: 0,
      todo: 0,
      note: 'No skip/todo debt allowed in SEO flow tests.',
    },
  },
} as const;
