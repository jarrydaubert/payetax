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
    console.log(`✅ Security audit history saved to ${SECURITY_LOG}`);
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
          const packages = Object.keys(outdated).map((name) => ({
            name,
            current: outdated[name].current,
            wanted: outdated[name].wanted,
            latest: outdated[name].latest,
            type: outdated[name].type || 'dependencies',
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

function generateSecurityReport(audit, history) {
  console.log('\n🔒 SECURITY AUDIT REPORT');
  console.log('=====================================');
  console.log(`📅 Timestamp: ${audit.timestamp}`);

  console.log('\n🚨 VULNERABILITY SUMMARY:');
  console.log(
    `  Critical: ${audit.summary.critical} ${audit.summary.critical <= SECURITY_THRESHOLDS.critical ? '✅' : '❌'} (max: ${SECURITY_THRESHOLDS.critical})`
  );
  console.log(
    `  High: ${audit.summary.high} ${audit.summary.high <= SECURITY_THRESHOLDS.high ? '✅' : '❌'} (max: ${SECURITY_THRESHOLDS.high})`
  );
  console.log(
    `  Moderate: ${audit.summary.moderate} ${audit.summary.moderate <= SECURITY_THRESHOLDS.moderate ? '✅' : '⚠️'} (max: ${SECURITY_THRESHOLDS.moderate})`
  );
  console.log(
    `  Low: ${audit.summary.low} ${audit.summary.low <= SECURITY_THRESHOLDS.low ? '✅' : '⚠️'} (max: ${SECURITY_THRESHOLDS.low})`
  );
  console.log(`  Total: ${audit.summary.total}`);

  console.log('\n📦 DEPENDENCY ANALYSIS:');
  console.log(`  Production Dependencies: ${audit.dependencies.prod}`);
  console.log(`  Development Dependencies: ${audit.dependencies.dev}`);
  console.log(`  Optional Dependencies: ${audit.dependencies.optional}`);
  console.log(`  Total Dependencies: ${audit.dependencies.total}`);

  if (audit.vulnerabilities && audit.vulnerabilities.length > 0) {
    console.log('\n🔍 DETAILED VULNERABILITIES:');

    // Group by severity
    const bySeverity = audit.vulnerabilities.reduce((acc, vuln) => {
      if (!acc[vuln.severity]) acc[vuln.severity] = [];
      acc[vuln.severity].push(vuln);
      return acc;
    }, {});

    for (const severity of ['critical', 'high', 'moderate', 'low']) {
      if (bySeverity[severity] && bySeverity[severity].length > 0) {
        console.log(`\n  ${severity.toUpperCase()} (${bySeverity[severity].length}):`);
        for (const [i, vuln] of bySeverity[severity].entries()) {
          console.log(`    ${i + 1}. ${vuln.name}${vuln.version ? `@${vuln.version}` : ''}`);
          console.log(`       ${vuln.title || 'No description available'}`);
          if (vuln.url) {
            console.log(`       More info: ${vuln.url}`);
          }
          if (vuln.fixAvailable) {
            console.log(`       Fix: Update to version ${vuln.fixAvailable}`);
          }
        }
      }
    }
  }

  if (audit.outdatedPackages && audit.outdatedPackages.length > 0) {
    console.log('\n📅 OUTDATED PACKAGES:');
    const criticalOutdated = audit.outdatedPackages.filter((pkg) => {
      const currentMajor = parseInt(pkg.current.split('.')[0], 10);
      const latestMajor = parseInt(pkg.latest.split('.')[0], 10);
      return latestMajor > currentMajor;
    });

    if (criticalOutdated.length > 0) {
      console.log('  Major version updates available:');
      for (const pkg of criticalOutdated.slice(0, 10)) {
        console.log(`    ${pkg.name}: ${pkg.current} → ${pkg.latest} (${pkg.type})`);
      }

      if (criticalOutdated.length > 10) {
        console.log(`    ... and ${criticalOutdated.length - 10} more`);
      }
    } else {
      console.log('  ✅ No major version updates required');
    }
  }

  // Trend analysis
  if (history.audits.length > 1) {
    console.log('\n📈 SECURITY TRENDS (last 5 audits):');

    const totalTrend = analyzeTrend(history.audits, 'total');
    if (totalTrend) {
      console.log(
        `  Total Vulnerabilities: ${totalTrend.change > 0 ? '+' : ''}${totalTrend.change} ${totalTrend.improving ? '📈' : '📉'} (${totalTrend.baseline} → ${totalTrend.recent})`
      );
    }

    const criticalTrend = analyzeTrend(history.audits, 'critical');
    if (criticalTrend && criticalTrend.recent > 0) {
      console.log(
        `  Critical: ${criticalTrend.change > 0 ? '+' : ''}${criticalTrend.change} ${criticalTrend.improving ? '📈' : '📉'} (${criticalTrend.baseline} → ${criticalTrend.recent})`
      );
    }

    const highTrend = analyzeTrend(history.audits, 'high');
    if (highTrend && highTrend.recent > 0) {
      console.log(
        `  High: ${highTrend.change > 0 ? '+' : ''}${highTrend.change} ${highTrend.improving ? '📈' : '📉'} (${highTrend.baseline} → ${highTrend.recent})`
      );
    }
  }

  // Recommendations
  console.log('\n💡 SECURITY RECOMMENDATIONS:');
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
    console.log('  🎉 No security issues found! Keep up the great work!');
  } else {
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  // Next steps
  console.log('\n🔧 SUGGESTED ACTIONS:');
  if (audit.summary.critical > 0 || audit.summary.high > 0) {
    console.log('  1. Run `npm audit fix` to automatically fix issues');
    console.log('  2. Review breaking changes for major updates');
    console.log('  3. Test application thoroughly after fixes');
    console.log('  4. Consider alternative packages if fixes unavailable');
  } else {
    console.log('  ✅ Security posture is good');
    console.log('  • Continue regular monthly audits');
    console.log('  • Keep dependencies updated');
    console.log('  • Monitor security advisories');
  }

  console.log('\n=====================================\n');
}

async function runSecurityAudit() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Running security audit...\n');

    exec('npm audit --audit-level=info --json', async (_error, stdout, _stderr) => {
      try {
        let auditData;

        if (stdout) {
          auditData = JSON.parse(stdout);
        } else {
          // If no vulnerabilities, npm audit returns empty
          auditData = {
            vulnerabilities: {},
            metadata: {
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
            },
          };
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
          summary: auditData.metadata.vulnerabilities,
          dependencies: auditData.metadata.dependencies,
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
    console.log('🔒 Starting security audit...\n');

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
      console.log('❌ Critical security vulnerabilities found');
      process.exit(1);
    } else {
      console.log('✅ Security audit completed successfully');
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
