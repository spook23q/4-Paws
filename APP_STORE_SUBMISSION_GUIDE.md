# 4 Paws - App Store Submission Guide

## Quick Start

### Option 1: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Option 2: Local Build
```bash
# Generate native projects
npx expo prebuild

# Build iOS (requires Mac with Xcode)
cd ios && xcodebuild -workspace 4paws.xcworkspace -scheme 4paws

# Build Android
cd android && ./gradlew assembleRelease
```

---

## App Store Information

### App Name
**4 Paws**

### Subtitle
Paws & Peace of Mind — Cat Sitting Service

### Description
4 Paws connects cat owners with trusted, verified cat sitters in their area. Our platform features:

• **Verified Sitters** - All sitters undergo background checks and cat care assessments
• **Real-Time Messaging** - Chat directly with sitters before and during bookings
• **Secure Payments** - Pay safely through the app with Stripe integration
• **Push Notifications** - Stay updated on booking confirmations and messages
• **Geofencing Technology** - Know your cat is safe with location monitoring
• **Emergency Support** - 24/7 emergency contact and backup sitter dispatch

### Keywords
cat sitting, pet care, cat sitter, pet sitting, cat care, pet services, cat boarding, pet minder

### Category
- Primary: Lifestyle
- Secondary: Utilities

### Age Rating
4+ (No objectionable content)

---

## Required URLs for App Store Submissions

### Privacy Policy URL
**File:** `privacy-policy-standalone.html`

Host this file on your website and provide the URL during app submission. Both Apple App Store and Google Play Store require a privacy policy URL.

### Data Deletion URL (Required for Google Play)
**File:** `data-deletion-standalone.html`

Google Play Store requires a data deletion instruction URL. Host this file and provide the URL in Play Console under:
- **Play Console** → **App content** → **Data safety** → **Data deletion**

Example URLs (replace with your actual hosted URLs):
- Privacy Policy: `https://yourdomain.com/privacy-policy`
- Data Deletion: `https://yourdomain.com/data-deletion`

### In-App Account Deletion
The app includes a built-in account deletion feature accessible from:
**Profile Tab → Scroll to bottom → "Delete Account" button**

This satisfies both Apple's and Google's requirements for user data deletion capabilities.

---

## Required Assets

### App Icon
- Location: `assets/images/icon.png`
- Size: 1024x1024px (App Store), 512x512px (Play Store)

### Screenshots (Required sizes)
- iPhone 6.7": 1290 x 2796px
- iPhone 6.5": 1284 x 2778px
- iPad Pro 12.9": 2048 x 2732px
- Android Phone: 1080 x 1920px

---

## Build Configuration

### iOS (eas.json)
```json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "resourceClass": "m-medium"
      }
    }
  }
}
```

### Android (eas.json)
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

---

## Environment Variables (Required for Production)

Add these in your EAS secrets or build environment:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

---

## Submission Checklist

### Before Submitting
- [ ] Test all user flows on physical devices
- [ ] Verify push notifications work
- [ ] Test payment flow with Stripe test keys
- [ ] Review privacy policy and terms of service
- [ ] Prepare app store screenshots
- [ ] Write compelling app description
- [ ] Host privacy policy and data deletion pages

### iOS App Store
- [ ] Create App Store Connect listing
- [ ] Upload build via EAS or Transporter
- [ ] Fill in app metadata
- [ ] Add Privacy Policy URL
- [ ] Verify account deletion feature works
- [ ] Submit for review

### Google Play Store
- [ ] Create Play Console listing
- [ ] Upload AAB/APK file
- [ ] Complete content rating questionnaire
- [ ] Add Privacy Policy URL
- [ ] Add Data Deletion URL (App content → Data safety)
- [ ] Complete Data Safety form
- [ ] Submit for review

---

## Google Play Data Safety Form

When completing the Data Safety section in Play Console, provide the following information:

### Data Types Collected
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Name | Yes | With other users | Account, App functionality |
| Email | Yes | No | Account, Communications |
| Phone | Yes | With other users | Account, App functionality |
| Location | Yes | With other users | App functionality |
| Photos | Yes | With other users | App functionality |
| Payment info | Yes | With Stripe | Payments |
| Messages | Yes | With other users | App functionality |

### Data Deletion
- **Can users request data deletion?** Yes
- **Data deletion URL:** Your hosted `data-deletion-standalone.html` URL

---

## Support

For technical issues, contact the development team or refer to:
- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
