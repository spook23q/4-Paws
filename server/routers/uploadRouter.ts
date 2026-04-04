import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

export const uploadRouter = router({
  // Upload profile photo
  uploadProfilePhoto: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
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

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64, "base64");

        // Generate a unique file key
        const ext = input.mimeType === "image/png" ? "png" : "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `profile-photos/${ctx.user.id}-${randomSuffix}.${ext}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Update user's profile photo URL in database
        await db
          .update(users)
          .set({ profilePhoto: url })
          .where(eq(users.id, ctx.user.id));

        return { success: true, url };
      } catch (error: any) {
        console.error("[Upload] Profile photo upload failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload profile photo",
        });
      }
    }),
});
