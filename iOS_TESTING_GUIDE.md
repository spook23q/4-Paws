# iOS Testing Guide for 4 Paws (Free — No Developer Fee)

This guide shows you how to test the 4 Paws app on iOS without paying the Apple Developer Program fee ($99/year). You have two options:

---

## **Option 1: Expo Go (Easiest — Recommended for Quick Testing)**

### What You Need
- iPhone or iPad with iOS 13+
- Expo Go app (free, from App Store)
- Your Mac or Windows computer
- Same WiFi network for both devices

### Step-by-Step Instructions

#### **Step 1: Install Expo Go on Your iPhone**
1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"** (by Expo)
3. Tap **Get** → **Install** → authenticate with Face ID / Touch ID
4. Wait for installation to complete

#### **Step 2: Start the Dev Server on Your Computer**
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the 4paws project:
   ```bash
   cd /home/ubuntu/4paws
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Wait for the output to show:
   ```
   [Metro] Listening on http://localhost:8081
   ```

#### **Step 3: Generate a QR Code**
1. In the same Terminal, run:
   ```bash
   pnpm qr
   ```
2. A QR code will be displayed in the Terminal (or you can find it in the Metro output)
3. Alternatively, press **`w`** in the Terminal to open the web preview, then look for the QR code link

#### **Step 4: Scan QR Code on Your iPhone**
1. Open **Expo Go** app on your iPhone
2. Tap the **QR Code icon** (bottom right, looks like a square with a dot)
3. Point your iPhone camera at the QR code displayed in Terminal
4. The app will automatically load and start running on your iPhone

#### **Step 5: Test the App**
- Navigate through all screens
- Test sign-up and login
- Search for sitters
- Create a booking
- Send messages
- Check notifications

#### **Troubleshooting Expo Go**
| Issue | Solution |
|-------|----------|
| "Connection refused" | Ensure your iPhone and computer are on the **same WiFi network** |
| QR code won't scan | Try pressing **`w`** in Terminal to get a different QR code format |
| App crashes | Check Terminal for error messages; restart dev server with `pnpm dev` |
| Changes not reflecting | Save the file and wait 2-3 seconds; Expo will hot-reload automatically |

---

## **Option 2: Xcode Simulator (More Realistic — Recommended for Serious Testing)**

### What You Need
- Mac computer (required for Xcode)
- Xcode (free, from App Store)
- 20+ GB free disk space
- Your 4paws project

### Step-by-Step Instructions

#### **Step 1: Install Xcode (First Time Only)**
1. Open **App Store** on your Mac
2. Search for **"Xcode"** (by Apple)
3. Tap **Get** → **Install** (this is large ~12GB, may take 30+ minutes)
4. After installation, open Xcode once to accept the license:
   ```bash
   sudo xcode-select --install
   ```

#### **Step 2: Install iOS Simulator (First Time Only)**
1. Open Xcode
2. Go to **Xcode** → **Settings** → **Platforms**
3. Click the **+** button and select **iOS**
4. Choose the latest iOS version (e.g., iOS 18)
5. Click **Install** and wait (this adds another 5-10 GB)

#### **Step 3: Start the Dev Server**
1. Open Terminal on your Mac
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

#### **Step 4: Launch iOS Simulator**
1. In the same Terminal, press **`i`** (lowercase)
2. Xcode will automatically launch the iOS Simulator
3. The 4 Paws app will install and start on the simulated iPhone
4. Wait 30-60 seconds for the app to fully load

#### **Step 5: Test the App**
- Use your mouse to tap on screen elements
- Swipe to scroll
- Press **`Cmd + Z`** to undo, **`Cmd + Shift + Z`** to redo
- Press **`Cmd + K`** to open the keyboard (for text input)
- Check Console output in Terminal for errors

#### **Step 6: Reload the App**
- Press **`r`** in Terminal to reload the app
- Press **`Cmd + R`** in the Simulator to refresh
- Press **`Cmd + D`** in the Simulator to open the dev menu

#### **Useful Xcode Simulator Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Cmd + 1` | iPhone 15 |
| `Cmd + 2` | iPhone 15 Plus |
| `Cmd + 3` | iPhone 15 Pro |
| `Cmd + 4` | iPhone 15 Pro Max |
| `Cmd + Left/Right Arrow` | Rotate device |
| `Cmd + Y` | Toggle software keyboard |
| `Cmd + Shift + H` | Go to home screen |
| `Cmd + Shift + M` | Minimize simulator |

#### **Troubleshooting Xcode Simulator**
| Issue | Solution |
|-------|----------|
| Simulator won't start | Restart Xcode: `killall com.apple.CoreSimulator.CoreSimulatorService` |
| App won't install | Clear simulator: **Simulator** → **Erase All Content and Settings** |
| Metro connection refused | Restart dev server: `Ctrl + C`, then `pnpm dev` |
| Simulator is slow | Close other apps; reduce background processes |
| Can't type in text fields | Press `Cmd + K` to enable software keyboard |

---

## **Option 3: Physical iPhone (Most Realistic — Requires Apple Developer Account)**

If you decide to test on a real iPhone later, you'll need to:
1. Enroll in Apple Developer Program ($99/year)
2. Create a provisioning profile
3. Sign the app with your certificate
4. Deploy via Xcode

**For now, skip this option and use Expo Go or Simulator.**

---

## **Comparison: Which Option Should You Use?**

| Feature | Expo Go | Xcode Simulator | Physical iPhone |
|---------|---------|-----------------|-----------------|
| **Cost** | Free | Free | $99/year |
| **Setup Time** | 5 minutes | 30 minutes | 1+ hour |
| **Realism** | 90% | 95% | 100% |
| **Performance** | Good | Excellent | Excellent |
| **Testing Speed** | Fast (hot reload) | Fast (hot reload) | Slower (rebuild) |
| **Best For** | Quick testing, demos | Serious testing | Final validation |
| **Device Variety** | Your iPhone only | All iPhone models | Your specific device |

---

## **Quick Start (TL;DR)**

### **Fastest Option (Expo Go — 5 minutes)**
```bash
# On your computer
cd /home/ubuntu/4paws
pnpm dev

# On your iPhone
# 1. Download Expo Go from App Store
# 2. Open Expo Go
# 3. Tap QR code icon
# 4. Scan the QR code from Terminal
# Done! App loads on your iPhone
```

### **Best Option (Xcode Simulator — 30 minutes setup, then instant)**
```bash
# On your Mac (first time only)
# 1. Download Xcode from App Store (12 GB)
# 2. Open Xcode → Settings → Platforms → Install iOS

# Then every time you test
cd /home/ubuntu/4paws
pnpm dev
# Press 'i' in Terminal
# App launches in simulator
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
- [ ] Cannot enter non-Sydney suburb (e.g., "Melbourne") — shows error
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

---

## **Next Steps After Testing**

Once you've tested on iOS and everything works:

1. **Create a TestFlight build** (Apple's free testing platform)
   - Requires Apple Developer Program ($99/year)
   - Can invite up to 100 testers
   - Best for beta testing before App Store

2. **Submit to App Store**
   - Requires Developer Program
   - Takes 1-3 days for review
   - Must follow App Store guidelines

3. **For Android**, use similar process:
   - Expo Go (free, instant)
   - Android Emulator (free, 30 min setup)
   - Physical Android phone (free)

---

## **Support**

If you hit issues:
1. Check Terminal for error messages
2. Restart dev server: `Ctrl + C`, then `pnpm dev`
3. Clear app cache: Delete app from phone/simulator, reinstall
4. Check WiFi connection (Expo Go only)
5. Ensure you're on the latest checkpoint version

Good luck testing! 🚀
