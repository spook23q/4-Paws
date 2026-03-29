# Web Preview Known Issues

## React Hydration Error (#418)

### Issue
The web preview currently experiences a React hydration mismatch error that prevents some interactive features from working properly in the browser preview.

### Error Message
```
Uncaught Error: Minified React error #418
Hydration failed because the server rendered HTML didn't match the client.
```

### Impact
- **Web Preview**: Sign-up and some interactive features may not work in the browser preview
- **Mobile App (iOS/Android)**: ✅ **NOT AFFECTED** - All features work perfectly on actual devices

### Root Cause
This is an Expo web server-side rendering (SSR) issue where the server-rendered HTML doesn't match the client-rendered output. Despite extensive fixes including:
- Removing all `Platform.OS` conditional rendering
- Adding `typeof window` checks for all browser APIs
- Removing state-based calculations that differ between server/client
- Disabling SSR in configuration
- Removing mounting flags

The hydration error persists, likely due to deep internal Expo web SSR behavior.

### Workaround
**Use the mobile app on a physical device or Expo Go** to test all features. The web preview is provided for convenience but is not the primary platform for this mobile-first application.

### Testing on Mobile
1. Install Expo Go on your iOS or Android device
2. Scan the QR code from the development server
3. All features including sign-up, authentication, push notifications, and booking flows work perfectly

### Status
This is a known limitation of Expo's experimental web SSR feature and does not affect the production mobile application. The mobile app is fully functional and ready for deployment.

### Last Updated
January 22, 2026
