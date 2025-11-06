/**
 * Tests for animation design tokens
 *
 * @module constants/__tests__/animationTokens
 */

import {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  ANIMATION_GESTURES,
  ANIMATION_SPRINGS,
  ANIMATION_STAGGER,
  ANIMATION_TRANSITIONS,
  ANIMATION_VARIANTS,
  getAccessibleAnimation,
  getAccessibleTransition,
} from '../animationTokens';

describe('Animation Tokens', () => {
  describe('ANIMATION_DURATIONS', () => {
    it('should have all duration values', () => {
      expect(ANIMATION_DURATIONS.INSTANT).toBe(0.1);
      expect(ANIMATION_DURATIONS.FAST).toBe(0.2);
      expect(ANIMATION_DURATIONS.NORMAL).toBe(0.3);
      expect(ANIMATION_DURATIONS.SLOW).toBe(0.5);
      expect(ANIMATION_DURATIONS.SLOWER).toBe(0.8);
    });

    it('should have durations in ascending order', () => {
      expect(ANIMATION_DURATIONS.INSTANT).toBeLessThan(ANIMATION_DURATIONS.FAST);
      expect(ANIMATION_DURATIONS.FAST).toBeLessThan(ANIMATION_DURATIONS.NORMAL);
      expect(ANIMATION_DURATIONS.NORMAL).toBeLessThan(ANIMATION_DURATIONS.SLOW);
      expect(ANIMATION_DURATIONS.SLOW).toBeLessThan(ANIMATION_DURATIONS.SLOWER);
    });
  });

  describe('ANIMATION_EASINGS', () => {
    it('should have all easing curves', () => {
      expect(ANIMATION_EASINGS.DEFAULT).toEqual([0.4, 0, 0.2, 1]);
      expect(ANIMATION_EASINGS.SMOOTH).toEqual([0.4, 0, 0.6, 1]);
      expect(ANIMATION_EASINGS.SHARP).toEqual([0.4, 0, 1, 1]);
      expect(ANIMATION_EASINGS.EASE_OUT).toEqual([0, 0, 0.2, 1]);
      expect(ANIMATION_EASINGS.EASE_IN).toEqual([0.4, 0, 1, 1]);
    });

    it('should have valid cubic-bezier values', () => {
      Object.values(ANIMATION_EASINGS).forEach((easing) => {
        expect(easing).toHaveLength(4);
        easing.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('ANIMATION_SPRINGS', () => {
    it('should have spring configurations', () => {
      expect(ANIMATION_SPRINGS.DEFAULT).toEqual({
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
      expect(ANIMATION_SPRINGS.GENTLE).toEqual({
        type: 'spring',
        stiffness: 200,
        damping: 25,
      });
      expect(ANIMATION_SPRINGS.BOUNCY).toEqual({
        type: 'spring',
        stiffness: 400,
        damping: 10,
      });
      expect(ANIMATION_SPRINGS.STIFF).toEqual({
        type: 'spring',
        stiffness: 500,
        damping: 40,
      });
    });

    it('should have valid spring values', () => {
      Object.values(ANIMATION_SPRINGS).forEach((spring) => {
        expect(spring.type).toBe('spring');
        expect(spring.stiffness).toBeGreaterThan(0);
        expect(spring.damping).toBeGreaterThan(0);
      });
    });
  });

  describe('ANIMATION_VARIANTS', () => {
    it('should have all variant types', () => {
      expect(ANIMATION_VARIANTS.fadeIn).toBeDefined();
      expect(ANIMATION_VARIANTS.fadeInUp).toBeDefined();
      expect(ANIMATION_VARIANTS.fadeInDown).toBeDefined();
      expect(ANIMATION_VARIANTS.scaleIn).toBeDefined();
      expect(ANIMATION_VARIANTS.slideInLeft).toBeDefined();
      expect(ANIMATION_VARIANTS.slideInRight).toBeDefined();
      expect(ANIMATION_VARIANTS.popIn).toBeDefined();
    });

    it('should have initial, animate, and exit states', () => {
      Object.values(ANIMATION_VARIANTS).forEach((variant) => {
        expect(variant.initial).toBeDefined();
        expect(variant.animate).toBeDefined();
        expect(variant.exit).toBeDefined();
      });
    });

    it('fadeIn should only animate opacity', () => {
      const { fadeIn } = ANIMATION_VARIANTS;
      expect(fadeIn.initial).toEqual({ opacity: 0 });
      expect(fadeIn.animate).toEqual({ opacity: 1 });
      expect(fadeIn.exit).toEqual({ opacity: 0 });
    });

    it('fadeInUp should animate opacity and y', () => {
      const { fadeInUp } = ANIMATION_VARIANTS;
      expect(fadeInUp.initial).toEqual({ opacity: 0, y: 20 });
      expect(fadeInUp.animate).toEqual({ opacity: 1, y: 0 });
      expect(fadeInUp.exit).toEqual({ opacity: 0, y: -20 });
    });

    it('scaleIn should animate opacity and scale', () => {
      const { scaleIn } = ANIMATION_VARIANTS;
      expect(scaleIn.initial).toEqual({ opacity: 0, scale: 0.95 });
      expect(scaleIn.animate).toEqual({ opacity: 1, scale: 1 });
      expect(scaleIn.exit).toEqual({ opacity: 0, scale: 0.95 });
    });
  });

  describe('ANIMATION_GESTURES', () => {
    it('should have hover and tap gestures', () => {
      expect(ANIMATION_GESTURES.hover).toBeDefined();
      expect(ANIMATION_GESTURES.hoverGentle).toBeDefined();
      expect(ANIMATION_GESTURES.hoverStrong).toBeDefined();
      expect(ANIMATION_GESTURES.tap).toBeDefined();
      expect(ANIMATION_GESTURES.tapGentle).toBeDefined();
      expect(ANIMATION_GESTURES.tapStrong).toBeDefined();
    });

    it('hover should scale up', () => {
      expect(ANIMATION_GESTURES.hover.scale).toBeGreaterThan(1);
      expect(ANIMATION_GESTURES.hoverGentle.scale).toBeGreaterThan(1);
      expect(ANIMATION_GESTURES.hoverStrong.scale).toBeGreaterThan(1);
    });

    it('tap should scale down', () => {
      expect(ANIMATION_GESTURES.tap.scale).toBeLessThan(1);
      expect(ANIMATION_GESTURES.tapGentle.scale).toBeLessThan(1);
      expect(ANIMATION_GESTURES.tapStrong.scale).toBeLessThan(1);
    });

    it('should have increasing hover intensity', () => {
      expect(ANIMATION_GESTURES.hoverGentle.scale).toBeLessThan(ANIMATION_GESTURES.hover.scale);
      expect(ANIMATION_GESTURES.hover.scale).toBeLessThan(ANIMATION_GESTURES.hoverStrong.scale);
    });
  });

  describe('ANIMATION_TRANSITIONS', () => {
    it('should have standard transitions', () => {
      expect(ANIMATION_TRANSITIONS.default).toBeDefined();
      expect(ANIMATION_TRANSITIONS.fast).toBeDefined();
      expect(ANIMATION_TRANSITIONS.slow).toBeDefined();
      expect(ANIMATION_TRANSITIONS.spring).toBeDefined();
      expect(ANIMATION_TRANSITIONS.layout).toBeDefined();
    });

    it('should have valid transition properties', () => {
      expect(ANIMATION_TRANSITIONS.default.duration).toBe(ANIMATION_DURATIONS.NORMAL);
      expect(ANIMATION_TRANSITIONS.default.ease).toEqual(ANIMATION_EASINGS.DEFAULT);
    });
  });

  describe('ANIMATION_STAGGER', () => {
    it('should have stagger configurations', () => {
      expect(ANIMATION_STAGGER.fast).toBeDefined();
      expect(ANIMATION_STAGGER.normal).toBeDefined();
      expect(ANIMATION_STAGGER.slow).toBeDefined();
    });

    it('should have ascending stagger delays', () => {
      expect(ANIMATION_STAGGER.fast.staggerChildren).toBeLessThan(
        ANIMATION_STAGGER.normal.staggerChildren
      );
      expect(ANIMATION_STAGGER.normal.staggerChildren).toBeLessThan(
        ANIMATION_STAGGER.slow.staggerChildren
      );
    });
  });

  describe('getAccessibleTransition', () => {
    it('should return zero duration when motion is reduced', () => {
      const transition = ANIMATION_TRANSITIONS.default;
      const result = getAccessibleTransition(true, transition);
      expect(result).toEqual({ duration: 0 });
    });

    it('should return original transition when motion is not reduced', () => {
      const transition = ANIMATION_TRANSITIONS.default;
      const result = getAccessibleTransition(false, transition);
      expect(result).toEqual(transition);
    });

    it('should work with spring transitions', () => {
      const spring = ANIMATION_SPRINGS.DEFAULT;
      const result = getAccessibleTransition(true, spring);
      expect(result).toEqual({ duration: 0 });
    });
  });

  describe('getAccessibleAnimation', () => {
    it('should return empty object when motion is reduced', () => {
      const animation = { opacity: 0, y: 20 };
      const result = getAccessibleAnimation(true, animation);
      expect(result).toEqual({});
    });

    it('should return original animation when motion is not reduced', () => {
      const animation = { opacity: 0, y: 20 };
      const result = getAccessibleAnimation(false, animation);
      expect(result).toEqual(animation);
    });

    it('should work with complex animations', () => {
      const animation = {
        opacity: 0,
        scale: 0.95,
        x: -20,
        transition: { duration: 0.3 },
      };
      const result = getAccessibleAnimation(false, animation);
      expect(result).toEqual(animation);
    });
  });
});
