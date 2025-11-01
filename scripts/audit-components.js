#!/usr/bin/env node
/**
 * Component Audit Script
 *
 * Analyzes src/components directory for:
 * - Usage patterns
 * - Orphaned files
 * - Test coverage
 * - Duplication
 * - Improvement opportunities
 */

const fs = require('node:fs');
const path = require('node:path');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const SRC_DIR = path.join(__dirname, '../src');
const APP_DIR = path.join(__dirname, '../src/app');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

// Get all component files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// Find imports of a component
function findImports(componentPath, searchDirs) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const _relativePath = componentPath.replace(SRC_DIR, '@').replace(/\\/g, '/');
  const imports = [];

  for (const searchDir of searchDirs) {
    const files = getAllFiles(searchDir);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const importPatterns = [
        new RegExp(`from ['"]@/components/.*${componentName}['"]`, 'g'),
        new RegExp(`from ['"]\\.\\..*${componentName}['"]`, 'g'),
      ];

      for (const pattern of importPatterns) {
        if (pattern.test(content)) {
          imports.push(file.replace(path.join(__dirname, '..'), ''));
        }
      }
    }
  }

  return [...new Set(imports)];
}

// Analyze components
function analyzeComponents() {
  const components = getAllFiles(COMPONENTS_DIR);
  const testFiles = components.filter((f) => f.includes('__tests__'));
  const sourceFiles = components.filter((f) => !f.includes('__tests__'));

  log('\n🔍 COMPONENT AUDIT REPORT', 'bold');
  log('='.repeat(80), 'cyan');

  // 1. Overview
  log('\n📊 OVERVIEW', 'bold');
  log(`Total files: ${components.length}`);
  log(`Source files: ${sourceFiles.length}`);
  log(`Test files: ${testFiles.length}`);

  // 2. Component categorization
  const categories = {};
  for (const file of sourceFiles) {
    const category = file.split('/src/components/')[1]?.split('/')[0] || 'root';
    categories[category] = (categories[category] || 0) + 1;
  }

  log('\n📁 BY CATEGORY', 'bold');
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a);
  for (const [cat, count] of sortedCategories) {
    log(`  ${cat.padEnd(15)} ${count.toString().padStart(3)} files`);
  }

  // 3. Find unused components
  log('\n🔍 USAGE ANALYSIS', 'bold');
  log('Analyzing imports across codebase...\n');

  const usage = {};
  for (const file of sourceFiles) {
    const imports = findImports(file, [SRC_DIR, APP_DIR]);
    const fileName = path.basename(file);
    usage[fileName] = {
      path: file.replace(path.join(__dirname, '..'), ''),
      imports: imports.length,
      importedBy: imports,
    };
  }

  // Unused components
  const unused = Object.entries(usage).filter(([, data]) => data.imports === 0);
  if (unused.length > 0) {
    log(`❌ POTENTIALLY UNUSED (${unused.length} files):`, 'red');
    for (const [name, data] of unused) {
      log(`  • ${name.padEnd(35)} ${data.path}`, 'red');
    }
  } else {
    log('✅ All components are used!', 'green');
  }

  // Highly used components
  const highlyUsed = Object.entries(usage)
    .filter(([, data]) => data.imports >= 5)
    .sort(([, a], [, b]) => b.imports - a.imports);

  if (highlyUsed.length > 0) {
    log(`\n⭐ HIGHLY USED (${highlyUsed.length} components with 5+ imports):`, 'green');
    for (const [name, data] of highlyUsed) {
      log(`  • ${name.padEnd(35)} ${String(data.imports).padStart(2)} imports`);
    }
  }

  // 4. Test coverage
  log('\n🧪 TEST COVERAGE', 'bold');
  const testedComponents = new Set(
    testFiles.map((f) => {
      const testName = path.basename(f).replace('.test.tsx', '').replace('.test.ts', '');
      return testName;
    })
  );

  const untestedSource = sourceFiles.filter((f) => {
    const name = path.basename(f, path.extname(f));
    return !(testedComponents.has(name) || f.includes('/ui/'));
  });

  log(`Total test files: ${testFiles.length}`);
  log(`Source files without tests: ${untestedSource.length}`);

  if (untestedSource.length > 0) {
    log('\n⚠️  FILES WITHOUT TESTS:', 'yellow');
    for (const f of untestedSource) {
      const rel = f.replace(COMPONENTS_DIR, '');
      log(`  • ${rel}`, 'yellow');
    }
  }

  // 5. UI component usage
  log('\n🎨 SHADCN UI COMPONENTS', 'bold');
  const uiComponents = sourceFiles.filter((f) => f.includes('/ui/'));
  log(`Total UI components: ${uiComponents.length}`);

  const uiUsage = {};
  for (const file of uiComponents) {
    const name = path.basename(file, path.extname(file));
    const imports = findImports(file, [SRC_DIR, APP_DIR]);
    uiUsage[name] = imports.length;
  }

  log('\nUI Component Usage:');
  const sortedUiUsage = Object.entries(uiUsage).sort(([, a], [, b]) => b - a);
  for (const [name, count] of sortedUiUsage) {
    const indicator = count === 0 ? '❌' : count < 3 ? '⚠️ ' : '✅';
    log(`  ${indicator} ${name.padEnd(25)} ${String(count).padStart(2)} imports`);
  }

  log(`\n${'='.repeat(80)}`, 'cyan');
  log('✅ Audit complete!\n', 'green');
}

// Run the audit
try {
  analyzeComponents();
} catch (error) {
  log(`\n❌ Error running audit: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}
