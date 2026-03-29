# 4 Paws - Project TODO

## Branding & Design
- [x] Generate app logo with cat paw replacing 'A' in "4 Paws"
- [x] Configure app colors (light blue #B8DDE8 and warm orange #F5A962)
- [x] Add orange cat illustration to home screen
- [x] Update app.config.ts with app name and branding

## Database Schema
- [x] Users table (email, phone, password, role, profile data)
- [x] Cat Owners profiles table
- [x] Cat Sitters profiles table (pricing, experience, service area, skills)
- [x] Cats table (owner_id, name, age, temperament, medical notes, feeding schedule)
- [x] Bookings table (owner_id, sitter_id, cat_ids, dates, status, price)
- [x] Messages table (conversation threads and messages)
- [x] Reviews table (booking_id, sitter_id, rating, review text)

## Backend API Endpoints
- [x] Authentication endpoints (sign up, sign in, logout)
- [x] User profile endpoints (get, update)
- [x] Cat owner profile endpoints
- [x] Cat sitter profile endpoints
- [x] Cats CRUD endpoints
- [x] Search sitters endpoint (with filters: suburb, dates, price, rating, skills)
- [x] Bookings CRUD endpoints
- [x] Booking request/accept/decline endpoints
- [x] Messages endpoints (conversations, send message, get messages)
- [x] Reviews endpoints (create, get sitter reviews)

## Authentication & Onboarding
- [ ] Welcome screen with cat illustration and slogan
- [ ] Role selection screen (Cat Owner vs Cat Sitter)
- [ ] Sign up flow for Cat Owners (email, phone, password)
- [ ] Sign up flow for Cat Sitters (email, phone, password)
- [ ] Sign in screen
- [ ] Cat Owner onboarding (profile setup, add cat details)
- [ ] Cat Sitter onboarding (profile photo, location, pricing, experience, skills, bio)

## Cat Owner Features
- [ ] Home screen with quick actions and upcoming bookings
- [ ] Search sitters screen with list view
- [ ] Search filters (suburb, dates, price range, rating, special skills)
- [ ] Map view of sitters
- [ ] Sitter detail screen with profile, reviews, and pricing
- [ ] Booking request flow (date picker, cat selection, price calculation)
- [ ] My Bookings screen (Upcoming, Pending, Past tabs)
- [ ] Booking detail screen
- [ ] Cancel booking functionality
- [ ] Leave review screen (star rating and text)
- [ ] My Cats screen (list of cats with add/edit)
- [ ] Owner profile screen

## Cat Sitter Features
- [ ] Home screen with stats (total bookings, rating, earnings)
- [ ] My Bookings screen (Requests, Upcoming, Past tabs)
- [ ] View booking requests with cat details
- [ ] Accept/decline booking requests
- [ ] Mark booking as complete
- [ ] Sitter profile screen with reviews
- [ ] Edit sitter profile

## Messaging
- [ ] Messages screen with conversation list
- [ ] Chat screen with real-time messaging
- [ ] Message owner/sitter from booking screen
- [ ] Unread message indicators

## Static Content Pages
- [ ] About Us page
- [ ] Why Choose Us page
- [ ] Contact Us page
- [ ] FAQ page (accordion style)
- [ ] Safety & Trust page

## Settings & Profile
- [ ] Settings screen (notifications, account, privacy, terms)
- [ ] Edit profile functionality for both roles
- [ ] Logout functionality

## Push Notifications
- [x] Set up Expo push notifications
- [x] New booking request notification (Sitter)
- [x] Booking confirmation notification (Owner)
- [x] New message notification (Both)
- [ ] Upcoming booking reminder (24 hours before)
- [x] Booking completion prompt (Owner)
- [ ] Review received notification (Sitter)

## App Configuration
- [ ] Configure for iOS App Store submission
- [ ] Configure for Google Play Store submission
- [ ] Test on iOS device
- [ ] Test on Android device

## Design Updates
- [x] Update background color to incorporate warm tan/orange from cat illustration

## Static Content Pages
- [x] Integrate Why Choose Us page from Figma design
- [x] Create About Us page
- [x] Create Contact Us page
- [x] Create Safety & Trust page
- [x] Create FAQ page with expandable sections
- [x] Build sign up screen for owners and sitters
- [x] Build sign in screen
- [x] Implement sitter search with filters
- [x] Create booking request flow
- [x] Build messaging interface
- [x] Build cat list screen for owners
- [x] Build add cat form
- [x] Build edit cat screen
- [x] Create sitter profile editor with pricing, experience, service area, and skills
- [x] Build individual chat screen with message bubbles and input field
- [x] Build sitter detail page with bio, experience, pricing, skills, and reviews
- [x] Build booking request form with date selection, cat selection, and price calculation

## Design Updates
- [x] Regenerate app logo with text-only "4 PAWS" design
- [x] Fix welcome screen background color to use tan instead of black
- [x] Build sitter booking management interface
- [x] Implement live chatbot for customer support

## Bug Fixes
- [x] Fix sign-up registration error preventing new user registration
- [x] Fix sign-in authentication issues

## Design Updates
- [x] Change all orange buttons to dark green
- [x] Replace all black backgrounds with light tan color

## Design Updates
- [x] Regenerate cat illustration with heart or circular background instead of rectangle
- [x] Increase cat illustration size to take up most of the welcome screen
- [x] Regenerate cat illustration with tan background to match app theme
- [x] Regenerate cat illustration with light tan background only (no darker tan)

## Critical Bug Fixes
- [x] Fix database schema mismatch causing authentication failures

## Branding Updates
- [x] Create new app logo with light tan and blue color scheme
- [x] Update all app icon files (iOS and Android)
- [x] Update app.config.ts with new logo URL

## Authentication Issues Investigation
- [ ] Re-investigate persistent login/registration issues
- [ ] Check server logs for authentication errors
- [ ] Verify database connection and user table
- [ ] Test authentication with different credentials
- [x] Create visual documentation of all app screens

## Critical Issue Resolution
- [x] Execute phone field fix (added missing column to database)
- [x] Update Drizzle schema for nullable phone
- [x] Update authRouter to handle null phone values
- [x] Test complete authentication flow (registration + login)
- [x] Verify no SQL errors in authentication
- [x] Fix ALL .limit() calls causing SQL syntax errors (BLOCKING REGISTRATION)
- [x] Test registration after fixing limit calls
- [x] Verify login works after fixing limit calls

## Remember Me Feature
- [x] Add Remember Me checkbox to login screen UI
- [x] Implement session persistence with AsyncStorage
- [x] Pass rememberMe preference to signIn function
- [x] Clear stored credentials on logout
- [x] Test Remember Me functionality (12 tests passing)

## Color Scheme Updates
- [x] Replace grey text colors with black/white in theme config
- [x] Update muted text color for light mode (black #000000)
- [x] Update muted text color for dark mode (white #FFFFFF)
- [x] Test readability across all screens

## Standalone Authentication (Remove Manus OAuth)
- [ ] Remove Manus OAuth dependencies from auth system
- [ ] Implement standalone email/password registration
- [ ] Implement standalone email/password login
- [ ] Remove OAuth callback routes
- [ ] Test registration with new email addresses
- [ ] Test login with registered accounts
- [ ] Verify session management works independently

## Google OAuth Login
- [ ] Install expo-auth-session and expo-web-browser packages
- [ ] Configure Google OAuth client IDs (web, iOS, Android)
- [ ] Add Google sign-in button to login screen
- [ ] Implement Google OAuth flow in frontend
- [ ] Add backend endpoint to handle Google OAuth tokens
- [ ] Create or link user accounts from Google profile data
- [ ] Test Google login on web and mobile

## Database Schema Updates
- [x] Add pushToken field to users table in schema.ts
- [x] Sync pushToken field to database
- [x] Verify pushToken column exists in users table

## Push Token Implementation
- [x] Create API endpoint to update user push tokens in database
- [x] Implement push token registration on login
- [x] Implement push token registration on app startup
- [x] Update notification service to fetch push tokens from database
- [x] Add push notifications to booking creation and confirmation
- [x] Test complete push notification flow end-to-end

## Critical Bug Fixes
- [x] Push notification system fully implemented and working on mobile
- [ ] Web preview hydration error (known Expo SSR limitation - does not affect mobile app)
- [x] Test complete registration flow end-to-end (works on mobile)
- [x] Verify database user creation (confirmed working)

## Production Readiness Checklist
- [x] Audit all user flows for completeness (sign-up, booking, messaging, reviews)
- [x] Add Profile/Settings screen with user info editing
- [x] Add Privacy Policy page
- [x] Add Terms of Service page
- [x] Reorganize tab navigation (5 main tabs: Home, Search, Bookings, Messages, Profile)
- [x] Create updateProfile API endpoint
- [x] Move static pages to Profile menu
- [x] Configure app metadata (name, description, version)
- [x] Verify app icons for all platforms
- [x] Configure splash screens
- [x] Set up privacy policy and terms of service
- [x] Configure app permissions (notifications)
- [x] Create production build documentation (DEPLOYMENT.md)
- [x] Change web output to static (SSR disabled)
- [ ] Web preview hydration error (known Expo SSR limitation - does not affect mobile app)
- [ ] Test all flows on physical iOS device
- [ ] Test all flows on physical Android device
- [ ] Remove debug code and console logs
- [ ] Final production checkpoint

## Social Media & Payment Icons
- [x] Add social media icons (Facebook, Instagram, Twitter, LinkedIn) to Contact screen
- [x] Add social media sharing functionality (links to social profiles)
- [x] Add payment method icons (Visa, Mastercard, PayPal, Stripe) to booking screens
- [x] Create payment methods display component

## Logo Variants
- [x] Generate 6 logo variants with cat paw replacing the A in 4PAWS
- [x] Add cute decorative elements to each variant (whiskers and dimples)
- [x] Generate bonus 7th variant with Australian mullet cat
- [x] Save logo variants to assets folder
- [ ] Update app icon with selected variant

## High-Resolution App Icon
- [x] Generate high-resolution PNG version of Variant 1 (Happy Tabby Greeting)
- [x] Update icon.png with new logo
- [x] Update splash-icon.png with new logo
- [x] Update favicon.png with new logo
- [x] Update android-icon-foreground.png with new logo
- [x] Update app.config.ts with new logo URL
- [x] Save checkpoint with new branding

## New Logo Variants (Exact Font Match)
- [ ] Generate variants with bold italic black "4P🐾WS" font matching reference image
- [ ] Replace A with cute paw print
- [ ] Add prominent whiskers to cat
- [ ] Create variants with solid blue backgrounds
- [ ] Create variants with blue gradient backgrounds
- [ ] Create variants with cat balancing food bowl on head
- [ ] Update app icons with selected variant

## Error Handling Improvements
- [x] Update catch block in sign-up.tsx with better error handling

## Database Schema Updates
- [x] Verify push_token field exists in Drizzle schema
- [x] Update DATABASE_SCHEMA.md if push_token is missing
- [x] Run database migration if schema changes are needed

## Push Notification Implementation
- [x] Add push notifications to new message sending
- [x] Add push notifications to booking decline flow
- [x] Add push notifications to booking completion flow

## Database Rebuild
- [x] Drop all existing tables in MySQL
- [x] Generate fresh migration files from Drizzle schema
- [x] Apply migrations to create clean database structure
- [x] Verify all tables created correctly

## User Registration Testing
- [x] Create vitest test file for user registration flow
- [x] Test user signup with email/password
- [x] Test push token saving to database
- [x] Verify user data retrieval
- [x] Run all tests and verify passing

## Booking Flow Integration Tests
- [x] Create test for complete booking lifecycle
- [x] Test booking request with push notification
- [x] Test booking acceptance with push notification
- [x] Test booking decline with push notification
- [x] Test booking completion with push notification
- [x] Run booking tests and verify passing

## Seed Data Script
- [x] Create seed script with realistic test users
- [x] Add seed data for sitters with profiles
- [x] Add seed data for owners with cats
- [x] Add seed data for sample bookings
- [x] Add seed data for messages and conversations
- [x] Test seed script execution

## Real-Time Chat with WebSockets
- [x] Install Socket.IO dependencies (socket.io, socket.io-client)
- [x] Create WebSocket server with Socket.IO
- [x] Implement message event handlers on server
- [x] Create client-side WebSocket context and hooks
- [x] Update message sending to emit via WebSocket
- [x] Update message UI to listen for real-time messages
- [x] Add typing indicators to conversations
- [ ] Add online/offline status indicators
- [x] Wire WebSocketProvider into app layout
- [ ] Test real-time messaging end-to-end

## Photo Sharing in Chatbot
- [x] Add image picker to chatbot screen
- [x] Upload photos to S3 storage
- [x] Create AI vision endpoint for cat photo analysis
- [x] Display uploaded photos in chat
- [x] Test photo upload and AI analysis

## AI Chatbot
- [x] Create chatbot backend with LLM integration
- [x] Build chatbot knowledge base (cat care, booking, FAQs)
- [x] Create chatbot screen with conversation UI
- [x] Add quick-reply buttons for common questions
- [x] Implement message input and send functionality
- [x] Add chatbot tab to main navigation
- [x] Implement conversation history persistence
- [x] Test chatbot interface end-to-end

## Hamburger Menu
- [x] Create hamburger menu component with slide-out drawer
- [x] Add menu items (Profile, Settings, About, Logout)
- [x] Add user info section at top of menu
- [x] Integrate menu button into app header
- [x] Add smooth animations for menu open/close
- [x] Test menu functionality

## Google Places API Integration
- [x] Request Google Places API key from user
- [x] Install react-native-google-places-autocomplete
- [x] Create AddressAutocomplete component
- [ ] Add address field to sitter profiles (component ready, needs integration)
- [ ] Integrate address search into search screen (component ready, needs integration)
- [ ] Add location-based sitter filtering
- [x] Test address autocomplete functionality (API key validated)

## Text Color Improvements
- [x] Update muted text color from light grey to darker color (#4B5563)
- [x] Verify text contrast across all screens

## Expanded Seed Data
- [x] Generate 10 unique cat profile images
- [x] Add 10 additional sitter profiles to seed script
- [x] Add 10 customer profiles with cat images to seed script
- [x] Run seed script to populate database

## Fix Light Grey Text Colors
- [x] Update all light grey heading/title text to darker color (#1F2937)
- [x] Update placeholder text colors in all input fields (uses theme muted color)
- [x] Verify readability across all screens

## Cat Images S3 Upload
- [x] Upload 10 cat profile images to S3
- [x] Update seed script with S3 URLs
- [x] Update existing cat records with S3 URLs

## Sitter Search & Filtering
- [x] Add search input for suburb/location
- [x] Add price range filter slider
- [x] Add experience level filter
- [x] Add special services filters (medication, multiple cats, etc.)
- [x] Implement filter logic in search query
- [x] Display filtered results

## Sitter Detail Screen
- [x] Create sitter detail screen route
- [x] Display sitter profile photo, name, and bio
- [x] Show ratings and reviews
- [x] Display pricing and experience
- [x] Add instant booking button
- [x] Link from search results to detail screen

## Welcome Screen Text Fixes
- [x] Make "4 P🐾WS" logo text darker (currently light grey)
- [x] Change tagline from "Exclusively for Cats" to "Cats Only"

## Map View for Sitter Search
- [x] Install react-native-maps library
- [x] Create MapView component with custom markers
- [x] Add toggle button to switch between list and map views
- [x] Display sitter markers on map with profile photos
- [x] Add marker tap to show sitter info callout
- [x] Navigate to sitter detail from map marker
- [x] Test map view on web and mobile

## Dashboard Image Cleanup
- [x] Remove cat and heart image from owner dashboard (keep only 4PAWS logo)

## About Us Page
- [x] Create About Us page highlighting cat-only focus
- [x] Emphasize quality guarantee and unique positioning
- [x] Add About Us link to header navigation
- [x] Add About Us link to footer navigation (N/A - mobile app uses tab navigation)
- [x] Comprehensive app review and testing

## Dashboard Redesign with Light Blue Accents
- [x] Create multiple dashboard design variants
- [x] Incorporate light blue (#0a7ea4) accent color
- [x] Keep "4 P🐾WS" title unchanged
- [x] Implement chosen design variant (Variant 2 - Light Blue Card Backgrounds)

## Apply Light Blue Theme to Search Results
- [x] Update search results page with light blue card backgrounds
- [x] Apply consistent color scheme (#E6F4FE, #0a7ea4)
- [x] Update sitter cards with light blue accents
- [x] Ensure design consistency with dashboard

## UI Fixes - Text Visibility
- [x] Darken placeholder text color in all input fields for better readability
- [x] Fix welcome screen background - match inner and outer tan colors

## Cat Hero Image Fix
- [x] Regenerate cat hero image with orange tabby cat color restored

## Stripe Payment Integration
- [x] Install Stripe SDK dependencies
- [x] Create Stripe payment service on backend
- [x] Add payment intent creation API endpoint
- [x] Add paymentIntentId column to bookings table
- [x] Download Stripe, Mastercard, and Visa logos
- [x] Create payment UI component with Stripe payment sheet
- [x] Add payment provider logos to payment screens
- [x] Integrate payment into booking confirmation flow
- [x] Implement webhook handler for payment events
- [x] Auto-update booking status on successful payment
- [x] Create payment history screen (tab in bookings)
- [x] Show transaction history for owners and sitters
- [x] Store Stripe API keys securely (user to add via Settings → Secrets)
- [ ] Test payment flow end-to-end

## App Store Optimization (ASO)
- [x] Research and identify best keywords for cat sitting apps
- [x] Update app name with primary keyword
- [x] Write optimized app description (short and long)
- [x] Update app.config.ts with ASO metadata
- [x] Create keyword strategy document
- [x] Add app screenshots descriptions
- [x] Optimize app subtitle/tagline

## Pre-Launch Landing Page
- [x] Create simple, cute landing page design
- [x] Add email capture form
- [x] Add cat-themed visuals and branding
- [x] Create thank you message after signup
- [x] Add social proof and app features
- [x] Make mobile-responsive

## Landing Page Countdown Timer
- [x] Add live countdown timer to February 5, 2026
- [x] Display days, hours, minutes, seconds
- [x] Create sense of urgency for visitors

## Social Sharing Buttons
- [x] Add Twitter share button
- [x] Add Facebook share button
- [x] Add WhatsApp share button
- [x] Position below email form
- [x] Include pre-filled share text

## Testimonials Section
- [x] Create testimonials section with user quotes
- [x] Add 3-4 testimonials from early users/beta testers
- [x] Include user names and roles (cat owner/sitter)
- [x] Add star ratings or cat emojis
- [x] Position strategically on landing page
- [x] Make mobile-responsive

## App-Wide Text Visibility Fix
- [x] Update theme.config.js muted color to be darker
- [x] Find and replace all light title text colors
- [x] Fix all placeholder text colors app-wide (35+ instances)
- [x] Fix all label text colors
- [x] Test visibility on all screens

## Chatbot Icon Change
- [x] Change chatbot tab icon from message to chat bubble
- [x] Add bubble.left.and.bubble.right.fill icon mapping
- [x] Differentiate from messages tab icon

## Replace Title with Logo Image
- [x] Process logo image to match app background color
- [x] Save logo to assets/images/
- [x] Replace "4 Paws" text title in tab headers with logo
- [x] Keep home screen unchanged
- [ ] Test logo display across all screens

## Update Home Screen Logo
- [x] Remove "4 P🐾WS" text title from home screen
- [x] Move cat-in-heart image lower
- [x] Add new 4paws logo image above cat

## Fix TypeScript Build Errors
- [ ] Fix bigint type errors in webhook router
- [ ] Resolve MySqlColumn type mismatches
- [ ] Test TypeScript compilation
- [ ] Verify APK build works

## Fix TypeScript Build Errors
- [x] Fix bigint type errors in webhook router
- [x] Resolve MySqlColumn type mismatches
- [x] Test TypeScript compilation
- [x] Verify APK build works

## Fix Android APK Build Error
- [x] Investigate 4paws logo PNG compilation error
- [x] Check logo image format and corruption
- [x] Replace or regenerate logo image if needed
- [x] Test APK build successfully

## Home Screen Design Updates
- [ ] Make all text darker (not light font)
- [ ] Add 4paws logo to home screen above cat
- [ ] Remove small title text below the cat image
- [ ] Test visual appearance on preview

## URGENT: Fix Broken UI
- [x] Remove excess tabs from bottom navigation (keep only 5)
- [x] Remove duplicate logo from home screen content
- [x] Fix light grey text colors to be darker
- [x] Fix broken tab icons showing empty boxes

## Light/Dark Mode Toggle Feature
- [x] Review existing theme provider and color system
- [x] Add theme toggle state with AsyncStorage persistence
- [x] Create dark mode toggle UI in profile screen
- [x] Update theme colors for proper dark mode
- [x] Test theme switching on device

## Floating PawsBot Chat Button
- [x] Create floating action button component
- [x] Add button to main app layout
- [x] Navigate to PawsBot screen on tap
- [ ] Test on device

## Welcome Screen Update
- [x] Remove cat and heart image from welcome screen
- [x] Add big 4 PAWS title instead

## Fix Home Screen Design
- [x] Remove cat/heart image from home screen
- [x] Use 4PAWS title without tan background
- [x] Fix tab bar showing too many icons (was already correct, removed header logo)

## Use Logo Image for Title
- [x] Replace text title with 4PAWS logo image on home screen
- [x] Replace text title with 4PAWS logo image on welcome screen

## Logo Transparency and Size
- [x] Remove tan background from logo (make transparent)
- [x] Enlarge logo on welcome and home screens

## Update Slogan Text
- [x] Change "Cats Only" to "Cat Sitting Service" on welcome screen
- [x] Change "Cats Only" to "Cat Sitting Service" on home screen

## Logo Color Update
- [x] Change 4PAWS text to light beige color
- [x] Keep blue paw unchanged
- [x] Enlarge logo slightly on screens

## Animated Kitten Illustration
- [x] Generate kitten playing with string illustration
- [x] Add to home screen with animation

## Live Animated Kitten
- [x] Find Lottie animation of kitten playing
- [x] Replace static image with live animation

## Fix Sign Up/Sign In Crash
- [x] Investigate auth navigation crash
- [x] Fix the issue - added auth routes to Stack navigator

## Add Cat Animation to Welcome Screen
- [x] Add Lottie animation to welcome/landing page

## Fix FloatingChatButton Hooks Error
- [x] Fix early return causing hooks order issue - moved useAnimatedStyle before conditional return

## Replace Fox Animation with Cat
- [ ] Find proper cat/kitten Lottie animation
- [ ] Replace current animation file

## Custom Animated Cat Component
- [x] Created AnimatedCat SVG component with orange tabby cat playing with yarn
- [x] Added bouncing body animation
- [x] Replaced Lottie fox animation with custom cat on welcome screen
- [x] Replaced Lottie fox animation with custom cat on home screen

## Cute Cartoon Kitten Illustration
- [x] Generate cute cartoon kitten with round face and big eyes
- [x] Update AnimatedCat component with new design
- [x] Test animation on screens

## Moving Kitten Animation
- [x] Find animated GIF of kitten actually moving (cat playing with ball)
- [x] Replace static image with animated GIF
- [x] Test animation plays correctly

## Forgot Password Feature
- [x] Create forgot password screen
- [x] Add navigation from sign-in screen
- [x] Implement password reset API endpoint
- [x] Test forgot password flow

## Fix Kitten GIF Background
- [x] Change white background to match home screen background (#FDF6E3)

## Map View for Nearby Sitters
- [x] Install react-native-maps library
- [x] Create map screen component with location permission
- [x] Add sitter location markers and user location
- [x] Implement sitter details bottom sheet with actions
- [x] Add map tab to navigation (replaces search tab)
- [x] Fix floating chat button to navigate to chatbot screen
- [x] Change chat button to green (#10B981) with emoji icon

## Android Studio Configuration
- [x] Check current Android build configuration
- [x] Updated app.config.ts with Android permissions and build settings
- [x] Created eas.json for EAS build configuration
- [x] Created Android manifest configuration guide
- [x] Configured location, camera, and storage permissions
- [x] Fixed kitten GIF with transparent background
- [x] Fixed chatbot floating button navigation

## Bug Fixes (Completed)
- [x] Fix kitten GIF background - must be truly transparent
- [x] Fix chatbot feature - not working (fixed navigation from floating button to chatbot screen)

## Sitter Profile Population (Completed)
- [x] Review database schema for sitter profiles
- [x] Generate sitter profile images (10 professional portraits)
- [x] Upload images to S3 (all images uploaded to CDN)
- [x] Update seed data with real pricing ($30-$40/day, $75-$95/night)
- [x] Update sitter display screens with images and pricing
- [x] Test sitter profiles end-to-end

## What Makes Us Better Page (Completed)
- [x] Create "What makes us better" page with geofencing content
- [x] Generate mobile-friendly image with app colors (blue, pink, light tan)
- [x] Add navigation to the new page from home screen
- [x] Test page display on mobile

## Hamburger Menu & Geofencing Demo (Completed)
- [x] Add "What Makes Us Better" link to hamburger menu
- [x] Create animated geofencing demo component with animations
- [x] Integrate demo into What Makes Us Better page
- [x] Test navigation and animations

## Preview Fix & New Features (Current Sprint)
- [x] Fix preview screen loading issue (fixed react-native-maps web compatibility)
- [x] Create "How to Set Up" geofence tutorial page
- [x] Add push notification preview mockup
- [x] Create emergency contact feature with one-tap calling
- [x] Test all features end-to-end

## Bug Fix - Kitten GIF Background (URGENT)
- [x] Generate new kitten image with TRULY transparent background (no black)
- [x] Ensure transparency works in both light and dark mode
- [x] Test and verify fix

## Bug Fix - Map Icon Not Working
- [x] Investigate map tab configuration
- [x] Fix map tab navigation/functionality (skip location loading on web)
- [x] Test map icon press

## 4PAWS Title Color Fix
- [x] Change 4, P, W, S text to black in light mode
- [x] Keep blue paw color unchanged
- [x] Keep dark mode colors unchanged
- [x] Test on welcome and home screens

## Expo Go Compatibility Fixes
- [x] Fix react-native-maps error in Expo Go (show list view instead)
- [x] Fix expo-notifications error in Expo Go (skip loading on Android)
- [x] Test app loads without errors in Expo Go

## Real-Time Chat Feature (Current Sprint)
- [x] Review existing messaging/WebSocket infrastructure (already implemented!)
- [x] Create chat conversation list screen (already exists in messages tab)
- [x] Create real-time chat screen with message input (already exists at messages/[id].tsx)
- [x] Add chat entry points from sitter profiles and bookings (Message button on both)
- [x] Test real-time messaging end-to-end
- [x] Fixed SitterMapView Expo Go compatibility (shows list fallback)

## Rating & Review System (Current Sprint)
- [x] Review existing database schema for reviews (already exists!)
- [x] Create review submission screen (app/bookings/review.tsx)
- [x] Create review API endpoint (already exists in reviewsRouter.ts)
- [x] Add review prompt after booking completion
- [x] Display reviews on sitter profiles (already implemented in sitter detail screen)
- [x] Test review system end-to-end

## 4PAWS Logo Light Mode Fix
- [x] Generate new logo with BLACK text (4, P, W, S) and BLUE paw
- [x] Update app to use new logo in light mode
- [x] Test visibility on light background

## Dark Mode Color Fix
- [x] Change neon green font to white in dark mode

## Push Notification System
- [x] Review existing notification infrastructure (already fully implemented!)
- [x] Implement push notifications for booking confirmations (already in bookingsRouter.ts)
- [x] Implement push notifications for new messages (already in messagesRouter.ts)
- [x] Test notifications end-to-end

## APK Build Fix
- [x] Update eas.json for faster build (added local-apk profile)
- [x] Create local build instructions (BUILD_APK_LOCALLY.md)
- [x] Test build configuration

## Account Deletion (App Store Requirement)
- [x] Add deleteAccount API endpoint with password verification
- [x] Add Delete Account button to Profile screen
- [x] Implement confirmation modal with password and DELETE text verification
- [x] Handle data cleanup and sign out after deletion
- [x] Test account deletion flow

## Google Play Console Data Deletion Link
- [x] Create standalone data deletion webpage for Play Console
- [x] Add instructions for requesting account/data deletion
- [x] Update app store submission guide with deletion link

## Host Static Pages from Backend
- [x] Add Express routes to serve privacy policy HTML
- [x] Add Express routes to serve data deletion HTML
- [x] Test hosted URLs work

## Kotlin/KSP Version Fix
- [x] Fix Kotlin version mismatch (1.9.0 not supported by KSP)
- [x] Update to supported Kotlin version (2.0.20)

## Expo SDK Upgrade
- [x] Upgrade to latest Expo SDK (54.0.33)
- [x] Update all related dependencies
- [x] Fix NODE_ENV environment variable issue for EAS builds

## Bug Fixes - Maps and GIF
- [x] Fix maps icon crash when tapped (improved error handling)
- [x] Fix L-shaped line around logo in dark mode (removed PNG artifact)

## Loading Animations Enhancement
- [x] Create reusable skeleton loading component
- [x] Create animated loading spinner component (with paw animation)
- [x] Add loading states to search/sitter list screen
- [x] Add loading states to sitter profile screen
- [x] Add loading states to bookings screen
- [x] Add loading states to messages screen

## Custom Empty State Illustrations
- [x] Generate illustration for no search results
- [x] Generate illustration for no bookings
- [x] Generate illustration for no messages
- [x] Generate illustration for no reviews
- [x] Create reusable EmptyState component
- [x] Add empty states to search screen
- [x] Add empty states to bookings screen
- [x] Add empty states to messages screen

## User Address Feature
- [x] Add address fields to database schema (street_address, suburb, state, postcode, country, latitude, longitude)
- [x] Create address management API endpoints (updateAddress, getAddress)
- [x] Build address settings UI component with form fields
- [x] Add address menu item to profile screen
- [x] Auto-fill suburb from user address in search
- [x] Integrate address with nearby sitter search
## Navigation Reorganization
- [x] Move profile section into settings
- [x] Create hamburger menu dropdown component
- [x] Update tab navigation to remove profile tab (hidden from tab bar)
- [x] Integrate hamburger menu into app header

## Distance-Based Sorting
- [x] Create distance calculation utility function (Haversine formula)
- [x] Add sorting toggle to search screen (distance/rating/price)
- [x] Display distance on sitter cards when distance sort is active
- [x] Implement sorting logic in FlatList data
