# 4 Paws - Local Build Instructions

This guide will help you build the 4 Paws app locally on your computer and upload it to Google Play Store, bypassing the EAS cloud build queue entirely.

---

## Prerequisites

Before you begin, make sure you have the following installed:

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org/

Verify installation:
```bash
node --version  # Should show v18.x.x or higher
```

### 2. Java JDK 17
Download from: https://adoptium.net/temurin/releases/?version=17

Verify installation:
```bash
java -version  # Should show version 17.x.x
```

### 3. Android Studio
Download from: https://developer.android.com/studio

After installation:
1. Open Android Studio
2. Go to **Settings → Languages & Frameworks → Android SDK**
3. Install **Android SDK Platform 34** (or latest)
4. Install **Android SDK Build-Tools**
5. Note your Android SDK location (you'll need it)

### 4. Set Environment Variables

**Windows:**
Add these to System Environment Variables:
```
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

**macOS/Linux:**
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

Then run: `source ~/.bashrc` or `source ~/.zshrc`

---

## Step-by-Step Build Instructions

### Step 1: Extract the Project

Extract the downloaded `4paws-project.zip` to a folder on your computer.

### Step 2: Open Terminal/Command Prompt

Navigate to the project folder:
```bash
cd path/to/4paws
```

### Step 3: Install Dependencies

```bash
npm install
```

This may take a few minutes.

### Step 4: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 5: Login to Expo (Create Free Account if Needed)

```bash
eas login
```

If you don't have an Expo account, create one at: https://expo.dev/signup

### Step 6: Build the Android App Bundle (AAB)

For Google Play Store submission, you need an AAB file:

```bash
eas build --platform android --profile production --local
```

**This will take 10-20 minutes** depending on your computer.

When complete, you'll see a message like:
```
Build finished
AAB file: /path/to/build-xxxxx.aab
```

### Step 7: (Alternative) Build APK for Testing

If you want to test on your device first:

```bash
eas build --platform android --profile preview --local
```

This creates an APK you can install directly on your Android phone.

---

## Upload to Google Play Store

### Step 1: Go to Google Play Console
https://play.google.com/console

### Step 2: Create Your App (if not already created)
1. Click **"Create app"**
2. Fill in app details:
   - App name: **4 Paws**
   - Default language: English
   - App or game: App
   - Free or paid: Free (or Paid)

### Step 3: Complete Store Listing
Go to **Main store listing** and fill in:
- Short description (max 80 chars): `Connect with trusted cat sitters in your area`
- Full description: (see APP_STORE_SUBMISSION_GUIDE.md)
- App icon: Upload `assets/images/icon.png`
- Feature graphic: Create a 1024x500 banner
- Screenshots: Take screenshots from your phone

### Step 4: Complete App Content Section
Go to **App content** and complete:

**Privacy Policy:**
- URL: `https://your-domain.com/privacy-policy`
- (Use the privacy-policy-standalone.html file - host it anywhere)

**Data Safety:**
- Answer the questionnaire about data collection
- Data deletion URL: `https://your-domain.com/data-deletion`

**Content Rating:**
- Complete the IARC questionnaire
- 4 Paws should receive an "Everyone" rating

**Target Audience:**
- Select 18+ (adults only for marketplace apps)

### Step 5: Upload Your AAB

1. Go to **Release → Production** (or Testing → Internal testing first)
2. Click **"Create new release"**
3. Upload your `.aab` file from Step 6
4. Add release notes (e.g., "Initial release")
5. Click **"Review release"**
6. Click **"Start rollout to Production"**

### Step 6: Wait for Review
Google typically reviews apps within 1-7 days. You'll receive an email when approved.

---

## Building for iOS

iOS builds require a Mac with Xcode installed.

### Prerequisites
- macOS computer
- Xcode 15+ (from App Store)
- Apple Developer Account ($99/year)

### Build Command
```bash
eas build --platform ios --profile production --local
```

### Upload to App Store
Use **Transporter** app (free on Mac App Store) to upload the `.ipa` file to App Store Connect.

---

## Troubleshooting

### "Command not found: eas"
Run: `npm install -g eas-cli`

### "JAVA_HOME is not set"
Make sure Java 17 is installed and JAVA_HOME environment variable is set correctly.

### "Android SDK not found"
1. Open Android Studio
2. Go to Settings → Android SDK
3. Copy the SDK path
4. Set ANDROID_HOME to that path

### "Build failed: Gradle error"
Try cleaning and rebuilding:
```bash
cd android
./gradlew clean
cd ..
eas build --platform android --profile production --local --clear-cache
```

### "Out of memory during build"
Add to your terminal before building:
```bash
export NODE_OPTIONS=--max-old-space-size=8192
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Build AAB for Play Store | `eas build -p android --profile production --local` |
| Build APK for testing | `eas build -p android --profile preview --local` |
| Build iOS | `eas build -p ios --profile production --local` |
| Clean build cache | `eas build --clear-cache --local` |

---

## Support Files Included

- `privacy-policy-standalone.html` - Host this for your privacy policy URL
- `data-deletion-standalone.html` - Host this for data deletion URL (required by Google)
- `APP_STORE_SUBMISSION_GUIDE.md` - Detailed app store submission info
- `assets/images/icon.png` - App icon (1024x1024)

---

## Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Visit Expo documentation: https://docs.expo.dev
3. Search Expo forums: https://forums.expo.dev

Good luck with your app launch! 🐱🐾
