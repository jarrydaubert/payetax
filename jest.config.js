const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const config = {
  // Test isolation - clear mock state between tests to prevent pollution
  clearMocks: true,

  // Performance optimizations
  maxWorkers: process.env.CI ? 2 : '50%', // Use 50% of CPU cores locally, 2 in CI
  workerIdleMemoryLimit: '512MB', // Kill workers using too much memory

  coverageProvider: 'v8', // v8 is faster than babel
  coverageDirectory: '<rootDir>/audit-outputs/coverage',
  testEnvironment: 'jsdom',
  // Fix for modern ESM libraries (MSW, fetch polyfills) that use package.json "exports" field.
  // Without this, Jest/JSDOM forces "browser" export which may lack Node polyfills needed in tests.
  // See: https://mswjs.io/docs/migrations/1.x-to-2.x
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Setup files - fetch polyfills must run before modules are imported
  setupFiles: ['<rootDir>/jest.setup.fetch.js'],
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/src/lib/__tests__/__mocks__/',
    '<rootDir>/.contentlayer/',
  ],
  transformIgnorePatterns: ['/node_modules/(?!(@?contentlayer2?|next-mdx-remote|github-slugger)/)'],
  moduleNameMapper: {
    '^@testing-library/react$': '<rootDir>/src/test/testing-library.tsx',
    // Mock Contentlayer generated files (must be first to catch before other patterns)
    '^contentlayer/generated$': '<rootDir>/src/lib/__tests__/__mocks__/contentlayer.mock.ts',
    '^\\./.contentlayer/generated(.*)$':
      '<rootDir>/src/lib/__tests__/__mocks__/contentlayer.mock.ts',
    '^\\.contentlayer/generated(.*)$': '<rootDir>/src/lib/__tests__/__mocks__/contentlayer.mock.ts',
    '.contentlayer/generated': '<rootDir>/src/lib/__tests__/__mocks__/contentlayer.mock.ts',
    '<rootDir>/.contentlayer/generated(.*)$':
      '<rootDir>/src/lib/__tests__/__mocks__/contentlayer.mock.ts',
    '^contentlayer2/client$': '<rootDir>/src/lib/__tests__/__mocks__/contentlayer-client.mock.ts',
    '^@contentlayer2/client$': '<rootDir>/src/lib/__tests__/__mocks__/contentlayer-client.mock.ts',
    '^contentlayer2/dist/client/index.js$':
      '<rootDir>/src/lib/__tests__/__mocks__/contentlayer-client.mock.ts',
    // Mock next-mdx-remote to avoid ESM parsing issues
    '^next-mdx-remote/rsc$': '<rootDir>/src/lib/__tests__/__mocks__/next-mdx-remote.mock.tsx',
    // Mock github-slugger (ESM-only package)
    '^github-slugger$': '<rootDir>/src/lib/__tests__/__mocks__/github-slugger.mock.ts',
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    // Next.js App Router - Exclude thin wrappers with no logic
    '!src/app/**/page.tsx', // Page wrappers (import and render components)
    '!src/app/**/layout.tsx', // Layout wrappers
    '!src/app/not-found.tsx', // Error pages
    '!src/app/global-error.tsx',
    '!src/app/offline/page.tsx', // Static pages
    '!src/app/fonts.ts', // Configuration files
    '!src/app/robots.ts',
    '!src/app/sitemap.ts',
    '!src/app/globals.css',
    '!src/app/manifest.ts', // PWA manifest
    '!src/types/navigation.ts', // Type definitions only
    // Focus on business logic: components, lib, store, hooks, utils
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  // Coverage thresholds - enforce minimum code coverage
  coverageThreshold: {
    global: {
      statements: 65,
      branches: 55,
      functions: 65,
      lines: 65,
    },
    // More lenient for UI components (visual testing often better than unit tests)
    // Note: Lower function threshold (20%) because JSX inline callbacks inflate function counts
    // but don't represent actual testable business logic
    './src/components/**/*.{ts,tsx}': {
      statements: 60,
      branches: 30,
      functions: 20,
      lines: 60,
    },
    // Very lenient for layout components (many conditional rendering branches)
    './src/components/templates/PageContainer.tsx': {
      statements: 60,
      branches: 15,
      functions: 60,
      lines: 60,
    },
    // Strict for pure business logic (calculators, utilities)
    './src/lib/taxCalculator.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './src/lib/periodCalculator.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    // Lenient for server-side/file operations (blog.ts, hard to test with Contentlayer)
    './src/lib/blog.ts': {
      statements: 30,
      branches: 50,
      functions: 0,
      lines: 30,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
