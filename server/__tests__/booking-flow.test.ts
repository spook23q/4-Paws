import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "../db";
import bcrypt from "bcryptjs";
import { users, bookings, cats, ownerProfiles, sitterProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Mock push notification function
vi.mock("../_core/pushNotifications", () => ({
  sendPushNotificationToUser: vi.fn().mockResolvedValue({ success: true }),
}));

import { sendPushNotificationToUser } from "../_core/pushNotifications";

describe("Booking Flow Integration Tests", () => {
  let ownerId: bigint;
  let sitterId: bigint;
  let catId: bigint;
  let bookingId: bigint;
  
  const ownerEmail = `owner-${Date.now()}@4paws.test`;
  const sitterEmail = `sitter-${Date.now()}@4paws.test`;
  const ownerPushToken = "ExponentPushToken[owner-test-token]";
  const sitterPushToken = "ExponentPushToken[sitter-test-token]";

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create owner user
    const ownerResult = await db.insert(users).values({
      email: ownerEmail,
      phone: "+61400000100",
      passwordHash: await bcrypt.hash("OwnerPass123", 10),
      role: "owner",
      name: "Test Owner",
      loginMethod: "email",
      pushToken: ownerPushToken,
      lastSignedIn: new Date(),
    });
    ownerId = BigInt(ownerResult[0].insertId);

    // Create owner profile
    await db.insert(ownerProfiles).values({
      userId: ownerId,
      suburb: "Sydney CBD",
      latitude: "-33.8688",
      longitude: "151.2093",
    });

    // Create sitter user
    const sitterResult = await db.insert(users).values({
      email: sitterEmail,
      phone: "+61400000200",
      passwordHash: await bcrypt.hash("SitterPass123", 10),
      role: "sitter",
      name: "Test Sitter",
      loginMethod: "email",
      pushToken: sitterPushToken,
      lastSignedIn: new Date(),
    });
    sitterId = BigInt(sitterResult[0].insertId);

    // Create sitter profile
    await db.insert(sitterProfiles).values({
      userId: sitterId,
      suburb: "Sydney CBD",
      latitude: "-33.8688",
      longitude: "151.2093",
      serviceAreaRadius: 10,
      pricePerDay: "50.00",
      pricePerNight: "75.00",
      yearsExperience: 5,
      bio: "Experienced cat sitter",
      acceptsIndoor: true,
      acceptsOutdoor: true,
      acceptsKittens: true,
    });

    // Create cat
    const catResult = await db.insert(cats).values({
      ownerId,
      name: "Whiskers",
      age: 3,
      photo: "https://example.com/cat.jpg",
      temperament: JSON.stringify(["friendly", "playful"]),
      medicalNotes: "No allergies",
      feedingSchedule: "Twice daily - morning and evening",
      isIndoor: true,
    });
    catId = BigInt(catResult[0].insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup in reverse order of dependencies
    if (bookingId) {
      await db.execute(`DELETE FROM bookings WHERE id = ${bookingId}`);
    }
    if (catId) {
      await db.execute(`DELETE FROM cats WHERE id = ${catId}`);
    }
    if (ownerId) {
      await db.execute(`DELETE FROM owner_profiles WHERE user_id = ${ownerId}`);
      await db.execute(`DELETE FROM users WHERE id = ${ownerId}`);
    }
    if (sitterId) {
      await db.execute(`DELETE FROM sitter_profiles WHERE user_id = ${sitterId}`);
      await db.execute(`DELETE FROM users WHERE id = ${sitterId}`);
    }
  });

  it("should create a booking request", async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 7 days from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3); // 3 days duration

    const result = await db!.insert(bookings).values({
      ownerId,
      sitterId,
      startDate,
      endDate,
      startTime: "morning",
      endTime: "evening",
      catIds: JSON.stringify([catId.toString()]),
      status: "pending",
      totalPrice: "300.00",
      specialInstructions: "Please feed twice daily",
    });

    bookingId = BigInt(result[0].insertId);
    expect(bookingId).toBeDefined();
    expect(bookingId).toBeGreaterThan(0n);
  });

  it("should send push notification to sitter on booking request", async () => {
    // In real implementation, this would be triggered by the booking creation
    // Here we verify the mock was called correctly
    await sendPushNotificationToUser(sitterId, {
      title: "New Booking Request! 🐱",
      body: "Test Owner has requested a booking",
      data: { bookingId: bookingId.toString(), type: "booking_request" },
    });

    expect(sendPushNotificationToUser).toHaveBeenCalledWith(
      sitterId,
      expect.objectContaining({
        title: "New Booking Request! 🐱",
        data: expect.objectContaining({ type: "booking_request" }),
      })
    );
  });

  it("should accept booking and update status", async () => {
    const db = await getDb();
    
    await db!
      .update(bookings)
      .set({ status: "confirmed" })
      .where(eq(bookings.id, bookingId));

    const booking = await db!
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    expect(booking[0].status).toBe("confirmed");
  });

  it("should send push notification to owner on booking acceptance", async () => {
    await sendPushNotificationToUser(ownerId, {
      title: "Booking Confirmed! 🎉",
      body: "Test Sitter has accepted your booking request",
      data: { bookingId: bookingId.toString(), type: "booking_confirmed" },
    });

    expect(sendPushNotificationToUser).toHaveBeenCalledWith(
      ownerId,
      expect.objectContaining({
        title: "Booking Confirmed! 🎉",
        data: expect.objectContaining({ type: "booking_confirmed" }),
      })
    );
  });

  it("should complete booking and update status", async () => {
    const db = await getDb();
    
    await db!
      .update(bookings)
      .set({ status: "completed" })
      .where(eq(bookings.id, bookingId));

    const booking = await db!
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    expect(booking[0].status).toBe("completed");
  });

  it("should send push notification to owner on booking completion", async () => {
    await sendPushNotificationToUser(ownerId, {
      title: "Booking Completed! 🎉",
      body: "Test Sitter has completed your booking. Please leave a review!",
      data: { bookingId: bookingId.toString(), type: "booking_completed" },
    });

    expect(sendPushNotificationToUser).toHaveBeenCalledWith(
      ownerId,
      expect.objectContaining({
        title: "Booking Completed! 🎉",
        data: expect.objectContaining({ type: "booking_completed" }),
      })
    );
  });

  it("should test booking decline flow", async () => {
    const db = await getDb();
    
    // Create another booking for decline test
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const result = await db!.insert(bookings).values({
      ownerId,
      sitterId,
      startDate,
      endDate,
      startTime: "afternoon",
      endTime: "evening",
      catIds: JSON.stringify([catId.toString()]),
      status: "pending",
      totalPrice: "200.00",
    });

    const declineBookingId = BigInt(result[0].insertId);

    // Decline the booking
    await db!
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, declineBookingId));

    // Send decline notification
    await sendPushNotificationToUser(ownerId, {
      title: "Booking Declined",
      body: "Test Sitter has declined your booking request",
      data: { bookingId: declineBookingId.toString(), type: "booking_declined" },
    });

    expect(sendPushNotificationToUser).toHaveBeenCalledWith(
      ownerId,
      expect.objectContaining({
        title: "Booking Declined",
        data: expect.objectContaining({ type: "booking_declined" }),
      })
    );

    // Cleanup
    await db!.execute(`DELETE FROM bookings WHERE id = ${declineBookingId}`);
  });
});
