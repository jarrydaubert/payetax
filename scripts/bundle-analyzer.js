#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const BUNDLE_HISTORY_FILE = path.join(__dirname, '..', 'bundle-history.json');
const NEXT_BUILD_DIR = path.join(__dirname, '..', '.next');

// Bundle size thresholds (in bytes)
const BUNDLE_THRESHOLDS = {
  totalSize: 512 * 1024, // 512KB
  firstLoadJS: 250 * 1024, // 250KB
  individualChunk: 100 * 1024, // 100KB
  maxGzipSize: 150 * 1024, // 150KB gzipped
};

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function loadBundleHistory() {
  try {
    if (fs.existsSync(BUNDLE_HISTORY_FILE)) {
      const data = fs.readFileSync(BUNDLE_HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load bundle history:', error.message);
  }
  return { measurements: [] };
}

function saveBundleHistory(history) {
  try {
    fs.writeFileSync(BUNDLE_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('❌ Failed to save bundle history:', error.message);
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function analyzeBundleSize() {
  const buildManifestPath = path.join(NEXT_BUILD_DIR, 'build-manifest.json');
  const _appBuildManifestPath = path.join(NEXT_BUILD_DIR, 'app-build-manifest.json');

  if (!fs.existsSync(buildManifestPath)) {
    throw new Error('Build manifest not found. Run `npm run build` first.');
  }

  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));

  // Analyze static chunks
  const staticDir = path.join(NEXT_BUILD_DIR, 'static');
  const chunksDir = path.join(staticDir, 'chunks');

  let totalSize = 0;
  let firstLoadJSSize = 0;
  const chunks = [];

  // Get all JS files
  function getJSFiles(dir, prefix = '') {
    const files = [];

    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        files.push(...getJSFiles(itemPath, `${prefix}${item}/`));
      } else if (item.endsWith('.js')) {
        const size = stat.size;
        files.push({
          name: `${prefix}${item}`,
          size,
          path: itemPath,
        });
      }
    }

    return files;
  }

  // Analyze chunks
  const allJSFiles = getJSFiles(chunksDir, 'chunks/');

  for (const file of allJSFiles) {
    totalSize += file.size;

    // Check if it's a first-load chunk
    const isFirstLoad =
      buildManifest.pages['/']?.some((chunk) => file.name.includes(chunk.replace('static/', ''))) ||
      file.name.includes('framework-') ||
      file.name.includes('main-') ||
      file.name.includes('webpack-');

    if (isFirstLoad) {
      firstLoadJSSize += file.size;
    }

    chunks.push({
      name: file.name,
      size: file.size,
      sizeFormatted: formatBytes(file.size),
      isFirstLoad,
      exceedsThreshold: file.size > BUNDLE_THRESHOLDS.individualChunk,
    });
  }

  // Sort chunks by size (largest first)
  chunks.sort((a, b) => b.size - a.size);

  return {
    timestamp: getCurrentTimestamp(),
    totalSize,
    firstLoadJSSize,
    chunkCount: chunks.length,
    chunks: chunks.slice(0, 10), // Top 10 largest chunks
    thresholds: {
      totalSizeOK: totalSize <= BUNDLE_THRESHOLDS.totalSize,
      firstLoadOK: firstLoadJSSize <= BUNDLE_THRESHOLDS.firstLoadJS,
      individualChunksOK: chunks.every((chunk) => !chunk.exceedsThreshold),
    },
  };
}

function analyzeTrend(measurements, metric, periods = 5) {
  if (measurements.length < 2) return null;

  const recentMeasurements = measurements.slice(-periods);
  if (recentMeasurements.length < 2) return null;

  const first = recentMeasurements[0][metric];
  const last = recentMeasurements[recentMeasurements.length - 1][metric];
  const change = ((last - first) / first) * 100;

  return {
    change: change.toFixed(1),
    improving: change < 0, // For bundle size, smaller is better
    recent: last,
    baseline: first,
  };
}

function generateBundleReport(analysis, history) {
  analysis.chunks.forEach((chunk, _index) => {
    const _status = chunk.exceedsThreshold ? '⚠️' : '✅';
    const _firstLoadBadge = chunk.isFirstLoad ? '[FIRST LOAD]' : '';
  });

  // Trend analysis
  if (history.measurements.length > 1) {
    const totalSizeTrend = analyzeTrend(history.measurements, 'totalSize');
    if (totalSizeTrend) {
    }

    const firstLoadTrend = analyzeTrend(history.measurements, 'firstLoadJSSize');
    if (firstLoadTrend) {
    }

    const chunkCountTrend = analyzeTrend(history.measurements, 'chunkCount');
    if (chunkCountTrend) {
    }
  }
  const recommendations = [];

  if (!analysis.thresholds.totalSizeOK) {
    recommendations.push(
      'Total bundle size exceeds threshold. Consider code splitting and tree shaking.'
    );
  }

  if (!analysis.thresholds.firstLoadOK) {
    recommendations.push('First Load JS is too large. Move non-critical code to dynamic imports.');
  }

  if (!analysis.thresholds.individualChunksOK) {
    const largechunks = analysis.chunks.filter((chunk) => chunk.exceedsThreshold);
    recommendations.push(`Large chunks detected: ${largechunks.map((c) => c.name).join(', ')}`);
  }

  // Check for optimization opportunities
  const duplicateDependencies = analysis.chunks.filter(
    (chunk) => chunk.name.includes('vendor') || chunk.name.includes('node_modules')
  );

  if (duplicateDependencies.length > 1) {
    recommendations.push(
      'Multiple vendor chunks detected. Consider optimizing chunk splitting configuration.'
    );
  }

  if (recommendations.length === 0) {
  } else {
    recommendations.forEach((_rec, _i) => {});
  }
  if (!(analysis.thresholds.totalSizeOK && analysis.thresholds.firstLoadOK)) {
  } else {
  }
}

async function runBundleAnalysis() {
  try {
    // Load existing history
    const history = loadBundleHistory();

    // Analyze current bundle
    const analysis = analyzeBundleSize();

    // Add to history
    history.measurements.push(analysis);

    // Keep only last 30 measurements
    if (history.measurements.length > 30) {
      history.measurements = history.measurements.slice(-30);
    }

    // Save updated history
    saveBundleHistory(history);

    // Generate report
    generateBundleReport(analysis, history);

    // Exit with error if thresholds exceeded
    const hasErrors = !(
      analysis.thresholds.totalSizeOK &&
      analysis.thresholds.firstLoadOK &&
      analysis.thresholds.individualChunksOK
    );

    if (hasErrors) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  runBundleAnalysis,
  analyzeBundleSize,
  generateBundleReport,
  formatBytes,
};

// Run if called directly
if (require.main === module) {
  runBundleAnalysis();
}
