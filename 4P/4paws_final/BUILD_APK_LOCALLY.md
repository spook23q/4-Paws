# Build APK Locally (No Cloud Wait Time)

## Option 1: EAS Local Build (Fastest)

Build the APK on your own machine instead of waiting for EAS cloud:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to your Expo account
eas login

# Build APK locally (runs on YOUR machine, no queue)
eas build --platform android --profile preview --local
```

The APK will be saved to your current directory when complete.

---

## Option 2: Manual Android Build

If EAS local build doesn't work, build directly with Android tools:

### Step 1: Generate Native Android Project
```bash
cd /path/to/4paws
npx expo prebuild --platform android
```

### Step 2: Build APK with Gradle
```bash
cd android
./gradlew assembleRelease
```

### Step 3: Find Your APK
The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Option 3: Use Expo Dev Build

For testing purposes, you can create a development build:

```bash
# Create development APK
eas build --platform android --profile development --local
```

---

## Troubleshooting

### "Build timed out"
- Use `--local` flag to build on your machine
- Check your internet connection
- Try a different EAS profile: `eas build -p android --profile local-apk --local`

### "Gradle build failed"
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### "Java version error"
Ensure you have Java 17 installed:
```bash
java -version  # Should show 17.x
```

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `eas build -p android --profile preview --local` | Build APK locally |
| `eas build -p android --profile local-apk --local` | Alternative APK build |
| `npx expo prebuild -p android` | Generate Android project |
| `cd android && ./gradlew assembleRelease` | Manual Gradle build |

---

## Requirements for Local Build

- **Node.js** 18+
- **Java JDK** 17
- **Android SDK** (via Android Studio)
- **EAS CLI** (`npm install -g eas-cli`)

The local build typically takes 5-15 minutes depending on your machine specs.
