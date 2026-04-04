/**
 * Expanded seed script to populate database with 10 sitters and 10 customers
 * Run with: pnpm tsx scripts/seed-expanded.ts
 */

import { getDb } from "../server/db";
import bcrypt from "bcryptjs";
import { users, ownerProfiles, sitterProfiles, cats } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

// Sydney suburbs for realistic addresses
const sydneySuburbs = [
  "Bondi", "Manly", "Newtown", "Surry Hills", "Paddington",
  "Darlinghurst", "Glebe", "Balmain", "Mosman", "Coogee"
];

// Cat breeds
const catBreeds = [
  "Domestic Shorthair", "Persian", "Siamese", "British Shorthair",
  "Maine Coon", "Bengal", "Russian Blue", "Ragdoll", "Scottish Fold", "Calico"
];

// S3 URLs for cat profile images
const catImageUrls = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/cbRqDdrFyqGYyXrv.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/tRwifeTptWmyThxA.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/mTugkRFErOefAMcT.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/FSGvtNafDjMkiDzR.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/bFhHUPFDaSKuFdJv.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/wrKJaScsvQhTUliE.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/PbhengzsylRENpue.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/cbxIhwARfFGvFmKC.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/JgxAnvAXLBupjvJy.png",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/lpVWdXoeLLRrlCLp.png"
];

async function seedExpanded() {
  console.log("🌱 Starting expanded database seed...");
  
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // Create 10 sitter profiles
    console.log("Creating 10 sitter users...");
    const sitterIds: bigint[] = [];
    
    const sitterData = [
      { name: "Emma Wilson", email: "emma.wilson@4paws.com", suburb: "Bondi", bio: "Experienced cat sitter with 5 years of experience. I love all breeds and provide daily photo updates!" },
      { name: "James Chen", email: "james.chen@4paws.com", suburb: "Manly", bio: "Former vet nurse specializing in feline care. Your cats will be in safe, professional hands." },
      { name: "Sophie Martin", email: "sophie.martin@4paws.com", suburb: "Newtown", bio: "Cat lover and pet first aid certified. I treat every cat like my own!" },
      { name: "Oliver Brown", email: "oliver.brown@4paws.com", suburb: "Surry Hills", bio: "Professional cat sitter offering overnight stays and daily visits. Police checked and insured." },
      { name: "Isabella Taylor", email: "isabella.taylor@4paws.com", suburb: "Paddington", bio: "Gentle, patient cat sitter with experience caring for senior and special needs cats." },
      { name: "Lucas Anderson", email: "lucas.anderson@4paws.com", suburb: "Darlinghurst", bio: "Cat whisperer with a calm, nurturing approach. Your cats will feel right at home." },
      { name: "Mia Thompson", email: "mia.thompson@4paws.com", suburb: "Glebe", bio: "Reliable and trustworthy cat sitter. I provide medication administration and grooming services." },
      { name: "Noah Garcia", email: "noah.garcia@4paws.com", suburb: "Balmain", bio: "Experienced with multiple cats and all temperaments. Flexible scheduling available." },
      { name: "Ava Rodriguez", email: "ava.rodriguez@4paws.com", suburb: "Mosman", bio: "Cat enthusiast offering premium care in a safe, loving environment." },
      { name: "Liam Martinez", email: "liam.martinez@4paws.com", suburb: "Coogee", bio: "Professional cat sitter with excellent references. Your cats' happiness is my priority!" }
    ];

    for (let i = 0; i < sitterData.length; i++) {
      const sitter = sitterData[i];
      const result = await db.insert(users).values({
        email: sitter.email,
        phone: `+6140${String(i + 1).padStart(7, '0')}`,
        passwordHash: await bcrypt.hash("Password123!", 10),
        role: "sitter",
        name: sitter.name,
        loginMethod: "email",
        pushToken: `ExponentPushToken[sitter-${i + 1}]`,
        profilePhoto: `https://i.pravatar.cc/150?img=${20 + i}`,
        lastSignedIn: new Date(),
      });
      const sitterId = BigInt(result[0].insertId);
      sitterIds.push(sitterId);

      // Create sitter profile
      await db.insert(sitterProfiles).values({
        userId: sitterId,
        suburb: sitter.suburb,
        latitude: (-33.8 + Math.random() * 0.2).toFixed(6),
        longitude: (151.2 + Math.random() * 0.2).toFixed(6),
        bio: sitter.bio,
        yearsExperience: Math.floor(Math.random() * 8) + 2,
        pricePerDay: String(25 + Math.floor(Math.random() * 20)),
        pricePerNight: String(60 + Math.floor(Math.random() * 40)),
        acceptsIndoor: true,
        acceptsOutdoor: true,
        acceptsKittens: true,
        acceptsSeniors: true,
        acceptsMedicalNeeds: i % 2 === 0,
        canAdministerMedication: i % 2 === 0,
        canGiveInjections: i % 3 === 0,
        experienceSpecialDiets: i % 2 === 0,
        canHandleMultipleCats: true,
        averageRating: (4.5 + Math.random() * 0.5).toFixed(2),
        totalReviews: Math.floor(Math.random() * 50) + 10,
        totalBookings: Math.floor(Math.random() * 100) + 20,
      });
    }

    console.log(`✅ Created ${sitterIds.length} sitters`);

    // Create 10 customer (owner) profiles with cats
    console.log("Creating 10 customer users with cats...");
    const ownerIds: bigint[] = [];
    
    const ownerData = [
      { name: "Sarah Johnson", email: "sarah.johnson@example.com" },
      { name: "Michael Davis", email: "michael.davis@example.com" },
      { name: "Emily White", email: "emily.white@example.com" },
      { name: "Daniel Lee", email: "daniel.lee@example.com" },
      { name: "Jessica Moore", email: "jessica.moore@example.com" },
      { name: "David Wilson", email: "david.wilson@example.com" },
      { name: "Laura Clark", email: "laura.clark@example.com" },
      { name: "Ryan Hall", email: "ryan.hall@example.com" },
      { name: "Rachel Adams", email: "rachel.adams@example.com" },
      { name: "Kevin Baker", email: "kevin.baker@example.com" }
    ];

    const catNames = [
      "Whiskers", "Luna", "Shadow", "Mittens", "Tiger",
      "Simba", "Bella", "Oliver", "Cleo", "Max"
    ];

    for (let i = 0; i < ownerData.length; i++) {
      const owner = ownerData[i];
      const result = await db.insert(users).values({
        email: owner.email,
        phone: `+6141${String(i + 1).padStart(7, '0')}`,
        passwordHash: await bcrypt.hash("Password123!", 10),
        role: "owner",
        name: owner.name,
        loginMethod: "email",
        pushToken: `ExponentPushToken[owner-${i + 1}]`,
        profilePhoto: `https://i.pravatar.cc/150?img=${30 + i}`,
        lastSignedIn: new Date(),
      });
      const ownerId = BigInt(result[0].insertId);
      ownerIds.push(ownerId);

      // Create owner profile
      await db.insert(ownerProfiles).values({
        userId: ownerId,
        suburb: sydneySuburbs[i],
        latitude: (-33.8 + Math.random() * 0.2).toFixed(6),
        longitude: (151.2 + Math.random() * 0.2).toFixed(6),
      });

      // Create a cat for each owner with unique S3 image
      const photoUrl = catImageUrls[i];

      await db.insert(cats).values({
        ownerId: ownerId,
        name: catNames[i],
        age: Math.floor(Math.random() * 12) + 1,
        photo: photoUrl,
        temperament: JSON.stringify([["Friendly", "Playful", "Calm", "Energetic", "Shy"][Math.floor(Math.random() * 5)]]),
        medicalNotes: "Healthy, up to date on vaccinations",
        feedingSchedule: "Twice daily - morning and evening",
        isIndoor: i % 3 === 0,
      });
    }

    console.log(`✅ Created ${ownerIds.length} owners with cats`);
    console.log("✅ Expanded seed completed successfully!");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

seedExpanded()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
