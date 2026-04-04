import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getUserByEmail, getUserByOpenId } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import { getSessionCookieOptions } from "../_core/cookies";
import { notifyUser } from "../notificationHelpers";

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper function to verify passwords
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate a deterministic openId for email/password users
function generateLocalOpenId(userId: bigint): string {
  return `local:${userId.toString()}`;
}

export const authRouter = router({
  // Sign up endpoint
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        phone: z.string().min(10).optional(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum(["owner", "sitter"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const passwordHash = hashPassword(input.password);

      // Create user (openId will be set after we get the auto-generated ID)
      const result = await db.insert(users).values({
        email: input.email,
        phone: input.phone,
        passwordHash,
        name: input.name,
        role: input.role,
        profilePhoto: null,
        openId: null,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      const userId = BigInt(result[0].insertId);

      // Set openId for the new user so JWT auth can find them
      const openId = generateLocalOpenId(userId);
      await db
        .update(users)
        .set({ openId })
        .where(eq(users.id, userId));

      // Get the created user
      const newUser = await db.select().from(users).where(eq(users.id, userId));

      if (!newUser || newUser.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Create a proper JWT session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie on response for web clients
      try {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      } catch (e) {
        // Cookie setting may fail in some contexts, token is still returned
        console.warn("[Auth] Could not set cookie:", e);
      }

      // Send welcome notification to new user
      try {
        const welcomeTitle = input.role === "sitter"
          ? "Welcome to 4 Paws, Sitter! 🐾"
          : "Welcome to 4 Paws! 🐱";
        const welcomeBody = input.role === "sitter"
          ? `Hi ${input.name}! Your sitter account has been created. Complete your profile and upload compliance documents to start accepting bookings.`
          : `Hi ${input.name}! Your account has been created. Browse available cat sitters in your area and book your first sitting!`;
        await notifyUser({
          userId,
          type: "general",
          title: welcomeTitle,
          body: welcomeBody,
          data: { action: "welcome", role: input.role },
        });
      } catch (error) {
        console.error("[Auth] Failed to send welcome notification:", error);
      }

      return {
        success: true,
        userId: result[0].insertId,
        token: sessionToken,
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          role: newUser[0].role,
          phone: newUser[0].phone,
          profilePhoto: newUser[0].profilePhoto,
        },
      };
    }),

  // Sign in endpoint
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get user by email
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      if (!verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Ensure user has an openId (migrate legacy users who signed up before this fix)
      let openId = user.openId;
      if (!openId) {
        openId = generateLocalOpenId(user.id);
        await db
          .update(users)
          .set({ openId })
          .where(eq(users.id, user.id));
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Create a proper JWT session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie on response for web clients
      try {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      } catch (e) {
        console.warn("[Auth] Could not set cookie:", e);
      }

      return {
        success: true,
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
        },
      };
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
      phone: ctx.user.phone,
      profilePhoto: ctx.user.profilePhoto,
    };
  }),

  // Logout endpoint
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Clear the session cookie
    try {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    } catch (e) {
      console.warn("[Auth] Could not clear cookie:", e);
    }
    return {
      success: true,
    };
  }),

  // Update push token endpoint
  updatePushToken: protectedProcedure
    .input(
      z.object({
        pushToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Update user's push token
      await db
        .update(users)
        .set({ pushToken: input.pushToken })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
      };
    }),

  // Forgot password endpoint
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if user exists (but don't reveal this to prevent email enumeration)
      const user = await getUserByEmail(input.email);

      if (user) {
        console.log(`Password reset requested for: ${input.email}`);
      }

      // Always return success to prevent email enumeration
      return {
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions.",
      };
    }),

  // Delete account endpoint
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string(),
        confirmText: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verify confirmation text
      if (input.confirmText !== "DELETE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please type DELETE to confirm account deletion",
        });
      }

      // Verify password
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!user || user.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (!verifyPassword(input.password, user[0].passwordHash)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect password",
        });
      }

      // Clear session cookie
      try {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      } catch (e) {
        console.warn("[Auth] Could not clear cookie:", e);
      }

      // Delete user account (cascade will handle related data)
      await db.delete(users).where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "Account deleted successfully",
      };
    }),

  // Update user profile endpoint
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        phone: z.string().min(10).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const userId = ctx.user.id;
      const updateData: any = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.phone !== undefined) {
        updateData.phone = input.phone;
      }

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role as "owner" | "sitter",
        profilePhoto: updatedUser.profilePhoto,
      };
    }),
});
