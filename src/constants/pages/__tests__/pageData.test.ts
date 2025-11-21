/**
 * Page Data Constants Tests
 * Coverage Audit - PAYTAX-160
 *
 * Tests for static page data exports:
 * - aboutPageData.ts
 * - privacyPageData.ts
 * - compliancePageData.ts
 *
 * These files export static data that's validated with Zod `satisfies` at compile time.
 * Runtime tests ensure the data structures are valid and exports are correct.
 */

// Mock lucide-react ESM icons to avoid transformation issues
jest.mock('lucide-react/dist/esm/icons/alert-triangle.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/arrow-left-right.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/award.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/calculator.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/calendar.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/check-circle.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/code.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/database.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/eye.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/file-text.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/globe.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/heart.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/lightbulb.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/lock.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/palette.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/rocket.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/shield.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/sparkles.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/target.js', () => ({ default: () => null }));
jest.mock('lucide-react/dist/esm/icons/zap.js', () => ({ default: () => null }));

import {
  ABOUT_STATS,
  ABOUT_TECH_STACK,
  ABOUT_UNIQUE_FEATURES,
  ABOUT_VALUES,
} from '../aboutPageData';
import {
  COMPLIANCE_FEATURES,
  COMPLIANCE_STATEMENTS,
  complianceStats,
  DATA_SOURCES,
} from '../compliancePageData';
import {
  PRIVACY_DATA_FLOW,
  PRIVACY_DO_DO,
  PRIVACY_DONT_DO,
  PRIVACY_PRINCIPLES,
} from '../privacyPageData';

describe('aboutPageData', () => {
  describe('ABOUT_STATS', () => {
    it('should export an array of stats', () => {
      expect(Array.isArray(ABOUT_STATS)).toBe(true);
      expect(ABOUT_STATS.length).toBeGreaterThan(0);
    });

    it('should have required stat properties', () => {
      for (const stat of ABOUT_STATS) {
        expect(stat).toHaveProperty('icon');
        expect(stat).toHaveProperty('value');
        expect(stat).toHaveProperty('label');
        expect(stat).toHaveProperty('color');
      }
    });

    it('should have correct stat values', () => {
      expect(ABOUT_STATS).toContainEqual(
        expect.objectContaining({ value: '100%', label: 'Free Forever' })
      );
      expect(ABOUT_STATS).toContainEqual(
        expect.objectContaining({ value: '0', label: 'Data Stored' })
      );
    });
  });

  describe('ABOUT_VALUES', () => {
    it('should export an array of values', () => {
      expect(Array.isArray(ABOUT_VALUES)).toBe(true);
      expect(ABOUT_VALUES.length).toBeGreaterThan(0);
    });

    it('should have required properties', () => {
      for (const value of ABOUT_VALUES) {
        expect(value).toHaveProperty('icon');
        expect(value).toHaveProperty('title');
        expect(value).toHaveProperty('description');
      }
    });
  });

  describe('ABOUT_UNIQUE_FEATURES', () => {
    it('should export an array of features', () => {
      expect(Array.isArray(ABOUT_UNIQUE_FEATURES)).toBe(true);
      expect(ABOUT_UNIQUE_FEATURES.length).toBeGreaterThan(0);
    });

    it('should have feature properties', () => {
      for (const feature of ABOUT_UNIQUE_FEATURES) {
        expect(feature).toHaveProperty('icon');
        expect(feature).toHaveProperty('title');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('gradient');
      }
    });
  });

  describe('ABOUT_TECH_STACK', () => {
    it('should export an array of tech stack items', () => {
      expect(Array.isArray(ABOUT_TECH_STACK)).toBe(true);
      expect(ABOUT_TECH_STACK.length).toBeGreaterThan(0);
    });

    it('should have tech stack properties', () => {
      for (const tech of ABOUT_TECH_STACK) {
        expect(tech).toHaveProperty('icon');
        expect(tech).toHaveProperty('title');
        expect(tech).toHaveProperty('description');
      }
    });
  });
});

describe('privacyPageData', () => {
  describe('PRIVACY_PRINCIPLES', () => {
    it('should export an array of principles', () => {
      expect(Array.isArray(PRIVACY_PRINCIPLES)).toBe(true);
      expect(PRIVACY_PRINCIPLES.length).toBeGreaterThan(0);
    });

    it('should have principle properties', () => {
      for (const principle of PRIVACY_PRINCIPLES) {
        expect(principle).toHaveProperty('icon');
        expect(principle).toHaveProperty('title');
        expect(principle).toHaveProperty('description');
        expect(principle).toHaveProperty('gradient');
      }
    });
  });

  describe('PRIVACY_DATA_FLOW', () => {
    it('should export an array of data flow cards', () => {
      expect(Array.isArray(PRIVACY_DATA_FLOW)).toBe(true);
      expect(PRIVACY_DATA_FLOW.length).toBeGreaterThan(0);
    });

    it('should have card properties', () => {
      for (const card of PRIVACY_DATA_FLOW) {
        expect(card).toHaveProperty('icon');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('description');
      }
    });
  });

  describe('PRIVACY_DO_DO', () => {
    it('should export an array of things we do', () => {
      expect(Array.isArray(PRIVACY_DO_DO)).toBe(true);
      expect(PRIVACY_DO_DO.length).toBeGreaterThan(0);
    });

    it('should have string items', () => {
      for (const item of PRIVACY_DO_DO) {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PRIVACY_DONT_DO', () => {
    it('should export an array of things we do not do', () => {
      expect(Array.isArray(PRIVACY_DONT_DO)).toBe(true);
      expect(PRIVACY_DONT_DO.length).toBeGreaterThan(0);
    });

    it('should have string items', () => {
      for (const item of PRIVACY_DONT_DO) {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('compliancePageData', () => {
  describe('COMPLIANCE_FEATURES', () => {
    it('should export an array of features', () => {
      expect(Array.isArray(COMPLIANCE_FEATURES)).toBe(true);
      expect(COMPLIANCE_FEATURES.length).toBeGreaterThan(0);
    });

    it('should have compliance feature properties', () => {
      for (const feature of COMPLIANCE_FEATURES) {
        expect(feature).toHaveProperty('title');
        expect(feature).toHaveProperty('description');
        expect(feature).toHaveProperty('details');
        expect(feature).toHaveProperty('icon');
        expect(feature).toHaveProperty('lastUpdated');
        expect(feature).toHaveProperty('source');
        expect(feature).toHaveProperty('color');
      }
    });

    it('should have valid details arrays', () => {
      for (const feature of COMPLIANCE_FEATURES) {
        expect(Array.isArray(feature.details)).toBe(true);
        expect(feature.details.length).toBeGreaterThan(0);
      }
    });
  });

  describe('COMPLIANCE_STATEMENTS', () => {
    it('should export an array of statements', () => {
      expect(Array.isArray(COMPLIANCE_STATEMENTS)).toBe(true);
      expect(COMPLIANCE_STATEMENTS.length).toBeGreaterThan(0);
    });

    it('should have statement properties', () => {
      for (const statement of COMPLIANCE_STATEMENTS) {
        expect(statement).toHaveProperty('category');
        expect(statement).toHaveProperty('statement');
        expect(statement).toHaveProperty('verification');
        expect(statement).toHaveProperty('lastVerified');
      }
    });
  });

  describe('DATA_SOURCES', () => {
    it('should export an array of data sources', () => {
      expect(Array.isArray(DATA_SOURCES)).toBe(true);
      expect(DATA_SOURCES.length).toBeGreaterThan(0);
    });

    it('should have data source properties', () => {
      for (const source of DATA_SOURCES) {
        expect(source).toHaveProperty('source');
        expect(source).toHaveProperty('description');
        expect(source).toHaveProperty('url');
      }
    });

    it('should have valid URLs', () => {
      for (const source of DATA_SOURCES) {
        expect(source.url).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('complianceStats', () => {
    it('should export an array of stats', () => {
      expect(Array.isArray(complianceStats)).toBe(true);
      expect(complianceStats.length).toBeGreaterThan(0);
    });

    it('should have stat properties', () => {
      for (const stat of complianceStats) {
        expect(stat).toHaveProperty('icon');
        expect(stat).toHaveProperty('value');
        expect(stat).toHaveProperty('label');
        expect(stat).toHaveProperty('color');
      }
    });
  });
});
