import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, getUserByEmail } from "../db";
import bcrypt from "bcryptjs";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("User Registration Flow", () => {
  let testUserId: bigint | null = null;
  const testEmail = `test-${Date.now()}@4paws.test`;
  const testPassword = "SecurePassword123!";
  const testPushToken = "ExponentPushToken[test-token-123]";

  beforeAll(async () => {
    // Ensure database connection
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test user via SQL
    if (testUserId) {
      const db = await getDb();
      if (db) {
        await db.execute(`DELETE FROM users WHERE id = ${testUserId}`);
      }
    }
  });

  it("should create a new user with email and password", async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    // Hash password
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Insert user
    const result = await db!.insert(users).values({
      email: testEmail,
      phone: "+61400000000",
      passwordHash,
      role: "owner",
      name: "Test User",
      loginMethod: "email",
      lastSignedIn: new Date(),
    });

    testUserId = BigInt(result[0].insertId);
    expect(testUserId).toBeDefined();
    expect(testUserId).toBeGreaterThan(0n);
  });

  it("should retrieve user by email", async () => {
    const user = await getUserByEmail(testEmail);
    
    expect(user).toBeDefined();
    expect(user?.email).toBe(testEmail);
    expect(user?.name).toBe("Test User");
    expect(user?.role).toBe("owner");
    expect(user?.loginMethod).toBe("email");
  });

  it("should verify password hash", async () => {
    const user = await getUserByEmail(testEmail);
    expect(user).toBeDefined();

    // Verify password
    const isValid = await bcrypt.compare(testPassword, user!.passwordHash);
    expect(isValid).toBe(true);

    // Verify wrong password fails
    const isInvalid = await bcrypt.compare("WrongPassword", user!.passwordHash);
    expect(isInvalid).toBe(false);
  });

  it("should save push token to user", async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    // Update push token
    await db!
      .update(users)
      .set({ pushToken: testPushToken })
      .where(eq(users.email, testEmail));

    // Retrieve user and verify push token
    const user = await getUserByEmail(testEmail);
    expect(user).toBeDefined();
    expect(user?.pushToken).toBe(testPushToken);
  });

  it("should update push token when changed", async () => {
    const db = await getDb();
    const newPushToken = "ExponentPushToken[new-token-456]";

    // Update to new push token
    await db!
      .update(users)
      .set({ pushToken: newPushToken })
      .where(eq(users.email, testEmail));

    // Verify new token is saved
    const user = await getUserByEmail(testEmail);
    expect(user?.pushToken).toBe(newPushToken);
  });

  it("should handle null push token", async () => {
    const db = await getDb();

    // Clear push token
    await db!
      .update(users)
      .set({ pushToken: null })
      .where(eq(users.email, testEmail));

    // Verify token is null
    const user = await getUserByEmail(testEmail);
    expect(user?.pushToken).toBeNull();
  });

  it("should prevent duplicate email registration", async () => {
    const db = await getDb();
    const passwordHash = await bcrypt.hash("AnotherPassword", 10);

    // Attempt to insert user with same email
    await expect(async () => {
      await db!.insert(users).values({
        email: testEmail, // Same email as existing user
        phone: "+61400000001",
        passwordHash,
        role: "sitter",
        name: "Duplicate User",
        loginMethod: "email",
      });
    }).rejects.toThrow();
  });

  it("should create users with different roles", async () => {
    const db = await getDb();
    const sitterEmail = `sitter-${Date.now()}@4paws.test`;
    const passwordHash = await bcrypt.hash("SitterPassword123", 10);

    // Create sitter user
    const result = await db!.insert(users).values({
      email: sitterEmail,
      phone: "+61400000002",
      passwordHash,
      role: "sitter",
      name: "Test Sitter",
      loginMethod: "email",
      lastSignedIn: new Date(),
    });

    const sitterId = result[0].insertId;
    expect(sitterId).toBeDefined();

    // Verify sitter role
    const sitter = await getUserByEmail(sitterEmail);
    expect(sitter?.role).toBe("sitter");

    // Cleanup
    await db!.execute(`DELETE FROM users WHERE id = ${sitterId}`);
  });
});
