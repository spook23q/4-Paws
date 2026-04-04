# 4 Paws Web App - Complete Deployment Setup Guide

## Quick Start (5 minutes)

### 1. Create Vercel Account
- Go to https://vercel.com and sign up with GitHub
- Authorize Vercel to access your GitHub repositories

### 2. Create Vercel Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
cd /home/ubuntu/4paws
vercel --prod
```

Follow the prompts:
- Link to GitHub repository
- Set project name: `4-paws-web`
- Framework: Leave blank (Expo handles it)
- Build command: `npm run build:web`
- Output directory: `dist`

### 3. Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:

```
EXPO_PUBLIC_API_URL=https://api.4paws.app
EXPO_PUBLIC_APP_NAME=4 Paws
EXPO_PUBLIC_ENVIRONMENT=production
```

Replace `https://api.4paws.app` with your actual backend API URL.

### 4. Deploy

```bash
# Redeploy with environment variables
vercel --prod
```

Your app is now live! Visit the Vercel-provided URL.

---

## Advanced Setup (GitHub Actions + Automatic Deployment)

### 1. Get Vercel Tokens

```bash
# Get Vercel token
vercel token create

# Get project ID
vercel project list
vercel project inspect 4-paws-web
```

### 2. Add GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:
- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `EXPO_PUBLIC_API_URL`: Your backend API URL

### 3. Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy-web.yml`) will:
- Build on every push to `main` and `develop`
- Deploy to production on `main` push
- Deploy to preview on pull requests
- Comment on PRs with deployment URL

### 4. Test the Workflow

```bash
# Push to trigger deployment
git push origin main
```

Check GitHub Actions tab to see the build progress.

---

## Custom Domain Setup

### 1. Add Domain to Vercel

In Vercel dashboard:
1. Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `app.4paws.co.nz`)

### 2. Update DNS Records

Vercel will show you the DNS records to add. Update your domain registrar:

**Option A: CNAME (Recommended)**
```
Name: app
Type: CNAME
Value: cname.vercel.com
```

**Option B: A Records**
```
Name: app
Type: A
Value: 76.76.19.165

Name: app
Type: A
Value: 76.76.19.166
```

### 3. Verify Domain

Wait 5-10 minutes for DNS to propagate, then verify in Vercel dashboard.

---

## Performance Optimization

### 1. Enable Caching

Vercel automatically caches static assets. Verify in Response Headers:
```
Cache-Control: public, max-age=31536000, immutable
```

### 2. Enable Compression

Vercel automatically gzips responses. No action needed.

### 3. Monitor Performance

Use Vercel Analytics:
1. Project Settings → Analytics
2. Enable Web Analytics
3. View real-time metrics

---

## Testing Before Deployment

### 1. Build Locally

```bash
npm run build:web
npm run web:preview
```

Visit http://localhost:3001 to test.

### 2. Test Key Flows

- [ ] Sign up / Sign in
- [ ] Browse sitters (if owner)
- [ ] Create booking
- [ ] Send message
- [ ] View profile
- [ ] Update settings
- [ ] View notifications

### 3. Cross-Browser Testing

Test on:
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile browsers (Chrome, Safari)

### 4. Performance Testing

Use Lighthouse:
```bash
# In Chrome DevTools: Ctrl+Shift+P → Lighthouse
```

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .expo
npm install
npm run build:web
```

### API Calls Fail

1. Check `EXPO_PUBLIC_API_URL` is set correctly
2. Verify backend CORS allows your domain
3. Check browser console for CORS errors

**Fix CORS on backend:**
```typescript
// In your Express server
app.use(cors({
  origin: ['https://app.4paws.co.nz', 'http://localhost:3001'],
  credentials: true
}));
```

### Styling Issues

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check Tailwind CSS is properly configured

### 404 Errors on Refresh

Vercel automatically handles this with `vercel.json` rewrites. If still having issues:

1. Check `vercel.json` exists in project root
2. Verify rewrites are configured:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

### Slow Performance

1. Check bundle size: `npm run build:web -- --analyze`
2. Use Lighthouse to identify bottlenecks
3. Enable Vercel Analytics to monitor real-world performance
4. Consider code splitting for large routes

---

## Monitoring & Maintenance

### 1. Set Up Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### 2. Monitor Uptime

Use a service like:
- Pingdom
- UptimeRobot
- Datadog

### 3. Regular Updates

- Update dependencies monthly: `npm update`
- Review security advisories: `npm audit`
- Monitor Vercel for platform updates

---

## Rollback

If deployment has issues:

```bash
# Option 1: Rollback in Vercel dashboard
# Go to Deployments tab, click "Promote" on a previous deployment

# Option 2: Rollback via CLI
vercel rollback

# Option 3: Revert git commit and push
git revert <commit-hash>
git push origin main
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Expo Web Docs:** https://docs.expo.dev/workflow/web/
- **GitHub Actions:** https://docs.github.com/en/actions
- **React Native Web:** https://necolas.github.io/react-native-web/

---

## Next Steps

1. ✅ Build web app locally: `npm run build:web`
2. ✅ Test locally: `npm run web:preview`
3. ⏭️ Create Vercel account and project
4. ⏭️ Configure environment variables
5. ⏭️ Deploy to production
6. ⏭️ Add custom domain
7. ⏭️ Set up GitHub Actions for automatic deployments
8. ⏭️ Monitor performance and errors
