import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// For 4 Paws app - users sign up with email/phone/password
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email));
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: bigint) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id));
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId));
  return result.length > 0 ? result[0] : undefined;
}

// Upsert user for OAuth (backward compatibility)
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // For OAuth users with openId
    if (user.openId) {
      await db.insert(users).values({
        ...user,
        openId: user.openId,
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        passwordHash: user.passwordHash ?? "",
        role: user.role ?? "owner",
        lastSignedIn: user.lastSignedIn ?? new Date(),
      }).onDuplicateKeyUpdate({
        set: {
          name: user.name,
          email: user.email,
          loginMethod: user.loginMethod,
          lastSignedIn: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
