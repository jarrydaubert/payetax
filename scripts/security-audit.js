#!/usr/bin/env node

const { exec } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const AUDIT_DIR = path.join(__dirname, '..', 'audit-outputs');
const SECURITY_LOG = path.join(AUDIT_DIR, 'security-audit-history.json');

// Ensure audit-outputs directory exists
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

// Security audit configuration
const SECURITY_THRESHOLDS = {
  critical: 0, // No critical vulnerabilities allowed
  high: 0, // No high vulnerabilities allowed
  moderate: 2, // Max 2 moderate vulnerabilities
  low: 10, // Max 10 low vulnerabilities
};

function emptyAuditMetadata() {
  return {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0,
    },
    dependencies: {
      prod: 0,
      dev: 0,
      optional: 0,
      total: 0,
    },
  };
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function loadSecurityHistory() {
  try {
    if (fs.existsSync(SECURITY_LOG)) {
      const data = fs.readFileSync(SECURITY_LOG, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load security history:', error.message);
  }
  return { audits: [] };
}

function saveSecurityHistory(history) {
  try {
    fs.writeFileSync(SECURITY_LOG, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('❌ Failed to save security history:', error.message);
  }
}

function analyzeTrend(audits, metric, periods = 5) {
  if (audits.length < 2) return null;

  const recentAudits = audits.slice(-periods);
  if (recentAudits.length < 2) return null;

  const first = recentAudits[0].summary[metric];
  const last = recentAudits[recentAudits.length - 1].summary[metric];

  return {
    change: last - first,
    improving: last < first,
    recent: last,
    baseline: first,
  };
}

function checkOutdatedPackages() {
  return new Promise((resolve) => {
    exec('bun outdated --no-progress', (_error, stdout = '', stderr = '') => {
      try {
        const output = [stdout, stderr].filter(Boolean).join('\n');
        if (!output.includes('│')) {
          resolve([]);
          return;
        }

        const packages = output
          .split('\n')
          .filter((line) => line.includes('│'))
          .map((line) => line.split('│').map((segment) => segment.trim()))
          .filter((parts) => parts.length >= 6)
          .map((parts) => ({
            name: parts[1],
            current: parts[2],
            wanted: parts[3],
            latest: parts[4],
            type: 'dependencies',
          }))
          .filter((pkg) => pkg.name && pkg.name !== 'Package' && pkg.current && pkg.latest);

        resolve(packages);
      } catch (_error) {
        resolve([]);
      }
    });
  });
}

function extractJsonObject(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    return null;
  }

  try {
    return JSON.parse(output.slice(start, end + 1));
  } catch (_error) {
    return null;
  }
}

function parseBunAuditOutput(output) {
  const parsed = extractJsonObject(output);
  const summary = emptyAuditMetadata().vulnerabilities;
  const vulnerabilities = [];

  if (!parsed || typeof parsed !== 'object') {
    return { summary, vulnerabilities };
  }

  for (const [packageName, advisories] of Object.entries(parsed)) {
    if (!Array.isArray(advisories)) continue;

    for (const advisory of advisories) {
      const severity = advisory.severity || 'info';
      if (severity in summary) {
        summary[severity] += 1;
      } else {
        summary.info += 1;
      }

      vulnerabilities.push({
        name: packageName,
        severity,
        title: advisory.title || advisory.id || 'Security advisory',
        url: advisory.url || null,
        version: advisory.vulnerable_versions || advisory.version || null,
        fixAvailable: advisory.fixed_versions || null,
      });
    }
  }

  summary.total = vulnerabilities.length;
  return { summary, vulnerabilities };
}

function generateSecurityReport(audit, history) {
  console.log('\n🔐 Security Audit Report');
  console.log(`   Source: ${audit.scanSource}`);
  console.log(
    `   Vulnerabilities: total=${audit.summary.total}, critical=${audit.summary.critical}, high=${audit.summary.high}, moderate=${audit.summary.moderate}, low=${audit.summary.low}`,
  );
  console.log(`   Outdated packages: ${audit.outdatedPackages?.length || 0}`);

  if (audit.vulnerabilities && audit.vulnerabilities.length > 0) {
    // Group by severity
    const bySeverity = audit.vulnerabilities.reduce((acc, vuln) => {
      if (!acc[vuln.severity]) acc[vuln.severity] = [];
      acc[vuln.severity].push(vuln);
      return acc;
    }, {});

    for (const severity of ['critical', 'high', 'moderate', 'low']) {
      if (bySeverity[severity] && bySeverity[severity].length > 0) {
        const top = bySeverity[severity].slice(0, 5);
        console.log(`\n   ${severity.toUpperCase()} (${bySeverity[severity].length})`);
        for (const vuln of top) {
          const detail = vuln.url ? ` (${vuln.url})` : '';
          console.log(`   - ${vuln.name}: ${vuln.title}${detail}`);
        }
      }
    }
  }

  if (audit.outdatedPackages && audit.outdatedPackages.length > 0) {
    const criticalOutdated = audit.outdatedPackages.filter((pkg) => {
      if (!(pkg.current && pkg.latest)) return false;
      const currentMajor = parseInt(pkg.current.split('.')[0], 10);
      const latestMajor = parseInt(pkg.latest.split('.')[0], 10);
      if (Number.isNaN(currentMajor) || Number.isNaN(latestMajor)) return false;
      return latestMajor > currentMajor;
    });

    if (criticalOutdated.length > 0) {
      console.log(`\n📦 Major updates available for ${criticalOutdated.length} package(s)`);
      for (const pkg of criticalOutdated.slice(0, 10)) {
        console.log(`   - ${pkg.name}: ${pkg.current} -> ${pkg.latest}`);
      }
    }
  }

  // Trend analysis
  if (history.audits.length > 1) {
    const totalTrend = analyzeTrend(history.audits, 'total');
    if (totalTrend) {
      const trendDirection = totalTrend.improving ? 'improving' : 'worsening';
      console.log(
        `\n📈 Trend (${Math.min(5, history.audits.length)} runs): ${trendDirection}, change=${totalTrend.change}`,
      );
    }

    const criticalTrend = analyzeTrend(history.audits, 'critical');
    if (criticalTrend && criticalTrend.recent > 0) {
    }

    const highTrend = analyzeTrend(history.audits, 'high');
    if (highTrend && highTrend.recent > 0) {
    }
  }
  const recommendations = [];

  if (audit.summary.critical > 0) {
    recommendations.push('🚨 URGENT: Fix critical vulnerabilities immediately');
    recommendations.push('Consider temporarily removing affected dependencies if no fix available');
  }

  if (audit.summary.high > 0) {
    recommendations.push('🔴 HIGH PRIORITY: Address high-severity vulnerabilities');
  }

  if (audit.summary.moderate > SECURITY_THRESHOLDS.moderate) {
    recommendations.push('🟡 MEDIUM PRIORITY: Review moderate vulnerabilities');
  }

  if (audit.summary.low > SECURITY_THRESHOLDS.low) {
    recommendations.push('⚪ LOW PRIORITY: Consider addressing low-severity issues');
  }

  if (audit.outdatedPackages && audit.outdatedPackages.length > 20) {
    recommendations.push('📅 UPDATE: Many packages are outdated, consider batch updates');
  }

  // Security best practices
  recommendations.push('🔐 Regular security audits (monthly recommended)');
  recommendations.push('📋 Keep dependencies updated within major version ranges');
  recommendations.push('🚀 Monitor security advisories for used packages');

  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations');
    for (const rec of recommendations) {
      console.log(`   - ${rec}`);
    }
  }
}

async function runSecurityAudit() {
  return new Promise((resolve, reject) => {
    exec('bun audit --json --audit-level=low', async (error, stdout = '', stderr = '') => {
      try {
        const output = [stdout, stderr].filter(Boolean).join('\n');
        const scanSource = 'bun audit';
        const parsedAudit = parseBunAuditOutput(output);

        if (error && parsedAudit.summary.total === 0) {
          reject(error);
          return;
        }

        // Get outdated packages info
        const outdatedPackages = await checkOutdatedPackages();

        const audit = {
          timestamp: getCurrentTimestamp(),
          scanSource,
          summary: parsedAudit.summary,
          dependencies: emptyAuditMetadata().dependencies,
          vulnerabilities: parsedAudit.vulnerabilities,
          outdatedPackages,
        };

        resolve(audit);
      } catch (parseError) {
        console.error('❌ Failed to parse audit results:', parseError.message);
        reject(parseError);
      }
    });
  });
}

async function main() {
  try {
    // Load existing history
    const history = loadSecurityHistory();

    // Run security audit
    const audit = await runSecurityAudit();

    // Add to history
    history.audits.push(audit);

    // Keep only last 20 audits
    if (history.audits.length > 20) {
      history.audits = history.audits.slice(-20);
    }

    // Save updated history
    saveSecurityHistory(history);

    // Generate report
    generateSecurityReport(audit, history);

    // Exit with appropriate code based on security issues
    const hasSecurityIssues =
      audit.summary.critical > SECURITY_THRESHOLDS.critical ||
      audit.summary.high > SECURITY_THRESHOLDS.high;

    if (hasSecurityIssues) {
      console.error(
        '\n❌ Security gate failed: critical/high vulnerabilities exceed threshold (critical=0, high=0).',
      );
      process.exit(1);
    } else {
      console.log('\n✅ Security gate passed');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, runSecurityAudit, generateSecurityReport };
