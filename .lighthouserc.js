module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run build && npm start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 60000,
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 1 }],
        'categories:pwa': 'off',

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Performance metrics
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        interactive: ['warn', { maxNumericValue: 3500 }],

        // Bundle size
        'total-byte-weight': ['warn', { maxNumericValue: 512000 }], // 512KB
        'unused-javascript': ['warn', { maxNumericValue: 20000 }], // 20KB

        // Lighthouse 13 Insights (new audit IDs)
        // These replace legacy audits with actionable insights
        'cls-culprits-insight': 'off', // CLS breakdown - informational only
        'lcp-phases-insight': 'off', // LCP phases breakdown - informational only
        'lcp-discovery-insight': 'off', // LCP discovery timing - informational only
        'image-delivery-insight': 'off', // Image optimization insights - informational only
        'document-latency-insight': 'off', // Server response + redirects - informational only
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
