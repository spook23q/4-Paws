# 4 Paws - Pre-Launch Landing Page

A simple, cute landing page to capture email sign-ups before the official 4 Paws app launch.

## Files

- `index.html` - Complete standalone landing page
- `cat-hero.png` - Cat illustration image

## Features

✨ **Simple & Cute Design**
- Soft gradient background (tan to light blue)
- Circular logo with cat illustration
- Paw print decorations
- Clean, modern typography

📧 **Email Capture Form**
- Large, friendly email input
- "Join Waitlist" call-to-action button
- Success message after submission
- Privacy reassurance text

🎨 **Key Elements**
- 4 P🐾WS branding
- "Cats Only" tagline
- Feature highlights (Cat-Only, Verified, Chat, Secure)
- Social proof (500+ cat owners joined)
- Mobile responsive design

## Deployment Options

### Option 1: Static Hosting (Easiest)

**Netlify (Free)**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `landing-page` folder
3. Done! Your site is live

**Vercel (Free)**
1. Go to [vercel.com](https://vercel.com)
2. Import the `landing-page` folder
3. Deploy

**GitHub Pages (Free)**
1. Create a new GitHub repository
2. Upload `index.html` and `cat-hero.png`
3. Enable GitHub Pages in settings
4. Access at `https://yourusername.github.io/repo-name`

### Option 2: Traditional Web Hosting

Upload both files to your web host via FTP:
- `index.html`
- `cat-hero.png`

### Option 3: Custom Domain

After deploying to Netlify/Vercel:
1. Buy a domain (e.g., `4paws.com.au`)
2. Point domain to your deployment
3. SSL certificate is automatic

## Email Integration

The form currently shows a success message but doesn't store emails. To collect emails, integrate with one of these services:

### Mailchimp (Recommended)
```javascript
// Replace the fetch call in the script with:
fetch('https://YOUR_MAILCHIMP_ENDPOINT', {
    method: 'POST',
    body: JSON.stringify({ email: email }),
    headers: { 'Content-Type': 'application/json' }
})
```

### ConvertKit
```javascript
fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
    method: 'POST',
    body: JSON.stringify({
        api_key: 'YOUR_API_KEY',
        email: email
    }),
    headers: { 'Content-Type': 'application/json' }
})
```

### Your Own Backend
```javascript
fetch('https://your-api.com/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email: email }),
    headers: { 'Content-Type': 'application/json' }
})
```

### Google Sheets (No-Code Option)
1. Use a service like [Sheet.best](https://sheet.best)
2. Connect your Google Sheet
3. Get API endpoint
4. Replace fetch URL

## Customization

### Change Colors
Edit the CSS variables in `<style>`:
- Background gradient: `background: linear-gradient(135deg, #FFF5E6 0%, #E6F4FE 100%);`
- Primary color: `#0a7ea4` (blue)
- Text color: `#11181C` (dark)

### Change Text
Edit the HTML content:
- Headline: `<h1>4 P🐾WS</h1>`
- Tagline: `<p class="tagline">Paws & Peace of Mind — Cats Only</p>`
- Description: `<p class="description">...</p>`

### Change Social Proof Number
Edit: `<span class="social-number">500+</span>`

## Analytics

### Add Google Analytics
Add before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Add Facebook Pixel
Add before `</head>`:
```html
<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

## SEO

The page includes:
- Meta description
- Meta keywords
- Semantic HTML
- Mobile viewport
- Fast loading (single file)

### Improve SEO
1. Add Open Graph tags for social sharing
2. Add Twitter Card tags
3. Submit sitemap to Google Search Console
4. Get backlinks from pet blogs/forums

## Marketing Tips

### Before Launch
1. Share on social media (Facebook groups, Instagram, TikTok)
2. Post in cat owner forums (Reddit r/cats, r/CatAdvice)
3. Email existing contacts
4. Run Facebook/Instagram ads ($50-200 budget)
5. Partner with local cat cafes/vet clinics

### Track Performance
- Monitor email sign-ups daily
- A/B test different headlines
- Try different social proof numbers
- Test different CTA button text

### Launch Day
1. Email all waitlist subscribers
2. Offer early bird discount (10-20% off first booking)
3. Create urgency ("First 100 users get...")
4. Share success stories

## Support

For questions or issues, contact: [your-email@example.com]

---

**Good luck with your launch! 🚀🐱**
