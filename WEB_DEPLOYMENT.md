# 4 Paws Web App Deployment Guide

## Overview

The 4 Paws app is built with React Native Web, which means it runs on both mobile (iOS/Android) and web (browsers). This guide covers deploying the web version to a permanent domain.

## Architecture

- **Frontend:** React Native Web (Expo) — runs on all modern browsers
- **Backend:** Node.js/Express API (already deployed to AWS)
- **Database:** PostgreSQL (already deployed to AWS)
- **Web Hosting:** Vercel, Netlify, or AWS S3 + CloudFront (recommended: Vercel for simplicity)

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Pros:** Zero-config deployment, automatic HTTPS, CDN included, free tier available
**Cons:** Limited to Vercel's infrastructure

**Steps:**
1. Push your code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables (API_URL, etc.)
4. Deploy with one click

### Option 2: Netlify

**Pros:** Similar to Vercel, good free tier, easy setup
**Cons:** Similar limitations to Vercel

**Steps:**
1. Push code to GitHub
2. Connect to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist` or `web-build`
5. Deploy

### Option 3: AWS S3 + CloudFront (Most Control)

**Pros:** Full control, scalable, integrates with existing AWS backend
**Cons:** More complex setup

**Steps:**
1. Build: `npm run build`
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Set custom domain via Route53

## Build Configuration

### Web Build Command

```bash
# Build for web
npx expo export --platform web --output-dir dist

# Or use the npm script
npm run build:web
```

### Environment Variables for Web

Create `.env.production` for production:

```
EXPO_PUBLIC_API_URL=https://api.4paws.app
EXPO_PUBLIC_APP_NAME=4 Paws
EXPO_PUBLIC_ENVIRONMENT=production
```

## Pre-Deployment Checklist

- [ ] All screens tested on desktop (1920x1080), tablet (768x1024), and mobile (375x667)
- [ ] API endpoints configured for production backend
- [ ] Authentication flow works in browser
- [ ] Push notifications gracefully degrade on web (not available)
- [ ] File uploads work correctly
- [ ] Payment flow (Stripe) tested end-to-end
- [ ] Error handling and fallbacks in place
- [ ] Performance optimized (lazy loading, code splitting)
- [ ] SEO meta tags configured
- [ ] Analytics tracking configured

## Web-Specific Considerations

### Platform Detection

The app already detects platform and disables mobile-only features:

```typescript
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  // Mobile-only code (haptics, native features)
}
```

### Browser Storage

- **Mobile:** AsyncStorage (native)
- **Web:** AsyncStorage (uses localStorage under the hood)

No changes needed — AsyncStorage works on both.

### Responsive Design

The app already uses:
- `useScreenLayout` hook for responsive layouts
- Tailwind CSS for responsive classes
- SafeAreaView for safe zones

All screens adapt to landscape/portrait automatically.

### Limitations on Web

1. **Push Notifications:** Not available (gracefully disabled)
2. **Haptics:** Not available (gracefully disabled)
3. **Camera/Photo Library:** Limited (uses browser APIs)
4. **Geolocation:** Works but requires HTTPS + user permission
5. **Native Modules:** Disabled (uses web fallbacks)

## Deployment Steps

### Step 1: Build for Web

```bash
cd /home/ubuntu/4paws
npm run build:web
```

This creates a `dist` or `web-build` directory with static files.

### Step 2: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Follow the prompts to:
- Link to your GitHub repo
- Set project name
- Configure environment variables
- Deploy

### Step 3: Configure Custom Domain

1. Go to Vercel dashboard
2. Project Settings → Domains
3. Add your custom domain (e.g., `app.4paws.co.nz`)
4. Update DNS records at your domain registrar

### Step 4: Set Environment Variables

In Vercel dashboard:
1. Settings → Environment Variables
2. Add `EXPO_PUBLIC_API_URL` pointing to your production API
3. Add any other required variables
4. Redeploy

### Step 5: Monitor and Test

1. Visit your deployed URL
2. Test all major flows:
   - Sign up / Sign in
   - Browse sitters (owners)
   - Create booking
   - Send message
   - View bookings
   - Update profile
3. Check browser console for errors
4. Test on multiple browsers and devices

## Performance Optimization

### Code Splitting

Expo already handles code splitting for web. Verify with:

```bash
npm run build:web -- --analyze
```

### Image Optimization

- Use `expo-image` for automatic optimization
- Images are cached by CDN

### Caching Strategy

- Static assets: Cache for 1 year
- HTML: Cache for 1 hour (or no-cache)
- API responses: Handled by React Query

## Monitoring & Analytics

### Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/react
```

### Analytics

Add Amplitude or Mixpanel:

```bash
npm install @amplitude/analytics-browser
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .expo
npm install
npm run build:web
```

### API Calls Fail

- Check `EXPO_PUBLIC_API_URL` is set correctly
- Verify backend CORS allows your domain
- Check browser console for CORS errors

### Styling Issues

- Check Tailwind CSS is properly configured
- Verify theme colors are applied
- Test in multiple browsers

### Performance Issues

- Use browser DevTools to profile
- Check Network tab for large assets
- Use Lighthouse for performance audit

## Rollback

If deployment has issues:

```bash
# Vercel: Use dashboard to rollback to previous deployment
# Or redeploy previous commit
git revert <commit-hash>
git push
vercel --prod
```

## Next Steps

1. Choose hosting platform (Vercel recommended)
2. Build and test locally: `npm run build:web`
3. Deploy to staging first
4. Test all flows on staging
5. Deploy to production
6. Monitor for errors
7. Gather user feedback

## Support

For issues:
- Check Expo Web documentation: https://docs.expo.dev/workflow/web/
- Check Vercel documentation: https://vercel.com/docs
- Review browser console for errors
- Test on multiple browsers
