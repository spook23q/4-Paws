# 4 Paws - Cat Sitting Marketplace

## Project Overview

**4 Paws** is a cross-platform mobile app for iOS and Android that connects cat owners with trusted cat sitters in their local area. The app features a two-sided marketplace with separate flows for Cat Owners and Cat Sitters.

### Brand Identity

- **App Name**: 4 Paws (with cat paw replacing the "A" in the logo)
- **Slogan**: "Paws & Peace of Mind — Exclusively for Cats"
- **Primary Colors**: 
  - Light Blue: `#B8DDE8` (calm, trustworthy)
  - Warm Orange: `#F5A962` (friendly, energetic)
- **Visual Style**: Friendly, warm, pet-focused with rounded corners and cat-themed iconography
- **Mascot**: Orange tabby cat illustration featured on welcome screen

---

## ✅ Completed Features

### 1. Branding & Design
- ✅ Custom app logo with cat paw icon
- ✅ Orange cat hero illustration for home screen
- ✅ Brand color scheme configured (light blue & warm orange)
- ✅ App configuration updated with "4 Paws" branding

### 2. Database Schema (8 Tables)

**Users Table**
- Authentication: email, phone, password hash
- Role: owner or sitter
- Profile: name, photo, OAuth fields

**Owner Profiles Table**
- Location: suburb, latitude, longitude
- Linked to user account

**Sitter Profiles Table**
- Location & service area radius
- Pricing: per day and per night rates
- Experience: years of experience
- Capabilities: types of cats accepted (indoor/outdoor, kittens, seniors, medical needs)
- Special skills: medication, injections, special diets, multiple cats
- Stats: average rating, total reviews, total bookings

**Cats Table**
- Owner linkage
- Details: name, age, photo, temperament
- Care info: medical notes, feeding schedule, indoor/outdoor

**Bookings Table**
- Owner and sitter linkage
- Dates: start/end dates and times
- Cat IDs (JSON array)
- Special instructions
- Total price
- Status: pending, confirmed, completed, cancelled

**Conversations Table**
- Owner and sitter linkage
- Optional booking linkage
- Last message timestamp

**Messages Table**
- Conversation linkage
- Sender, content, read status
- Timestamp

**Reviews Table**
- Booking linkage
- Sitter and owner linkage
- Rating (1-5 stars)
- Review text
- Timestamp

### 3. Backend API Endpoints (6 Routers, 30+ Endpoints)

**Authentication Router** (`/auth`)
- `signUp` - Create new user account (owner or sitter)
- `signIn` - Authenticate user with email/password
- `me` - Get current user profile
- `logout` - Sign out user

**Profiles Router** (`/profiles`)
- `createOwnerProfile` - Create/update owner profile
- `createSitterProfile` - Create/update sitter profile with pricing and skills
- `getOwnerProfile` - Get current user's owner profile
- `getSitterProfile` - Get sitter profile by user ID
- `addCat` - Add cat for owner
- `getCats` - Get all cats for current owner
- `updateCat` - Update cat details
- `deleteCat` - Remove cat

**Sitters Router** (`/sitters`)
- `search` - Search sitters with filters:
  - Location (suburb)
  - Price range (min/max)
  - Rating (minimum stars)
  - Cat types (indoor, outdoor, kittens, seniors, medical needs)
  - Special skills (medication, injections, special diets)
  - Pagination (limit/offset)
- `getById` - Get sitter details with reviews

**Bookings Router** (`/bookings`)
- `create` - Create booking request
- `getMyBookings` - Get bookings for current user (filtered by status)
- `getById` - Get booking details with cat info
- `accept` - Accept booking (sitter only)
- `decline` - Decline booking (sitter only)
- `complete` - Mark booking as complete (sitter only)
- `cancel` - Cancel booking (owner only)

**Messages Router** (`/messages`)
- `getOrCreateConversation` - Get or create conversation between owner and sitter
- `getConversations` - Get all conversations for current user
- `getMessages` - Get messages for a conversation (with pagination)
- `sendMessage` - Send message in conversation
- `markAsRead` - Mark messages as read

**Reviews Router** (`/reviews`)
- `create` - Leave review for completed booking (owner only)
- `getBySitter` - Get reviews for a sitter (with pagination)
- `canReview` - Check if user can review a booking

### 4. Mobile App Foundation

**Authentication System**
- ✅ AuthContext for managing user state
- ✅ AsyncStorage for persistent login
- ✅ Welcome screen with cat illustration
- ✅ Role selection screen (Owner vs Sitter)

**Navigation Structure**
- Stack navigation for authentication flow
- Tab navigation prepared for main app
- Deep linking support configured

---

## 🔄 In Progress / Not Yet Implemented

### Authentication & Onboarding Screens
- [ ] Sign up screen (email, phone, password)
- [ ] Sign in screen
- [ ] Owner onboarding (profile setup, add cats)
- [ ] Sitter onboarding (profile, pricing, skills, bio)

### Cat Owner Screens
- [ ] Home screen with quick actions
- [ ] Search sitters (list and map view)
- [ ] Filter modal (suburb, dates, price, rating, skills)
- [ ] Sitter detail screen
- [ ] Booking request screen
- [ ] My Bookings (Upcoming, Pending, Past tabs)
- [ ] Booking detail screen
- [ ] Leave review screen
- [ ] My Cats screen
- [ ] Owner profile screen

### Cat Sitter Screens
- [ ] Home screen with stats
- [ ] My Bookings (Requests, Upcoming, Past tabs)
- [ ] Booking detail with cat info
- [ ] Sitter profile screen with reviews

### Shared Screens
- [ ] Messages list screen
- [ ] Chat screen
- [ ] Static content pages (About, Why Choose Us, Contact, FAQ, Safety & Trust)
- [ ] Settings screen

### Additional Features
- [ ] Push notifications setup
- [ ] Image upload for profiles and cats
- [ ] Map integration for sitter search
- [ ] Date/time pickers for bookings
- [ ] Real-time messaging updates
- [ ] App store submission preparation

---

## Technical Stack

**Frontend**
- React Native 0.81
- Expo SDK 54
- TypeScript 5.9
- NativeWind 4 (Tailwind CSS)
- Expo Router 6 (file-based routing)
- TanStack Query (data fetching)
- React Native Reanimated 4

**Backend**
- Node.js with Express
- tRPC for type-safe APIs
- MySQL database
- Drizzle ORM
- JWT authentication
- Password hashing (SHA-256)

**Infrastructure**
- Expo for cross-platform development
- AsyncStorage for local data persistence
- Expo Push Notifications (ready to configure)
- S3-compatible storage for images

---

## Database Relationships

```
Users (1) ──→ (1) OwnerProfiles
Users (1) ──→ (1) SitterProfiles
Users (1) ──→ (N) Cats
Users (1) ──→ (N) Bookings (as owner)
Users (1) ──→ (N) Bookings (as sitter)
Users (1) ──→ (N) Conversations (as owner)
Users (1) ──→ (N) Conversations (as sitter)
Users (1) ──→ (N) Messages (as sender)
Users (1) ──→ (N) Reviews (as owner)
Users (1) ──→ (N) Reviews (as sitter)

Bookings (1) ──→ (1) Reviews
Bookings (1) ──→ (0-1) Conversations
Conversations (1) ──→ (N) Messages
```

---

## Key User Flows

### Flow 1: Cat Owner Finding a Sitter
1. Sign up → Select "Cat Owner" role
2. Complete profile (suburb, location)
3. Add cat details (name, age, temperament, medical notes, feeding schedule)
4. Search for sitters (filter by suburb, dates, price, rating, skills)
5. View sitter profile and reviews
6. Create booking request (select dates, times, cats, add instructions)
7. Receive notification when sitter accepts
8. Message sitter for details
9. After completion, leave review

### Flow 2: Cat Sitter Receiving Bookings
1. Sign up → Select "Cat Sitter" role
2. Complete profile (photo, location, service area, pricing, experience, skills, bio)
3. Receive notification for new booking request
4. View booking details (owner info, cat details, dates)
5. Accept or decline booking
6. Message owner for additional details
7. Mark booking as complete after service
8. Receive review from owner

### Flow 3: In-App Messaging
1. Owner or sitter taps "Message" button
2. Opens chat screen with conversation
3. Send and receive messages in real-time
4. Receive push notifications for new messages
5. Conversation history saved

---

## Next Steps for Completion

### Phase 1: Complete Authentication & Onboarding
- Build sign up/sign in screens
- Implement owner onboarding flow
- Implement sitter onboarding flow
- Connect to backend APIs

### Phase 2: Build Cat Owner Experience
- Home screen with dashboard
- Search and filter sitters
- Sitter profiles and reviews
- Booking request flow
- My bookings management
- Cat management screens

### Phase 3: Build Cat Sitter Experience
- Home screen with stats
- Booking requests management
- Accept/decline/complete bookings
- Profile and reviews display

### Phase 4: Messaging & Communication
- Conversations list
- Chat interface
- Real-time updates
- Push notifications

### Phase 5: Polish & Deploy
- Static content pages
- Settings and preferences
- Image uploads
- Testing on iOS and Android
- App store submission

---

## API Testing

All backend endpoints are ready to test. You can use the tRPC client to test functionality:

**Example: Sign Up**
```typescript
const result = await trpc.auth.signUp.mutate({
  email: "owner@example.com",
  phone: "0412345678",
  password: "password123",
  name: "John Doe",
  role: "owner"
});
```

**Example: Search Sitters**
```typescript
const sitters = await trpc.sitters.search.query({
  suburb: "Sydney",
  minRating: 4,
  acceptsMedicalNeeds: true,
  limit: 20
});
```

---

## Design Guidelines

The app follows Apple Human Interface Guidelines (HIG) for a native iOS feel:

- **One-handed usage**: Primary actions within thumb reach
- **Portrait orientation**: Optimized for 9:16 aspect ratio
- **Clear hierarchy**: Important actions prominent
- **Friendly tone**: Warm, welcoming copy
- **Visual consistency**: Consistent spacing, typography, components
- **Accessibility**: High contrast, readable fonts, clear labels

---

## Project Structure

```
4paws/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   ├── auth/                # Authentication screens
│   ├── _layout.tsx          # Root layout with providers
│   └── index.tsx            # Welcome screen
├── assets/
│   └── images/
│       ├── icon.png         # App icon with cat paw
│       └── cat-hero.png     # Orange cat illustration
├── components/              # Reusable UI components
│   ├── screen-container.tsx
│   └── ui/
├── drizzle/                 # Database schema
│   └── schema.ts            # All table definitions
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and contexts
│   ├── auth-context.tsx     # Authentication state
│   ├── trpc.ts              # API client
│   └── utils.ts
├── server/                  # Backend API
│   ├── routers/             # tRPC routers
│   │   ├── authRouter.ts
│   │   ├── profilesRouter.ts
│   │   ├── sittersRouter.ts
│   │   ├── bookingsRouter.ts
│   │   ├── messagesRouter.ts
│   │   └── reviewsRouter.ts
│   ├── db.ts                # Database functions
│   └── routers.ts           # Main router
├── design.md                # Detailed design plan
├── todo.md                  # Feature tracking
└── PROJECT_SUMMARY.md       # This file
```

---

## Contact & Support

For questions or issues:
- Review the `design.md` file for detailed screen specifications
- Check `todo.md` for feature completion status
- Test backend APIs using the tRPC client
- Continue development by building remaining mobile screens

---

**Status**: Backend infrastructure complete, mobile UI foundation started. Ready for frontend development to continue.
