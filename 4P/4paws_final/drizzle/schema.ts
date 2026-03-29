import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// Users table - stores authentication and basic user info
export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["owner", "sitter"]).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    profilePhoto: text("profile_photo"),
    openId: varchar("open_id", { length: 255 }),
    loginMethod: varchar("login_method", { length: 50 }),
    pushToken: text("push_token"),
    // Address fields for geofencing and nearby search
    streetAddress: varchar("street_address", { length: 255 }),
    suburb: varchar("suburb", { length: 255 }),
    state: varchar("state", { length: 50 }),
    postcode: varchar("postcode", { length: 10 }),
    country: varchar("country", { length: 100 }).default("Australia"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    lastSignedIn: timestamp("last_signed_in"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    openIdIdx: index("open_id_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cat Owner profiles - additional info for owners
export const ownerProfiles = mysqlTable(
  "owner_profiles",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    suburb: varchar("suburb", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
  })
);

// Cat Sitter profiles - additional info for sitters
export const sitterProfiles = mysqlTable(
  "sitter_profiles",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    suburb: varchar("suburb", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    serviceAreaRadius: int("service_area_radius").notNull().default(10), // in km
    pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
    pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
    yearsExperience: int("years_experience").notNull().default(0),
    bio: text("bio"),
    acceptsIndoor: boolean("accepts_indoor").notNull().default(true),
    acceptsOutdoor: boolean("accepts_outdoor").notNull().default(true),
    acceptsKittens: boolean("accepts_kittens").notNull().default(true),
    acceptsSeniors: boolean("accepts_seniors").notNull().default(true),
    acceptsMedicalNeeds: boolean("accepts_medical_needs").notNull().default(false),
    canAdministerMedication: boolean("can_administer_medication").notNull().default(false),
    canGiveInjections: boolean("can_give_injections").notNull().default(false),
    experienceSpecialDiets: boolean("experience_special_diets").notNull().default(false),
    canHandleMultipleCats: boolean("can_handle_multiple_cats").notNull().default(true),
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
    totalReviews: int("total_reviews").notNull().default(0),
    totalBookings: int("total_bookings").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    suburbIdx: index("suburb_idx").on(table.suburb),
    ratingIdx: index("rating_idx").on(table.averageRating),
  })
);

// Cats table - stores cat information for owners
export const cats = mysqlTable(
  "cats",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    ownerId: bigint("owner_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    age: int("age").notNull(),
    photo: text("photo"),
    temperament: text("temperament"), // JSON array of strings
    medicalNotes: text("medical_notes"),
    feedingSchedule: text("feeding_schedule"),
    isIndoor: boolean("is_indoor").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("owner_idx").on(table.ownerId),
  })
);

// Bookings table - stores booking requests and confirmed bookings
export const bookings = mysqlTable(
  "bookings",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    ownerId: bigint("owner_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sitterId: bigint("sitter_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    startTime: varchar("start_time", { length: 50 }).notNull(), // e.g., "morning", "afternoon", "evening"
    endTime: varchar("end_time", { length: 50 }).notNull(),
    catIds: text("cat_ids").notNull(), // JSON array of cat IDs
    specialInstructions: text("special_instructions"),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).notNull().default("pending"),
    paymentIntentId: varchar("payment_intent_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("owner_idx").on(table.ownerId),
    sitterIdx: index("sitter_idx").on(table.sitterId),
    statusIdx: index("status_idx").on(table.status),
    startDateIdx: index("start_date_idx").on(table.startDate),
  })
);

// Conversations table - stores message threads between owners and sitters
export const conversations = mysqlTable(
  "conversations",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    ownerId: bigint("owner_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sitterId: bigint("sitter_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: bigint("booking_id", { mode: "bigint" }).references(() => bookings.id, { onDelete: "set null" }),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    ownerIdx: index("owner_idx").on(table.ownerId),
    sitterIdx: index("sitter_idx").on(table.sitterId),
    bookingIdx: index("booking_idx").on(table.bookingId),
  })
);

// Messages table - stores individual messages within conversations
export const messages = mysqlTable(
  "messages",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    conversationId: bigint("conversation_id", { mode: "bigint" })
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: bigint("sender_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("conversation_idx").on(table.conversationId),
    senderIdx: index("sender_idx").on(table.senderId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

// Reviews table - stores reviews left by owners for sitters
export const reviews = mysqlTable(
  "reviews",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().autoincrement(),
    bookingId: bigint("booking_id", { mode: "bigint" })
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    sitterId: bigint("sitter_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ownerId: bigint("owner_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: int("rating").notNull(), // 1-5 stars
    reviewText: text("review_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    bookingIdx: index("booking_idx").on(table.bookingId),
    sitterIdx: index("sitter_idx").on(table.sitterId),
    ownerIdx: index("owner_idx").on(table.ownerId),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  ownerProfile: one(ownerProfiles, {
    fields: [users.id],
    references: [ownerProfiles.userId],
  }),
  sitterProfile: one(sitterProfiles, {
    fields: [users.id],
    references: [sitterProfiles.userId],
  }),
  cats: many(cats),
  bookingsAsOwner: many(bookings, { relationName: "ownerBookings" }),
  bookingsAsSitter: many(bookings, { relationName: "sitterBookings" }),
  conversationsAsOwner: many(conversations, { relationName: "ownerConversations" }),
  conversationsAsSitter: many(conversations, { relationName: "sitterConversations" }),
  sentMessages: many(messages),
  reviewsGiven: many(reviews, { relationName: "reviewsGiven" }),
  reviewsReceived: many(reviews, { relationName: "reviewsReceived" }),
}));

export const ownerProfilesRelations = relations(ownerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [ownerProfiles.userId],
    references: [users.id],
  }),
}));

export const sitterProfilesRelations = relations(sitterProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sitterProfiles.userId],
    references: [users.id],
  }),
}));

export const catsRelations = relations(cats, ({ one }) => ({
  owner: one(users, {
    fields: [cats.ownerId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  owner: one(users, {
    fields: [bookings.ownerId],
    references: [users.id],
    relationName: "ownerBookings",
  }),
  sitter: one(users, {
    fields: [bookings.sitterId],
    references: [users.id],
    relationName: "sitterBookings",
  }),
  conversation: one(conversations),
  review: one(reviews),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  owner: one(users, {
    fields: [conversations.ownerId],
    references: [users.id],
    relationName: "ownerConversations",
  }),
  sitter: one(users, {
    fields: [conversations.sitterId],
    references: [users.id],
    relationName: "sitterConversations",
  }),
  booking: one(bookings, {
    fields: [conversations.bookingId],
    references: [bookings.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  sitter: one(users, {
    fields: [reviews.sitterId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
  owner: one(users, {
    fields: [reviews.ownerId],
    references: [users.id],
    relationName: "reviewsGiven",
  }),
}));
