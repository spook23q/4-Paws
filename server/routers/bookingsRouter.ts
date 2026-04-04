import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, users, sitterProfiles, cats, reviews } from "../../drizzle/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { notifyUser } from "../notificationHelpers";

export const bookingsRouter = router({
  // Create booking request
  create: protectedProcedure
    .input(
      z.object({
        sitterId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        catIds: z.array(z.string()),
        specialInstructions: z.string().optional(),
        totalPrice: z.number(),
        bookingFeePaymentId: z.string().optional(),
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
          message: "Only cat owners can create bookings",
        });
      }

      const result = await db.insert(bookings).values({
        ownerId: ctx.user.id,
        sitterId: BigInt(input.sitterId),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        startTime: input.startTime,
        endTime: input.endTime,
        catIds: JSON.stringify(input.catIds),
        specialInstructions: input.specialInstructions,
        totalPrice: input.totalPrice.toString(),
        bookingFeePaymentId: input.bookingFeePaymentId || null,
        bookingFeePaid: input.bookingFeePaymentId ? true : false,
        status: "pending",
      });

      // Send push + in-app notification to sitter
      try {
        const ownerName = ctx.user.name || "A cat owner";
        await notifyUser({
          userId: BigInt(input.sitterId),
          type: "booking_request",
          title: "New Booking Request! 🐱",
          body: `${ownerName} has requested a booking with you.`,
          data: { bookingId: String(result[0].insertId) },
        });
      } catch (error) {
        console.error("[Bookings] Failed to send notification:", error);
      }

      return {
        success: true,
        bookingId: result[0].insertId,
      };
    }),

  // Get bookings for current user
  getMyBookings: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conditions: any[] = [];

      if (ctx.user.role === "owner") {
        conditions.push(eq(bookings.ownerId, ctx.user.id));
      } else if (ctx.user.role === "sitter") {
        conditions.push(eq(bookings.sitterId, ctx.user.id));
      }

      if (input.status) {
        conditions.push(eq(bookings.status, input.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get bookings with related user info
      const bookingsList = await db
        .select({
          id: bookings.id,
          ownerId: bookings.ownerId,
          sitterId: bookings.sitterId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          catIds: bookings.catIds,
          specialInstructions: bookings.specialInstructions,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
          ownerName: sql<string>`owner_user.name`,
          ownerEmail: sql<string>`owner_user.email`,
          ownerPhone: sql<string>`owner_user.phone`,
          ownerPhoto: sql<string | null>`owner_user.profile_photo`,
          sitterName: sql<string>`sitter_user.name`,
          sitterEmail: sql<string>`sitter_user.email`,
          sitterPhone: sql<string>`sitter_user.phone`,
          sitterPhoto: sql<string | null>`sitter_user.profile_photo`,
        })
        .from(bookings)
        .innerJoin(sql`users AS owner_user`, eq(bookings.ownerId, sql`owner_user.id`))
        .innerJoin(sql`users AS sitter_user`, eq(bookings.sitterId, sql`sitter_user.id`))
        .where(whereClause)
        .orderBy(sql`${bookings.startDate} DESC`);

      // Check which bookings have reviews
      const bookingIds = bookingsList.map(b => b.id);
      const existingReviews = bookingIds.length > 0 
        ? await db.select({ bookingId: reviews.bookingId }).from(reviews).where(sql`${reviews.bookingId} IN (${sql.join(bookingIds, sql`, `)})`)
        : [];
      const reviewedBookingIds = new Set(existingReviews.map(r => r.bookingId.toString()));

      return bookingsList.map((b) => ({
        ...b,
        catIds: JSON.parse(b.catIds),
        totalPrice: parseFloat(b.totalPrice),
        hasReview: reviewedBookingIds.has(b.id.toString()),
      }));
    }),

  // Get booking by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const bookingId = BigInt(input.id);

      const booking = await db
        .select({
          id: bookings.id,
          ownerId: bookings.ownerId,
          sitterId: bookings.sitterId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          catIds: bookings.catIds,
          specialInstructions: bookings.specialInstructions,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
          ownerName: sql<string>`owner_user.name`,
          ownerEmail: sql<string>`owner_user.email`,
          ownerPhone: sql<string>`owner_user.phone`,
          ownerPhoto: sql<string | null>`owner_user.profile_photo`,
          sitterName: sql<string>`sitter_user.name`,
          sitterEmail: sql<string>`sitter_user.email`,
          sitterPhone: sql<string>`sitter_user.phone`,
          sitterPhoto: sql<string | null>`sitter_user.profile_photo`,
        })
        .from(bookings)
        .innerJoin(sql`users AS owner_user`, eq(bookings.ownerId, sql`owner_user.id`))
        .innerJoin(sql`users AS sitter_user`, eq(bookings.sitterId, sql`sitter_user.id`))
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Verify user has access to this booking
      if (
        booking[0].ownerId !== ctx.user.id &&
        booking[0].sitterId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this booking",
        });
      }

      // Get cat details
      const catIds = JSON.parse(booking[0].catIds);
      const catDetails = await db
        .select()
        .from(cats)
        .where(sql`${cats.id} IN (${sql.join(catIds.map((id: string) => BigInt(id)), sql`, `)})`);

      return {
        ...booking[0],
        catIds: JSON.parse(booking[0].catIds),
        totalPrice: parseFloat(booking[0].totalPrice),
        cats: catDetails.map((cat) => ({
          ...cat,
          temperament: JSON.parse(cat.temperament || "[]"),
        })),
      };
    }),

  // Accept booking (sitter only)
  accept: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can accept bookings",
        });
      }

      // Compliance check removed — sitters are verified by 4 Paws platform

      const bookingId = BigInt(input.id);

      // Verify booking belongs to this sitter
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0] || booking[0].sitterId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only accept your own booking requests",
        });
      }

      if (booking[0].status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking is not in pending status",
        });
      }

      await db
        .update(bookings)
        .set({ status: "confirmed" })
        .where(eq(bookings.id, bookingId));

      // Update sitter's total bookings
      await db
        .update(sitterProfiles)
        .set({ totalBookings: sql`${sitterProfiles.totalBookings} + 1` })
        .where(eq(sitterProfiles.userId, ctx.user.id));

      // Send push + in-app notification to owner
      try {
        const sitterName = ctx.user.name || "Your sitter";
        await notifyUser({
          userId: booking[0].ownerId,
          type: "booking_confirmed",
          title: "Booking Confirmed! 🎉",
          body: `${sitterName} has confirmed your booking request.`,
          data: { bookingId: input.id },
        });
      } catch (error) {
        console.error("[Bookings] Failed to send notification:", error);
      }

      return { success: true };
    }),

  // Decline booking (sitter only)
  decline: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can decline bookings",
        });
      }

      const bookingId = BigInt(input.id);

      // Verify booking belongs to this sitter
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0] || booking[0].sitterId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only decline your own booking requests",
        });
      }

      if (booking[0].status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking is not in pending status",
        });
      }

      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, bookingId));

      // Send push + in-app notification to owner
      try {
        const sitterName = ctx.user.name || "The sitter";
        await notifyUser({
          userId: booking[0].ownerId,
          type: "booking_declined",
          title: "Booking Declined",
          body: `${sitterName} has declined your booking request. Please find another sitter.`,
          data: { bookingId: input.id },
        });
      } catch (error) {
        console.error("[Bookings] Failed to send notification:", error);
      }

      return { success: true };
    }),

  // Mark booking as complete (sitter only)
  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "sitter") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only sitters can mark bookings as complete",
        });
      }

      const bookingId = BigInt(input.id);

      // Verify booking belongs to this sitter
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0] || booking[0].sitterId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only complete your own bookings",
        });
      }

      if (booking[0].status !== "confirmed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking must be confirmed to mark as complete",
        });
      }

      await db
        .update(bookings)
        .set({ status: "completed" })
        .where(eq(bookings.id, bookingId));

      // Send push + in-app notification to owner
      try {
        const sitterName = ctx.user.name || "Your sitter";
        await notifyUser({
          userId: booking[0].ownerId,
          type: "booking_completed",
          title: "Booking Completed! 🎉",
          body: `${sitterName} has completed your booking. How was your experience? Please leave a review!`,
          data: { bookingId: input.id },
        });
      } catch (error) {
        console.error("[Bookings] Failed to send notification:", error);
      }

      return { success: true };
    }),

  // Cancel booking (owner only, before confirmed)
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
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
          message: "Only owners can cancel bookings",
        });
      }

      const bookingId = BigInt(input.id);

      // Verify booking belongs to this owner
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        ;

      if (!booking[0] || booking[0].ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only cancel your own bookings",
        });
      }

      if (booking[0].status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel completed bookings",
        });
      }

      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, bookingId));

      // Send push + in-app notification to sitter
      try {
        const ownerName = ctx.user.name || "The owner";
        await notifyUser({
          userId: booking[0].sitterId,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          body: `${ownerName} has cancelled their booking request.`,
          data: { bookingId: input.id },
        });
      } catch (error) {
        console.error("[Bookings] Failed to send notification:", error);
      }

      return { success: true };
    }),

  // Get completed bookings that haven't been reviewed yet (owner only)
  getUnreviewed: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      if (ctx.user.role !== "owner") {
        return [];
      }

      // Get completed bookings for this owner that don't have reviews
      const completedBookings = await db
        .select({
          id: bookings.id,
          sitterId: bookings.sitterId,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
          sitterName: sql<string>`sitter_user.name`,
        })
        .from(bookings)
        .innerJoin(sql`users AS sitter_user`, eq(bookings.sitterId, sql`sitter_user.id`))
        .where(
          and(
            eq(bookings.ownerId, ctx.user.id),
            eq(bookings.status, "completed")
          )
        )
        .orderBy(sql`${bookings.createdAt} DESC`);

      // Filter out bookings that already have reviews
      if (completedBookings.length === 0) return [];

      const bookingIds = completedBookings.map(b => b.id);
      const existingReviews = await db
        .select({ bookingId: reviews.bookingId })
        .from(reviews)
        .where(sql`${reviews.bookingId} IN (${sql.join(bookingIds, sql`, `)})`);

      const reviewedIds = new Set(existingReviews.map(r => r.bookingId.toString()));

      return completedBookings
        .filter(b => !reviewedIds.has(b.id.toString()))
        .map(b => ({
          ...b,
          id: b.id.toString(),
          startDate: b.startDate instanceof Date ? b.startDate.toISOString() : String(b.startDate),
          endDate: b.endDate instanceof Date ? b.endDate.toISOString() : String(b.endDate),
        }));
    }),
});
