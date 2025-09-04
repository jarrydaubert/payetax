// src/types/__tests__/routes.test.ts

import {
  type ExternalRoute,
  type InternalRoute,
  isExternalRoute,
  isInternalRoute,
  type Route,
} from '../routes';

describe('Routes Types and Functions', () => {
  describe('Type definitions', () => {
    test('should accept valid internal routes', () => {
      const homeRoute: InternalRoute = '/';
      const aboutRoute: InternalRoute = '/about';
      const blogRoute: InternalRoute = '/blog';
      const feedbackRoute: InternalRoute = '/feedback';
      const privacyRoute: InternalRoute = '/privacy';
      const offlineRoute: InternalRoute = '/offline';

      expect(homeRoute).toBe('/');
      expect(aboutRoute).toBe('/about');
      expect(blogRoute).toBe('/blog');
      expect(feedbackRoute).toBe('/feedback');
      expect(privacyRoute).toBe('/privacy');
      expect(offlineRoute).toBe('/offline');
    });

    test('should accept valid dynamic blog routes', () => {
      const blogPostRoute: InternalRoute = '/blog/my-post-slug';
      const blogCategoryRoute: InternalRoute = '/blog/category/tax-tips';

      expect(blogPostRoute).toBe('/blog/my-post-slug');
      expect(blogCategoryRoute).toBe('/blog/category/tax-tips');
    });

    test('should accept valid external routes', () => {
      const httpsRoute: ExternalRoute = 'https://example.com';
      const httpRoute: ExternalRoute = 'http://example.com';
      const mailtoRoute: ExternalRoute = 'mailto:test@example.com';

      expect(httpsRoute).toBe('https://example.com');
      expect(httpRoute).toBe('http://example.com');
      expect(mailtoRoute).toBe('mailto:test@example.com');
    });

    test('should accept routes as union type', () => {
      const internalRoute: Route = '/about';
      const externalRoute: Route = 'https://example.com';
      const emailRoute: Route = 'mailto:contact@toolhubx.com';

      expect(internalRoute).toBe('/about');
      expect(externalRoute).toBe('https://example.com');
      expect(emailRoute).toBe('mailto:contact@toolhubx.com');
    });
  });

  describe('isExternalRoute function', () => {
    test('should return true for HTTPS URLs', () => {
      expect(isExternalRoute('https://example.com')).toBe(true);
      expect(isExternalRoute('https://google.com/search?q=test')).toBe(true);
      expect(isExternalRoute('https://subdomain.example.com/path')).toBe(true);
    });

    test('should return true for HTTP URLs', () => {
      expect(isExternalRoute('http://example.com')).toBe(true);
      expect(isExternalRoute('http://localhost:3000')).toBe(true);
      expect(isExternalRoute('http://192.168.1.1:8080/path')).toBe(true);
    });

    test('should return true for mailto links', () => {
      expect(isExternalRoute('mailto:test@example.com')).toBe(true);
      expect(isExternalRoute('mailto:contact@toolhubx.com?subject=Help')).toBe(true);
    });

    test('should return false for internal routes', () => {
      expect(isExternalRoute('/')).toBe(false);
      expect(isExternalRoute('/about')).toBe(false);
      expect(isExternalRoute('/blog')).toBe(false);
      expect(isExternalRoute('/blog/my-post')).toBe(false);
      expect(isExternalRoute('/blog/category/tax-tips')).toBe(false);
      expect(isExternalRoute('/feedback')).toBe(false);
      expect(isExternalRoute('/privacy')).toBe(false);
      expect(isExternalRoute('/offline')).toBe(false);
    });

    test('should return false for relative paths', () => {
      expect(isExternalRoute('about')).toBe(false);
      expect(isExternalRoute('./blog')).toBe(false);
      expect(isExternalRoute('../privacy')).toBe(false);
    });

    test('should return false for hash links', () => {
      expect(isExternalRoute('#section')).toBe(false);
      expect(isExternalRoute('#top')).toBe(false);
    });

    test('should return false for query parameters', () => {
      expect(isExternalRoute('/?query=test')).toBe(false);
      expect(isExternalRoute('/search?q=tax')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isExternalRoute('')).toBe(false);
    });

    test('should handle edge cases', () => {
      expect(isExternalRoute('ftp://example.com')).toBe(false); // Only http/https/mailto
      expect(isExternalRoute('file://path/to/file')).toBe(false);
      expect(isExternalRoute('tel:+1234567890')).toBe(false);
      expect(isExternalRoute('javascript:void(0)')).toBe(false);
    });
  });

  describe('isInternalRoute function', () => {
    test('should return true for internal routes', () => {
      expect(isInternalRoute('/')).toBe(true);
      expect(isInternalRoute('/about')).toBe(true);
      expect(isInternalRoute('/blog')).toBe(true);
      expect(isInternalRoute('/blog/my-post')).toBe(true);
      expect(isInternalRoute('/blog/category/tax-tips')).toBe(true);
      expect(isInternalRoute('/feedback')).toBe(true);
      expect(isInternalRoute('/privacy')).toBe(true);
      expect(isInternalRoute('/offline')).toBe(true);
    });

    test('should return true for relative paths', () => {
      expect(isInternalRoute('about')).toBe(true);
      expect(isInternalRoute('./blog')).toBe(true);
      expect(isInternalRoute('../privacy')).toBe(true);
    });

    test('should return true for hash links', () => {
      expect(isInternalRoute('#section')).toBe(true);
      expect(isInternalRoute('#top')).toBe(true);
    });

    test('should return true for query parameters', () => {
      expect(isInternalRoute('/?query=test')).toBe(true);
      expect(isInternalRoute('/search?q=tax')).toBe(true);
    });

    test('should return true for empty string', () => {
      expect(isInternalRoute('')).toBe(true);
    });

    test('should return false for HTTPS URLs', () => {
      expect(isInternalRoute('https://example.com')).toBe(false);
      expect(isInternalRoute('https://google.com/search?q=test')).toBe(false);
    });

    test('should return false for HTTP URLs', () => {
      expect(isInternalRoute('http://example.com')).toBe(false);
      expect(isInternalRoute('http://localhost:3000')).toBe(false);
    });

    test('should return false for mailto links', () => {
      expect(isInternalRoute('mailto:test@example.com')).toBe(false);
      expect(isInternalRoute('mailto:contact@toolhubx.com?subject=Help')).toBe(false);
    });

    test('should return true for edge cases that are not external', () => {
      expect(isInternalRoute('ftp://example.com')).toBe(true); // Not http/https/mailto
      expect(isInternalRoute('file://path/to/file')).toBe(true);
      expect(isInternalRoute('tel:+1234567890')).toBe(true);
      expect(isInternalRoute('javascript:void(0)')).toBe(true);
    });
  });

  describe('Function relationship', () => {
    test('should be inverse of each other for all routes', () => {
      const testRoutes = [
        '/',
        '/about',
        '/blog',
        '/blog/test-post',
        '/blog/category/finance',
        '/feedback',
        '/privacy',
        '/offline',
        'https://example.com',
        'http://test.com',
        'mailto:test@example.com',
        '#section',
        '?query=test',
        'relative/path',
        '../parent',
        './current',
        '',
        'ftp://file.com',
        'tel:123456',
      ];

      for (const route of testRoutes) {
        expect(isExternalRoute(route)).toBe(!isInternalRoute(route));
        expect(isInternalRoute(route)).toBe(!isExternalRoute(route));
      }
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should correctly categorize typical website routes', () => {
      // Internal routes
      const internalRoutes = [
        '/',
        '/about',
        '/blog',
        '/blog/understanding-tax-codes',
        '/blog/category/tax-tips',
        '/feedback',
        '/privacy',
      ];

      for (const route of internalRoutes) {
        expect(isInternalRoute(route)).toBe(true);
        expect(isExternalRoute(route)).toBe(false);
      }

      // External routes
      const externalRoutes = [
        'https://gov.uk/hmrc',
        'https://www.calculatorsoup.com',
        'mailto:support@toolhubx.com',
        'http://legacy-system.company.com',
      ];

      for (const route of externalRoutes) {
        expect(isExternalRoute(route)).toBe(true);
        expect(isInternalRoute(route)).toBe(false);
      }
    });

    test('should handle navigation link scenarios', () => {
      interface TestNavigationLink {
        name: string;
        href: string;
        external?: boolean;
      }

      const navigationLinks: TestNavigationLink[] = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'HMRC', href: 'https://gov.uk/hmrc', external: true },
        { name: 'Contact', href: 'mailto:contact@toolhubx.com', external: true },
      ];

      for (const link of navigationLinks) {
        const isExternal = isExternalRoute(link.href);
        if (link.external !== undefined) {
          expect(isExternal).toBe(link.external);
        }
      }
    });

    test('should work with Next.js Link components', () => {
      // Simulate how these functions might be used with Next.js Link
      const createLinkProps = (href: string) => {
        if (isExternalRoute(href)) {
          return {
            href,
            target: '_blank',
            rel: 'noopener noreferrer',
          };
        }
        return {
          href,
        };
      };

      const internalLinkProps = createLinkProps('/about');
      const externalLinkProps = createLinkProps('https://example.com');

      expect(internalLinkProps).toEqual({ href: '/about' });
      expect(externalLinkProps).toEqual({
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer',
      });
    });
  });

  describe('Type safety', () => {
    test('should work with type narrowing', () => {
      const testRoute: string = 'https://example.com';

      if (isExternalRoute(testRoute)) {
        // TypeScript should know this is ExternalRoute
        expect(testRoute.startsWith('http') || testRoute.startsWith('mailto:')).toBe(true);
      }

      if (isInternalRoute(testRoute)) {
        // This shouldn't execute for external route
        throw new Error('Should not reach this point for external route');
      }
    });

    test('should work with route arrays', () => {
      const routes: Route[] = [
        '/',
        '/about',
        'https://example.com',
        'mailto:test@example.com',
        '/blog/test-post',
      ];

      const internalRoutes = routes.filter(isInternalRoute);
      const externalRoutes = routes.filter(isExternalRoute);

      expect(internalRoutes).toHaveLength(3);
      expect(externalRoutes).toHaveLength(2);
      expect(internalRoutes).toEqual(['/', '/about', '/blog/test-post']);
      expect(externalRoutes).toEqual(['https://example.com', 'mailto:test@example.com']);
    });
  });
});
