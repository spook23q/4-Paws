import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getUserByEmail } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper function to verify passwords
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
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
    .mutation(async ({ input }) => {
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

      // Create user
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

      // Get the created user
      const newUser = await db.select().from(users).where(eq(users.id, BigInt(result[0].insertId)));
      
      if (!newUser || newUser.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Create a simple token (in production, use JWT)
      const token = `token_${newUser[0].id}_${Date.now()}`;

      return {
        success: true,
        userId: result[0].insertId,
        token,
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
    .mutation(async ({ input }) => {
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

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      return {
        success: true,
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
  logout: protectedProcedure.mutation(async () => {
    // In a real app, you would invalidate the session here
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
        // In a real app, you would:
        // 1. Generate a secure reset token
        // 2. Store it in the database with an expiration
        // 3. Send an email with the reset link
        // For now, we just log it (in production, integrate with email service)
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
