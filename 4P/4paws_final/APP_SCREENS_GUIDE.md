# 4 Paws App - Complete Screen Guide

This document provides a comprehensive overview of all screens in the 4 Paws cat sitting marketplace app.

---

## Authentication Screens

### 1. Welcome Screen
**Path:** `/` (root)
**Purpose:** First screen users see when opening the app
**Features:**
- App logo with cute orange tabby cat
- Tagline: "Paws & Peace of Mind — Exclusively for Cats"
- "Get Started" button → navigates to role selection
- "Already have an account? Sign In" link

### 2. Role Selection Screen
**Path:** `/auth/role-selection`
**Purpose:** User chooses whether they're a cat owner or sitter
**Features:**
- Two large cards:
  - **Cat Owner**: "Find trusted sitters for your feline friends"
  - **Cat Sitter**: "Earn money caring for adorable cats"
- Each card navigates to sign-up with pre-selected role

### 3. Sign Up Screen
**Path:** `/auth/sign-up`
**Purpose:** New user registration
**Features:**
- Full name input
- Email input (validated)
- Phone number input (optional)
- Password input (minimum 8 characters)
- Suburb/location input
- Role pre-selected from previous screen
- "Sign Up" button
- Link to sign-in for existing users

**Validation:**
- Email must be valid format
- Password must be at least 8 characters
- All required fields must be filled

### 4. Sign In Screen
**Path:** `/auth/sign-in`
**Purpose:** Existing user login
**Features:**
- Email input
- Password input
- "Sign In" button
- "Forgot password?" link
- Link to sign-up for new users

---

## Main Navigation (Tab Bar)

After authentication, users see a tab bar with these main sections:

### Tab 1: Search/Browse (Home)
**Icon:** Magnifying glass
**Path:** `/(tabs)/search`

### Tab 2: Bookings
**Icon:** Calendar
**Path:** `/(tabs)/bookings`

### Tab 3: Messages
**Icon:** Chat bubble
**Path:** `/(tabs)/messages`

### Tab 4: Favorites (Owners Only)
**Icon:** Heart
**Path:** `/(tabs)/favorites`

---

## Owner Screens

### 1. Search/Browse Sitters
**Path:** `/(tabs)/search`
**Purpose:** Find and filter cat sitters
**Features:**
- Search bar (search by name, suburb)
- Filters panel:
  - Suburb dropdown
  - Hourly rate slider ($15-$50+)
  - Minimum rating filter (1-5 stars)
  - "Available Now" toggle (next 7 days)
- Active filter count badge
- Sitter cards showing:
  - Profile photo
  - Name and suburb
  - Star rating and review count
  - Hourly rate
  - Heart icon to favorite/unfavorite
- Tap card → navigate to sitter profile

### 2. Sitter Profile Details
**Path:** `/sitters/[id]`
**Purpose:** View full sitter profile and book
**Features:**
- Large profile photo
- Name, suburb, hourly rate
- Star rating and review count
- Bio section
- "Unavailable Dates" section (if any in next 60 days)
- "Book Now" button → booking creation
- Reviews section:
  - Reviewer name and date
  - Star rating
  - Review text
  - Review photos (if any)

### 3. Create Booking
**Path:** `/bookings/create`
**Purpose:** Request a booking with a sitter
**Features:**
- Sitter name and rate displayed at top
- Start date picker
- End date picker
- Select cats (from owner's cat profiles)
- Special instructions text area
- Total cost calculation
- "Request Booking" button

**Note:** Dates that overlap with sitter's unavailable dates should be prevented

### 4. My Bookings
**Path:** `/(tabs)/bookings`
**Purpose:** View all bookings (past, upcoming, pending)
**Features:**
- Three tabs:
  - **Upcoming**: Confirmed future bookings
  - **Pending**: Awaiting sitter confirmation
  - **Past**: Completed bookings
- Each booking card shows:
  - Sitter photo and name
  - Dates
  - Cat names
  - Status badge
  - Total cost
- Tap card → booking details

### 5. Booking Details
**Path:** `/bookings/[id]`
**Purpose:** View full booking information
**Features:**
- Sitter info with photo
- Booking dates
- Cat names
- Special instructions
- Status (pending/confirmed/declined/completed)
- Total cost
- **For pending bookings:** "Cancel Request" button
- **For confirmed bookings:** "Message Sitter" button
- **For completed bookings:** "Leave Review" button (if not yet reviewed)

### 6. Leave Review
**Path:** `/review/[bookingId]`
**Purpose:** Rate and review sitter after completed booking
**Features:**
- Sitter name and photo
- 5-star rating selector
- Review text input (500 character limit with counter)
- Photo upload (up to 3 photos)
- "Submit Review" button

### 7. Favorites
**Path:** `/(tabs)/favorites`
**Purpose:** Quick access to saved sitters
**Features:**
- Grid of favorited sitter cards
- Same card format as search screen
- Tap to view profile or book
- Heart icon to unfavorite

### 8. Messages/Conversations
**Path:** `/(tabs)/messages`
**Purpose:** View all message threads
**Features:**
- List of conversations
- Each shows:
  - Other person's photo and name
  - Last message preview
  - Timestamp
  - Unread indicator (if applicable)
- Tap to open conversation

### 9. Chat Screen
**Path:** `/messages/[conversationId]`
**Purpose:** Send and receive messages
**Features:**
- Other person's name in header
- Message bubbles (left for received, right for sent)
- Timestamps
- Message input field at bottom
- Send button

### 10. My Cats
**Path:** `/profile/cats`
**Purpose:** Manage cat profiles
**Features:**
- List of owner's cats
- Each card shows:
  - Cat photo
  - Name, age, breed
  - Edit button
- "Add New Cat" button at bottom

### 11. Add/Edit Cat
**Path:** `/profile/edit-cat` or `/profile/edit-cat?id=[catId]`
**Purpose:** Create or update cat profile
**Features:**
- Photo upload
- Name input
- Age input
- Breed input
- Temperament dropdown (friendly, shy, playful, etc.)
- Medical notes text area
- "Save" button

### 12. Owner Profile Editor
**Path:** `/profile/edit-owner`
**Purpose:** Update owner account details
**Features:**
- Profile photo upload
- Name input
- Email (read-only)
- Phone input
- Suburb input
- "Save Changes" button

### 13. Settings
**Path:** `/settings`
**Purpose:** App preferences and account management
**Features:**
- **Notifications section:**
  - Booking notifications toggle
  - Message notifications toggle
  - Reminder notifications toggle
  - Marketing emails toggle
- **Account section:**
  - Edit Profile link
  - Manage Cats link (owners only)
  - Change Password link
- **Help & Support:**
  - FAQ link
  - About 4 Paws link
  - Safety Guidelines link
- **Logout button** at bottom

---

## Sitter Screens

Sitters see most of the same screens as owners, with these differences:

### 1. Search Screen
**Not available for sitters**
- Sitters cannot browse other sitters

### 2. Bookings (Sitter View)
**Path:** `/(tabs)/bookings`
**Purpose:** Manage booking requests and confirmed bookings
**Features:**
- Same three tabs (Upcoming, Pending, Past)
- **Pending tab** shows requests awaiting response:
  - Owner photo and name
  - Dates requested
  - Cat details
  - Total earnings
  - "Accept" and "Decline" buttons
- **Upcoming tab** shows confirmed bookings:
  - Owner contact info
  - "Message Owner" button
  - "Mark as Complete" button (on/after end date)
- **Past tab** shows completed bookings with earnings

### 3. Booking Details (Sitter View)
**Path:** `/bookings/[id]`
**Purpose:** View booking and take action
**Features:**
- Owner info with photo and contact
- Cat details (names, photos, temperament, medical notes)
- Booking dates
- Special instructions from owner
- Total earnings
- **For pending:** "Accept" and "Decline" buttons
- **For confirmed:** "Message Owner" and "Mark Complete" buttons

### 4. Sitter Profile Editor
**Path:** `/profile/edit-sitter`
**Purpose:** Update sitter profile and rates
**Features:**
- Profile photo upload
- Name input
- Email (read-only)
- Phone input
- Suburb input
- Bio text area (500 characters)
- Hourly rate input ($15-$100)
- "Save Changes" button

### 5. Availability Calendar
**Path:** `/availability/calendar`
**Purpose:** Block out unavailable dates
**Features:**
- Month/year navigation (< >)
- Calendar grid showing:
  - Past dates (grayed out)
  - Available dates (white)
  - Unavailable dates (red)
  - Selected date (blue highlight)
- Tap date to toggle unavailable
- Optional reason input for unavailable dates
- "Save" button

### 6. Settings (Sitter View)
**Path:** `/settings`
**Same as owner settings, but includes:**
- "Manage Availability" link → availability calendar

---

## Common Features Across All Screens

### Navigation
- Back button in header (where applicable)
- Tab bar always visible on main screens
- Smooth transitions between screens

### Loading States
- Spinner shown while data is loading
- Skeleton screens for lists

### Error Handling
- Toast notifications for errors
- Inline validation messages on forms
- Retry buttons for failed requests

### Empty States
- Friendly messages when lists are empty
- Call-to-action buttons to get started

### Responsive Design
- All screens optimized for mobile portrait orientation
- Safe area handling for notches and home indicators
- Keyboard avoidance for input fields

---

## Push Notifications

Users receive notifications for:
1. **New booking request** (sitters)
2. **Booking accepted** (owners)
3. **Booking declined** (owners)
4. **Booking completed** (owners) - includes review reminder
5. **New message** (both) - includes message preview
6. **Booking reminder** (both) - 24 hours before start

Tapping a notification navigates to the relevant screen.

---

## Authentication Flow Summary

1. User opens app → Welcome screen
2. Tap "Get Started" → Role selection
3. Choose Owner or Sitter → Sign-up screen (role pre-filled)
4. Fill form and submit → Account created
5. Automatically signed in → Main app (Search/Bookings tab)

**For returning users:**
1. Tap "Sign In" from welcome screen
2. Enter email and password
3. Tap "Sign In" → Main app

---

## Key User Journeys

### Owner Books a Sitter
1. Browse sitters on Search tab
2. Apply filters (suburb, rate, availability)
3. Tap sitter card → View profile
4. Read reviews and check unavailable dates
5. Tap "Book Now" → Create booking screen
6. Select dates and cats
7. Add special instructions
8. Tap "Request Booking"
9. Wait for sitter to accept (notification sent)
10. Receive acceptance notification
11. Message sitter if needed
12. After booking completes, leave review

### Sitter Accepts a Booking
1. Receive push notification of new request
2. Open app → Bookings tab (Pending)
3. Tap booking card → View details
4. Review owner info, cats, dates
5. Tap "Accept" → Booking confirmed
6. Owner receives acceptance notification
7. Message owner if needed
8. On booking date, provide cat sitting service
9. Tap "Mark as Complete" when done
10. Owner receives completion notification with review prompt

---

## Technical Notes

- **Authentication:** Email/password with secure session management
- **Database:** MySQL with Drizzle ORM
- **Real-time:** Push notifications via Expo Notifications
- **File uploads:** S3-compatible storage for photos
- **API:** tRPC for type-safe client-server communication
- **Styling:** NativeWind (Tailwind CSS for React Native)

---

## Known Issues & Limitations

1. **Authentication bug:** Some users report login/registration failures - investigating database query issues
2. **Availability validation:** Booking creation doesn't yet prevent requests on unavailable dates
3. **Password reset:** "Forgot password" link not yet implemented
4. **Search:** No full-text search on bio content yet
5. **Payments:** No payment processing integration (cost calculation only)

---

## Next Steps for Development

1. Fix authentication database query issues
2. Add booking date validation against sitter availability
3. Implement password reset flow
4. Add payment processing integration
5. Implement in-app notifications (in addition to push)
6. Add sitter verification/background checks
7. Create admin dashboard for platform management
