# Apple App Store Connect Credentials Guide — Slide Content

Visual style: Clean, professional tech guide with Apple-inspired minimalist aesthetic. Use a blue-to-indigo gradient theme. Each step should feel clear and actionable. Use icons and numbered steps prominently.

---

## Slide 1: Title Slide

**Heading:** Finding Your Apple App Store Connect Credentials

**Subheading:** A Step-by-Step Guide for 4 Paws iOS App Submission

**Footer text:** Issuer ID · Key ID · Team ID · API Key (.p8)

---

## Slide 2: What You Need and Why

**Heading:** Four Credentials Required to Publish on the App Store

To submit your iOS app for review and distribution, Apple requires four pieces of information that authenticate your developer identity and grant build permissions.

**Key points:**

- **Issuer ID** — A UUID that identifies your App Store Connect organization (e.g., f4cab5b0-7b6c-47da-b64e-99d49abd9c6a)
- **Key ID** — A short alphanumeric code tied to your specific API key (e.g., H123IJ5689)
- **Team ID** — A 10-character code identifying your Apple Developer team (e.g., 7A23BC9900)
- **API Key (.p8 file)** — A private key file downloaded once from Apple, used to sign API requests

---

## Slide 3: Prerequisite — Apple Developer Account

**Heading:** You Need an Active Apple Developer Program Membership

Before accessing any credentials, you must be enrolled in the Apple Developer Program, which costs $99 USD per year.

**Key points:**

- Go to developer.apple.com/programs and click "Enroll"
- Sign in with your Apple ID or create a new one
- Complete identity verification (may take 24–48 hours for new accounts)
- Once approved, you gain access to App Store Connect and the Developer portal
- Both individual and organization accounts work for app submission

---

## Slide 4: Step 1 — Navigate to the API Keys Page

**Heading:** Open App Store Connect and Find the API Keys Section

This is your starting point for finding the Issuer ID, Key ID, and downloading the .p8 file.

**Key points:**

1. Go to **appstoreconnect.apple.com** and sign in with your Apple ID
2. Click **"Users and Access"** in the top navigation bar
3. Click the **"Integrations"** tab
4. Select **"App Store Connect API"** in the left sidebar
5. You are now on the API Keys management page — all three credentials are accessible from here

---

## Slide 5: Step 2 — Copy Your Issuer ID

**Heading:** The Issuer ID Is Displayed at the Top of the API Keys Page

The Issuer ID is a UUID shared across all API keys in your account. It never changes.

**Key points:**

- Look at the **top of the page**, directly above the list of API keys
- It is labeled "Issuer ID" and formatted as a UUID (e.g., f4cab5b0-7b6c-47da-b64e-99d49abd9c6a)
- Click the copy icon next to it to copy it to your clipboard
- This value is the same for every key in your account
- Paste it into the "Issuer ID code" field in your publishing form

---

## Slide 6: Step 3 — Generate an API Key to Get the Key ID

**Heading:** Create a New API Key with Admin Access

If you haven't generated an API key yet, you need to create one. This gives you both the Key ID and the downloadable .p8 file.

**Key points:**

1. On the App Store Connect API page, click the **"+" button** or "Generate API Key"
2. Enter a descriptive name (e.g., "4 Paws Build Key")
3. Set the access level to **"Admin"** — required for app builds and submissions
4. Click **"Generate"** to create the key
5. The **Key ID** now appears in the table next to your key name — copy this alphanumeric code

---

## Slide 7: Step 4 — Download the API Key (.p8 File)

**Heading:** Download the .p8 File Immediately — You Only Get One Chance

Apple allows you to download the private key file exactly once. If you lose it, you must revoke the key and create a new one.

**Key points:**

- After generating the key, click **"Download API Key"** next to your new key
- The file will be named something like AuthKey_H123IJ5689.p8
- Save it in a secure location (e.g., a password manager or encrypted folder)
- You cannot re-download this file — the download button disappears after the first download
- Upload this .p8 file into the "Upload the API Key file" field in your publishing form

---

## Slide 8: Step 5 — Find Your Team ID

**Heading:** Your Team ID Lives in the Apple Developer Portal, Not App Store Connect

The Team ID is found on a different Apple website from the other three credentials.

**Key points:**

1. Go to **developer.apple.com/account** and sign in
2. Click **"Membership"** in the left sidebar (or scroll to "Membership details")
3. Your **Team ID** is listed as a 10-character alphanumeric code (e.g., 7A23BC9900)
4. Copy this value and paste it into the "Team ID" field
5. Note: This is different from your Apple ID — it identifies your developer team specifically

---

## Slide 9: Quick Reference Summary

**Heading:** All Four Credentials at a Glance

Use this as a checklist to confirm you have everything before submitting.

| Credential | Where to Find It | Format |
|---|---|---|
| Issuer ID | App Store Connect → Users & Access → Integrations → API (top of page) | UUID (36 characters) |
| Key ID | Same page → next to your generated key in the table | Alphanumeric (10 chars) |
| Team ID | developer.apple.com/account → Membership | Alphanumeric (10 chars) |
| API Key (.p8) | Download button next to key (one-time only) | .p8 file |

---

## Slide 10: You're Ready to Publish

**Heading:** Enter Your Credentials and Submit Your App for Review

With all four credentials in hand, you can now complete the iOS app publishing process.

**Key points:**

- Paste the Issuer ID, Key ID, and Team ID into their respective fields
- Upload the .p8 file using the file chooser
- Once submitted, the build system will use these credentials to sign and upload your app
- Apple's review process typically takes 24–48 hours for the first submission
- Keep your .p8 file backed up securely — you'll need it for future app updates too
