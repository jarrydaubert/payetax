// src/lib/__tests__/metadata.test.ts

import { generateMetadata, generateViewport } from '../metadata';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Metadata Module', () => {
  describe('generateMetadata', () => {
    test('should generate default metadata', () => {
      const metadata = generateMetadata({});

      expect(metadata.title).toEqual({
        default: 'Free UK PAYE Tax Calculator 2025-2026 | Salary & Take-Home Pay | PayeTax',
        template: '%s | PayeTax',
      });
      expect(metadata.description).toContain('Free UK PAYE tax calculator');
      expect(metadata.keywords).toContain('UK tax calculator 2025');
      expect(metadata.metadataBase).toBeInstanceOf(URL);
    });

    test('should use custom SITE_URL from environment', () => {
      // Need to reload module with new environment variable
      delete require.cache[require.resolve('../metadata')];
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';

      const { generateMetadata: newGenerateMetadata } = require('../metadata');
      const metadata = newGenerateMetadata({ pathname: '/test' });

      expect(metadata.alternates?.canonical).toBe('https://custom-domain.com/test');
      expect(metadata.openGraph?.url).toBe('https://custom-domain.com/test');
    });

    test('should format title correctly when site name not included', () => {
      const metadata = generateMetadata({
        title: 'Custom Page Title',
      });

      expect(metadata.title).toEqual({
        default: 'Custom Page Title | PayeTax',
        template: '%s | PayeTax',
      });
    });

    test('should not duplicate site name when already included', () => {
      const metadata = generateMetadata({
        title: 'Custom Page | PayeTax',
      });

      expect(metadata.title).toEqual({
        default: 'Custom Page | PayeTax',
        template: '%s | PayeTax',
      });
    });

    test('should handle custom OpenGraph image URL', () => {
      const metadata = generateMetadata({
        ogImage: 'https://example.com/custom-image.jpg',
      });

      expect(metadata.openGraph?.images).toEqual([
        {
          url: 'https://example.com/custom-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Free UK PAYE Tax Calculator 2025-2026 | Salary & Take-Home Pay',
        },
      ]);
      expect(metadata.twitter?.images).toEqual(['https://example.com/custom-image.jpg']);
    });

    test('should handle relative OpenGraph image path', () => {
      const metadata = generateMetadata({
        ogImage: '/images/custom-og.png',
      });

      expect(metadata.openGraph?.images).toEqual([
        {
          url: 'https://payetax.co.uk/images/custom-og.png',
          width: 1200,
          height: 630,
          alt: 'Free UK PAYE Tax Calculator 2025-2026 | Salary & Take-Home Pay',
        },
      ]);
    });

    test('should generate article metadata when type is article', () => {
      const publishedTime = '2024-01-15T10:00:00Z';
      const modifiedTime = '2024-01-16T15:30:00Z';

      const metadata = generateMetadata({
        type: 'article',
        title: 'Test Article',
        publishedTime,
        modifiedTime,
        authors: ['John Doe', 'Jane Smith'],
        section: 'Tax News',
        tags: ['tax', 'calculator', 'uk'],
        category: 'Finance',
      });

      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.article).toEqual({
        publishedTime,
        modifiedTime,
        authors: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
        section: 'Tax News',
        tags: ['tax', 'calculator', 'uk'],
      });
      expect(metadata.category).toBe('Finance');
    });

    test('should use publishedTime as modifiedTime when modifiedTime not provided', () => {
      const publishedTime = '2024-01-15T10:00:00Z';

      const metadata = generateMetadata({
        type: 'article',
        publishedTime,
      });

      expect(metadata.openGraph?.article?.modifiedTime).toBe(publishedTime);
    });

    test('should use default authors when none provided for articles', () => {
      const metadata = generateMetadata({
        type: 'article',
        publishedTime: '2024-01-15T10:00:00Z',
      });

      expect(metadata.openGraph?.article?.authors).toEqual([{ name: 'PayeTax' }]);
    });

    test('should handle noIndex parameter', () => {
      const metadata = generateMetadata({ noIndex: true });

      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
        nocache: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
        googleBot: {
          index: false,
          follow: false,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      });
    });

    test('should process keywords correctly', () => {
      const metadata = generateMetadata({
        keywords: 'tax calculator, paye, uk tax, hmrc rates',
      });

      expect(metadata.keywords).toEqual(['tax calculator', 'paye', 'uk tax', 'hmrc rates']);
    });

    test('should handle custom pathname for canonical URL', () => {
      const metadata = generateMetadata({
        pathname: '/calculator/paye',
      });

      expect(metadata.alternates?.canonical).toBe('https://payetax.co.uk/calculator/paye');
      // Note: languages property removed to fix hreflang conflicts (monolingual site)
    });

    test('should set Twitter card type', () => {
      const metadata = generateMetadata({
        twitterCard: 'summary',
      });

      expect(metadata.twitter?.card).toBe('summary');
    });

    test('should include verification codes', () => {
      const metadata = generateMetadata({});

      expect(metadata.verification?.google).toBe(
        'google-site-verification=EPjH4MjD1wobgTVgXC61zwcyeGjT5M_gWL2OI8Vu08c'
      );
      // Placeholder verification codes have been removed
      expect(metadata.verification?.other).toBeUndefined();
    });

    test('should include proper icons configuration', () => {
      const metadata = generateMetadata({});

      expect(metadata.icons).toEqual({
        icon: [
          { url: '/favicon.ico' },
          { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
          { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png' }],
        shortcut: ['/favicon-32x32.png'],
      });
    });

    test('should set format detection correctly', () => {
      const metadata = generateMetadata({});

      expect(metadata.formatDetection).toEqual({
        email: false,
        address: false,
        telephone: false,
      });
    });

    test('should include manifest and other metadata', () => {
      const metadata = generateMetadata({});

      expect(metadata.manifest).toBe('/manifest.json');
      expect(metadata.other).toEqual({
        'msapplication-TileColor': '#06b6d4',
        'theme-color': '#06b6d4',
      });
    });

    test('should handle custom locale', () => {
      const metadata = generateMetadata({
        locale: 'en_US',
      });

      expect(metadata.openGraph?.locale).toBe('en_US');
    });

    test('should set creator and publisher', () => {
      const metadata = generateMetadata({});

      expect(metadata.creator).toBe('PayeTax');
      expect(metadata.publisher).toBe('PayeTax');
    });

    test('should handle custom authors', () => {
      const metadata = generateMetadata({
        authors: ['Custom Author', 'Another Author'],
      });

      expect(metadata.authors).toEqual([{ name: 'Custom Author' }, { name: 'Another Author' }]);
    });
  });

  describe('generateViewport', () => {
    test('should generate viewport configuration (dark mode only)', () => {
      const viewport = generateViewport();

      expect(viewport).toEqual({
        themeColor: '#252525',
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5, // WCAG 2.2 AA - Allow 500% zoom
        userScalable: true,
        colorScheme: 'dark',
        viewportFit: 'cover',
      });
    });
  });
});
