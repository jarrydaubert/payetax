# 🚀 ToolHubX Deployment & CI/CD Guide

This document provides comprehensive deployment setup, configuration, and troubleshooting information for the ToolHubX UK Tax Calculator.

---

## 📋 Overview

ToolHubX uses a modern deployment strategy with Vercel for production hosting and GitLab for version control. The application leverages Next.js 15's static and server-side rendering capabilities for optimal performance.

### Current Setup Status

| Component | Status | Details |
|-----------|---------|---------|
| **Production Hosting** | ✅ Active | Vercel with automatic deployments |
| **Domain** | ✅ Connected | toolhubx.uk with SSL |
| **CI/CD Pipeline** | ✅ Automated | GitLab CI/CD with quality gates |
| **Environment Variables** | ✅ Configured | Production and preview environments |
| **Performance Monitoring** | ✅ Active | Lighthouse CI + Vercel Analytics |

---

## 🏗️ Production Environment

### Hosting Configuration

- **Platform**: Vercel (Next.js optimized)
- **Domain**: [toolhubx.uk](https://toolhubx.uk)
- **CDN**: Global edge network with 99.99% uptime
- **SSL**: Automatic Let's Encrypt certificates
- **Performance**: Sub-3 second loading times globally

### Environment Variables

#### Required Production Variables

```bash
# Analytics & Tracking
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX          # Google Analytics 4 ID

# Build Configuration
ANALYZE=false                           # Bundle analyzer (true for debugging)
NODE_ENV=production                     # Production optimizations

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true            # Progressive Web App features
NEXT_PUBLIC_ENABLE_ANALYTICS=true      # Analytics tracking

# API Configuration
FEEDBACK_EMAIL=feedback@toolhubx.uk    # Feedback form destination
```

#### Vercel-Specific Variables

```bash
# Deployment (automatically set by Vercel)
VERCEL=1                               # Vercel environment flag
VERCEL_ENV=production                  # Environment type
VERCEL_URL=toolhubx.uk                # Production URL
```

### Build Configuration

The application uses Next.js 15's optimized build process:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build"
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitLab CI/CD Configuration

The project uses a multi-stage pipeline defined in `.gitlab-ci.yml`:

```yaml
stages:
  - quality
  - build  
  - test
  - deploy
  - notify
```

#### Stage 1: Quality Assurance

```bash
# Code quality checks
npm run format              # Biome formatting
npm run check              # Linting and type checking
npm run test               # Unit test suite
```

#### Stage 2: Build Verification

```bash
# Production build
npm run build              # Next.js production build
npm run lighthouse-check   # Performance verification
```

#### Stage 3: Testing

```bash
# Comprehensive testing
npm run test:coverage      # Unit tests with coverage
npm run test:e2e          # End-to-end tests
```

#### Stage 4: Deployment

- **Automatic**: Deploys to Vercel on `main` branch
- **Preview**: Creates preview deployments for merge requests
- **Rollback**: Automatic rollback on deployment failures

---

## 📦 Deployment Process

### Automatic Deployment (Recommended)

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Pipeline execution** (automatic)
   - Quality checks run
   - Build verification
   - Deployment to production
   - Performance validation

3. **Verification** (automatic)
   - Health checks
   - Performance metrics
   - Error monitoring

### Manual Deployment (Backup Method)

```bash
# 1. Verify build locally
npm run fix-all            # Ensure code quality
npm run build             # Verify production build

# 2. Deploy via Vercel CLI
vercel --prod             # Deploy to production

# 3. Verify deployment
curl -I https://toolhubx.uk  # Check response headers
```

---

## 🧪 Environment Management

### Production Environment

- **URL**: [toolhubx.uk](https://toolhubx.uk)
- **Purpose**: Live application for end users
- **Monitoring**: Full analytics and error tracking
- **Performance**: Optimized for speed and SEO

### Preview Environments

- **URL**: Auto-generated Vercel preview URLs
- **Purpose**: Testing merge requests before production
- **Monitoring**: Basic functionality testing
- **Access**: Shared via GitLab merge request comments

### Development Environment

- **URL**: `localhost:3000`
- **Purpose**: Local development and testing
- **Hot Reload**: Enabled for rapid iteration
- **Debug Mode**: Full error information displayed

---

## ⚡ Performance Optimization

### Build Optimizations

1. **Bundle Splitting**: Automatic code splitting by routes
2. **Tree Shaking**: Unused code elimination
3. **Image Optimization**: WebP conversion and lazy loading
4. **CSS Optimization**: Tailwind CSS purging and minification
5. **JavaScript Minification**: Terser for production builds

### Current Performance Metrics

| Metric | Target | Current | Status |
|---------|--------|---------|---------|
| First Contentful Paint | < 1.5s | 1.2s | ✅ |
| Largest Contentful Paint | < 2.5s | 2.1s | ✅ |
| Cumulative Layout Shift | < 0.1 | 0.05 | ✅ |
| Bundle Size | < 350kB | 280kB | ✅ |
| Lighthouse Performance | > 95 | 97 | ✅ |

### Monitoring Tools

- **Vercel Analytics**: Real user metrics
- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Google performance standards
- **Bundle Analyzer**: JavaScript bundle inspection

---

## 🛠️ Troubleshooting

### Common Deployment Issues

#### Build Failures

**Problem**: Build fails with TypeScript errors
```bash
Solution:
npm run fix-all           # Fix formatting and linting issues
npx tsc --noEmit         # Check for type errors
npm run build            # Retry build
```

**Problem**: Bundle size exceeds limits
```bash
Solution:
npm run build:analyze    # Analyze bundle composition
# Review and optimize large dependencies
npm run build            # Rebuild after optimization
```

#### Runtime Errors

**Problem**: Environment variables not loading
```bash
Solution:
# Check Vercel dashboard > Settings > Environment Variables
# Ensure NEXT_PUBLIC_ prefix for client-side variables
# Redeploy after updating variables
```

**Problem**: API routes failing
```bash
Solution:
# Check server logs in Vercel dashboard
# Verify API route file structure in src/app/api/
# Test locally with `npm run dev`
```

#### Performance Issues

**Problem**: Slow loading times
```bash
Solution:
npm run lighthouse-check  # Identify performance bottlenecks
# Optimize images, reduce bundle size
# Enable Vercel analytics for real user data
```

### Emergency Procedures

#### Immediate Rollback

```bash
# Via Vercel Dashboard
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

# Via Vercel CLI
vercel rollback           # Rollback to previous deployment
```

#### Critical Issue Response

1. **Assess Impact**: Check error rates and user reports
2. **Quick Fix**: Apply hotfix if possible
3. **Rollback**: Rollback to stable version if fix unavailable
4. **Communicate**: Update status page and notify users
5. **Post-Mortem**: Document issue and prevention measures

---

## 📊 Deployment History

### Recent Releases

#### v2.1.0 (October 2025) - Code Quality & Atomic Design Refactor ✅
- **Features**: Atomic component refactoring, accessibility improvements
- **Stack**: Next.js 15.5, React 19, TypeScript 5.9
- **Bundle**: ~280kB (maintained optimization)
- **Tests**: 21 unit tests + 5 E2E suites (coverage audit pending)
- **Quality**: Zero TypeScript errors, zero Biome violations
- **Status**: Active development - cleanup & refinement phase

#### v2.0.0 (August 2025) - Major UI/UX Overhaul ✅
- **Features**: Glass-morphism design system, enhanced table presentation
- **Performance**: 30-50% render time improvement with React 19
- **Bundle**: 280kB (optimized from 455kB)
- **Status**: Successfully deployed, later refined

### Performance Improvements Over Time

| Version | Bundle Size | Lighthouse Score | Load Time |
|---------|-------------|------------------|-----------|
| v1.1.3 | 455kB | 92 | 3.2s |
| v2.0.0 | 280kB | 97 | 1.2s |

---

## 🔐 Security Considerations

### Security Headers

Implemented via `next.config.ts`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
  // ... additional headers
];
```

### Data Protection

- **No Personal Data Storage**: All calculations performed client-side
- **GDPR Compliance**: Cookie consent and privacy controls
- **SSL/TLS**: Automatic HTTPS with HSTS headers
- **CSRF Protection**: Built-in Next.js protections

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Platform Overview](https://vercel.com/docs)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Performance Best Practices](https://web.dev/performance/)

### Monitoring & Analytics

- [Vercel Analytics Dashboard](https://vercel.com/dashboard)
- [Google Analytics](https://analytics.google.com)
- [Lighthouse CI Reports](https://github.com/GoogleChrome/lighthouse-ci)

### Support Contacts

- **Technical Issues**: Create issue in GitLab repository
- **Deployment Questions**: Check Vercel documentation
- **Performance Concerns**: Review Lighthouse reports

---

**Last Updated**: October 2, 2025
**Current Version**: v2.1.0 (Active Development)
**Deployment Status**: ✅ Fully Automated with Monitoring