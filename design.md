# 4 Paws - Mobile App Design Plan

## Brand Identity

**App Name**: 4 Paws (with cat paw replacing the "A")
**Slogan**: "Paws & Peace of Mind — Exclusively for Cats"

**Color Palette**:
- **Primary Blue**: `#B8DDE8` (light blue from the cat image background)
- **Primary Orange**: `#F5A962` (warm orange from the cat)
- **Accent Orange**: `#E89556` (darker orange for stripes/accents)
- **Background**: White/Light gray
- **Text**: Dark gray/Black for readability

**Visual Style**:
- Friendly, warm, and pet-focused
- Rounded corners throughout (cards, buttons, inputs)
- Cat-themed iconography where appropriate
- The orange cat illustration featured prominently on home/welcome screens
- Clean, modern iOS-style interface following Apple Human Interface Guidelines

## Screen List & Primary Content

### Authentication Flow
1. **Welcome Screen**
   - Orange cat illustration (from provided image)
   - App logo "4 P🐾ws" with slogan
   - "Get Started" button
   - "Already have an account? Sign In" link

2. **Role Selection Screen**
   - "I'm a Cat Owner" card (with cat icon)
   - "I'm a Cat Sitter" card (with person+cat icon)
   - Back button

3. **Sign Up Screen** (separate for Owner/Sitter)
   - Email input
   - Phone number input
   - Password input
   - Confirm password input
   - "Create Account" button
   - "Already have an account? Sign In" link

4. **Sign In Screen**
   - Email input
   - Password input
   - "Forgot Password?" link
   - "Sign In" button
   - "Don't have an account? Sign Up" link

### Cat Owner Onboarding
5. **Owner Profile Setup**
   - Name input
   - Suburb/Location input (with autocomplete)
   - Profile photo upload (optional)
   - "Continue" button

6. **Add Cat Details**
   - Cat name
   - Age (dropdown or number input)
   - Temperament (checkboxes: Friendly, Shy, Playful, Independent, etc.)
   - Medical notes (text area)
   - Feeding schedule (text area)
   - Indoor/Outdoor (radio buttons)
   - Photo upload (optional)
   - "Add Another Cat" button
   - "Continue" button

### Cat Sitter Onboarding
7. **Become a Cat Sitter - Profile**
   - Profile photo upload (required)
   - Full name
   - Suburb/Location
   - Service area radius (slider: 5km - 50km)
   - "Continue" button

8. **Become a Cat Sitter - Services**
   - Pricing per day (number input)
   - Pricing per night (number input)
   - Years of experience (number input)
   - Types of cats accepted (checkboxes):
     - Indoor cats
     - Outdoor cats
     - Kittens
     - Senior cats
     - Cats with medical needs
   - Special skills (checkboxes):
     - Can administer medication
     - Can give injections
     - Experience with special diets
     - Can handle multiple cats
   - Short bio (text area, 200 chars)
   - "Complete Profile" button

### Main App - Cat Owner View
9. **Home Screen (Owner)**
   - Welcome message with cat illustration
   - Quick action cards:
     - "Find a Sitter"
     - "My Bookings"
     - "My Cats"
   - Recent/Upcoming bookings preview
   - Bottom tab navigation: Home, Search, Bookings, Messages, Profile

10. **Search Sitters Screen**
    - Search bar (suburb/location)
    - Filter button (opens filter modal)
    - Map view toggle
    - List of sitter cards:
      - Profile photo
      - Name
      - Rating (stars)
      - Distance
      - Price per day/night
      - Available dates indicator
      - Special skills badges
    - Tap card to view details

11. **Filter Modal**
    - Suburb input
    - Date range picker
    - Price range slider
    - Rating filter (minimum stars)
    - Special skills checkboxes
    - "Apply Filters" button

12. **Sitter Detail Screen**
    - Profile photo (large)
    - Name, rating, reviews count
    - Distance from owner
    - Pricing (day/night)
    - Service area radius
    - Experience
    - Types of cats accepted (badges)
    - Special skills (badges)
    - Bio
    - Reviews section (scrollable)
    - "Book Now" button
    - "Message" button

13. **Booking Request Screen**
    - Sitter summary card
    - Date picker (start/end dates)
    - Time selection (morning/afternoon/evening)
    - Select cat(s) (checkboxes)
    - Special instructions (text area)
    - Total price calculation
    - "Send Booking Request" button

14. **My Bookings Screen (Owner)**
    - Tabs: Upcoming, Pending, Past
    - Booking cards:
      - Sitter photo and name
      - Cat(s) name(s)
      - Dates and times
      - Status badge (Pending/Confirmed/Completed)
      - "View Details" / "Message Sitter" buttons

15. **Booking Detail Screen (Owner)**
    - Full booking information
    - Sitter contact info
    - Cat details
    - Status
    - "Cancel Booking" button (if applicable)
    - "Message Sitter" button
    - "Leave Review" button (after completion)

16. **Leave Review Screen**
    - Sitter name and photo
    - Star rating selector (1-5)
    - Review text area
    - "Submit Review" button

17. **My Cats Screen**
    - List of cat cards:
      - Photo
      - Name, age
      - Quick info
    - "Add New Cat" button
    - Tap to edit

18. **Owner Profile Screen**
    - Profile photo
    - Name, email, phone
    - Location
    - "Edit Profile" button
    - "Settings" button
    - "Logout" button

### Main App - Cat Sitter View
19. **Home Screen (Sitter)**
    - Welcome message
    - Stats cards:
      - Total bookings
      - Average rating
      - Earnings this month
    - Pending requests count
    - Upcoming bookings preview
    - Bottom tab navigation: Home, Bookings, Messages, Profile

20. **My Bookings Screen (Sitter)**
    - Tabs: Requests, Upcoming, Past
    - Booking cards:
      - Owner photo and name
      - Cat(s) details
      - Dates and times
      - Price
      - "Accept" / "Decline" buttons (for requests)
      - "View Details" / "Message Owner" buttons

21. **Booking Detail Screen (Sitter)**
    - Full booking information
    - Owner contact info
    - Cat details (names, ages, temperament, medical notes, feeding schedule)
    - Status
    - "Accept" / "Decline" buttons (if pending)
    - "Mark as Complete" button (when finished)
    - "Message Owner" button

22. **Sitter Profile Screen**
    - Profile photo
    - Name, rating, reviews count
    - Service area
    - Pricing
    - Experience
    - Types accepted
    - Special skills
    - Bio
    - Reviews section
    - "Edit Profile" button
    - "Settings" button
    - "Logout" button

### Shared Screens
23. **Messages Screen**
    - List of conversations:
      - Other user's photo and name
      - Last message preview
      - Timestamp
      - Unread indicator
    - Tap to open chat

24. **Chat Screen**
    - Header with other user's name and photo
    - Message bubbles (owner vs sitter color-coded)
    - Text input with send button
    - Timestamp on messages

25. **Static Content Screens**
    - About Us
    - Why Choose Us
    - Contact Us
    - FAQ (accordion style)
    - Safety & Trust
    - All accessible from menu (hamburger or profile)

26. **Settings Screen**
    - Notification preferences
    - Account settings
    - Privacy policy
    - Terms of service
    - Help & Support
    - Logout

## Key User Flows

### Flow 1: Cat Owner Finding and Booking a Sitter
1. Owner signs up → Role Selection → Sign Up (Owner) → Owner Profile Setup → Add Cat Details
2. Owner navigates to Search Sitters → Applies filters (suburb, dates, price, rating)
3. Owner browses list/map of sitters → Taps on a sitter card
4. Owner views Sitter Detail Screen → Reads reviews and bio
5. Owner taps "Book Now" → Booking Request Screen
6. Owner selects dates, times, cats, adds instructions → Sees total price
7. Owner taps "Send Booking Request" → Request sent to sitter
8. Owner receives push notification when sitter responds
9. If accepted, booking moves to "Upcoming" tab
10. After sit is completed, owner receives prompt to leave review
11. Owner leaves star rating and review

### Flow 2: Cat Sitter Receiving and Accepting a Booking
1. Sitter signs up → Role Selection → Sign Up (Sitter) → Become a Cat Sitter (Profile + Services)
2. Sitter receives push notification for new booking request
3. Sitter navigates to My Bookings → Requests tab
4. Sitter taps on booking card → Views Booking Detail Screen
5. Sitter reviews cat details, dates, owner info
6. Sitter taps "Accept" → Booking confirmed
7. Owner receives push notification of confirmation
8. Booking moves to "Upcoming" for both parties
9. Sitter can message owner for additional details
10. After sit, sitter marks booking as "Complete"

### Flow 3: In-App Messaging
1. Owner or Sitter taps "Message" button from booking or profile screen
2. Opens Chat Screen with conversation
3. User types message and taps send
4. Other party receives push notification
5. Messages appear in real-time
6. Conversation history saved in Messages tab

### Flow 4: Leaving a Review
1. After booking completion, owner receives notification
2. Owner navigates to My Bookings → Past tab
3. Owner taps on completed booking → Booking Detail Screen
4. Owner taps "Leave Review" button
5. Owner selects star rating (1-5) and writes review
6. Owner taps "Submit Review"
7. Review appears on sitter's profile
8. Sitter's average rating updates

## Navigation Structure

### Cat Owner Bottom Tabs
- **Home**: Dashboard with quick actions and upcoming bookings
- **Search**: Find sitters with filters and map
- **Bookings**: Upcoming, Pending, Past bookings
- **Messages**: Conversations with sitters
- **Profile**: Owner profile, cats, settings

### Cat Sitter Bottom Tabs
- **Home**: Dashboard with stats and pending requests
- **Bookings**: Requests, Upcoming, Past bookings
- **Messages**: Conversations with owners
- **Profile**: Sitter profile, reviews, settings

### Menu/Settings Access
- Static content pages accessible from Profile → Menu icon or Settings
- Settings accessible from Profile screen

## Push Notification Triggers
- New booking request received (Sitter)
- Booking request accepted/declined (Owner)
- New message received (Both)
- Upcoming booking reminder (24 hours before) (Both)
- Booking completion prompt (Owner)
- Review received (Sitter)

## Design Principles
- **One-handed usage**: All primary actions within thumb reach
- **Portrait orientation**: Optimized for 9:16 aspect ratio
- **iOS-first design**: Follows Apple HIG for native feel
- **Clear hierarchy**: Important actions prominent, secondary actions accessible
- **Friendly tone**: Warm, welcoming copy throughout
- **Visual consistency**: Consistent spacing, typography, and component styles
- **Accessibility**: High contrast, readable font sizes, clear labels
- **Error handling**: Clear error messages and validation feedback
- **Loading states**: Skeleton screens and spinners for async operations
