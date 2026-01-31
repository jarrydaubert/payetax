// scripts/check-color-contrast.js
// Check WCAG color contrast ratios

// Convert OKLCH to RGB (simplified - approximate)
function oklchToRgb(l, _c, _h) {
  // Simplified conversion for contrast checking
  // In production, use a proper color library
  const lightness = l * 255;
  return { r: lightness, g: lightness, b: lightness };
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Test color pairs
const colorTests = {
  lightMode: {
    background: { l: 0.98, c: 0, h: 0 },
    foreground: { l: 0.145, c: 0, h: 0 },
    mutedForeground: { l: 0.45, c: 0, h: 0 }, // FIXED: darkened to 0.45
    primary: { l: 0.205, c: 0, h: 0 },
  },
  darkMode: {
    background: { l: 0.18, c: 0.02, h: 260 },
    foreground: { l: 0.985, c: 0, h: 0 },
    mutedForeground: { l: 0.65, c: 0, h: 0 },
    primary: { l: 0.9, c: 0, h: 0 },
  },
};

for (const [_mode, colors] of Object.entries(colorTests)) {
  const bgRgb = oklchToRgb(colors.background.l, colors.background.c, colors.background.h);
  const fgRgb = oklchToRgb(colors.foreground.l, colors.foreground.c, colors.foreground.h);
  const mutedRgb = oklchToRgb(
    colors.mutedForeground.l,
    colors.mutedForeground.c,
    colors.mutedForeground.h,
  );
  const primaryRgb = oklchToRgb(colors.primary.l, colors.primary.c, colors.primary.h);

  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const mutedLum = getLuminance(mutedRgb.r, mutedRgb.g, mutedRgb.b);
  const primaryLum = getLuminance(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  // Test different opacity levels
  const tests = [
    {
      name: 'Body text (foreground 100%)',
      ratio: getContrastRatio(bgLum, fgLum),
      required: 4.5,
    },
    {
      name: 'Paragraphs (foreground 90%) - FIXED',
      ratio: getContrastRatio(bgLum, fgLum * 0.9 + bgLum * 0.1),
      required: 4.5,
    },
    {
      name: 'Code labels (muted-foreground) - FIXED',
      ratio: getContrastRatio(bgLum, mutedLum),
      required: 4.5,
    },
    {
      name: 'Muted foreground color',
      ratio: getContrastRatio(bgLum, mutedLum),
      required: 4.5,
    },
    {
      name: 'Primary text (links/buttons)',
      ratio: getContrastRatio(bgLum, primaryLum),
      required: 4.5,
    },
    {
      name: 'Headings (large text)',
      ratio: getContrastRatio(bgLum, fgLum),
      required: 3.0,
    },
  ];

  for (const { name, ratio, required } of tests) {
    const passes = ratio >= required;
    const status = passes ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    console.log(`     Ratio: ${ratio.toFixed(2)}:1 (Required: ${required}:1)`);
  }
}
