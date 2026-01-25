# Lighthouse Performance Scores

## Latest Report: Jan 25, 2026

| Metric | Mobile | Desktop |
|--------|--------|---------|
| **Performance** | 98 | 100 |
| **Accessibility** | 96 | 96 |
| **Best Practices** | 96 | 96 |
| **SEO** | 100 | 100 |

Source: PageSpeed Insights / Lighthouse v13.0.1

---

## History

| Date | Version | Mobile Perf | Desktop Perf | Notes |
|------|---------|-------------|--------------|-------|
| 2026-01-25 | v4.9.6 | 98 | 100 | Post-newsletter system, lazy loading optimizations |

---

## Key Optimizations Applied

### Performance
- DeferredContent with IntersectionObserver (lazy calculator loading)
- Dynamic imports for Recharts (-571KB from initial bundle)
- Server-rendered hero for instant LCP
- Bundle reduced from 15MB → 2.8MB (-81%)
- PWA with service worker caching

### Accessibility
- WCAG 2.2 AA compliance
- Proper ARIA labels
- Keyboard navigation support
- Color contrast ratios verified

### SEO
- Dynamic sitemap with 200+ pages
- Structured data (JSON-LD)
- Meta descriptions on all pages
- Canonical URLs
- Mobile-first responsive design

---

## How to Run Lighthouse

```bash
# Via Chrome DevTools
# 1. Open site in Chrome
# 2. F12 → Lighthouse tab → Generate report

# Via PageSpeed Insights
# https://pagespeed.web.dev/

# Via CLI (if installed)
lighthouse https://payetax.co.uk --output=json --output-path=./lighthouse-report.json
```

## Target Scores

| Metric | Target | Current |
|--------|--------|---------|
| Performance | >90 | ✅ 98-100 |
| Accessibility | >90 | ✅ 96 |
| Best Practices | >90 | ✅ 96 |
| SEO | >90 | ✅ 100 |
