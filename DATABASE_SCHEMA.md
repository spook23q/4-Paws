# 4 Paws Database Schema Documentation

This document provides a complete overview of the database schema for the 4 Paws cat sitting marketplace app.

---

## Core Authentication Tables

### `users` Table
**Purpose:** Stores all user accounts (both owners and sitters)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | varchar(255) | NOT NULL, UNIQUE | User's email address (login credential) |
| `phone` | varchar(20) | NOT NULL | User's phone number |
| `password_hash` | varchar(255) | NOT NULL | Bcrypt hashed password |
| `role` | enum('owner', 'sitter') | NOT NULL | User role in the platform |
| `name` | varchar(255) | NOT NULL | User's full name |
| `profile_photo` | text | NULL | URL to profile photo (S3) |
| `open_id` | varchar(255) | NULL | OAuth provider ID (for social login) |
| `login_method` | varchar(50) | NULL | Login method (email, google, etc.) |
| `push_token` | text | NULL | Device push notification token (for Expo notifications) |
| `last_signed_in` | timestamp | NULL | Last successful login timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Account creation timestamp |
| `updated_at` | timestamp | NOT NULL, ON UPDATE NOW | Last update timestamp |

**Indexes:**
- `email_idx` on `email`
- `role_idx` on `role`
- `open_id_idx` on `open_id`

**Authentication Flow:**
1. User registers → email + password_hash + role stored
2. User logs in → email looked up, password verified against password_hash
3. Session created with user ID

---

## Profile Tables

### `owner_profiles` Table
**Purpose:** Additional information for cat owners

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Profile ID |
| `user_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Reference to user account |
| `suburb` | varchar(255) | NOT NULL | Owner's suburb/location |
| `latitude` | decimal(10,7) | NULL | Geographic latitude |
| `longitude` | decimal(10,7) | NULL | Geographic longitude |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Profile creation |
| `updated_at` | timestamp | NOT NULL, ON UPDATE NOW | Last update |

**Indexes:**
- `user_idx` on `user_id`

**Cascade:** ON DELETE CASCADE (deletes profile when user deleted)

### `sitter_profiles` Table
**Purpose:** Additional information and settings for cat sitters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Profile ID |
| `user_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Reference to user account |
| `suburb` | varchar(255) | NOT NULL | Sitter's suburb/location |
| `latitude` | decimal(10,7) | NULL | Geographic latitude |
| `longitude` | decimal(10,7) | NULL | Geographic longitude |
| `service_area_radius` | int | NOT NULL, DEFAULT 10 | Service radius in km |
| `price_per_day` | decimal(10,2) | NOT NULL | Day visit rate |
| `price_per_night` | decimal(10,2) | NOT NULL | Overnight rate |
| `years_experience` | int | NOT NULL, DEFAULT 0 | Years of cat sitting experience |
| `bio` | text | NULL | Sitter biography |
| `accepts_indoor` | boolean | NOT NULL, DEFAULT true | Accepts indoor cats |
| `accepts_outdoor` | boolean | NOT NULL, DEFAULT true | Accepts outdoor cats |
| `accepts_kittens` | boolean | NOT NULL, DEFAULT true | Accepts kittens |
| `accepts_seniors` | boolean | NOT NULL, DEFAULT true | Accepts senior cats |
| `accepts_medical_needs` | boolean | NOT NULL, DEFAULT false | Accepts cats with medical needs |
| `can_administer_medication` | boolean | NOT NULL, DEFAULT false | Can give oral medication |
| `can_give_injections` | boolean | NOT NULL, DEFAULT false | Can give injections |
| `experience_special_diets` | boolean | NOT NULL, DEFAULT false | Experience with special diets |
| `can_handle_multiple_cats` | boolean | NOT NULL, DEFAULT true | Can handle multiple cats |
| `average_rating` | decimal(3,2) | DEFAULT 0.00 | Average star rating (0-5) |
| `total_reviews` | int | NOT NULL, DEFAULT 0 | Total number of reviews |
| `total_bookings` | int | NOT NULL, DEFAULT 0 | Total completed bookings |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Profile creation |
| `updated_at` | timestamp | NOT NULL, ON UPDATE NOW | Last update |

**Indexes:**
- `user_idx` on `user_id`
- `suburb_idx` on `suburb`
- `rating_idx` on `average_rating`

**Cascade:** ON DELETE CASCADE

---

## Cat Management

### `cats` Table
**Purpose:** Stores information about owners' cats

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Cat ID |
| `owner_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Cat owner |
| `name` | varchar(255) | NOT NULL | Cat's name |
| `age` | int | NOT NULL | Cat's age in years |
| `photo` | text | NULL | URL to cat photo (S3) |
| `temperament` | text | NULL | JSON array of temperament traits |
| `medical_notes` | text | NULL | Medical conditions, medications |
| `feeding_schedule` | text | NULL | Feeding instructions |
| `is_indoor` | boolean | NOT NULL, DEFAULT true | Indoor or outdoor cat |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Record creation |
| `updated_at` | timestamp | NOT NULL, ON UPDATE NOW | Last update |

**Indexes:**
- `owner_idx` on `owner_id`

**Cascade:** ON DELETE CASCADE

---

## Booking System

### `bookings` Table
**Purpose:** Stores booking requests and confirmed bookings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Booking ID |
| `owner_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Cat owner making request |
| `sitter_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Sitter receiving request |
| `start_date` | timestamp | NOT NULL | Booking start date/time |
| `end_date` | timestamp | NOT NULL | Booking end date/time |
| `start_time` | varchar(50) | NOT NULL | Time of day (morning/afternoon/evening) |
| `end_time` | varchar(50) | NOT NULL | Time of day |
| `cat_ids` | text | NOT NULL | JSON array of cat IDs included |
| `special_instructions` | text | NULL | Owner's instructions to sitter |
| `total_price` | decimal(10,2) | NOT NULL | Total booking cost |
| `status` | enum | NOT NULL, DEFAULT 'pending' | pending, confirmed, completed, cancelled |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Request creation |
| `updated_at` | timestamp | NOT NULL, ON UPDATE NOW | Last status change |

**Indexes:**
- `owner_idx` on `owner_id`
- `sitter_idx` on `sitter_id`
- `status_idx` on `status`
- `start_date_idx` on `start_date`

**Cascade:** ON DELETE CASCADE

**Status Flow:**
1. `pending` - Owner creates booking request
2. `confirmed` - Sitter accepts request
3. `completed` - Sitter marks booking as complete
4. `cancelled` - Owner cancels before start

---

## Messaging System

### `conversations` Table
**Purpose:** Message threads between owners and sitters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Conversation ID |
| `owner_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Cat owner |
| `sitter_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Cat sitter |
| `booking_id` | bigint | NULL, FOREIGN KEY → bookings.id | Related booking (optional) |
| `last_message_at` | timestamp | NOT NULL, DEFAULT NOW | Last message timestamp |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Conversation start |

**Indexes:**
- `owner_idx` on `owner_id`
- `sitter_idx` on `sitter_id`
- `booking_idx` on `booking_id`

**Cascade:** 
- ON DELETE CASCADE for users
- ON DELETE SET NULL for bookings

### `messages` Table
**Purpose:** Individual messages within conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| `conversation_id` | bigint | NOT NULL, FOREIGN KEY → conversations.id | Parent conversation |
| `sender_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Message sender |
| `content` | text | NOT NULL | Message text |
| `is_read` | boolean | NOT NULL, DEFAULT false | Read status |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Message timestamp |

**Indexes:**
- `conversation_idx` on `conversation_id`
- `sender_idx` on `sender_id`
- `created_at_idx` on `created_at`

**Cascade:** ON DELETE CASCADE

---

## Review System

### `reviews` Table
**Purpose:** Owner reviews of sitters after completed bookings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Review ID |
| `booking_id` | bigint | NOT NULL, FOREIGN KEY → bookings.id | Completed booking |
| `sitter_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Sitter being reviewed |
| `owner_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Owner writing review |
| `rating` | int | NOT NULL | Star rating (1-5) |
| `review_text` | text | NULL | Written review |
| `photos` | text | NULL | JSON array of photo URLs |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | Review submission |

**Indexes:**
- `booking_idx` on `booking_id`
- `sitter_idx` on `sitter_id`
- `owner_idx` on `owner_id`

**Cascade:** ON DELETE CASCADE

**Constraints:**
- One review per booking (enforced in application logic)
- Rating must be 1-5
- Can only review after booking status = 'completed'

---

## Additional Tables

### `favorites` Table
**Purpose:** Owners' saved/favorited sitters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Favorite ID |
| `owner_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Cat owner |
| `sitter_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Favorited sitter |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | When favorited |

**Unique Constraint:** `(owner_id, sitter_id)` - prevent duplicate favorites

**Cascade:** ON DELETE CASCADE

### `sitter_availability` Table
**Purpose:** Dates when sitters are unavailable

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO_INCREMENT | Availability ID |
| `sitter_id` | bigint | NOT NULL, FOREIGN KEY → users.id | Sitter |
| `unavailable_date` | date | NOT NULL | Blocked date |
| `reason` | varchar(255) | NULL | Optional reason |
| `created_at` | timestamp | NOT NULL, DEFAULT NOW | When created |

**Indexes:**
- `sitter_idx` on `sitter_id`
- `date_idx` on `unavailable_date`

**Cascade:** ON DELETE CASCADE

### `bookings` Additional Columns
**Purpose:** Booking reminder tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `reminder_sent` | boolean | NOT NULL, DEFAULT false | 24-hour reminder sent |

---

## Entity Relationships

```
users (1) ←→ (0..1) owner_profiles
users (1) ←→ (0..1) sitter_profiles
users (1) ←→ (0..*) cats [as owner]
users (1) ←→ (0..*) bookings [as owner]
users (1) ←→ (0..*) bookings [as sitter]
users (1) ←→ (0..*) conversations [as owner]
users (1) ←→ (0..*) conversations [as sitter]
users (1) ←→ (0..*) messages [as sender]
users (1) ←→ (0..*) reviews [as owner]
users (1) ←→ (0..*) reviews [as sitter]
users (1) ←→ (0..*) favorites [as owner]
users (1) ←→ (0..*) sitter_availability [as sitter]

bookings (1) ←→ (0..1) conversations
bookings (1) ←→ (0..1) reviews
conversations (1) ←→ (0..*) messages
```

---

## Registration Flow

### Owner Registration
1. User submits sign-up form with:
   - email
   - password (min 8 characters)
   - name
   - phone
   - suburb
   - role = 'owner'

2. Backend validates:
   - Email not already registered (check `users.email` unique constraint)
   - Password meets requirements
   - All required fields present

3. Backend creates records:
   ```sql
   INSERT INTO users (email, password_hash, name, phone, role)
   VALUES (?, ?, ?, ?, 'owner');
   
   INSERT INTO owner_profiles (user_id, suburb)
   VALUES (LAST_INSERT_ID(), ?);
   ```

4. Session created, user logged in

### Sitter Registration
1. User submits sign-up form with:
   - email
   - password
   - name
   - phone
   - suburb
   - role = 'sitter'

2. Backend validates (same as owner)

3. Backend creates records:
   ```sql
   INSERT INTO users (email, password_hash, name, phone, role)
   VALUES (?, ?, ?, ?, 'sitter');
   
   INSERT INTO sitter_profiles (user_id, suburb, price_per_day, price_per_night)
   VALUES (LAST_INSERT_ID(), ?, 25.00, 35.00); -- default rates
   ```

4. Session created, user logged in

---

## Login Flow

1. User submits email + password

2. Backend queries:
   ```sql
   SELECT id, email, password_hash, role, name
   FROM users
   WHERE email = ?;
   ```

3. Backend verifies password:
   ```javascript
   const isValid = await bcrypt.compare(password, user.password_hash);
   ```

4. If valid:
   - Update `last_signed_in` timestamp
   - Create session with user ID and role
   - Return user data to client

5. If invalid:
   - Return authentication error

---

## Common Queries

### Get User Profile (Owner)
```sql
SELECT u.*, op.suburb, op.latitude, op.longitude
FROM users u
LEFT JOIN owner_profiles op ON u.id = op.user_id
WHERE u.id = ?;
```

### Get User Profile (Sitter)
```sql
SELECT u.*, sp.*
FROM users u
LEFT JOIN sitter_profiles sp ON u.id = sp.user_id
WHERE u.id = ?;
```

### Search Sitters
```sql
SELECT u.name, u.profile_photo, sp.*
FROM users u
INNER JOIN sitter_profiles sp ON u.id = sp.user_id
WHERE u.role = 'sitter'
  AND sp.suburb LIKE ?
  AND sp.average_rating >= ?
  AND sp.price_per_day <= ?
ORDER BY sp.average_rating DESC, sp.total_reviews DESC;
```

### Check Email Availability
```sql
SELECT COUNT(*) as count
FROM users
WHERE email = ?;
```

---

## Data Types & Constraints Summary

### Password Storage
- **Never** store plain text passwords
- Use bcrypt with salt rounds = 10
- Store hash in `password_hash` varchar(255)

### Timestamps
- All tables have `created_at` and `updated_at` (except messages)
- Use MySQL `timestamp` type with default NOW()
- `updated_at` uses ON UPDATE NOW()

### Foreign Keys
- All foreign keys use ON DELETE CASCADE (except conversation.booking_id uses SET NULL)
- Ensures referential integrity
- Automatic cleanup when parent records deleted

### Enums
- `users.role`: 'owner' | 'sitter'
- `bookings.status`: 'pending' | 'confirmed' | 'completed' | 'cancelled'

### JSON Fields
- `cats.temperament`: Array of strings
- `bookings.cat_ids`: Array of bigint IDs
- `reviews.photos`: Array of S3 URLs

---

## Known Schema Issues

1. **ID Type Mismatch**: Schema defines `bigint` but actual MySQL database uses `int` (auto_increment). This causes type casting issues in queries.

2. **Phone Field**: Currently NOT NULL but should be nullable since it's optional in sign-up form.

3. **Missing Indexes**: Could benefit from composite indexes on frequently queried combinations (e.g., `suburb + average_rating` for sitter search).

4. **Booking Validation**: No database-level constraint to prevent overlapping bookings for same sitter.

5. **Review Uniqueness**: No unique constraint on `booking_id` in reviews table (should be one review per booking).

---

## Recommendations

1. **Align Schema with Database**: Update Drizzle schema to use `int` instead of `bigint` to match actual MySQL implementation.

2. **Add Composite Indexes**: Create indexes for common query patterns.

3. **Add Constraints**: Implement unique constraint on `reviews.booking_id` and check constraint for overlapping bookings.

4. **Normalize Enums**: Consider separate tables for status values if they need descriptions or localization.

5. **Audit Trail**: Add `deleted_at` timestamps for soft deletes instead of hard deletes.
