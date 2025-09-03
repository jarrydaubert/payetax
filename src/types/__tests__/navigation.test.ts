// src/types/__tests__/navigation.test.ts

import type { NavigationLink, NavigationSection } from '../navigation';
import type { Route } from '../routes';

describe('Navigation Types', () => {
  describe('NavigationLink interface', () => {
    test('should accept basic navigation link', () => {
      const basicLink: NavigationLink = {
        name: 'Home',
        href: '/',
      };

      expect(basicLink.name).toBe('Home');
      expect(basicLink.href).toBe('/');
      expect(basicLink.icon).toBeUndefined();
      expect(basicLink.external).toBeUndefined();
    });

    test('should accept link with icon', () => {
      const iconLink: NavigationLink = {
        name: 'Dashboard',
        href: '/dashboard',
        icon: 'dashboard-icon', // In real usage, this would be React.ReactNode
      };

      expect(iconLink.name).toBe('Dashboard');
      expect(iconLink.href).toBe('/dashboard');
      expect(iconLink.icon).toBe('dashboard-icon');
    });

    test('should accept external link', () => {
      const externalLink: NavigationLink = {
        name: 'HMRC Website',
        href: 'https://gov.uk/hmrc',
        external: true,
      };

      expect(externalLink.name).toBe('HMRC Website');
      expect(externalLink.href).toBe('https://gov.uk/hmrc');
      expect(externalLink.external).toBe(true);
    });

    test('should accept link with all properties', () => {
      const fullLink: NavigationLink = {
        name: 'Tax Calculator',
        href: '/calculator',
        icon: 'calculator-icon',
        external: false,
      };

      expect(fullLink.name).toBe('Tax Calculator');
      expect(fullLink.href).toBe('/calculator');
      expect(fullLink.icon).toBe('calculator-icon');
      expect(fullLink.external).toBe(false);
    });

    test('should work with different route types', () => {
      const internalLink: NavigationLink = {
        name: 'About',
        href: '/about',
      };

      const blogLink: NavigationLink = {
        name: 'Tax Tips',
        href: '/blog/category/tax-tips',
      };

      const externalLink: NavigationLink = {
        name: 'External Site',
        href: 'https://example.com',
        external: true,
      };

      const mailtoLink: NavigationLink = {
        name: 'Contact',
        href: 'mailto:contact@toolhubx.com',
        external: true,
      };

      expect(internalLink.href).toBe('/about');
      expect(blogLink.href).toBe('/blog/category/tax-tips');
      expect(externalLink.href).toBe('https://example.com');
      expect(mailtoLink.href).toBe('mailto:contact@toolhubx.com');
    });
  });

  describe('NavigationSection interface', () => {
    test('should accept basic navigation section', () => {
      const section: NavigationSection = {
        title: 'Main Navigation',
        links: [
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ],
      };

      expect(section.title).toBe('Main Navigation');
      expect(section.links).toHaveLength(2);
      expect(section.links[0].name).toBe('Home');
      expect(section.links[1].name).toBe('About');
    });

    test('should accept empty links array', () => {
      const emptySection: NavigationSection = {
        title: 'Empty Section',
        links: [],
      };

      expect(emptySection.title).toBe('Empty Section');
      expect(emptySection.links).toHaveLength(0);
    });

    test('should accept complex navigation section', () => {
      const complexSection: NavigationSection = {
        title: 'Tools & Resources',
        links: [
          {
            name: 'Tax Calculator',
            href: '/',
            icon: 'calculator-icon',
          },
          {
            name: 'Blog',
            href: '/blog',
            icon: 'blog-icon',
          },
          {
            name: 'HMRC Official',
            href: 'https://gov.uk/hmrc',
            icon: 'external-icon',
            external: true,
          },
          {
            name: 'Support',
            href: 'mailto:support@toolhubx.com',
            external: true,
          },
        ],
      };

      expect(complexSection.title).toBe('Tools & Resources');
      expect(complexSection.links).toHaveLength(4);

      const [calculator, blog, hmrc, support] = complexSection.links;

      expect(calculator.name).toBe('Tax Calculator');
      expect(calculator.href).toBe('/');
      expect(calculator.icon).toBe('calculator-icon');

      expect(blog.name).toBe('Blog');
      expect(blog.href).toBe('/blog');

      expect(hmrc.external).toBe(true);
      expect(support.external).toBe(true);
    });
  });

  describe('Real-world navigation scenarios', () => {
    test('should handle typical website navigation', () => {
      const mainNavigation: NavigationSection = {
        title: 'Main Menu',
        links: [
          { name: 'Home', href: '/' },
          { name: 'Calculator', href: '/' },
          { name: 'About', href: '/about' },
          { name: 'Blog', href: '/blog' },
          { name: 'Contact', href: '/feedback' },
        ],
      };

      const footerNavigation: NavigationSection = {
        title: 'Footer Links',
        links: [
          { name: 'Privacy Policy', href: '/privacy' },
          { name: 'Terms of Service', href: '/terms' },
          { name: 'Offline Page', href: '/offline' },
        ],
      };

      const externalLinks: NavigationSection = {
        title: 'External Resources',
        links: [
          {
            name: 'HMRC Tax Rates',
            href: 'https://gov.uk/income-tax-rates',
            external: true,
          },
          {
            name: 'Gov.uk',
            href: 'https://gov.uk',
            external: true,
          },
          {
            name: 'Support Email',
            href: 'mailto:support@toolhubx.com',
            external: true,
          },
        ],
      };

      expect(mainNavigation.links).toHaveLength(5);
      expect(footerNavigation.links).toHaveLength(3);
      expect(externalLinks.links).toHaveLength(3);

      // Check that external links are marked correctly
      const externalLinksWithFlag = externalLinks.links.filter((link) => link.external);
      expect(externalLinksWithFlag).toHaveLength(3);
    });

    test('should handle mobile navigation with icons', () => {
      const mobileNavigation: NavigationSection = {
        title: 'Mobile Menu',
        links: [
          {
            name: 'Home',
            href: '/',
            icon: '🏠',
          },
          {
            name: 'Calculate',
            href: '/',
            icon: '🧮',
          },
          {
            name: 'Blog',
            href: '/blog',
            icon: '📝',
          },
          {
            name: 'Info',
            href: '/about',
            icon: 'ℹ️',
          },
        ],
      };

      expect(mobileNavigation.links.every((link) => link.icon)).toBe(true);
      expect(mobileNavigation.links.every((link) => !link.external)).toBe(true);
    });

    test('should handle breadcrumb navigation', () => {
      const breadcrumbs: NavigationLink[] = [
        { name: 'Home', href: '/' },
        { name: 'Blog', href: '/blog' },
        { name: 'Tax Tips', href: '/blog/category/tax-tips' },
        { name: 'Understanding Tax Codes', href: '/blog/understanding-tax-codes' },
      ];

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[breadcrumbs.length - 1].name).toBe('Understanding Tax Codes');
    });

    test('should handle sidebar navigation with mixed link types', () => {
      const sidebar: NavigationSection = {
        title: 'Quick Links',
        links: [
          { name: 'Dashboard', href: '/' },
          { name: 'Recent Calculations', href: '/#recent' },
          { name: 'Tax Year 2024-25', href: '/?year=2024-2025' },
          { name: 'Help & Support', href: '/feedback' },
          { name: 'HMRC Guidance', href: 'https://gov.uk/hmrc', external: true },
        ],
      };

      const internalLinks = sidebar.links.filter((link) => !link.external);
      const externalLinks = sidebar.links.filter((link) => link.external);

      expect(internalLinks).toHaveLength(4);
      expect(externalLinks).toHaveLength(1);
    });
  });

  describe('Type safety and integration', () => {
    test('should work with route type checking', () => {
      const createNavigationLink = (
        name: string,
        href: Route,
        options?: Partial<NavigationLink>
      ): NavigationLink => {
        return {
          name,
          href,
          ...options,
        };
      };

      const homeLink = createNavigationLink('Home', '/');
      const externalLink = createNavigationLink('External', 'https://example.com', {
        external: true,
      });
      const blogLink = createNavigationLink('Blog Post', '/blog/my-post', { icon: 'blog-icon' });

      expect(homeLink.name).toBe('Home');
      expect(homeLink.href).toBe('/');
      expect(externalLink.external).toBe(true);
      expect(blogLink.icon).toBe('blog-icon');
    });

    test('should work with navigation filtering', () => {
      const allLinks: NavigationLink[] = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'External', href: 'https://example.com', external: true },
        { name: 'Email', href: 'mailto:test@example.com', external: true },
        { name: 'Privacy', href: '/privacy' },
      ];

      const internalOnly = allLinks.filter((link) => !link.external);
      const externalOnly = allLinks.filter((link) => link.external);
      const withIcons = allLinks.filter((link) => link.icon !== undefined);

      expect(internalOnly).toHaveLength(3);
      expect(externalOnly).toHaveLength(2);
      expect(withIcons).toHaveLength(0); // No icons in this test
    });

    test('should work with nested navigation structures', () => {
      const navigationSections: NavigationSection[] = [
        {
          title: 'Main',
          links: [
            { name: 'Home', href: '/' },
            { name: 'Calculator', href: '/' },
          ],
        },
        {
          title: 'Content',
          links: [
            { name: 'Blog', href: '/blog' },
            { name: 'About', href: '/about' },
          ],
        },
        {
          title: 'External',
          links: [{ name: 'HMRC', href: 'https://gov.uk/hmrc', external: true }],
        },
      ];

      const totalLinks = navigationSections.reduce(
        (count, section) => count + section.links.length,
        0
      );
      const allLinks = navigationSections.flatMap((section) => section.links);
      const externalLinks = allLinks.filter((link) => link.external);

      expect(totalLinks).toBe(5);
      expect(allLinks).toHaveLength(5);
      expect(externalLinks).toHaveLength(1);
    });
  });
});
