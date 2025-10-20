# CI/CD Pipeline Guide

**Last Updated:** October 2025  
**Status:** Optimized for GitLab free tier (400 min/month)

---

## 📋 Overview

PayeTax uses a **three-layer validation approach**:

1. **Local (Husky)** - Immediate feedback before commits
2. **GitLab CI** - Security scanning + quick quality gate
3. **Vercel** - Production validation + deployments

This division ensures fast feedback, secure code, and production-ready builds while staying within the GitLab free tier.

---

## 🎯 Current Pipeline Configuration

### Pipeline Structure

```yaml
stages:
  - prepare       # Install dependencies once
  - security      # Secret detection + vulnerability scanning
  - validate      # Quick TypeScript + linting check (MRs only)
```

### Jobs

**1. install_dependencies** (prepare stage)
- Runs: `npm ci`
- Artifacts: Shares `node_modules/` with other jobs
- Duration: ~1 min
- Purpose: Eliminate redundant dependency installations

**2. secret_detection** (security stage)
- Tool: GitLab built-in (Gitleaks)
- Duration: ~30 sec
- Purpose: Prevent credentials from being committed

**3. dependency_audit** (security stage)
- Runs: `npm audit --audit-level=high --production`
- Duration: ~30 sec
- Purpose: Catch vulnerable dependencies
- `allow_failure: true` (doesn't block on medium/low)

**4. quick_validation** (validate stage)
- Runs: `npm run typecheck` + `npx biome check .`
- Duration: ~1-2 min
- Only on: Merge requests (not main)
- Purpose: Fast feedback before Vercel build

---

## 📊 Resource Usage

### Monthly Estimates

**Current activity:** ~88 commits/month + ~25 MRs/month

**Usage breakdown:**
```
Main pushes: 88 × 1.5 min = 132 min
Merge requests: 25 × 3 min = 75 min
─────────────────────────────────
Total: ~207 minutes/month ✅

Free tier limit: 400 min/month
Buffer: 193 minutes (48% under limit)
```

### Historical Context

**Before optimization (Oct 2024):**
- Usage: ~1,200 min/month (3x over limit)
- Issues: Redundant npm ci installations, custom secret scanning, full test suite in CI

**After optimization (Oct 2025):**
- Usage: ~207 min/month
- Reduction: 83%
- Changes: Shared dependencies, built-in secret detection, removed redundant tests

---

## 🔄 What Runs Where

### GitLab CI
✅ Security scanning (secrets + dependencies)  
✅ Quick validation on MRs (typecheck + lint)  
❌ Unit tests (run locally)  
❌ E2E tests (run locally)  
❌ Build validation (Vercel handles)

### Vercel (Automatic)
✅ Build validation on every push  
✅ Deployment previews for MRs  
✅ Production deployments (main branch)  
✅ Performance metrics  
✅ Error reporting

### Local (Husky Hooks)
✅ Pre-commit: `npm run lint` + `npm run typecheck` + `npm run test:ci`  
⏳ Pre-push: Full test suite + build validation (PAYTAX-24 - pending)

---

## 🚀 Pipeline Execution

### On Main Branch Push

```
install_dependencies (1 min)
    ↓
secret_detection + dependency_audit (parallel, 30 sec)

Total: ~1.5 minutes
```

### On Merge Request

```
install_dependencies (1 min)
    ↓
secret_detection + dependency_audit (parallel, 30 sec)
    ↓
quick_validation (typecheck + lint, 1-2 min)

Total: ~2.5-3 minutes
```

---

## 🔧 Optimization Guidelines

### Stay Within Free Tier

**Target:** <300 min/month (with buffer)

**If usage increases:**
1. **First:** Check if activity spike is temporary
2. **Option 1:** Remove `quick_validation` from MRs (rely on Vercel only)
3. **Option 2:** Run `dependency_audit` weekly instead of per-commit
4. **Option 3:** Use GitLab scheduled pipelines for non-critical checks

**Don't do:**
- ❌ Add unit/E2E tests back to CI (run locally)
- ❌ Add separate build job (Vercel does this)
- ❌ Run npm ci in multiple jobs (use shared dependencies)

### Best Practices

**DO:**
✅ Share `node_modules/` via artifacts  
✅ Use GitLab built-in templates when available  
✅ Run expensive jobs on MRs only (not main)  
✅ Use `needs` directive for parallelization  
✅ Set reasonable timeouts  

**DON'T:**
❌ Install dependencies in every job  
❌ Run full test suites in CI (expensive)  
❌ Duplicate checks Vercel already does  
❌ Run jobs on all branches (main + MRs only)  

---

## 🛠️ Making Changes to Pipeline

### Testing Pipeline Changes

1. **Create a branch:**
   ```bash
   git checkout -b test/ci-pipeline-update
   ```

2. **Update `.gitlab-ci.yml`**

3. **Push and observe:**
   ```bash
   git push origin test/ci-pipeline-update
   ```

4. **Check GitLab pipeline:**
   - Go to: CI/CD → Pipelines
   - Verify execution time
   - Check job logs

5. **If successful, merge to main**

### Common Modifications

**Add new security scan:**
```yaml
# Use GitLab templates when possible
include:
  - template: Jobs/Secret-Detection.gitlab-ci.yml
  - template: Jobs/SAST.gitlab-ci.yml  # Add SAST scanning
```

**Add new validation job:**
```yaml
accessibility_check:
  stage: validate
  dependencies:
    - install_dependencies
  needs: ["install_dependencies"]
  script:
    - npm run audit:a11y
  only:
    - merge_requests
```

**Conditional execution:**
```yaml
expensive_job:
  only:
    refs:
      - merge_requests
    changes:
      - src/**/*
      - app/**/*
```

---

## 📈 Monitoring

### Check Pipeline Usage

**GitLab Dashboard:**
- Settings → Usage Quotas → Pipelines
- View: Minutes used this month
- Target: <300 minutes

**Pipeline Analytics:**
- CI/CD → Pipelines → Analytics
- View: Average duration trends
- Target: Main ~1.5 min, MRs ~3 min

### Alert Thresholds

**Monitor monthly usage:**
- ✅ <250 min - Excellent
- ⚠️ 250-350 min - Good (watch trends)
- 🚨 >350 min - Review for optimizations
- 🔴 >400 min - Immediate action needed

---

## 🔍 Troubleshooting

### Pipeline Timing Out

**Symptoms:** Jobs exceed 5 minute timeout

**Solutions:**
1. Check if dependencies cached properly
2. Verify node_modules artifact is being shared
3. Check for network issues (npm registry)

### High Monthly Usage

**Symptoms:** Approaching 400 minute limit

**Diagnosis:**
```bash
# Check recent pipeline runs
# GitLab → CI/CD → Pipelines → View duration

# Count runs this month
# Settings → Usage Quotas → Pipelines
```

**Solutions:**
1. Review activity spike (temporary or permanent?)
2. Remove non-critical jobs
3. Increase caching
4. Run expensive checks weekly instead of per-commit

### Failed Security Scans

**secret_detection fails:**
- Review job logs for flagged patterns
- Check if false positive (e.g., example code)
- If real secret: Rotate immediately + fix

**dependency_audit fails:**
- Run `npm audit` locally
- Review vulnerabilities
- Update packages: `npm audit fix`
- If unfixable: Document risk + set `allow_failure: true`

---

## 🎯 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Monthly usage | <300 min | ~207 min ✅ |
| Main pipeline time | <2 min | ~1.5 min ✅ |
| MR pipeline time | <4 min | ~3 min ✅ |
| Security scans | Automated | ✅ |
| Build validation | Automated | ✅ (Vercel) |

---

## 📚 Related Documentation

- [`.gitlab-ci.yml`](../../.gitlab-ci.yml) - Pipeline configuration
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development workflow
- [Vercel Dashboard](https://vercel.com/payetax) - Deployment status
- [GitLab Pipelines](https://gitlab.com/payetax/payetax/-/pipelines) - Pipeline history

---

## 🔄 Change History

**October 2025 - Major Optimization**
- Added shared dependency installation
- Switched to GitLab built-in secret detection
- Removed redundant testing from CI
- Reduced usage from 1,200 → 207 min/month (83% reduction)

**September 2025 - Initial Setup**
- Basic pipeline with quality checks, tests, E2E
- Custom secret detection
- Usage: ~1,200 min/month (over limit)

---

**Questions or issues?**  
Create a Linear issue: `[Infrastructure] CI/CD: [Your question]`
