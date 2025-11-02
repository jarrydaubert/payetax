# iPhone PWA Install Prompt - Known Behavior

**Issue Date:** 2 November 2025  
**Status:** ✅ Working as Designed (Not a Bug)

---

## Issue Report

**User reported:** "Not seeing the install notification on iPhone"

## Analysis

### How iOS PWA Install Works

**iOS Safari does NOT support the `beforeinstallprompt` event:**
- This is a Chromium-only API
- iOS uses a completely different install mechanism
- No automatic install banners on iOS

### Current Implementation

Our PWA install code (register-sw.js):
```javascript
window.addEventListener('beforeinstallprompt', () => {
  // Don't prevent default - let browser handle the install prompt
  t('[PWA] Install prompt triggered - browser will show native UI');
});
```

**This works for:**
- ✅ Chrome (Desktop & Android)
- ✅ Edge (Desktop & Android)
- ✅ Samsung Internet
- ❌ Safari (iOS & macOS) - Does not fire this event

---

## iOS PWA Installation Process

### How Users Install on iPhone/iPad

**Manual Process:**
1. Open payetax.co.uk in Safari
2. Tap the **Share button** (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** to confirm

**No automatic prompts available on iOS** - This is an Apple limitation, not a bug in our code.

### Why iOS is Different

Apple restricts PWA installation to prevent:
- Spam install prompts
- Non-Safari browsers from installing PWAs
- Bypassing App Store review

---

## What We've Implemented

### ✅ All Required PWA Features

1. **Valid manifest.json** ✅
   - Name, icons (180x180, 192x192, 512x512)
   - Start URL, display mode, theme color
   - iOS meta tags for status bar

2. **Service Worker** ✅
   - Offline support
   - Cache strategies
   - Update notifications

3. **iOS Meta Tags** ✅
   ```html
   <meta name="apple-mobile-web-app-capable" content="yes" />
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
   <meta name="apple-mobile-web-app-title" content="PayeTax" />
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   ```

4. **Installability** ✅
   - App IS installable on iOS
   - Just requires manual user action
   - This is by design (Apple's design)

---

## Platform Comparison

| Feature | Chrome/Edge | Safari iOS | Safari macOS |
|---------|-------------|------------|--------------|
| beforeinstallprompt event | ✅ | ❌ | ❌ |
| Auto install banner | ✅ | ❌ | ❌ |
| Manual install | ✅ | ✅ | ✅ (Sonoma+) |
| Install location | Address bar + Menu | Share → Add to Home Screen | Address bar |
| Criteria | Engagement heuristics | Always available | Always available |

---

## Solutions

### Option 1: Do Nothing (Recommended)

**Reasoning:**
- iOS users are familiar with the Share → Add to Home Screen flow
- Any custom "install" prompt on iOS would be misleading (can't trigger programmatically)
- Apple explicitly doesn't want auto-prompts

**Verdict:** This is the standard approach for iOS PWAs.

### Option 2: Add iOS Install Instructions

Show instructions for iOS users:

```typescript
// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS && !navigator.standalone) {
  // Show instructions modal/banner
  <div>
    <p>Install PayeTax for offline access:</p>
    <ol>
      <li>Tap the Share button</li>
      <li>Select "Add to Home Screen"</li>
      <li>Tap "Add"</li>
    </ol>
  </div>
}
```

**Note:** `navigator.standalone` tells if app is already installed.

### Option 3: iOS-Specific Banner

Many sites show a persistent banner with instructions:

```
┌────────────────────────────────────────┐
│ 📱 Install PayeTax                      │
│ Tap [Share icon] → Add to Home Screen  │
│                                   [×]  │
└────────────────────────────────────────┘
```

**Examples:**
- Twitter shows this banner
- Instagram shows this banner
- Many PWAs use this pattern

---

## Recommendation

### Short-term: Document Expected Behavior

Add to About page or FAQ:

**"How do I install PayeTax?"**

**On iPhone/iPad:**
1. Open Safari
2. Tap Share button
3. Select "Add to Home Screen"

**On Android/Desktop:**
- Chrome will show an install prompt automatically
- Or: Menu → Install PayeTax

### Long-term: Consider iOS Install Banner

If analytics show high iOS traffic, add a dismissible banner with install instructions.

---

## Testing

**Verified on:**
- ✅ Chrome Android - Auto prompt works
- ✅ Chrome Desktop - Install icon in address bar
- ✅ Edge Desktop - Install prompt works
- ✅ Safari iOS - Manual install works (Share → Add to Home Screen)

**Expected behavior confirmed** - No bugs found.

---

## References

- [MDN: beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)
- [Can I Use: beforeinstallprompt](https://caniuse.com/mdn-api_beforeinstallprompteven) - Not supported in Safari
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

---

## Conclusion

**Status:** ✅ **NOT A BUG** - Working as designed

**iPhone PWA install:**
- Requires manual user action
- No programmatic trigger available
- This is an Apple platform limitation
- Our implementation is correct

**No action needed** unless we want to add iOS-specific install instructions.
