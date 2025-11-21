/**
 * Core Web Vitals E2E Performance Tests
 * PAYTAX-160 Phase 3: Add performance monitoring
 *
 * Tests performance metrics that impact user experience and SEO:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 *
 * Target Metrics (Good):
 * - LCP: < 2.5s
 * - FID: < 100ms
 * - CLS: < 0.1
 *
 * Uses Playwright's performance APIs and Chrome DevTools Protocol
 */

import { expect, test } from '@playwright/test';

test.describe('Core Web Vitals - Performance Monitoring', () => {
  test.describe.configure({ mode: 'parallel' });

  /**
   * Helper function to collect Web Vitals using PerformanceObserver
   */
  async function getWebVitals(page: any) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {
          lcp: null,
          fid: null,
          cls: null,
          ttfb: null,
          fcp: null,
        };

        // Collect LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Collect FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          }
        }).observe({ entryTypes: ['paint'] });

        // Collect CLS (Cumulative Layout Shift)
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-expect-error
            if (!entry.hadRecentInput) {
              // @ts-expect-error
              clsScore += entry.value;
            }
          }
          vitals.cls = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });

        // Collect TTFB (Time to First Byte)
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navigationEntry) {
          vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        }

        // Resolve after a reasonable time to collect metrics
        setTimeout(() => {
          resolve(vitals);
        }, 3000);
      });
    });
  }

  test.describe('Homepage Performance', () => {
    test('should meet Core Web Vitals targets on homepage', async ({ page }) => {
      // Navigate to homepage
      await page.goto('/', { waitUntil: 'networkidle' });

      // Wait for page to fully load
      await page.waitForLoadState('load');

      // Collect Web Vitals
      const vitals: any = await getWebVitals(page);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📊 Core Web Vitals - Homepage:', {
        LCP: vitals.lcp ? `${vitals.lcp.toFixed(2)}ms` : 'N/A',
        FCP: vitals.fcp ? `${vitals.fcp.toFixed(2)}ms` : 'N/A',
        CLS: vitals.cls ? vitals.cls.toFixed(3) : 'N/A',
        TTFB: vitals.ttfb ? `${vitals.ttfb.toFixed(2)}ms` : 'N/A',
      });

      // Assert LCP (Largest Contentful Paint) < 2.5s
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(2500);
      }

      // Assert FCP (First Contentful Paint) < 1.8s
      if (vitals.fcp) {
        expect(vitals.fcp).toBeLessThan(1800);
      }

      // Assert CLS (Cumulative Layout Shift) < 0.1
      if (vitals.cls !== null) {
        expect(vitals.cls).toBeLessThan(0.1);
      }

      // Assert TTFB (Time to First Byte) < 800ms
      if (vitals.ttfb) {
        expect(vitals.ttfb).toBeLessThan(800);
      }
    });

    test('should load critical resources efficiently', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Check resource timing
      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries.map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: entry.initiatorType,
        }));
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`📦 Resources loaded: ${resources.length}`);

      // Assert critical resources load quickly
      const criticalResources = resources.filter(
        (r: any) => r.type === 'script' || r.type === 'css' || r.type === 'img'
      );

      for (const resource of criticalResources) {
        // Each critical resource should load within 3 seconds
        expect(resource.duration).toBeLessThan(3000);
      }
    });
  });

  test.describe('Calculator Page Performance', () => {
    test('should meet Core Web Vitals on calculator page', async ({ page }) => {
      // Navigate to calculator page with pre-filled salary
      await page.goto('/calculator/45000-after-tax', { waitUntil: 'networkidle' });
      await page.waitForLoadState('load');

      // Collect Web Vitals
      const vitals: any = await getWebVitals(page);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📊 Core Web Vitals - Calculator Page:', {
        LCP: vitals.lcp ? `${vitals.lcp.toFixed(2)}ms` : 'N/A',
        CLS: vitals.cls ? vitals.cls.toFixed(3) : 'N/A',
      });

      // Calculator page should have good LCP
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(2500);
      }

      // Should have minimal layout shift
      if (vitals.cls !== null) {
        expect(vitals.cls).toBeLessThan(0.1);
      }
    });

    test('should have fast interaction response time (FID proxy)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Measure interaction responsiveness
      const startTime = Date.now();

      // Interact with salary input
      const salaryInput = page.getByTestId('salary-input');
      await salaryInput.click();
      await salaryInput.fill('50000');

      const interactionTime = Date.now() - startTime;

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`⚡ Interaction time: ${interactionTime}ms`);

      // Interaction should be fast (proxy for FID)
      expect(interactionTime).toBeLessThan(100);
    });
  });

  test.describe('Blog Page Performance', () => {
    test('should meet Core Web Vitals on blog', async ({ page }) => {
      await page.goto('/blog', { waitUntil: 'networkidle' });
      await page.waitForLoadState('load');

      // Collect Web Vitals
      const vitals: any = await getWebVitals(page);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📊 Core Web Vitals - Blog Page:', {
        LCP: vitals.lcp ? `${vitals.lcp.toFixed(2)}ms` : 'N/A',
        CLS: vitals.cls ? vitals.cls.toFixed(3) : 'N/A',
      });

      // Blog should have good loading performance
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(2500);
      }

      if (vitals.cls !== null) {
        expect(vitals.cls).toBeLessThan(0.1);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test.use({
      ...test.use,
      viewport: { width: 375, height: 667 }, // iPhone SE size
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    });

    test('should meet Core Web Vitals on mobile', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForLoadState('load');

      // Collect Web Vitals
      const vitals: any = await getWebVitals(page);

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📱 Core Web Vitals - Mobile:', {
        LCP: vitals.lcp ? `${vitals.lcp.toFixed(2)}ms` : 'N/A',
        CLS: vitals.cls ? vitals.cls.toFixed(3) : 'N/A',
      });

      // Mobile targets (slightly more lenient)
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(3000); // 3s for mobile
      }

      if (vitals.cls !== null) {
        expect(vitals.cls).toBeLessThan(0.15); // Slightly higher for mobile
      }
    });
  });

  test.describe('Bundle Size & Resource Performance', () => {
    test('should have reasonable bundle sizes', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Get JavaScript bundle sizes
      const bundles = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries
          .filter((entry: any) => entry.name.includes('.js'))
          .map((entry: any) => ({
            name: entry.name.split('/').pop(),
            size: entry.transferSize || 0,
            duration: entry.duration,
          }));
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('📦 JavaScript Bundles:', bundles);

      // Total JS should be under 500KB (compressed)
      const totalJSSize = bundles.reduce((sum: number, b: any) => sum + b.size, 0);
      expect(totalJSSize).toBeLessThan(500 * 1024);
    });

    test('should load images efficiently', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Get image sizes
      const images = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        return entries
          .filter(
            (entry: any) =>
              entry.name.includes('.jpg') ||
              entry.name.includes('.png') ||
              entry.name.includes('.webp') ||
              entry.name.includes('.svg')
          )
          .map((entry: any) => ({
            name: entry.name.split('/').pop(),
            size: entry.transferSize || 0,
            duration: entry.duration,
          }));
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log('🖼️ Images:', images);

      // Each image should be reasonably sized (under 200KB)
      for (const img of images) {
        if (img.size > 0) {
          expect(img.size).toBeLessThan(200 * 1024);
        }
      }
    });
  });

  test.describe('Performance Budget Monitoring', () => {
    test('should meet overall performance budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForLoadState('load');

      const totalLoadTime = Date.now() - startTime;

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`⏱️ Total page load time: ${totalLoadTime}ms`);

      // Page should load completely within 4 seconds
      expect(totalLoadTime).toBeLessThan(4000);
    });

    test('should have efficient rendering performance', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });

      // Measure long tasks (> 50ms blocks main thread)
      const longTasks = await page.evaluate(() => {
        return new Promise((resolve) => {
          const tasks: any[] = [];

          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                tasks.push({
                  duration: entry.duration,
                  startTime: entry.startTime,
                });
              }
            }).observe({ entryTypes: ['longtask'] });
          } catch (_e) {
            // longtask not supported in all browsers
          }

          setTimeout(() => resolve(tasks), 2000);
        });
      });

      // biome-ignore lint/suspicious/noConsole: Test debugging output
      console.log(`🐌 Long tasks detected: ${longTasks.length}`);

      // Should have minimal long tasks (ideally 0, max 3)
      expect(longTasks.length).toBeLessThanOrEqual(3);
    });
  });
});
