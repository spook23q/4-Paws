# 4 Paws Web App — Vercel Deployment Guide

Deploy your 4 Paws web app to Vercel in 10 minutes with a permanent domain.

---

## Prerequisites

- ✅ GitHub account (with 4paws repository)
- ✅ Vercel account (free tier available)
- ✅ Ionos account (domain registrar)
- ✅ Domain: `4paws-catsonly.online`
- ✅ Backend API: `https://4-paws-catsonly.base44.app`

---

## Step 1: Create a Vercel Project

### 1.1 Sign In to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Sign In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### 1.2 Import Your Repository

1. After signing in, click **"Add New..."** in the top-right
2. Select **"Project"**
3. Under "Import Git Repository", find **4paws**
4. Click **"Import"**

---

## Step 2: Configure Build Settings

### 2.1 Project Settings

On the import screen, configure these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Leave blank (or select "Other") |
| **Build Command** | `npm run build:web` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.2 Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `EXPO_PUBLIC_API_URL` | `https://4-paws-catsonly.base44.app` |
| `EXPO_PUBLIC_APP_NAME` | `4 Paws` |
| `NODE_ENV` | `production` |

---

## Step 3: Deploy

1. Click **"Deploy"** button
2. Wait 3-5 minutes for the build to complete
3. Once complete, you'll see a success message with a URL like:
   - `https://4paws-catsonly.vercel.app`

✅ **Your web app is now live!** Test it at that URL.

---

## Step 4: Add Custom Domain

### 4.1 In Vercel Dashboard

1. Go to your project dashboard
2. Click **"Settings"** tab
3. Select **"Domains"** from the left menu
4. Click **"Add Domain"**
5. Enter: `4paws-catsonly.online`
6. Click **"Add"**

### 4.2 Configure DNS at Ionos

Vercel will show you DNS records to add. In Ionos:

1. Log in to **https://www.ionos.com**
2. Go to **"Domains"** → **"4paws-catsonly.online"**
3. Click **"DNS Settings"**
4. Add the Vercel DNS records:
   - **Type:** `CNAME`
   - **Name:** `www` (or as specified by Vercel)
   - **Value:** `cname.vercel-dns.com` (or Vercel's provided value)

5. Also add (if needed):
   - **Type:** `A`
   - **Name:** `@` (root)
   - **Value:** `76.76.19.163` (Vercel's IP)

6. **Save changes** — DNS propagation takes 5-30 minutes

### 4.3 Verify Domain in Vercel

1. Return to Vercel dashboard
2. Refresh the Domains page
3. Once DNS propagates, you'll see ✅ **"Valid Configuration"**
4. Your app is now accessible at: `https://4paws-catsonly.online`

---

## Step 5: Test Your Deployment

### 5.1 Test Web App

1. Visit **https://4paws-catsonly.online**
2. Test core flows:
   - Sign up as owner/sitter
   - Browse sitters
   - Create a booking
   - Send a message
   - Check notifications

### 5.2 Test Backend Connection

1. In the app, try signing up
2. Check that:
   - API calls reach your backend (`4-paws-catsonly.base44.app`)
   - Notifications work
   - Payments process (if testing)

---

## Step 6: Enable HTTPS & Security

Vercel automatically provides HTTPS with free SSL certificates. No action needed!

### Optional: Security Headers

Vercel's `vercel.json` already includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Step 7: Monitor & Maintain

### 7.1 View Logs

1. In Vercel dashboard, click **"Deployments"**
2. Select a deployment to see build logs
3. Click **"Runtime Logs"** to see errors

### 7.2 Redeploy

To redeploy after code changes:
1. Push changes to GitHub
2. Vercel automatically rebuilds and deploys
3. Check **"Deployments"** tab for status

### 7.3 Rollback

If something breaks:
1. Go to **"Deployments"**
2. Find the previous working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Troubleshooting

### Build Fails

**Error:** `npm run build:web` fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `EXPO_PUBLIC_API_URL` is set correctly
3. Verify `package.json` has `build:web` script
4. Check for TypeScript errors: `npm run check`

### Domain Not Working

**Error:** `4paws-catsonly.online` shows 404 or doesn't load

**Solution:**
1. Verify DNS records at Ionos are correct
2. Wait 30 minutes for DNS propagation
3. Use `nslookup 4paws-catsonly.online` to check DNS
4. Check Vercel dashboard shows ✅ "Valid Configuration"

### App Loads But API Calls Fail

**Error:** Bookings, messages, or auth don't work

**Solution:**
1. Check `EXPO_PUBLIC_API_URL` is correct: `https://4-paws-catsonly.base44.app`
2. Verify backend is running and accessible
3. Check browser console for CORS errors
4. Ensure backend has CORS enabled for `https://4paws-catsonly.online`

### Slow Performance

**Solution:**
1. Vercel CDN caches static assets globally
2. First load may be slow (cold start)
3. Subsequent loads are fast
4. Check **"Analytics"** tab in Vercel for performance metrics

---

## Next Steps

1. ✅ **Web app deployed** — Users can now access via browser
2. 📱 **Mobile app** — Continue with iOS/Android app store submissions
3. 🎯 **Marketing** — Share `https://4paws-catsonly.online` with early users
4. 📊 **Analytics** — Set up Google Analytics to track web traffic
5. 🔔 **Notifications** — Test push notifications on web (if using PWA)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Ionos Support:** https://www.ionos.com/help
- **4 Paws Backend:** `https://4-paws-catsonly.base44.app`

---

**Deployment Date:** March 12, 2026  
**Domain:** 4paws-catsonly.online  
**Backend API:** https://4-paws-catsonly.base44.app
