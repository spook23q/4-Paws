# Android Manifest Configuration Guide

When you run `eas build --platform android`, Expo will generate the Android project with the following configurations already applied:

## Permissions Added (from app.config.ts)
- `POST_NOTIFICATIONS` - For push notifications
- `ACCESS_FINE_LOCATION` - For precise GPS location (required for map)
- `ACCESS_COARSE_LOCATION` - For approximate location
- `INTERNET` - For API calls
- `CAMERA` - For photo uploads
- `READ_EXTERNAL_STORAGE` - For file access
- `WRITE_EXTERNAL_STORAGE` - For file storage

## Build Configuration
- **Min SDK Version**: 24 (Android 7.0)
- **Target SDK Version**: 34 (Android 14)
- **Compile SDK Version**: 34
- **Build Architectures**: armeabi-v7a, arm64-v8a
- **Kotlin Version**: 1.9.0
- **ProGuard**: Enabled in release builds for code obfuscation

## Google Maps Configuration
For react-native-maps to work, you'll need to:

1. **Generate Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Maps SDK for Android
   - Create an API key for Android
   - Add your app's SHA-1 fingerprint

2. **Add API Key to AndroidManifest.xml**:
   After running `eas build`, the generated `android/app/src/main/AndroidManifest.xml` will have:
   ```xml
   <application>
     <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE" />
   </application>
   ```

3. **Update eas.json** with your API key:
   ```json
   {
     "build": {
       "production": {
         "android": {
           "env": {
             "GOOGLE_MAPS_API_KEY": "YOUR_KEY_HERE"
           }
         }
       }
     }
   }
   ```

## Location Permissions at Runtime
The app requests location permissions at runtime (handled in map.tsx).
Users must grant permissions for the map to show their location.

## Building for Android Studio

### Option 1: Using EAS Build (Recommended)
```bash
eas build --platform android --profile preview
```

### Option 2: Local Build with Android Studio
```bash
# Generate Android project
expo prebuild --clean

# Open in Android Studio
open -a "Android Studio" android/
```

### Option 3: Build APK locally
```bash
# Generate Android project
expo prebuild --clean

# Build APK
cd android
./gradlew assembleRelease
cd ..
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### React Native Maps not showing
- Ensure Google Maps API key is added to AndroidManifest.xml
- Check that location permissions are granted
- Verify internet permission is enabled

### Build fails with Gradle error
- Clear Gradle cache: `cd android && ./gradlew clean && cd ..`
- Update Gradle: `cd android && ./gradlew wrapper --gradle-version 8.0 && cd ..`
- Check Java version: `java -version` (should be 11 or higher)

### Location not working
- Ensure `ACCESS_FINE_LOCATION` permission is granted
- Test on physical device (emulator may have location issues)
- Check that location services are enabled on device
