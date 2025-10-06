# Complete Guide: Moving payetax.co.uk from GoDaddy to Vercel

**Last Updated:** 2025-10-06
**Domain:** payetax.co.uk
**Current Registrar:** GoDaddy
**Target Platform:** Vercel

---

## Table of Contents

1. [Understanding Your Options](#understanding-your-options)
2. [Recommended Approach: External DNS (Keep GoDaddy Registration)](#recommended-approach-external-dns)
3. [Alternative: Full Domain Transfer to Vercel](#alternative-full-domain-transfer)
4. [DNS Records Reference](#dns-records-reference)
5. [Troubleshooting Common Issues](#troubleshooting-common-issues)
6. [Verification Checklist](#verification-checklist)

---

## Understanding Your Options

### Option 1: External DNS (Recommended) ⭐
- **What:** Keep domain registered with GoDaddy, point DNS to Vercel
- **Pros:**
  - Fastest setup (5-30 minutes)
  - No transfer fees
  - Keep GoDaddy management portal
  - Easier to reverse if needed
- **Cons:**
  - Manage domain in 2 places (GoDaddy + Vercel)

### Option 2: Full Domain Transfer
- **What:** Transfer domain registration from GoDaddy to Vercel
- **Pros:**
  - Everything in one place (Vercel dashboard)
  - Slightly cheaper long-term (Vercel = $15/year, GoDaddy varies)
- **Cons:**
  - Takes 5-7 days to complete
  - Domain must be unlocked
  - Requires auth code
  - 60-day wait if recently transferred

**⚠️ IMPORTANT:** For production sites, use **Option 1 (External DNS)** first to get online quickly. You can always transfer later.

---

## Recommended Approach: External DNS

This keeps your domain registered with GoDaddy but routes all traffic through Vercel.

### Step 1: Add Domain to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **PayeTax** project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `payetax.co.uk`
6. Click **Add**

Vercel will show you DNS records to configure. **Keep this page open!**

---

### Step 2: Configure DNS in GoDaddy

#### 2.1 Login to GoDaddy

1. Go to [GoDaddy Domain Portfolio](https://dcc.godaddy.com/domains)
2. Find **payetax.co.uk**
3. Click the **DNS** button (or **Manage DNS**)

#### 2.2 Add Vercel's DNS Records

**You need to add 2 types of records:**

##### A Record (for payetax.co.uk)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 600 (or 1 Hour) |

**Steps:**
1. Click **Add** (or **Add Record**)
2. Select **Type:** A
3. **Name/Host:** @ (this means root domain)
4. **Value/Points to:** `76.76.21.21`
5. **TTL:** 600 seconds (or "1 Hour")
6. Click **Save**

##### CNAME Record (for www.payetax.co.uk)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `cname.vercel-dns.com` | 600 |

**Steps:**
1. Click **Add** (or **Add Record**)
2. Select **Type:** CNAME
3. **Name/Host:** www
4. **Value/Points to:** `cname.vercel-dns.com`
5. **TTL:** 600 seconds
6. Click **Save**

#### 2.3 Remove Conflicting Records (CRITICAL!)

**⚠️ THIS IS THE #1 REASON DOMAINS FAIL TO CONNECT**

**Check for and DELETE these if they exist:**

1. **Existing A records** pointing to old IPs (except the Vercel one you just added)
2. **Existing CNAME records** for @ (root) - these conflict with A records
3. **Parked domain records** (GoDaddy's default parking page)
4. **Forwarding records** set up in GoDaddy

**How to check:**
- Look through your DNS records
- If you see multiple A records for @ or multiple CNAMEs for www, **delete the old ones**
- Keep ONLY the Vercel records

**Common GoDaddy defaults to remove:**
```
A @ 160.153.x.x (GoDaddy parking)
A @ 184.168.x.x (GoDaddy parking)
CNAME @ @ (invalid, causes errors)
```

---

### Step 3: Wait for DNS Propagation

**Timeline:**
- **First check:** 5-10 minutes (GoDaddy updates their servers)
- **Full propagation:** 1-24 hours (global DNS servers update)
- **Vercel verification:** Usually within 30 minutes

**While waiting, check status:**

```bash
# Check if DNS is propagating
nslookup payetax.co.uk

# Should show:
# Address: 76.76.21.21
```

Or use online tools:
- https://www.whatsmydns.net/#A/payetax.co.uk
- https://dnschecker.org/#A/payetax.co.uk

---

### Step 4: Verify in Vercel

1. Go back to **Vercel Dashboard** → **Settings** → **Domains**
2. Wait for the domain status to change from "Invalid Configuration" to "Valid Configuration"
3. You should see a green checkmark ✅ next to `payetax.co.uk`

**If it says "Invalid Configuration" after 1 hour:**
- Click the **Refresh** button in Vercel
- Or click **Edit** → **Verify** to trigger a re-check

---

### Step 5: Set Primary Domain (Optional)

If you want `payetax.co.uk` (without www) as your primary domain:

1. In Vercel → **Settings** → **Domains**
2. Find `payetax.co.uk` in the list
3. Click the **•••** menu
4. Click **Set as Primary Domain**

This makes `www.payetax.co.uk` redirect to `payetax.co.uk` automatically.

---

### Step 6: Enable HTTPS (Automatic)

Vercel automatically provisions SSL certificates once DNS is verified:

1. Wait 5-10 minutes after DNS verification
2. Go to `https://payetax.co.uk`
3. You should see the 🔒 padlock (secure connection)

**If HTTPS doesn't work after 1 hour:**
- Click **Regenerate Certificate** in Vercel → Settings → Domains
- Wait another 5-10 minutes

---

## Alternative: Full Domain Transfer

**⚠️ Only do this if you want to fully move registration from GoDaddy to Vercel.**

### Prerequisites

Before starting:
- [ ] Domain must be **unlocked** at GoDaddy
- [ ] Domain must be older than **60 days** since last transfer
- [ ] You have access to the **admin email** for the domain
- [ ] **No active disputes** on the domain

### Step 1: Unlock Domain at GoDaddy

1. Go to [GoDaddy Domains](https://dcc.godaddy.com/domains)
2. Select **payetax.co.uk**
3. Scroll down to **Domain Details**
4. Find **Domain Lock** (or **Transfer Lock**)
5. Click **Edit** or toggle to **OFF**
6. Confirm the unlock

**Domain lock must be OFF for transfers to work.**

---

### Step 2: Get Authorization Code (EPP Code)

1. Still in GoDaddy domain settings
2. Find **Authorization Code** (or **Transfer Authorization Code** or **EPP Code**)
3. Click **Email my code** or **Get Authorization Code**
4. Check your email (registered domain admin email)
5. **Copy the code** - it looks like: `Ab12Cd34Ef56Gh78`

**⚠️ Keep this code safe!** It's like a password for your domain.

---

### Step 3: Initiate Transfer in Vercel

1. Go to [Vercel Domains](https://vercel.com/dashboard/domains)
2. Click **Transfer in a Domain**
3. Enter: `payetax.co.uk`
4. Click **Continue**
5. Paste your **Authorization Code** from Step 2
6. Review the cost (around $15 USD/year)
7. Click **Transfer Domain**

---

### Step 4: Approve Transfer Email

**Within 5-15 minutes:**
1. Check email sent to your domain admin email
2. **Subject:** "Transfer Authorization for payetax.co.uk"
3. Open the email
4. Click **Approve Transfer** (or similar button)

**⚠️ CRITICAL:** You must approve this email within **5 days** or the transfer will be cancelled.

---

### Step 5: Wait for GoDaddy to Release Domain

**Timeline:**
- **GoDaddy review:** 1-24 hours
- **Registry processing:** 3-5 days
- **Total time:** Usually 5-7 days

**What happens:**
1. GoDaddy receives transfer request
2. GoDaddy sends you a confirmation email
3. You have the option to **cancel** or **expedite**
4. If you do nothing, transfer completes after 5 days automatically

**To speed it up:**
1. Login to GoDaddy
2. Go to **Pending Transfers**
3. Click **Accept Transfer** (if available)
4. This reduces wait time to 24-48 hours

---

### Step 6: Verify Transfer Complete

1. Check Vercel Dashboard → Domains
2. Status should change to **Active**
3. Domain registration is now with Vercel
4. You can manage everything from Vercel dashboard

---

## DNS Records Reference

### Required Records for PayeTax

Once your domain is connected to Vercel (either method), you need these additional DNS records:

#### Resend Email Verification (for support@payetax.co.uk)

**You said domain is verified - these should already exist:**

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | @ | `resend-verification-code-here` | Domain verification |
| TXT | @ | `v=spf1 include:resend.com ~all` | SPF (sender policy) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC (email auth) |
| CNAME | `resend._domainkey` | `resend._domainkey.resend.com` | DKIM (signature) |

**Where to add these:**
- **If using External DNS (Option 1):** Add in GoDaddy DNS
- **If transferred to Vercel (Option 2):** Add in Vercel DNS

**Get your exact records:**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Select `payetax.co.uk`
3. Copy the **exact** DNS records shown
4. Add them to your DNS provider

---

#### Google Analytics (Optional - for analytics.google.com)

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| TXT | @ | `google-site-verification=xxxxx` | GA4 verification |

**Only needed if Google asks you to verify domain ownership.**

---

#### Redirect www → non-www (Automatic)

Vercel handles this automatically once both records exist:
- A record for `@` (payetax.co.uk)
- CNAME record for `www` (www.payetax.co.uk)

**Result:** www.payetax.co.uk → payetax.co.uk (301 redirect)

---

## Troubleshooting Common Issues

### Issue 1: "Domain is not configured correctly" in Vercel

**Symptoms:**
- Red X next to domain in Vercel
- Error: "The nameservers do not point to Vercel"

**Solution:**
1. Go to GoDaddy DNS settings
2. Check if A record exists: `@ → 76.76.21.21`
3. Check if CNAME exists: `www → cname.vercel-dns.com`
4. **Delete any conflicting records**
5. Wait 10-30 minutes
6. Click **Refresh** in Vercel

**Common conflicts:**
- Multiple A records for @
- CNAME for @ (root) - this is invalid, use A record instead
- GoDaddy parking page records (160.x.x.x or 184.x.x.x)

---

### Issue 2: "ERR_TOO_MANY_REDIRECTS" when visiting site

**Symptoms:**
- Browser says "This page isn't working"
- Infinite redirect loop

**Cause:** Conflicting SSL/redirect settings

**Solution:**
1. Go to Vercel → Settings → Domains
2. Remove the domain
3. Re-add the domain
4. Make sure you set ONE domain as primary
5. Wait for new SSL certificate (5-10 mins)

---

### Issue 3: SSL Certificate Won't Provision

**Symptoms:**
- "Not Secure" warning in browser
- Certificate error

**Solution:**
1. Verify DNS is correct (use dnschecker.org)
2. Wait 30-60 minutes for propagation
3. Go to Vercel → Settings → Domains
4. Click **Regenerate Certificate** next to domain
5. If still failing after 2 hours, contact Vercel support

---

### Issue 4: Domain Transfer Stuck/Failed

**Symptoms:**
- Transfer not completing after 7 days
- "Transfer Failed" email from Vercel

**Common Causes:**
1. **Domain locked at GoDaddy** → Unlock it
2. **Wrong auth code** → Get new code from GoDaddy
3. **Transfer approval email not clicked** → Check spam folder
4. **Domain registered < 60 days ago** → Wait until 60 days pass
5. **Privacy protection enabled** → Disable WHOIS privacy at GoDaddy

**Solution:**
1. Cancel failed transfer in Vercel
2. Fix the issue causing failure
3. Try again after 24 hours

---

### Issue 5: Emails Not Working After DNS Change

**Symptoms:**
- Can't receive emails at support@payetax.co.uk
- Resend dashboard shows "Domain not verified"

**Solution:**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click your domain → **View DNS Records**
3. **Copy ALL the TXT and CNAME records shown**
4. Add them to GoDaddy DNS (or Vercel DNS if transferred)
5. Wait 15-30 minutes
6. Click **Verify Domain** in Resend

**Missing records check:**
```bash
# Check SPF record
nslookup -type=TXT payetax.co.uk

# Should include: v=spf1 include:resend.com ~all
```

---

### Issue 6: Old Site Still Showing

**Symptoms:**
- DNS is configured correctly
- But old site/parking page still appears

**Cause:** Browser cache or ISP DNS cache

**Solution:**
1. **Clear browser cache:**
   - Chrome: Cmd+Shift+Delete → Clear cache
   - Safari: Safari → Clear History
2. **Flush DNS cache (Mac):**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```
3. **Try incognito/private mode**
4. **Check from different network** (use phone with wifi off)
5. **Wait for full propagation** (up to 24-48 hours)

---

### Issue 7: GoDaddy Rejecting DNS Changes

**Symptoms:**
- "Record cannot be added" error in GoDaddy
- Changes keep reverting

**Common Causes:**
1. **Domain forwarding enabled** in GoDaddy
2. **Email forwarding enabled** (conflicts with DNS)
3. **Website builder active** (GoDaddy site builder)

**Solution:**
1. **Disable forwarding:**
   - GoDaddy → Domain Settings → Forwarding
   - Click **Manage** next to Domain/Subdomain
   - Click **Delete** on all forwards
2. **Disable email forwarding:**
   - GoDaddy → Email → Forwarding
   - Remove all email forwards
3. **Cancel website hosting:**
   - GoDaddy → Hosting
   - Cancel any active hosting plans for this domain
4. Now try adding DNS records again

---

## Verification Checklist

### Pre-Launch Checklist

Before changing DNS, verify:

- [ ] Vercel project is deployed and working (test at payetax-xxx.vercel.app)
- [ ] Environment variables set in Vercel:
  - [ ] `RESEND_API_KEY`
  - [ ] `NEXT_PUBLIC_GA_ID`
- [ ] Build completing successfully (no errors)
- [ ] All pages loading correctly on preview URL

---

### DNS Configuration Checklist

After configuring DNS:

- [ ] A record added: `@ → 76.76.21.21`
- [ ] CNAME record added: `www → cname.vercel-dns.com`
- [ ] Old/conflicting records removed
- [ ] TTL set to 600 (or 1 hour)
- [ ] Waited 10-30 minutes for propagation

---

### Verification Commands

**Check DNS propagation:**

```bash
# Check A record (should show 76.76.21.21)
nslookup payetax.co.uk

# Check CNAME (should show cname.vercel-dns.com)
nslookup www.payetax.co.uk

# Check from multiple locations
# Use: https://www.whatsmydns.net/#A/payetax.co.uk
```

**Check SSL certificate:**

```bash
# Should show "issuer: C=US, O=Let's Encrypt"
openssl s_client -connect payetax.co.uk:443 -servername payetax.co.uk | grep issuer
```

**Check HTTP → HTTPS redirect:**

```bash
# Should return 301 or 308 redirect to https://
curl -I http://payetax.co.uk
```

---

### Post-Launch Checklist

After domain is live:

- [ ] `https://payetax.co.uk` loads correctly
- [ ] `https://www.payetax.co.uk` redirects to main domain
- [ ] `http://payetax.co.uk` redirects to HTTPS
- [ ] SSL certificate shows valid (🔒 padlock)
- [ ] All pages load (test: /, /about, /blog, /privacy)
- [ ] Calculator works
- [ ] Feedback form works (test sending feedback)
- [ ] Theme toggle works (in footer)
- [ ] Analytics tracking (check GA4 Real-Time)
- [ ] Service Worker installs (check Console for "[SW] Service Worker...")
- [ ] PWA install prompt appears (mobile)

---

## Quick Reference

### Key Vercel IPs & Endpoints

```
A Record:     76.76.21.21
CNAME:        cname.vercel-dns.com
Nameservers:  ns1.vercel-dns.com, ns2.vercel-dns.com (only if using Vercel DNS)
```

### Key Resend Records

Get your exact values from: https://resend.com/domains

```
TXT @:              resend-verification-XXXXX (your unique code)
TXT @:              v=spf1 include:resend.com ~all
TXT _dmarc:         v=DMARC1; p=none; rua=mailto:support@payetax.co.uk
CNAME resend._domainkey: resend._domainkey.resend.com
```

### DNS Propagation Check Sites

- https://www.whatsmydns.net
- https://dnschecker.org
- https://mxtoolbox.com/SuperTool.aspx

### Useful Commands

```bash
# Check DNS from command line
nslookup payetax.co.uk
dig payetax.co.uk

# Check SSL certificate
openssl s_client -connect payetax.co.uk:443 -servername payetax.co.uk

# Check HTTP headers
curl -I https://payetax.co.uk

# Flush DNS cache (Mac)
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Flush DNS cache (Windows)
ipconfig /flushdns
```

---

## Support Resources

### Vercel Support
- **Dashboard:** https://vercel.com/dashboard
- **Docs:** https://vercel.com/docs/concepts/projects/domains
- **Support:** https://vercel.com/support (chat in bottom right)

### GoDaddy Support
- **DNS Management:** https://dcc.godaddy.com/domains
- **Help:** https://www.godaddy.com/help
- **Phone:** 1-480-505-8877 (if you need to unlock domain quickly)

### Resend Support
- **Dashboard:** https://resend.com/domains
- **Docs:** https://resend.com/docs
- **Support:** support@resend.com

---

## Estimated Timeline

| Task | Time |
|------|------|
| Add domain to Vercel | 2 minutes |
| Configure DNS in GoDaddy | 5 minutes |
| DNS propagation | 10-30 minutes (up to 24 hours globally) |
| Vercel verification | 5-30 minutes |
| SSL certificate provisioning | 5-10 minutes |
| **Total (External DNS)** | **30-60 minutes typically** |
| | |
| Full domain transfer | 5-7 days |

---

## Final Notes

1. **Don't panic if it doesn't work immediately** - DNS changes can take time
2. **Test thoroughly before announcing** - use the post-launch checklist
3. **Keep backups** - Have your Vercel preview URL handy as a backup
4. **Document your DNS records** - Screenshot your GoDaddy DNS settings before changing

**Good luck with your launch! 🚀**

---

**Need Help?**

If you get stuck:
1. Check the [Troubleshooting](#troubleshooting-common-issues) section above
2. Use the [Verification Checklist](#verification-checklist)
3. Contact Vercel support via dashboard (they're very responsive)
4. Or ping me for help debugging specific errors

**Pro tip:** Screenshot every step so if something goes wrong, you can show support exactly what you did!
