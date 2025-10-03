# 🚀 PayeTax Deployment Checklist

Complete list of all credentials, IDs, and tokens needed for production deployment.

---

## 📝 Quick Reference - All IDs & Tokens

Copy your actual values here as you obtain them. This is your single source of truth.

### Google Analytics
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
**Status**: ⬜ Not yet created
**Get from**: https://analytics.google.com > Data Streams > Measurement ID
**Use in**: `.env.local` and Vercel Environment Variables

---

### M365 SMTP (Email System)
```env
M365_SMTP_HOST=smtp.office365.com
M365_SMTP_PORT=587
M365_EMAIL=jarryd@payetax.co.uk
M365_PASSWORD=your-new-app-password-here
```
**Status**: ⬜ Password needs to be changed
**Get from**: https://account.microsoft.com/security > App passwords
**Use in**: `.env.local` and Vercel Environment Variables

---

### Vercel Deployment (GitLab CI/CD)
```bash
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_xxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxx
```
**Status**: ⬜ Not yet obtained
**Get from**:
- Token: https://vercel.com/account/tokens
- IDs: Vercel Dashboard > Project > Settings > General

**Use in**: GitLab > Settings > CI/CD > Variables (Protected + Masked)
**URL**: https://gitlab.com/jarrydaubert/paye-tax/-/settings/ci_cd

---

### Optional: Buy Me a Coffee
```
Username: payetax
Account URL: https://buymeacoffee.com/payetax
```
**Status**: ⬜ Verify account exists
**Get from**: https://buymeacoffee.com
**Use in**: Already configured in `layout.tsx` (line 159)

---

## ✅ Completed / Already Have

### Domain
- **Production URL**: `https://payetax.co.uk` ✅
- **Status**: Configured in `.gitlab-ci.yml` and documentation

---

## ⚠️ CRITICAL - Required Before Launch

### 1. Google Analytics 4 (GA4) Configuration
**Purpose**: User analytics and traffic tracking

**Required Values**:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Action Required**:
1. Create new GA4 property at: https://analytics.google.com
2. Property Settings:
   - Property Name: `PayeTax UK Tax Calculator`
   - Time Zone: `United Kingdom`
   - Currency: `Pound Sterling (£)`
3. Data Streams > Add Stream > Web
   - Website URL: `https://payetax.co.uk`
   - Stream Name: `PayeTax Production`
4. Copy Measurement ID (format: `G-XXXXXXXXXX`)
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

**Where to Set**:
- **Local Development**: `/Users/jarrydaubert/Desktop/payetax/.env.local`
- **Vercel Production**: Project Settings > Environment Variables

**Features Configured**:
- IP anonymization for GDPR compliance ✅
- Consent mode (cookie banner) ✅
- Custom events (calculator usage, exports) ✅
- Page view tracking ✅

**Status**: ❌ New property needs to be created

---

### 2. M365 SMTP Configuration (Email Feedback System)
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

### 3. Vercel Deployment Tokens (GitLab CI/CD)
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

### 4. Vercel Analytics (Optional but Recommended)
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

### 5. Buy Me a Coffee Widget
**Purpose**: Optional donation support widget

**Current Status**: Configured with username `payetax`
- Widget loads from: https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js
- Account: https://buymeacoffee.com/payetax

**Action**: Verify account exists or update username in `src/app/layout.tsx` (line 159)

**Status**: ⚠️ Verify account

---

### 6. PWA & Service Worker (Already Configured)
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

### 7. Structured Data & SEO (Already Configured)
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

### 8. GitLab Branch Protection
**Purpose**: Prevent force pushes to main

**Current Issue**: Main branch is protected (good!) but blocks force push
**Status**: ✅ Working as intended - use merge/pull instead

---

### 9. Security Headers (Vercel)
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

- [ ] **Create new GA4 property and get Measurement ID**
- [ ] **Add GA4 ID to `.env.local` and Vercel**
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
