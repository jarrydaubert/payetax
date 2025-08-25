# Deployment & CI/CD Setup Guide

## 📋 Overview

This document captures the deployment setup, lessons learned, and configurations for ToolHubX v2.

## 🔧 Current Setup (v1.1.3)

### Repository & Hosting
- **Git Repository**: GitLab (`https://gitlab.com/jarrydaubert/toolhubx`)
- **Production Hosting**: Vercel
- **Domain**: toolhubx.uk (needs to be connected)
- **Current Deployment**: Manual via Vercel CLI

### Manual Deployment Process ✅ 
Successfully used for v1.1.3 release:

```bash
# 1. Update version in package.json
npm version patch  # Updates to next patch version

# 2. Stage all changes
git add .

# 3. Commit with detailed message
git commit -m "🚀 Release v1.x.x: Brief description

✨ Features:
- List new features

🔧 Improvements:  
- List improvements

🏗️ Architecture:
- List architectural changes"

# 4. Create annotated tag
git tag -a v1.x.x -m "Release v1.x.x: Brief description"

# 5. Push to GitLab
git push origin main
git push origin v1.x.x

# 6. Deploy to Vercel
vercel --prod --yes
```

## ⚠️ Issues Identified

### 1. No Auto-Deployment
**Problem**: Manual deployment required for every change
**Impact**: Slower release cycle, prone to human error
**Solution**: Set up GitLab CI/CD pipeline (created `.gitlab-ci.yml`)

### 2. Vercel Integration Missing  
**Problem**: Vercel not connected to GitLab repository
**Impact**: No automatic previews, manual deployments only
**Solution**: Need to connect GitLab repo to Vercel project

### 3. Environment Variables
**Problem**: Manual setup required for each deployment
**Impact**: Risk of missing configurations
**Solution**: Document all required env vars

## 🚀 Automated Deployment Setup (TODO)

### Step 1: GitLab CI/CD Configuration

✅ **Created**: `.gitlab-ci.yml` with:
- **Test Stage**: ESLint + TypeScript checking  
- **Build Stage**: Production build creation
- **Deploy Stage**: Auto-deploy to Vercel
- **Preview Stage**: MR preview deployments

### Step 2: Vercel Integration (NEEDS SETUP)

**Required Actions**:
1. Connect GitLab repository to Vercel project
2. Set up environment variables in Vercel dashboard
3. Configure custom domain (toolhubx.uk)
4. Enable auto-deployments from GitLab

**Vercel Environment Variables Needed**:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics 4 ID
VERCEL_TOKEN=xxxx               # For CLI deployments
VERCEL_ORG_ID=xxxx             # Organization ID  
VERCEL_PROJECT_ID=xxxx         # Project ID
```

### Step 3: GitLab CI/CD Variables (NEEDS SETUP)

**Required Variables** (Settings > CI/CD > Variables):
```bash
VERCEL_TOKEN        # Vercel CLI authentication token
VERCEL_ORG_ID       # Your Vercel organization ID
VERCEL_PROJECT_ID   # Your specific project ID
```

**How to get Vercel tokens**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login and get org/project info
vercel login
vercel link  # Links project and shows IDs

# Generate token in Vercel dashboard:
# Settings > Tokens > Create Token
```

## 📊 Deployment History

### v1.1.3 (Aug 22, 2025) ✅
- **Method**: Manual via Vercel CLI
- **Features**: Analytics & cookie consent best practices
- **Bundle**: 455kB (optimized)
- **Status**: Successfully deployed
- **URL**: https://toolhubx-main-copy-86t9kvg90-project-javelin.vercel.app
- **Issues**: No auto-deployment, manual process

### Previous Releases
- **v1.1.2**: Initial analytics implementation
- **v1.1.1**: Tax calculation improvements  
- **v1.1.0**: Multi-period support

## 🔍 Lessons Learned

### ✅ What Works Well
1. **Manual CLI Deployment**: Reliable and fast
2. **GitLab Integration**: Good version control and tagging
3. **Build Process**: TypeScript + ESLint catches issues early
4. **Bundle Optimization**: 455kB is acceptable for feature set

### ⚠️ Pain Points
1. **Manual Process**: Time-consuming, error-prone
2. **No Preview Deployments**: Can't test before production
3. **Environment Setup**: Manual env var management
4. **Domain Configuration**: Not connected to main domain

### 🎯 Next Steps Priority

1. **HIGH**: Connect GitLab repository to Vercel project
2. **HIGH**: Set up CI/CD environment variables  
3. **MEDIUM**: Configure custom domain (toolhubx.uk)
4. **MEDIUM**: Set up staging environment
5. **LOW**: Add deployment notifications (Slack/Discord)

## 🧪 Testing Deployment

### Pre-Deployment Checklist
- [ ] `npm run lint` passes - use biome
- [ ] `npm run build` succeeds  
- [ ] Bundle size under 500kB
- [ ] Environment variables configured
- [ ] Version bumped in package.json
- [ ] Changelog updated

### Post-Deployment Verification
- [ ] Site loads correctly
- [ ] All calculators functional
- [ ] Analytics tracking works
- [ ] Mobile responsive
- [ ] Performance acceptable (< 3s load)

## 📚 References

- [Vercel GitLab Integration](https://vercel.com/docs/git/gitlab)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: August 22, 2025  
**Version**: v1.1.3  
**Status**: Manual deployment working, automation in progress
