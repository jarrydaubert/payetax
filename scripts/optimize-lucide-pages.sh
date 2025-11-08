#!/bin/bash
# scripts/optimize-lucide-pages.sh
# Generates optimized Lucide imports for heavy pages

echo "=== About Page (16 icons) ==="
node -e "
const icons = ['AlertTriangle', 'ArrowLeftRight', 'Award', 'Calculator', 'Code', 'Eye', 'Heart', 'Lightbulb', 'Lock', 'Palette', 'Rocket', 'Shield', 'Sparkles', 'Target', 'Zap'];
const toKebab = (s) => s.replace(/([a-z])([A-Z])/g, '\$1-\$2').toLowerCase();
console.log('// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)');
console.log('// About page: 15 icons');
icons.forEach(icon => console.log(\`import \${icon} from 'lucide-react/dist/esm/icons/\${toKebab(icon)}.js';\`));
"

echo ""
echo "=== Privacy Page (14 icons) ==="
node -e "
const icons = ['Calendar', 'CheckCircle', 'Cookie', 'Database', 'Eye', 'FileText', 'Globe', 'Lock', 'Server', 'Shield', 'UserX', 'X'];
const toKebab = (s) => s.replace(/([a-z])([A-Z])/g, '\$1-\$2').toLowerCase();
console.log('// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)');
console.log('// Privacy page: 12 icons');
icons.forEach(icon => console.log(\`import \${icon} from 'lucide-react/dist/esm/icons/\${toKebab(icon)}.js';\`));
"

echo ""
echo "=== Compliance Page (9 icons) ==="
node -e "
const icons = ['AlertTriangle', 'Award', 'Calendar', 'CheckCircle', 'ExternalLink', 'FileText', 'Shield', 'Sparkles', 'Users'];
const toKebab = (s) => s.replace(/([a-z])([A-Z])/g, '\$1-\$2').toLowerCase();
console.log('// Optimized Lucide imports (bypasses Turbopack tree-shaking issue)');
console.log('// Compliance page: 9 icons');
icons.forEach(icon => console.log(\`import \${icon} from 'lucide-react/dist/esm/icons/\${toKebab(icon)}.js';\`));
"
