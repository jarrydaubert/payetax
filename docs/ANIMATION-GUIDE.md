# Animation Guide

**Last Updated:** November 6, 2025  
**Status:** Production Ready

---

## Overview

This guide provides best practices and patterns for using animations in PayeTax. All animations use **Framer Motion** with centralized design tokens for consistency and maintainability.

---

## Quick Reference

### Animation Tokens Location
```typescript
import {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  ANIMATION_VARIANTS,
  ANIMATION_TRANSITIONS,
  ANIMATION_GESTURES,
  ANIMATION_STAGGER,
  getAccessibleAnimation,
  getAccessibleTransition,
} from '@/constants/animationTokens';

import { useMotionPreference } from '@/hooks/useMotionPreference';
```

---

## Core Principles

### 1. **Accessibility First** ⚠️ MANDATORY

**ALWAYS respect user motion preferences:**

```typescript
import { useMotionPreference } from '@/hooks/useMotionPreference';

function MyComponent() {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0 }}
      animate={shouldReduceMotion ? {} : { opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
    >
      {content}
    </motion.div>
  );
}
```

**Why:** WCAG 2.2 Level AAA requires respecting `prefers-reduced-motion`. Users with vestibular disorders can experience nausea from animations.

---

### 2. **Use Design Tokens** 📚

**DON'T:** Inline magic numbers
```typescript
// ❌ BAD - Hard to maintain, inconsistent
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
/>
```

**DO:** Use centralized tokens
```typescript
// ✅ GOOD - Consistent, maintainable
<motion.div
  variants={ANIMATION_VARIANTS.fadeInUp}
  initial="initial"
  animate="animate"
  transition={ANIMATION_TRANSITIONS.default}
/>
```

---

### 3. **Hardware Acceleration** ⚡

**DO:** Animate `transform` and `opacity`
```typescript
// ✅ GOOD - GPU accelerated
{ opacity: 0, scale: 0.95, x: -20, y: 20 }
```

**DON'T:** Animate layout properties
```typescript
// ❌ BAD - Causes layout thrashing, janky
{ width: '100px', height: '200px', top: 0, left: 0 }
```

**For layout changes, use the `layout` prop:**
```typescript
// ✅ GOOD - FLIP animation (GPU accelerated)
<motion.div layout>
  {content}
</motion.div>
```

---

## Common Patterns

### Pattern 1: Basic Fade In

```typescript
import { ANIMATION_VARIANTS, ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';

function FadeInComponent() {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.div
      variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeIn}
      initial={shouldReduceMotion ? {} : "initial"}
      animate={shouldReduceMotion ? {} : "animate"}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
    >
      {content}
    </motion.div>
  );
}
```

---

### Pattern 2: Scroll-Triggered Reveal

```typescript
function ScrollRevealComponent() {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? {} : "initial"}
      whileInView={shouldReduceMotion ? {} : "animate"}
      viewport={{ once: true, margin: '-50px' }}
      variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInUp}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
    >
      {content}
    </motion.div>
  );
}
```

---

### Pattern 3: Staggered Children

```typescript
function StaggeredList() {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.ul
      variants={{
        visible: {
          transition: shouldReduceMotion ? {} : ANIMATION_STAGGER.normal,
        },
      }}
      initial={shouldReduceMotion ? {} : "hidden"}
      animate={shouldReduceMotion ? {} : "visible"}
    >
      {items.map((item) => (
        <motion.li
          key={item.id}
          variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInUp}
        >
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

---

### Pattern 4: Enter/Exit Animations

```typescript
import { AnimatePresence } from 'framer-motion';

function ConditionalComponent({ show }) {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="content"
          variants={shouldReduceMotion ? {} : ANIMATION_VARIANTS.fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.default}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### Pattern 5: Layout Animations

```typescript
function LayoutAnimationComponent({ isExpanded }) {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.div
      layout={!shouldReduceMotion}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.spring}
      className={isExpanded ? 'h-auto' : 'h-0'}
    >
      {content}
    </motion.div>
  );
}
```

---

### Pattern 6: Hover/Tap Gestures

```typescript
function InteractiveButton() {
  const shouldReduceMotion = useMotionPreference();
  
  return (
    <motion.button
      whileHover={shouldReduceMotion ? {} : ANIMATION_GESTURES.hover}
      whileTap={shouldReduceMotion ? {} : ANIMATION_GESTURES.tap}
    >
      Click Me
    </motion.button>
  );
}
```

---

### Pattern 7: Parallax Scroll

```typescript
import { useScroll, useTransform } from 'framer-motion';

function ParallaxComponent() {
  const shouldReduceMotion = useMotionPreference();
  const ref = useRef(null);
  
  const { scrollY } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : -50]);
  
  return (
    <motion.div ref={ref} style={shouldReduceMotion ? {} : { y }}>
      {content}
    </motion.div>
  );
}
```

---

## Animation Tokens Reference

### Durations

```typescript
ANIMATION_DURATIONS.INSTANT  // 0.1s - Micro-interactions
ANIMATION_DURATIONS.FAST     // 0.2s - Button feedback
ANIMATION_DURATIONS.NORMAL   // 0.3s - Most UI transitions
ANIMATION_DURATIONS.SLOW     // 0.5s - Large elements
ANIMATION_DURATIONS.SLOWER   // 0.8s - Emphasis effects
```

### Easings

```typescript
ANIMATION_EASINGS.DEFAULT    // [0.4, 0, 0.2, 1] - Material Design standard
ANIMATION_EASINGS.SMOOTH     // [0.4, 0, 0.6, 1] - Gentle deceleration
ANIMATION_EASINGS.SHARP      // [0.4, 0, 1, 1] - Quick exit
ANIMATION_EASINGS.EASE_OUT   // [0, 0, 0.2, 1] - Starts fast
ANIMATION_EASINGS.EASE_IN    // [0.4, 0, 1, 1] - Ends fast
```

### Variants

```typescript
ANIMATION_VARIANTS.fadeIn         // Simple opacity fade
ANIMATION_VARIANTS.fadeInUp       // Fade + slide up
ANIMATION_VARIANTS.fadeInDown     // Fade + slide down
ANIMATION_VARIANTS.scaleIn        // Fade + scale
ANIMATION_VARIANTS.slideInLeft    // Slide from left
ANIMATION_VARIANTS.slideInRight   // Slide from right
ANIMATION_VARIANTS.popIn          // Scale + bounce
```

### Gestures

```typescript
ANIMATION_GESTURES.hover          // scale: 1.05
ANIMATION_GESTURES.hoverGentle    // scale: 1.02
ANIMATION_GESTURES.hoverStrong    // scale: 1.1
ANIMATION_GESTURES.tap            // scale: 0.95
ANIMATION_GESTURES.tapGentle      // scale: 0.98
ANIMATION_GESTURES.tapStrong      // scale: 0.9
```

---

## Performance Guidelines

### ✅ DO

1. **Use GPU-accelerated properties**
   - `transform` (translate, scale, rotate)
   - `opacity`
   - `filter` (blur, etc.)

2. **Use `will-change` sparingly**
   ```typescript
   <motion.div style={{ willChange: 'transform' }}>
   ```

3. **Optimize viewport observers**
   ```typescript
   viewport={{ once: true, margin: '-50px' }}
   ```

4. **Keep animations under 500ms**
   - Users perceive animations over 500ms as "slow"
   - Prefer ANIMATION_DURATIONS.NORMAL (300ms)

### ❌ DON'T

1. **Animate layout properties**
   - `width`, `height`, `top`, `left`, `right`, `bottom`
   - Use `layout` prop instead

2. **Animate many elements simultaneously**
   - Limit to 10-20 animated elements on screen
   - Use stagger delays to spread out work

3. **Use heavy filters excessively**
   - `blur()`, `drop-shadow()` can be expensive
   - Profile with Chrome DevTools Performance

---

## Testing Animations

### Manual Testing Checklist

- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Test on low-end devices (CPU throttling 4x)
- [ ] Verify 60 FPS in Chrome DevTools Performance
- [ ] Test keyboard navigation during animations
- [ ] Verify screen reader compatibility

### Performance Testing

```bash
# Run Lighthouse performance audit
npm run lighthouse

# Check bundle size impact
npm run bundle:analyze
```

---

## Common Mistakes

### ❌ Mistake 1: Forgetting Accessibility

```typescript
// BAD - No reduced motion support
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
/>
```

**Fix:** Always use `useMotionPreference()`

---

### ❌ Mistake 2: Animating Layout Properties

```typescript
// BAD - Causes layout thrashing
<motion.div
  animate={{ height: isOpen ? '200px' : '0px' }}
/>
```

**Fix:** Use `layout` prop
```typescript
// GOOD - GPU accelerated FLIP animation
<motion.div
  layout
  className={isOpen ? 'h-[200px]' : 'h-0'}
/>
```

---

### ❌ Mistake 3: Inconsistent Timing

```typescript
// BAD - Magic numbers everywhere
transition={{ duration: 0.3 }}
transition={{ duration: 0.25 }}
transition={{ duration: 0.4 }}
```

**Fix:** Use `ANIMATION_DURATIONS` or `ANIMATION_TRANSITIONS`

---

### ❌ Mistake 4: Too Many Animations

```typescript
// BAD - Overwhelming, distracting
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: 180 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
  />
))}
```

**Fix:** Keep it simple, use stagger delays
```typescript
// GOOD - Clean, professional
{items.map((item) => (
  <motion.div variants={ANIMATION_VARIANTS.fadeInUp} />
))}
```

---

## When NOT to Animate

**Skip animations for:**
- Critical content (hero headlines, CTAs)
- Large images (LCP optimization)
- Frequently toggled elements (tabs, dropdowns)
- Loading states (keep instant for perceived speed)

---

## Debugging Tips

### Chrome DevTools Performance Panel

1. Open DevTools → Performance
2. Start recording
3. Trigger animation
4. Stop recording
5. Look for:
   - Layout shifts (red bars)
   - Long frames (> 16ms)
   - Forced reflows

### Common Issues

**Problem:** Janky animations
- **Cause:** Animating layout properties
- **Fix:** Use `transform` or `layout` prop

**Problem:** Animations not firing
- **Cause:** Missing `key` prop in `AnimatePresence`
- **Fix:** Add unique `key` to each child

**Problem:** Memory leaks
- **Cause:** Not cleaning up scroll listeners
- **Fix:** Framer Motion handles this automatically

---

## Examples from PayeTax

### ResultCard (Scroll Reveal)
```typescript
// src/components/molecules/ResultCard.tsx
<motion.div
  initial={shouldReduceMotion ? {} : 'initial'}
  whileInView={shouldReduceMotion ? {} : 'animate'}
  viewport={{ once: true, margin: '-50px' }}
  variants={ANIMATION_VARIANTS.fadeInUp}
  transition={{ ...ANIMATION_TRANSITIONS.default, delay }}
>
  <ResultCardContent />
</motion.div>
```

### SimpleHero (Parallax)
```typescript
// src/components/molecules/SimpleHero.tsx
const { scrollY } = useScroll({ target: ref });
const y = useTransform(scrollY, [0, 500], [0, shouldReduceMotion ? 0 : -50]);

<motion.div style={shouldReduceMotion ? {} : { y }}>
  <HeroContent />
</motion.div>
```

### IncomeSourceList (Enter/Exit)
```typescript
// src/components/organisms/IncomeSourceList.tsx
<AnimatePresence mode='popLayout'>
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
      exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
      transition={shouldReduceMotion ? { duration: 0 } : ANIMATION_TRANSITIONS.spring}
    >
      <ItemContent />
    </motion.div>
  ))}
</AnimatePresence>
```

---

## Resources

### Official Documentation
- [Framer Motion Docs](https://motion.dev/)
- [Animation Tokens Source](/src/constants/animationTokens.ts)
- [Motion Preference Hook](/src/hooks/useMotionPreference.ts)

### Internal Documentation
- [Framer Motion Audit](/docs/FRAMER-MOTION-AUDIT.md)
- [Design Tokens](/src/constants/designTokens.ts)

### Performance
- [Web Animations Performance](https://web.dev/animations-guide/)
- [WCAG 2.2 Motion Guidelines](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

---

## Questions?

For questions about animations:
1. Check this guide first
2. Review existing examples in PayeTax
3. Consult the Framer Motion audit document
4. Create a Linear issue with tag `animation`

---

**Last Updated:** November 6, 2025  
**Maintained by:** PayeTax Development Team
