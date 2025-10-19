#!/usr/bin/env node

const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const PERFORMANCE_LOG = path.join(__dirname, '..', 'performance-history.json');

// Performance monitoring configuration
const PERFORMANCE_THRESHOLDS = {
  performance: 90,
  accessibility: 100,
  bestPractices: 90,
  seo: 100,
  fcp: 1.5, // First Contentful Paint (seconds)
  lcp: 2.5, // Largest Contentful Paint (seconds)
  cls: 0.1, // Cumulative Layout Shift
  tbt: 300, // Total Blocking Time (ms)
};

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function loadPerformanceHistory() {
  try {
    if (fs.existsSync(PERFORMANCE_LOG)) {
      const data = fs.readFileSync(PERFORMANCE_LOG, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load performance history:', error.message);
  }
  return { measurements: [] };
}

function savePerformanceHistory(history) {
  try {
    fs.writeFileSync(PERFORMANCE_LOG, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('❌ Failed to save performance history:', error.message);
  }
}

function analyzeTrend(measurements, metric, periods = 5) {
  if (measurements.length < 2) return null;

  const recentMeasurements = measurements.slice(-periods);
  if (recentMeasurements.length < 2) return null;

  const values = recentMeasurements.map((m) => m.metrics[metric]).filter((v) => v !== undefined);
  if (values.length < 2) return null;

  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;

  return {
    change: change.toFixed(1),
    improving: metric.includes('score') ? change > 0 : change < 0,
    recent: last,
    baseline: first,
  };
}

function generateReport(measurement, history) {
  // Trend analysis
  if (history.measurements.length > 1) {
    const performanceTrend = analyzeTrend(history.measurements, 'performanceScore');
    if (performanceTrend) {
    }

    const fcpTrend = analyzeTrend(history.measurements, 'fcp');
    if (fcpTrend) {
    }

    const bundleTrend = analyzeTrend(history.measurements, 'totalByteWeight');
    if (bundleTrend) {
      const _baselineKB = (bundleTrend.baseline / 1024).toFixed(1);
      const _recentKB = (bundleTrend.recent / 1024).toFixed(1);
    }
  }
  const recommendations = [];

  if (measurement.metrics.performanceScore < PERFORMANCE_THRESHOLDS.performance) {
    recommendations.push('Consider optimizing JavaScript bundle size and removing unused code');
  }

  if (measurement.metrics.fcp > PERFORMANCE_THRESHOLDS.fcp) {
    recommendations.push('Optimize First Contentful Paint by reducing server response time');
  }

  if (measurement.metrics.lcp > PERFORMANCE_THRESHOLDS.lcp) {
    recommendations.push('Optimize Largest Contentful Paint by optimizing images and fonts');
  }

  if (measurement.metrics.cls > PERFORMANCE_THRESHOLDS.cls) {
    recommendations.push('Reduce Cumulative Layout Shift by reserving space for dynamic content');
  }

  if (measurement.metrics.tbt > PERFORMANCE_THRESHOLDS.tbt) {
    recommendations.push('Reduce Total Blocking Time by code splitting and lazy loading');
  }

  if (recommendations.length === 0) {
  } else {
    recommendations.forEach((_rec, _i) => {});
  }
}

async function runPerformanceAudit() {
  return new Promise((resolve, reject) => {
    exec('lhci autorun --collect.numberOfRuns=1 --no-upload', (error, _stdout, _stderr) => {
      if (error) {
        console.error('❌ Lighthouse CI failed:', error.message);
        reject(error);
        return;
      }

      // Parse Lighthouse results
      try {
        // LHCI creates results in .lighthouseci directory
        const resultsDir = path.join(process.cwd(), '.lighthouseci');
        const manifestPath = path.join(resultsDir, 'manifest.json');

        if (!fs.existsSync(manifestPath)) {
          throw new Error('Lighthouse results not found');
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const resultPath = path.join(resultsDir, manifest[0].jsonPath);
        const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));

        const measurement = {
          timestamp: getCurrentTimestamp(),
          url: result.finalUrl,
          metrics: {
            performanceScore: Math.round(result.categories.performance.score * 100),
            accessibilityScore: Math.round(result.categories.accessibility.score * 100),
            bestPracticesScore: Math.round(result.categories['best-practices'].score * 100),
            seoScore: Math.round(result.categories.seo.score * 100),
            fcp: result.audits['first-contentful-paint'].numericValue / 1000,
            lcp: result.audits['largest-contentful-paint'].numericValue / 1000,
            cls: result.audits['cumulative-layout-shift'].numericValue,
            tbt: result.audits['total-blocking-time'].numericValue,
            speedIndex: result.audits['speed-index'].numericValue,
            interactive: result.audits.interactive.numericValue / 1000,
            totalByteWeight: result.audits['total-byte-weight'].numericValue,
            unusedJavaScript: result.audits['unused-javascript'].details?.overallSavingsBytes || 0,
          },
        };

        resolve(measurement);
      } catch (parseError) {
        console.error('❌ Failed to parse Lighthouse results:', parseError.message);
        reject(parseError);
      }
    });
  });
}

async function main() {
  try {
    // Load existing performance history
    const history = loadPerformanceHistory();

    // Run performance audit
    const measurement = await runPerformanceAudit();

    // Add to history
    history.measurements.push(measurement);

    // Keep only last 50 measurements to prevent file from growing too large
    if (history.measurements.length > 50) {
      history.measurements = history.measurements.slice(-50);
    }

    // Save updated history
    savePerformanceHistory(history);

    // Generate report
    generateReport(measurement, history);

    // Exit with appropriate code based on critical thresholds
    const criticalFailures = [
      measurement.metrics.accessibilityScore < PERFORMANCE_THRESHOLDS.accessibility,
      measurement.metrics.seoScore < PERFORMANCE_THRESHOLDS.seo,
      measurement.metrics.performanceScore < 80, // More strict for CI
    ];

    if (criticalFailures.some(Boolean)) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Performance monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, runPerformanceAudit, generateReport };
