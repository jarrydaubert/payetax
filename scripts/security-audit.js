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
    exec('npm outdated --json', (_error, stdout, _stderr) => {
      try {
        if (stdout) {
          const outdated = JSON.parse(stdout);
          if (outdated?.error) {
            resolve([]);
            return;
          }
          const packages = Object.entries(outdated)
            .filter(
              ([, details]) =>
                details &&
                typeof details.current === 'string' &&
                typeof details.latest === 'string',
            )
            .map(([name, details]) => ({
              name,
              current: details.current,
              wanted: details.wanted,
              latest: details.latest,
              type: details.type || 'dependencies',
            }));
          resolve(packages);
        } else {
          resolve([]);
        }
      } catch (_e) {
        resolve([]);
      }
    });
  });
}

function runBunPmScan() {
  return new Promise((resolve, reject) => {
    exec('bun pm scan', (error, stdout = '', stderr = '') => {
      const output = [stdout, stderr].filter(Boolean).join('\n');
      const advisoriesMatch = output.match(/(\d+)\s+advisories?\s+found/i);
      const advisories = advisoriesMatch ? Number(advisoriesMatch[1]) : 0;
      const noAdvisories = /No advisories found/i.test(output);
      const hasScanResult = noAdvisories || /advisories?\s+found/i.test(output);

      if (error && !hasScanResult) {
        reject(error);
        return;
      }

      resolve({
        advisories: noAdvisories ? 0 : advisories,
        output,
      });
    });
  });
}

function generateSecurityReport(audit, history) {
  if (audit.vulnerabilities && audit.vulnerabilities.length > 0) {
    // Group by severity
    const bySeverity = audit.vulnerabilities.reduce((acc, vuln) => {
      if (!acc[vuln.severity]) acc[vuln.severity] = [];
      acc[vuln.severity].push(vuln);
      return acc;
    }, {});

    for (const severity of ['critical', 'high', 'moderate', 'low']) {
      if (bySeverity[severity] && bySeverity[severity].length > 0) {
        for (const [_i, vuln] of bySeverity[severity].entries()) {
          if (vuln.url) {
          }
          if (vuln.fixAvailable) {
          }
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
      for (const _pkg of criticalOutdated.slice(0, 10)) {
      }

      if (criticalOutdated.length > 10) {
      }
    } else {
    }
  }

  // Trend analysis
  if (history.audits.length > 1) {
    const totalTrend = analyzeTrend(history.audits, 'total');
    if (totalTrend) {
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

  if (recommendations.length === 0) {
  } else {
    recommendations.forEach((_rec, _i) => {});
  }
  if (audit.summary.critical > 0 || audit.summary.high > 0) {
  } else {
  }
}

async function runSecurityAudit() {
  return new Promise((resolve, reject) => {
    exec('npm audit --audit-level=info --json', async (_error, stdout, _stderr) => {
      try {
        let auditData = null;
        let scanSource = 'npm audit';

        if (stdout) {
          auditData = JSON.parse(stdout);
        }

        const npmSummary = auditData?.metadata?.vulnerabilities;
        const npmDependencies = auditData?.metadata?.dependencies;
        const npmAuditMissingData =
          !(npmSummary && npmDependencies) || auditData?.error?.code === 'ENOLOCK';

        if (npmAuditMissingData) {
          // Bun projects may not have package-lock.json; fall back to Bun's scanner.
          const bunScan = await runBunPmScan();
          scanSource = 'bun pm scan';
          auditData = {
            vulnerabilities: {},
            metadata: emptyAuditMetadata(),
          };

          if (bunScan.advisories > 0) {
            // Bun scan doesn't expose severities in a stable machine-readable format;
            // classify advisories as high to keep CI behavior conservative.
            auditData.metadata.vulnerabilities.high = bunScan.advisories;
            auditData.metadata.vulnerabilities.total = bunScan.advisories;
          }
        }

        // Get outdated packages info
        const outdatedPackages = await checkOutdatedPackages();

        // Process vulnerabilities
        const vulnerabilities = [];
        if (auditData.vulnerabilities) {
          for (const vuln of Object.values(auditData.vulnerabilities)) {
            if (vuln.via) {
              for (const via of vuln.via) {
                if (typeof via === 'object') {
                  vulnerabilities.push({
                    name: vuln.name,
                    severity: vuln.severity,
                    title: via.title,
                    url: via.url,
                    version: via.version,
                    fixAvailable: vuln.fixAvailable ? vuln.fixAvailable.version : null,
                  });
                }
              }
            }
          }
        }

        const audit = {
          timestamp: getCurrentTimestamp(),
          scanSource,
          summary: auditData.metadata?.vulnerabilities || emptyAuditMetadata().vulnerabilities,
          dependencies: auditData.metadata?.dependencies || emptyAuditMetadata().dependencies,
          vulnerabilities,
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
      process.exit(1);
    } else {
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
