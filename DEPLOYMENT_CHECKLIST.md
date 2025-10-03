# 🚀 PayeTax Deployment Checklist

Complete list of all credentials, IDs, and tokens needed for production deployment.

---

## ✅ Completed / Already Have

### Google Analytics
- **GA ID**: `G-99DW6ZQWMT` ✅
- **Location**: Set in `.env.local`
- **Used by**: GA4 tracking in `src/components/analytics/Analytics.tsx`
- **Status**: Active and configured

### Domain
- **Production URL**: `https://payetax.co.uk` ✅
- **Status**: Configured in `.gitlab-ci.yml` and documentation

---

## ⚠️ CRITICAL - Required Before Launch

### 1. M365 SMTP Configuration (Email Feedback System)
**Purpose**: Error reporting and user feedback emails

**Required Values**:
```env
M365_SMTP_HOST=smtp.office365.com
M365_SMTP_PORT=587
M365_EMAIL=jarryd@payetax.co.uk
M365_PASSWORD=<your-new-app-password>
```

**Action Required**:
1. ⚠️ **CHANGE PASSWORD** - Old password `Hermanus01!` was exposed in `.env.local.example`
2. Go to: https://account.microsoft.com/security
3. Navigate to "Security" > "Advanced security options"
4. Under "App passwords", select "Create a new app password"
5. Copy generated password to `.env.local` file (NOT `.env.local.example`)

**Where to Set**:
- **Local Development**: `/Users/jarrydaubert/Desktop/payetax/.env.local`
- **Vercel Production**: Project Settings > Environment Variables

**Status**: ❌ Password needs to be changed and set

---

### 2. Vercel Deployment Tokens (GitLab CI/CD)
**Purpose**: Automated deployments from GitLab CI/CD pipeline

**Required Values**:
```bash
VERCEL_TOKEN=<vercel-cli-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
```

**How to Get**:

#### VERCEL_TOKEN
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `PayeTax GitLab CI`
4. Scope: Full Access (or limit to specific projects)
5. Copy token (shown once only!)

#### VERCEL_ORG_ID & VERCEL_PROJECT_ID
**Option 1 - From Vercel Dashboard**:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings > General
4. Copy "Project ID" and "Team ID" (or Personal Account ID)

**Option 2 - Using Vercel CLI** (after linking project):
```bash
cd /Users/jarrydaubert/Desktop/payetax
npx vercel link
cat .vercel/project.json
```

**Where to Set**:
- GitLab: Settings > CI/CD > Variables (Protected + Masked)
  - https://gitlab.com/jarrydaubert/paye-tax/-/settings/ci_cd

**Status**: ❌ Not configured yet

---

### 3. Vercel Analytics (Optional but Recommended)
**Purpose**: Web Vitals and performance tracking

**How to Enable**:
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select PayeTax project
3. Analytics tab > Enable Analytics
4. Speed Insights tab > Enable Speed Insights

**Cost**: FREE on Hobby tier
- Unlimited pageviews
- CSV exports (250 rows)
- 2-year data retention

**Status**: ✅ Code integrated (lines 9-10, 155-156 in `layout.tsx`)
⚠️ Needs activation in Vercel Dashboard

---

## 📋 Optional Configuration (Post-Launch)

### 4. Buy Me a Coffee Widget
**Purpose**: Optional donation support widget

**Current Status**: Configured with username `payetax`
- Widget loads from: https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js
- Account: https://buymeacoffee.com/payetax

**Action**: Verify account exists or update username in `src/app/layout.tsx` (line 159)

**Status**: ⚠️ Verify account

---

### 5. PWA & Service Worker (Already Configured)
**Purpose**: Progressive Web App functionality

**Files**:
- `/public/manifest.json` ✅
- `/public/sw.js` ✅
- `/public/register-sw.js` ✅

**Icons**:
- All favicon sizes configured ✅
- Android Chrome icons: 192x192, 512x512 ✅
- Apple touch icon ✅

**Status**: ✅ Fully configured

---

### 6. Structured Data & SEO (Already Configured)
**Purpose**: Search engine optimization

**Configured**:
- Sitemap: `https://payetax.co.uk/sitemap.xml` ✅
- Robots.txt: `https://payetax.co.uk/robots.txt` ✅
- Schema.org markup in `layout.tsx` ✅
- Blog post canonical URLs ✅
- AEO Dataset schema ✅

**Status**: ✅ Fully configured

---

## 🔐 Security Configuration

### 7. GitLab Branch Protection
**Purpose**: Prevent force pushes to main

**Current Issue**: Main branch is protected (good!) but blocks force push
**Status**: ✅ Working as intended - use merge/pull instead

---

### 8. Security Headers (Vercel)
**Purpose**: CSP, HSTS, Permissions Policy

**Configured in**: `/vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Status**: ✅ Configured

---

## 📝 Pre-Launch Checklist Summary

### Must Complete Before Going Live:

- [ ] **Change M365 password** (security critical!)
- [ ] **Add M365 credentials to `.env.local`**
- [ ] **Get Vercel deployment token**
- [ ] **Get Vercel Org ID and Project ID**
- [ ] **Add Vercel variables to GitLab CI/CD**
- [ ] **Enable Vercel Analytics in dashboard**
- [ ] **Verify Buy Me a Coffee account exists**
- [ ] **Test deployment pipeline end-to-end**
- [ ] **Verify emails work (feedback form)**

### Nice to Have (Can do post-launch):

- [ ] Set up Vercel deployment notifications (Slack/Discord)
- [ ] Configure custom domain DNS (if not already done)
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error tracking (Sentry optional)

---

## 🎯 Quick Start Commands

```bash
# Local development with all env vars
cp .env.local.example .env.local
# Edit .env.local with real credentials
npm install
npm run dev

# Test production build
npm run build
npm run start

# Deploy to Vercel (after CI/CD setup)
git push origin main  # Triggers GitLab CI → Vercel
```

---

## 📞 Support Resources

| Service | Dashboard URL | Docs |
|---------|--------------|------|
| **Vercel** | https://vercel.com/dashboard | https://vercel.com/docs |
| **GitLab CI/CD** | https://gitlab.com/jarrydaubert/paye-tax/-/pipelines | https://docs.gitlab.com/ee/ci/ |
| **Google Analytics** | https://analytics.google.com | https://support.google.com/analytics |
| **M365 Admin** | https://admin.microsoft.com | https://docs.microsoft.com/microsoft-365 |

---

## 🚨 Security Notes

1. **Never commit** real credentials to Git
2. **Always use** GitLab CI/CD Variables (Masked + Protected)
3. **Rotate tokens** every 90 days (calendar reminder)
4. **Use separate** tokens for dev/staging/prod
5. **Enable 2FA** on Vercel, GitLab, Microsoft accounts

---

**Last Updated**: 2025-10-03
**Status**: Ready for deployment after completing "Must Complete" items above
**Repository**: https://gitlab.com/jarrydaubert/paye-tax
