# IndexNow Setup Guide

## What is IndexNow?

IndexNow is a protocol that allows websites to instantly notify search engines about content updates. It's supported by Microsoft Bing, Yandex, and other search engines.

**Benefits:**
- ⚡ Faster indexing (minutes instead of days/weeks)
- 🔄 Automatic notification on content updates
- 🆓 Completely free
- 🌐 Works with multiple search engines

---

## Setup Instructions

### Step 1: Generate an IndexNow Key

1. Visit https://www.bing.com/indexnow or generate a random key
2. Generate a unique API key (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
3. Copy this key - you'll need it for the next steps

**Alternative:** Generate your own key (32+ character hexadecimal string):
```bash
# Generate a random key
openssl rand -hex 32
```

### Step 2: Add Key to Environment Variables

Add to your `.env.local` file (for local development):
```bash
INDEXNOW_KEY=your-key-here
```

Add to Vercel environment variables (for production):
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add new variable:
   - **Name:** `INDEXNOW_KEY`
   - **Value:** Your generated key
   - **Environment:** Production, Preview, Development
3. Redeploy your site

### Step 3: Create Key File in Public Directory

Create a file in `/public/{your-key}.txt` containing only the key itself.

**Example:**
```bash
# File: /public/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
# Content:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

This file proves to search engines that you own the domain.

### Step 4: Test the API

After deployment, test your IndexNow endpoint:

```bash
# Check if configured
curl https://payetax.co.uk/api/indexnow

# Submit URLs for indexing
curl -X POST https://payetax.co.uk/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://payetax.co.uk/",
      "https://payetax.co.uk/blog",
      "https://payetax.co.uk/calculator/50000-after-tax"
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "submitted": 3,
  "message": "Successfully submitted 3 URLs to IndexNow"
}
```

### Step 5: Verify Key File is Accessible

Test that search engines can access your key file:
```bash
curl https://payetax.co.uk/{your-key}.txt
```

Should return your key.

---

## How to Use

### Manual Submission

Submit individual URLs via API call:
```bash
curl -X POST https://payetax.co.uk/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://payetax.co.uk/new-page"]}'
```

### Automatic Submission (Recommended)

Integrate with your deployment pipeline to auto-submit on content updates.

**Option 1: Vercel Deploy Hook**

Create a script that runs after deployment:

```typescript
// scripts/submit-to-indexnow.ts
const urls = [
  'https://payetax.co.uk/',
  'https://payetax.co.uk/blog',
  // Add all your important URLs
];

fetch('https://payetax.co.uk/api/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ urls }),
})
  .then(res => res.json())
  .then(data => console.log('IndexNow submission:', data))
  .catch(err => console.error('IndexNow error:', err));
```

Add to `package.json`:
```json
{
  "scripts": {
    "postbuild": "node scripts/submit-to-indexnow.js"
  }
}
```

**Option 2: GitHub Actions**

Create `.github/workflows/indexnow.yml`:
```yaml
name: Submit to IndexNow

on:
  push:
    branches: [main]

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - name: Submit URLs to IndexNow
        run: |
          curl -X POST https://payetax.co.uk/api/indexnow \
            -H "Content-Type: application/json" \
            -d '{"urls": ["https://payetax.co.uk/"]}'
```

---

## What URLs to Submit

### High Priority
- Homepage: `https://payetax.co.uk/`
- Main calculator: `https://payetax.co.uk/calculator`
- Blog hub: `https://payetax.co.uk/blog`
- New blog posts (immediately after publishing)
- Updated content (after significant changes)

### Medium Priority
- Popular calculator pages (e.g., `/calculator/50000-after-tax`)
- Category pages
- Static pages (About, Privacy)

### Low Priority (Skip)
- Pagination pages
- Archive pages
- Redirect pages

**Limit:** IndexNow accepts up to 10,000 URLs per request, but for best results, submit:
- **New content:** Immediately after publishing
- **Updated content:** When you make significant changes
- **Avoid:** Submitting the same URL multiple times per day

---

## Troubleshooting

### "IndexNow not configured" Error

**Cause:** `INDEXNOW_KEY` environment variable not set.

**Fix:**
1. Add key to `.env.local` (local dev)
2. Add to Vercel environment variables (production)
3. Redeploy

### Key File 404 Error

**Cause:** Key file not accessible at `https://payetax.co.uk/{key}.txt`

**Fix:**
1. Create file in `/public/{key}.txt`
2. Ensure file contains only the key (no extra whitespace)
3. Redeploy and test with `curl`

### "API returned 400/422" Error

**Causes:**
- Invalid URL format
- Key doesn't match key file
- Host mismatch

**Fix:**
1. Ensure all URLs start with `https://payetax.co.uk`
2. Verify key matches between API payload and key file
3. Check JSON payload structure

### URLs Not Getting Indexed

**Reality Check:** IndexNow doesn't guarantee indexing, it just notifies search engines faster.

**Timeline:**
- **Bing:** Usually 1-7 days after IndexNow submission
- **Yandex:** 1-14 days
- **Google:** Doesn't support IndexNow yet (use Search Console instead)

**Best Practice:**
- Continue submitting to Google Search Console
- Use IndexNow for Bing/Yandex
- Monitor Bing Webmaster Tools for indexing status

---

## Monitoring

### Check Submission Status

```bash
# Health check
curl https://payetax.co.uk/api/indexnow

# Response
{
  "service": "IndexNow",
  "configured": true,
  "message": "IndexNow is configured and ready"
}
```

### Bing Webmaster Tools

1. Sign up at https://www.bing.com/webmasters
2. Add and verify your site
3. Check "URL Inspection" to see indexing status
4. View IndexNow submission history

---

## Best Practices

### DO ✅
- Submit new content immediately after publishing
- Submit updated content after significant changes
- Keep your key file accessible
- Monitor Bing Webmaster Tools for indexing status
- Batch URLs in a single request when possible

### DON'T ❌
- Submit the same URL multiple times per day (rate limits)
- Submit >10,000 URLs in one request
- Share your IndexNow key publicly
- Expect instant indexing (takes 1-7 days typically)
- Rely solely on IndexNow (still use Search Console)

---

## Security Notes

1. **Key is semi-public:** The key file is publicly accessible, which is by design
2. **Domain verification:** Key file proves you own the domain
3. **No authentication needed:** IndexNow doesn't require OAuth/tokens
4. **Rate limiting:** Search engines may rate limit excessive submissions

**Your key proves ownership, but don't worry** - it's designed to be accessible via HTTP.

---

## Related Documentation

- **IndexNow Protocol:** https://www.indexnow.org/
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **API Endpoint:** `/src/app/api/indexnow/route.ts`
- **SEO Master Plan:** `/docs/SEO_MASTER_PLAN.md`

---

**Status:** ✅ Implemented in v2.0.1  
**Last Updated:** January 19, 2026  
**Next Steps:** Set up INDEXNOW_KEY and deploy
