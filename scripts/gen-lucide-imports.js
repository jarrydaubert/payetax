// scripts/gen-lucide-imports.js
// Quick script to generate optimized Lucide icon imports
// Usage: node scripts/gen-lucide-imports.js

const icons = [
  'ArrowRight',
  'BookOpen',
  'Calendar',
  'Clock',
  'FileText',
  'Search',
  'Sparkles',
  'Star',
  'Tag',
  'TrendingUp',
  'Zap',
];

// Convert PascalCase to kebab-case for Lucide's file structure
const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

console.log('// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)');
console.log(
  icons
    .map((icon) => `import ${icon} from 'lucide-react/dist/esm/icons/${toKebabCase(icon)}.js';`)
    .join('\n')
);
console.log('\n// Total icons:', icons.length);
console.log('// Estimated bundle reduction: ~', (icons.length * 1.5).toFixed(1), 'KB vs full lib');
