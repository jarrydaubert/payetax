# Animation Guide

**Last Updated:** 2025-11-07  
**Status:** Complete  
**Reference:** PAYTAX-75 Framer Motion 12.23.24 Maximization

---

## 🎯 Animation Philosophy

**PayeTax uses a hybrid approach: CSS for simple, Framer Motion for complex.**

### When to Use CSS
- ✅ Simple hover states (`hover:underline`)
- ✅ Focus rings
- ✅ Loading spinners (pulse)
- ✅ Basic transitions

### When to Use Framer Motion
- ✅ State-driven animations (mount/unmount)
- ✅ Stagger animations (sequential reveals)
- ✅ Gestures (hover/tap with physics)
- ✅ Layout animations (smooth position changes)
- ✅ Scroll-driven effects
- ✅ Complex choreography

---

## 📦 Animation Tokens

All animations use centralized tokens from `/src/constants/animationTokens.ts`

### Durations
```typescript
import { ANIMATION_DURATIONS } from '@/constants/animationTokens';

ANIMATION_DURATIONS.INSTANT  // 0.1s - micro-interactions
ANIMATION_DURATIONS.FAST      // 0.2s - button feedback
ANIMATION_DURATIONS.NORMAL    // 0.3s - most UI transitions
ANIMATION_DURATIONS.SLOW      // 0.5s - large elements
ANIMATION_DURATIONS.SLOWER    // 0.8s - emphasis
```

### Easings
```typescript
import { ANIMATION_EASINGS } from '@/constants/animationTokens';

ANIMATION_EASINGS.DEFAULT     // [0.4, 0, 0.2, 1] - balanced
ANIMATION_EASINGS.SMOOTH      // [0.4, 0, 0.6, 1] - gentle
ANIMATION_EASINGS.SHARP       // [0.4, 0, 1, 1] - quick exit
ANIMATION_EASINGS.EASE_OUT    // [0, 0, 0.2, 1] - starts fast
ANIMATION_EASINGS.EASE_IN     // [0.4, 0, 1, 1] - ends fast
```

### Springs
```typescript
import { ANIMATION_SPRINGS } from '@/constants/animationTokens';

ANIMATION_SPRINGS.DEFAULT     // stiffness: 300, damping: 30
ANIMATION_SPRINGS.GENTLE      // stiffness: 200, damping: 25
ANIMATION_SPRINGS.BOUNCY      // stiffness: 400, damping: 10
ANIMATION_SPRINGS.STIFF       // stiffness: 500, damping: 40
```

---

## 🎨 Common Patterns

### 1. Fade In/Up (Cards, Sections)
```typescript
import { motion } from 'framer-motion';
import { ANIMATION_VARIANTS, ANIMATION_TRANSITIONS } from '@/constants/animationTokens';
import { useMotionPreference } from '@/hooks/useMotionPreference';

function MyCard() {
  const shouldReduceMotion = useMotionPreference();

  return (
    <motion.div
      initial='initial'
      animate='animate'
      variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}
      transition={ANIMATION_TRANSITIONS.default}
    >
      {/* content */}
    </motion.div>
  );
}
```

### 2. Stagger Animation (Card Groups)
```typescript
import { ANIMATION_CONTAINER_VARIANTS, ANIMATION_VARIANTS } from '@/constants/animationTokens';

function CardList() {
  const shouldReduceMotion = useMotionPreference();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : ANIMATION_CONTAINER_VARIANTS.staggerNormal}
      initial='hidden'
      animate='show'
    >
      {items.map(item => (
        <motion.div
          key={item.id}
          variants={shouldReduceMotion ? undefined : ANIMATION_VARIANTS.fadeInUp}
        >
          <Card {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 3. Hover/Tap Gestures (Interactive Elements)
```typescript
import { ANIMATION_GESTURES } from '@/constants/animationTokens';
import { useIsMobile } from '@/hooks/useMediaQuery';

function InteractiveCard() {
  const shouldReduceMotion = useMotionPreference();
  const isMobile = useIsMobile();

  const gestureProps = shouldReduceMotion
    ? {}
    : {
        whileHover: isMobile ? ANIMATION_GESTURES.hoverGentle : ANIMATION_GESTURES.hover,
        whileTap: ANIMATION_GESTURES.tapGentle,
      };

  return (
    <motion.div {...gestureProps}>
      <Card />
    </motion.div>
  );
}
```

### 4. Layout Animations (Table Rows, Lists)
```typescript
import { ANIMATION_TRANSITIONS } from '@/constants/animationTokens';

function DynamicRow() {
  const shouldReduceMotion = useMotionPreference();
  const MotionRow = shouldReduceMotion ? Row : motion(Row);

  return (
    <MotionRow
      layout={!shouldReduceMotion}
      transition={!shouldReduceMotion ? ANIMATION_TRANSITIONS.layout : undefined}
    >
      {/* cells */}
    </MotionRow>
  );
}
```

### 5. useAnimate() for Imperative Control
```typescript
import { useAnimate } from 'framer-motion';
import { useCallback } from 'react';

function AnimatedButton({ onClick }) {
  const [scope, animate] = useAnimate();

  const handleClick = useCallback(() => {
    // Call onClick immediately (non-blocking)
    if (onClick) {
      onClick();
    }

    // Run animation in background
    if (scope.current) {
      const runAnimation = async () => {
        await animate(scope.current, { scale: 0.95 }, { duration: 0.1 });
        await animate(scope.current, { scale: 1.05 }, { duration: 0.15, type: 'spring' });
        await animate(scope.current, { scale: 1 }, { duration: 0.2, type: 'spring' });
      };
      runAnimation();
    }
  }, [onClick, animate, scope]);

  return (
    <motion.button ref={scope} onClick={handleClick}>
      Click me
    </motion.button>
  );
}
```

### 6. Scroll-Driven Animations
```typescript
import { useScroll, useTransform } from 'framer-motion';

function ParallaxSection() {
  const { scrollY } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <motion.div style={{ y, opacity }}>
      {/* content */}
    </motion.div>
  );
}
```

---

## ♿ Accessibility

### Always Respect prefers-reduced-motion

```typescript
import { useMotionPreference } from '@/hooks/useMotionPreference';

function MyComponent() {
  const shouldReduceMotion = useMotionPreference();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {/* content */}
    </motion.div>
  );
}
```

### Global Animation Disable
Defined in `/src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 📱 Mobile Optimization

### Use Responsive Animation Values

```typescript
import { useIsMobile } from '@/hooks/useMediaQuery';

function ResponsiveCard() {
  const isMobile = useIsMobile();

  return (
    <motion.div
      whileHover={{ scale: isMobile ? 1.02 : 1.05 }}  // Smaller scale on mobile
      whileTap={{ scale: 0.98 }}
    >
      <Card />
    </motion.div>
  );
}
```

### Available Hooks
```typescript
import {
  useMediaQuery,      // Generic: useMediaQuery('(max-width: 768px)')
  useIsMobile,        // <= 768px
  useIsTouch,         // Touch device detection (hover: none)
  useIsSmallMobile,   // <= 640px
} from '@/hooks/useMediaQuery';
```

---

## ⚡ Performance Best Practices

### 1. GPU-Accelerated Properties Only
✅ **Use:** `transform`, `opacity`, `filter`  
❌ **Avoid:** `width`, `height`, `top`, `left`, `margin`, `padding`

```typescript
// ✅ GOOD - GPU accelerated
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// ❌ BAD - Triggers layout/paint
<motion.div animate={{ marginLeft: 100 }} />
```

### 2. Use will-change Sparingly
```css
/* Only add when animating, remove after */
.animating {
  will-change: transform;
}
```

### 3. Lazy Load Heavy Animations
```typescript
const HeavyAnimation = dynamic(() => import('./HeavyAnimation'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### 4. Memoize Animation Props
```typescript
const animationProps = useMemo(
  () => shouldReduceMotion ? {} : {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  [shouldReduceMotion]
);
```

---

## 🎯 Animation Checklist

Before shipping animations:

- [ ] Uses centralized animation tokens
- [ ] Respects `prefers-reduced-motion`
- [ ] Only GPU-accelerated properties
- [ ] Mobile-optimized (smaller scales)
- [ ] Touch targets ≥ 44x44px (WCAG 2.2 AA)
- [ ] No layout thrashing
- [ ] Smooth 60fps on mid-range devices
- [ ] Tested on real devices (iOS, Android)

---

## 📊 Current Implementation Status

| Component | Gestures | Stagger | Layout | useAnimate | useScroll |
|-----------|----------|---------|--------|------------|-----------|
| ResultCard | ✅ | - | - | - | - |
| TaxRateCard | ✅ | - | - | - | - |
| GlowButton | ✅ | - | - | ✅ | - |
| TaxRatesOverview | ✅ | ✅ | - | - | - |
| ResultsSummaryCards | ✅ | ✅ | - | - | - |
| ResultTableRow | - | - | ✅ | - | - |
| SimpleHero | - | - | - | - | ✅ |
| IncomeSourceList | - | ✅ | ✅ | - | - |

---

## 📚 Further Reading

- [Framer Motion Docs](https://www.framer.com/motion/)
- [useAnimate() Guide](https://www.framer.com/motion/use-animate/)
- [Layout Animations](https://www.framer.com/motion/layout-animations/)
- [Scroll Animations](https://www.framer.com/motion/scroll-animations/)
- [WCAG 2.2 Animation Guidelines](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)

---

## 💡 Tips & Tricks

### Debugging Animations
```typescript
// Add to any motion component
<motion.div
  animate={{ opacity: 1 }}
  onAnimationStart={() => console.log('Animation started')}
  onAnimationComplete={() => console.log('Animation complete')}
/>
```

### Chaining Animations
```typescript
const sequence = async () => {
  await animate(ref1, { x: 100 });
  await animate(ref2, { y: 100 });
  await animate(ref3, { scale: 1.5 });
};
```

### AnimatePresence for Exit Animations
```typescript
<AnimatePresence mode='wait'>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

**Happy animating!** 🎨✨
