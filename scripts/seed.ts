/**
 * Seed script to populate database with realistic test data
 * Run with: pnpm tsx scripts/seed.ts
 */

import { getDb } from "../server/db";
import bcrypt from "bcryptjs";
import { users, ownerProfiles, sitterProfiles, cats, bookings, conversations, messages } from "../drizzle/schema";

async function seed() {
  console.log("🌱 Starting database seed...");
  
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // Create owner users
    console.log("Creating owner users...");
    const owner1Result = await db.insert(users).values({
      email: "alice.smith@example.com",
      phone: "+61400111222",
      passwordHash: await bcrypt.hash("Password123!", 10),
      role: "owner",
      name: "Alice Smith",
      loginMethod: "email",
      pushToken: "ExponentPushToken[alice-token-123]",
      profilePhoto: "https://i.pravatar.cc/150?img=1",
      lastSignedIn: new Date(),
    });
    const owner1Id = BigInt(owner1Result[0].insertId);

    const owner2Result = await db.insert(users).values({
      email: "bob.jones@example.com",
      phone: "+61400222333",
      passwordHash: await bcrypt.hash("Password123!", 10),
      role: "owner",
      name: "Bob Jones",
      loginMethod: "email",
      pushToken: "ExponentPushToken[bob-token-456]",
      profilePhoto: "https://i.pravatar.cc/150?img=12",
      lastSignedIn: new Date(),
    });
    const owner2Id = BigInt(owner2Result[0].insertId);

    // Create owner profiles
    console.log("Creating owner profiles...");
    await db.insert(ownerProfiles).values([
      {
        userId: owner1Id,
        suburb: "Bondi Beach",
        latitude: "-33.8915",
        longitude: "151.2767",
      },
      {
        userId: owner2Id,
        suburb: "Surry Hills",
        latitude: "-33.8860",
        longitude: "151.2107",
      },
    ]);

    // Create sitter users
    console.log("Creating sitter users...");
    const sitter1Result = await db.insert(users).values({
      email: "emma.wilson@example.com",
      phone: "+61400333444",
      passwordHash: await bcrypt.hash("Password123!", 10),
      role: "sitter",
      name: "Emma Wilson",
      loginMethod: "email",
      pushToken: "ExponentPushToken[emma-token-789]",
      profilePhoto: "https://i.pravatar.cc/150?img=5",
      lastSignedIn: new Date(),
    });
    const sitter1Id = BigInt(sitter1Result[0].insertId);

    const sitter2Result = await db.insert(users).values({
      email: "james.brown@example.com",
      phone: "+61400444555",
      passwordHash: await bcrypt.hash("Password123!", 10),
      role: "sitter",
      name: "James Brown",
      loginMethod: "email",
      pushToken: "ExponentPushToken[james-token-012]",
      profilePhoto: "https://i.pravatar.cc/150?img=11",
      lastSignedIn: new Date(),
    });
    const sitter2Id = BigInt(sitter2Result[0].insertId);

    // Create sitter profiles
    console.log("Creating sitter profiles...");
    await db.insert(sitterProfiles).values([
      {
        userId: sitter1Id,
        suburb: "Bondi Beach",
        latitude: "-33.8915",
        longitude: "151.2767",
        serviceAreaRadius: 15,
        pricePerDay: "45.00",
        pricePerNight: "65.00",
        yearsExperience: 7,
        bio: "Passionate cat lover with 7 years of experience. I treat every cat like my own! Specializing in senior cats and special needs care.",
        acceptsIndoor: true,
        acceptsOutdoor: true,
        acceptsKittens: true,
      },
      {
        userId: sitter2Id,
        suburb: "Newtown",
        latitude: "-33.8970",
        longitude: "151.1794",
        serviceAreaRadius: 10,
        pricePerDay: "40.00",
        pricePerNight: "60.00",
        yearsExperience: 3,
        bio: "Experienced with all cat breeds and temperaments. I provide daily photo updates and lots of playtime!",
        acceptsIndoor: true,
        acceptsOutdoor: false,
        acceptsKittens: true,
      },
    ]);

    // Create cats
    console.log("Creating cats...");
    const cat1Result = await db.insert(cats).values({
      ownerId: owner1Id,
      name: "Whiskers",
      age: 4,
      photo: "https://placekitten.com/400/300",
      temperament: JSON.stringify(["friendly", "playful", "curious"]),
      medicalNotes: "No known allergies. Up to date on vaccinations.",
      feedingSchedule: "Twice daily - 8am and 6pm. Dry food with occasional wet food treats.",
      isIndoor: true,
    });
    const cat1Id = BigInt(cat1Result[0].insertId);

    const cat2Result = await db.insert(cats).values({
      ownerId: owner1Id,
      name: "Shadow",
      age: 2,
      photo: "https://placekitten.com/401/300",
      temperament: JSON.stringify(["shy", "gentle", "affectionate"]),
      medicalNotes: "Needs thyroid medication daily (pill in wet food).",
      feedingSchedule: "Three times daily - 7am, 2pm, 7pm. Prescription diet food only.",
      isIndoor: true,
    });
    const cat2Id = BigInt(cat2Result[0].insertId);

    const cat3Result = await db.insert(cats).values({
      ownerId: owner2Id,
      name: "Mittens",
      age: 6,
      photo: "https://placekitten.com/402/300",
      temperament: JSON.stringify(["independent", "calm", "friendly"]),
      medicalNotes: "Senior cat, no special needs. Prefers quiet environments.",
      feedingSchedule: "Twice daily - morning and evening. Free-fed dry food.",
      isIndoor: true,
    });
    const cat3Id = BigInt(cat3Result[0].insertId);

    // Create bookings
    console.log("Creating bookings...");
    const now = new Date();
    
    // Past completed booking
    const pastStart = new Date(now);
    pastStart.setDate(pastStart.getDate() - 10);
    const pastEnd = new Date(pastStart);
    pastEnd.setDate(pastEnd.getDate() + 3);

    const booking1Result = await db.insert(bookings).values({
      ownerId: owner1Id,
      sitterId: sitter1Id,
      startDate: pastStart,
      endDate: pastEnd,
      startTime: "morning",
      endTime: "evening",
      catIds: JSON.stringify([cat1Id.toString()]),
      specialInstructions: "Whiskers loves to play with feather toys! Please give him at least 30 minutes of playtime daily.",
      totalPrice: "135.00",
      status: "completed",
    });
    const booking1Id = BigInt(booking1Result[0].insertId);

    // Upcoming confirmed booking
    const upcomingStart = new Date(now);
    upcomingStart.setDate(upcomingStart.getDate() + 5);
    const upcomingEnd = new Date(upcomingStart);
    upcomingEnd.setDate(upcomingEnd.getDate() + 4);

    const booking2Result = await db.insert(bookings).values({
      ownerId: owner1Id,
      sitterId: sitter2Id,
      startDate: upcomingStart,
      endDate: upcomingEnd,
      startTime: "afternoon",
      endTime: "morning",
      catIds: JSON.stringify([cat1Id.toString(), cat2Id.toString()]),
      specialInstructions: "Shadow is shy at first but warms up quickly. Please hide his medication pill in wet food.",
      totalPrice: "240.00",
      status: "confirmed",
    });
    const booking2Id = BigInt(booking2Result[0].insertId);

    // Pending booking request
    const pendingStart = new Date(now);
    pendingStart.setDate(pendingStart.getDate() + 14);
    const pendingEnd = new Date(pendingStart);
    pendingEnd.setDate(pendingEnd.getDate() + 2);

    const booking3Result = await db.insert(bookings).values({
      ownerId: owner2Id,
      sitterId: sitter1Id,
      startDate: pendingStart,
      endDate: pendingEnd,
      startTime: "evening",
      endTime: "morning",
      catIds: JSON.stringify([cat3Id.toString()]),
      specialInstructions: "Mittens is very independent. Just needs feeding and some gentle pets.",
      totalPrice: "90.00",
      status: "pending",
    });
    const booking3Id = BigInt(booking3Result[0].insertId);

    // Create conversations
    console.log("Creating conversations and messages...");
    const conv1Result = await db.insert(conversations).values({
      ownerId: owner1Id,
      sitterId: sitter1Id,
      bookingId: booking1Id,
      lastMessageAt: new Date(now.getTime() - 86400000 * 5), // 5 days ago
    });
    const conv1Id = BigInt(conv1Result[0].insertId);

    const conv2Result = await db.insert(conversations).values({
      ownerId: owner1Id,
      sitterId: sitter2Id,
      bookingId: booking2Id,
      lastMessageAt: new Date(now.getTime() - 3600000 * 2), // 2 hours ago
    });
    const conv2Id = BigInt(conv2Result[0].insertId);

    // Create messages
    console.log("Creating messages...");
    await db.insert(messages).values([
      // Conversation 1 (past booking)
      {
        conversationId: conv1Id,
        senderId: owner1Id,
        content: "Hi Emma! Thanks for taking care of Whiskers last week. He seemed so happy when I got back!",
        createdAt: new Date(now.getTime() - 86400000 * 5),
      },
      {
        conversationId: conv1Id,
        senderId: sitter1Id,
        content: "It was my pleasure! Whiskers is such a sweetheart. We had lots of fun playtime together 😊",
        createdAt: new Date(now.getTime() - 86400000 * 5 + 3600000),
      },
      // Conversation 2 (upcoming booking)
      {
        conversationId: conv2Id,
        senderId: owner1Id,
        content: "Hi James! Looking forward to you watching Whiskers and Shadow next week. Just wanted to confirm you have the key pickup details?",
        createdAt: new Date(now.getTime() - 3600000 * 3),
      },
      {
        conversationId: conv2Id,
        senderId: sitter2Id,
        content: "Yes, I have all the details! I'll pick up the key from your neighbor on the morning of the 5th. Don't worry, they'll be in great hands!",
        createdAt: new Date(now.getTime() - 3600000 * 2),
      },
      {
        conversationId: conv2Id,
        senderId: owner1Id,
        content: "Perfect! Thank you so much. I'll leave extra treats in the cupboard for them 🐱",
        createdAt: new Date(now.getTime() - 3600000 * 2 + 600000),
      },
    ]);

    console.log("✅ Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log("- 2 owners created");
    console.log("- 2 sitters created");
    console.log("- 3 cats created");
    console.log("- 3 bookings created (1 completed, 1 confirmed, 1 pending)");
    console.log("- 2 conversations created");
    console.log("- 5 messages created");
    console.log("\n🔑 Test Credentials:");
    console.log("Owner 1: alice.smith@example.com / Password123!");
    console.log("Owner 2: bob.jones@example.com / Password123!");
    console.log("Sitter 1: emma.wilson@example.com / Password123!");
    console.log("Sitter 2: james.brown@example.com / Password123!");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    console.log("\n✨ Database seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed error:", error);
    process.exit(1);
  });
