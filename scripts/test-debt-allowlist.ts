export const TEST_DEBT_ALLOWLIST = {
  totalMax: {
    skip: 11,
    todo: 2,
  },
  files: {
    'e2e/accessibility-wcag22.spec.ts': {
      skip: 6,
      todo: 0,
      note: 'PAYTAX-81 accessibility debt and false-positive investigation.',
    },
    'e2e/seo-blog.spec.ts': {
      skip: 2,
      todo: 0,
      note: 'Conditional skip until backlink and content-seeded assumptions are strict.',
    },
    'src/lib/__tests__/cookieUtils.test.ts': {
      skip: 1,
      todo: 0,
      note: 'Edge month-boundary behavior still under review.',
    },
    'src/lib/__tests__/taxCalculator.hmrcVerification.test.ts': {
      skip: 2,
      todo: 0,
      note: 'Known HMRC rounding divergence edge-cases.',
    },
    'src/lib/tax/__tests__/directorCalculator.spec.ts': {
      skip: 0,
      todo: 2,
      note: 'NI category transitions pending implementation parity.',
    },
  },
} as const;
