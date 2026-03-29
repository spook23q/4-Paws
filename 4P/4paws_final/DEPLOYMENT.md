# 4 Paws - Production Deployment Guide

## Overview
This document provides instructions for deploying the 4 Paws mobile app to the App Store (iOS) and Google Play (Android).

## Prerequisites
- Expo account (https://expo.dev)
- Apple Developer account ($99/year) for iOS deployment
- Google Play Developer account ($25 one-time fee) for Android deployment
- EAS CLI installed: `npm install -g eas-cli`

## Build Configuration

### iOS Build
```bash
# Login to Expo
eas login

# Configure iOS build
eas build:configure

# Create iOS build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android Build
```bash
# Create Android build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## App Store Requirements

### iOS (App Store)
1. **App Name**: 4 Paws
2. **Bundle ID**: space.manus.x4paws.t20260118223445
3. **Version**: 1.0.0
4. **Category**: Lifestyle
5. **Age Rating**: 4+ (No objectionable content)
6. **Privacy Policy URL**: Required (accessible via app)
7. **Support URL**: Required (accessible via app)

### Android (Google Play)
1. **Package Name**: space.manus.x4paws.t20260118223445
2. **Version Code**: 1
3. **Version Name**: 1.0.0
4. **Category**: Lifestyle
5. **Content Rating**: Everyone
6. **Privacy Policy URL**: Required (accessible via app)

## App Description

### Short Description (80 characters)
Connect with trusted cat sitters in your area for peace of mind pet care.

### Full Description
4 Paws is the premier cat sitting marketplace that connects loving cat owners with experienced, trusted cat sitters in their local area.

**For Cat Owners:**
- Find qualified cat sitters near you
- View detailed sitter profiles with reviews and ratings
- Book sitting services with flexible dates
- Communicate directly with sitters through in-app messaging
- Manage multiple cat profiles with detailed care instructions

**For Cat Sitters:**
- Create a professional profile showcasing your experience
- Set your own rates and availability
- Receive booking requests from cat owners
- Build your reputation through reviews
- Manage bookings and communicate with clients

**Key Features:**
- Secure user authentication
- Real-time messaging between owners and sitters
- Push notifications for booking updates
- Detailed cat profiles with medical and dietary information
- Review and rating system for quality assurance
- Safe and secure platform

Whether you're a cat owner looking for reliable care or an experienced sitter wanting to connect with clients, 4 Paws provides a trusted platform for cat sitting services.

## Screenshots Required
- Minimum 3 screenshots per platform
- iOS: 6.5" display (1284 x 2778 pixels)
- Android: Minimum 1080 x 1920 pixels

Recommended screenshots:
1. Welcome/Home screen
2. Search sitters screen
3. Sitter profile detail
4. Booking request flow
5. Messages/Chat screen

## Privacy & Permissions

### iOS Permissions (Info.plist)
- NSUserNotificationsUsageDescription: "We need permission to send you booking updates and messages"

### Android Permissions (AndroidManifest.xml)
- POST_NOTIFICATIONS: For push notifications (already configured)

## Testing Checklist
- [ ] Sign up flow works on both platforms
- [ ] Sign in and authentication works
- [ ] Search sitters functionality works
- [ ] Booking creation and management works
- [ ] Messaging between users works
- [ ] Push notifications work on physical devices
- [ ] Profile editing works
- [ ] Cat profile management works (owners)
- [ ] Sitter profile management works (sitters)
- [ ] All static pages load correctly
- [ ] App doesn't crash on launch
- [ ] All navigation flows work smoothly

## Known Issues
- **Web Preview**: React hydration error #418 affects web preview only. This does NOT affect the mobile app on iOS or Android devices. The web preview is provided for convenience but is not the primary platform.

## Post-Launch Monitoring
- Monitor crash reports in Expo dashboard
- Track user feedback and reviews
- Monitor push notification delivery rates
- Track booking conversion rates

## Support
For technical issues or questions:
- Check the app's Support section
- Contact: support@4paws.app (configure this email)

## Version History
- **1.0.0** (January 2026): Initial release
  - User authentication
  - Cat sitter search and booking
  - Messaging system
  - Push notifications
  - Profile management
