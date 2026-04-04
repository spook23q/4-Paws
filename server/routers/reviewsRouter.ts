import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reviews, bookings, sitterProfiles, users } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { notifyUser } from "../notificationHelpers";

export const reviewsRouter = router({
  // Create review (owner only, after booking completion)
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().max(1000).optional(),
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

      if (ctx.user.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only cat owners can leave reviews",
        });
      }

      const bookingId = BigInt(input.bookingId);

      // Get booking
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify booking belongs to this owner
      if (booking[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only review your own bookings",
        });
      }

      // Verify booking is completed
      if (booking[0].status !== "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only review completed bookings",
        });
      }

      // Check if review already exists
      const existingReview = await db
        .select()
        .from(reviews)
        .where(eq(reviews.bookingId, bookingId))
        ;

      if (existingReview.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already reviewed this booking",
        });
      }

      // Create review
      await db.insert(reviews).values({
        bookingId,
        sitterId: booking[0].sitterId,
        ownerId: ctx.user.id,
        rating: input.rating,
        reviewText: input.reviewText,
      });

      // Update sitter's average rating and review count
      const sitterReviews = await db
        .select({
          avgRating: sql<number>`AVG(${reviews.rating})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(reviews)
        .where(eq(reviews.sitterId, booking[0].sitterId));

      if (sitterReviews[0]) {
        await db
          .update(sitterProfiles)
          .set({
            averageRating: sitterReviews[0].avgRating.toFixed(2),
            totalReviews: sitterReviews[0].count,
          })
          .where(eq(sitterProfiles.userId, booking[0].sitterId));
      }

      // Notify sitter about the new review
      try {
        const ownerName = ctx.user.name || "A cat owner";
        const starText = "⭐".repeat(input.rating);
        await notifyUser({
          userId: booking[0].sitterId,
          type: "new_review",
          title: "New Review Received! ⭐",
          body: `${ownerName} left you a ${input.rating}-star review. ${starText}`,
          data: { sitterId: booking[0].sitterId.toString() },
        });
      } catch (error) {
        console.error("[Reviews] Failed to send review notification:", error);
      }

      return { success: true };
    }),

  // Get reviews for a sitter
  getBySitter: protectedProcedure
    .input(
      z.object({
        sitterId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const sitterId = BigInt(input.sitterId);

      const reviewsList = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          reviewText: reviews.reviewText,
          createdAt: reviews.createdAt,
          ownerName: users.name,
          ownerPhoto: users.profilePhoto,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.ownerId, users.id))
        .where(eq(reviews.sitterId, sitterId))
        .orderBy(sql`${reviews.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset);

      return reviewsList;
    }),

  // Check if user can review a booking
  canReview: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "owner") {
        return { canReview: false, reason: "Only owners can leave reviews" };
      }

      const bookingId = BigInt(input.bookingId);

      // Get booking
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0]) {
        return { canReview: false, reason: "Booking not found" };
      }

      if (booking[0].ownerId !== ctx.user.id) {
        return { canReview: false, reason: "Not your booking" };
      }

      if (booking[0].status !== "completed") {
        return { canReview: false, reason: "Booking not completed" };
      }

      // Check if review already exists
      const existingReview = await db
        .select()
        .from(reviews)
        .where(eq(reviews.bookingId, bookingId))
        ;

      if (existingReview.length > 0) {
        return { canReview: false, reason: "Already reviewed" };
      }

      return { canReview: true };
    }),
});
