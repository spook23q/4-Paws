# Android Testing Guide for 4 Paws (100% Free — No Fees)

Good news: **Android testing is completely free and easier than iOS.** You don't need a paid developer account. Here are three options:

---

## **Option 1: Expo Go on Android Phone (Easiest — 5 minutes)**

### What You Need
- Android phone (Android 8+)
- Expo Go app (free, from Google Play Store)
- Your computer
- Same WiFi network

### Step-by-Step Instructions

#### **Step 1: Install Expo Go on Your Android Phone**
1. Open **Google Play Store** on your Android phone
2. Search for **"Expo Go"** (by Expo)
3. Tap **Install** → wait for download
4. Tap **Open** to launch Expo Go

#### **Step 2: Start the Dev Server on Your Computer**
1. Open Terminal / Command Prompt
2. Navigate to the project:
   ```bash
   cd /home/ubuntu/4paws
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
4. Wait for:
   ```
   [Metro] Listening on http://localhost:8081
   ```

#### **Step 3: Generate and Scan QR Code**
1. In Terminal, press **`a`** (lowercase) to open Android options
2. Or run:
   ```bash
   pnpm qr
   ```
3. A QR code will display in Terminal
4. On your Android phone, open **Expo Go**
5. Tap the **QR code icon** (bottom right)
6. Point your phone camera at the QR code
7. App will automatically load on your phone

#### **Step 4: Test the App**
- Navigate through all screens
- Test sign-up and login
- Search for sitters
- Create bookings
- Send messages

#### **Troubleshooting Expo Go**
| Issue | Solution |
|-------|----------|
| "Connection refused" | Ensure phone and computer are on **same WiFi** |
| QR code won't scan | Try pressing `a` in Terminal for a different QR code |
| App crashes | Check Terminal for errors; restart with `pnpm dev` |
| Changes not showing | Save file; Expo will hot-reload in 2-3 seconds |
| "Expo Go not found" | Make sure you're in Google Play Store, not Samsung App Store |

---

## **Option 2: Android Emulator (Recommended for Serious Testing)**

### What You Need
- Windows, Mac, or Linux computer
- Android Studio (free, ~2.5 GB)
- 10+ GB free disk space
- 30 minutes for first-time setup

### Step-by-Step Instructions

#### **Step 1: Download Android Studio (First Time Only)**

**On Windows:**
1. Go to https://developer.android.com/studio
2. Click **Download Android Studio**
3. Run the installer
4. Follow the setup wizard (accept defaults)
5. Wait for installation (~5 minutes)

**On Mac:**
1. Go to https://developer.android.com/studio
2. Click **Download Android Studio for Mac**
3. Open the `.dmg` file
4. Drag Android Studio to Applications folder
5. Open Applications → Android Studio

**On Linux:**
```bash
sudo apt-get install android-studio
```

#### **Step 2: Create a Virtual Android Device**
1. Open Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Select **Pixel 6** (or any phone model)
5. Click **Next**
6. Select **Android 14** (or latest available)
7. Click **Next** → **Finish**
8. Wait for the emulator image to download (~2 GB)

#### **Step 3: Start the Dev Server**
1. Open Terminal / Command Prompt
2. Navigate to project:
   ```bash
   cd /home/ubuntu/4paws
   ```
3. Start dev server:
   ```bash
   pnpm dev
   ```
4. Wait for Metro to start

#### **Step 4: Launch Android Emulator**
1. In Terminal, press **`a`** (lowercase)
2. Expo will automatically:
   - Launch Android Emulator
   - Build the app
   - Install on emulator
   - Start the app
3. Wait 30-60 seconds for app to fully load

#### **Step 5: Test the App**
- Use mouse to tap elements
- Swipe to scroll
- Right-click and drag to rotate device
- Press `Ctrl + M` (Windows) or `Cmd + M` (Mac) to open dev menu

#### **Useful Android Emulator Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl + M` (Win) / `Cmd + M` (Mac) | Open dev menu |
| `R` (in Terminal) | Reload app |
| `Ctrl + Shift + Z` (Win) / `Cmd + Shift + Z` (Mac) | Open debugger |
| Right-click + drag | Rotate device |
| `Ctrl + Scroll` (Win) / `Scroll` (Mac) | Zoom in/out |
| `Ctrl + T` | Open terminal in emulator |

#### **Troubleshooting Android Emulator**
| Issue | Solution |
|-------|----------|
| Emulator won't start | Restart Android Studio; check disk space |
| App won't install | Clear emulator: **Virtual Device Manager** → **Wipe Data** |
| Metro connection refused | Restart dev server: `Ctrl + C`, then `pnpm dev` |
| Emulator is very slow | Close other apps; use Pixel 4a instead of Pixel 6 Pro |
| Can't type in text fields | Press `Ctrl + M` (Win) or `Cmd + M` (Mac) to enable keyboard |
| "adb: command not found" | Add Android SDK to PATH or restart Terminal |

---

## **Option 3: Physical Android Phone (Most Realistic — 100% Free)**

### What You Need
- Android phone (Android 8+)
- USB cable
- Your computer
- 10 minutes setup

### Step-by-Step Instructions

#### **Step 1: Enable Developer Mode on Your Phone**
1. Go to **Settings** → **About Phone**
2. Find **Build Number** (usually at bottom)
3. Tap **Build Number** **7 times** rapidly
4. You'll see: "You are now a developer!"
5. Go back to Settings → **Developer Options** (now visible)
6. Enable **USB Debugging**
7. Enable **Install via USB** (if available)

#### **Step 2: Connect Phone to Computer**
1. Plug your Android phone into your computer with USB cable
2. On your phone, select **File Transfer** mode (not charging only)
3. On your computer, open Terminal / Command Prompt
4. Run:
   ```bash
   adb devices
   ```
5. You should see your phone listed (e.g., `emulator-5554`)

#### **Step 3: Start the Dev Server**
1. In Terminal, navigate to project:
   ```bash
   cd /home/ubuntu/4paws
   ```
2. Start dev server:
   ```bash
   pnpm dev
   ```

#### **Step 4: Install App on Your Phone**
1. In Terminal, press **`a`** (lowercase)
2. Expo will:
   - Build the app
   - Install on your connected phone
   - Start the app
3. Watch your phone—app will launch automatically
4. Wait 30-60 seconds for full load

#### **Step 5: Test the App**
- Use your fingers to interact normally
- All features work exactly like production
- Check Terminal for real-time error logs

#### **Troubleshooting Physical Phone**
| Issue | Solution |
|-------|----------|
| Phone not detected | Run `adb devices`; if empty, restart USB debugging |
| "Permission denied" | Tap "Allow USB Debugging" prompt on phone |
| App won't install | Ensure phone has 500 MB free space |
| Connection drops | Use a different USB cable or port |
| Can't see Terminal output | Run `adb logcat` to see phone logs |

---

## **Comparison: Which Android Option?**

| Feature | Expo Go | Android Emulator | Physical Phone |
|---------|---------|------------------|-----------------|
| **Cost** | Free | Free | Free |
| **Setup Time** | 5 min | 30 min | 10 min |
| **Realism** | 90% | 95% | 100% |
| **Performance** | Good | Excellent | Excellent |
| **Testing Speed** | Fast | Fast | Fast |
| **Best For** | Quick demos | Serious testing | Final validation |
| **Device Variety** | Your phone only | All Android models | Your specific device |

---

## **Quick Start (TL;DR)**

### **Fastest (Expo Go — 5 minutes)**
```bash
# On your computer
cd /home/ubuntu/4paws
pnpm dev

# On your Android phone
# 1. Download Expo Go from Google Play Store
# 2. Open Expo Go
# 3. Tap QR code icon
# 4. Scan the QR code from Terminal
# Done! App loads on your phone
```

### **Best (Android Emulator — 30 min setup, then instant)**
```bash
# On your computer (first time only)
# 1. Download Android Studio
# 2. Create Virtual Device (Pixel 6, Android 14)

# Then every time you test
cd /home/ubuntu/4paws
pnpm dev
# Press 'a' in Terminal
# App launches in emulator
```

### **Most Realistic (Physical Phone — 10 min setup)**
```bash
# On your Android phone
# 1. Settings → About Phone → tap Build Number 7 times
# 2. Settings → Developer Options → enable USB Debugging

# On your computer
cd /home/ubuntu/4paws
pnpm dev
# Connect phone via USB
# Press 'a' in Terminal
# App installs and runs on your phone
```

---

## **Testing Checklist**

Once the app is running, test these flows:

### **Authentication**
- [ ] Sign up as Cat Owner
- [ ] Sign up as Cat Sitter
- [ ] Sign in with existing account
- [ ] Remember Me checkbox works
- [ ] Logout clears session

### **Geo-Fencing**
- [ ] "Sydney Metro Area Only" badge visible on search screen
- [ ] "Geo-fence Active" indicator on home screen
- [ ] Can enter Sydney suburb (e.g., "Bondi")
- [ ] Cannot enter non-Sydney suburb (e.g., "Melbourne")
- [ ] Address validation rejects out-of-area postcodes

### **Sitter Search**
- [ ] Search results show sitters
- [ ] Filter by suburb works
- [ ] Filter by price range works
- [ ] Filter by rating works
- [ ] Sort by distance/rating/price works
- [ ] Tap sitter card opens detail page

### **Booking**
- [ ] Can create booking request
- [ ] Date picker works
- [ ] Cat selection works
- [ ] Price calculation correct
- [ ] Booking appears in "My Bookings"

### **Messaging**
- [ ] Can send message to sitter
- [ ] Message appears in chat
- [ ] Unread badge shows

### **Performance**
- [ ] App doesn't crash
- [ ] No red error screens
- [ ] Smooth scrolling
- [ ] Images load correctly
- [ ] Notifications work (if testing on physical phone)

### **Geo-Fencing Specific Tests**
- [ ] Try entering "Wollongong" in search → should show "Not in Sydney"
- [ ] Try entering "Newcastle" → should show error
- [ ] Try entering "Parramatta" → should work
- [ ] Try entering "Bondi Beach" → should work
- [ ] Try entering "Manly" → should work

---

## **Android vs iOS Differences You Might Notice**

| Feature | Android | iOS |
|---------|---------|-----|
| **Back button** | Hardware/software back button | Swipe from left edge |
| **Status bar** | At top (system icons) | At top (system icons) |
| **Notifications** | Toast at bottom | Banner at top |
| **Keyboard** | Appears at bottom | Appears at bottom |
| **Safe area** | Handles notches/punch holes | Handles notches/home indicator |
| **Colors** | May look slightly different | Reference colors |

---

## **Performance Tips**

### **For Expo Go**
- Keep WiFi connection strong
- Close other apps on phone
- Restart Expo Go if app becomes unresponsive

### **For Android Emulator**
- Close other apps on computer
- Use Pixel 4a instead of Pixel 6 Pro (faster)
- Allocate more RAM in AVD settings if available
- Use hardware acceleration if available

### **For Physical Phone**
- Close background apps
- Ensure phone has 500 MB+ free space
- Use a high-speed USB 3.0 cable
- Keep phone plugged in during testing

---

## **Next Steps After Testing**

Once you've tested on Android and everything works:

1. **Create a Google Play Console account** (free)
   - No upfront fee
   - Pay $25 one-time registration fee when you publish
   - Can test with internal testers for free

2. **Use Google Play's Internal Testing**
   - Invite testers without publishing to store
   - Get feedback before public release
   - Completely free

3. **For iOS later**, you'll need:
   - Apple Developer Program ($99/year)
   - TestFlight for beta testing
   - App Store for public release

---

## **Support**

If you hit issues:
1. Check Terminal for error messages
2. Restart dev server: `Ctrl + C`, then `pnpm dev`
3. Clear app cache: Uninstall and reinstall
4. Check WiFi connection (Expo Go only)
5. Ensure you're on the latest checkpoint version

---

## **Pro Tips**

✅ **Test on multiple Android versions** — Use emulator to test Android 10, 12, 14
✅ **Test on different screen sizes** — Use Pixel 4, Pixel 6 Pro, Pixel Tablet
✅ **Check landscape mode** — Rotate device to test landscape layout
✅ **Test with slow network** — Use Chrome DevTools to throttle connection
✅ **Test with low storage** — Fill up phone storage to see how app behaves
✅ **Test with notifications** — Send test notifications from backend

Good luck testing! 🚀
