import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc.js";
import {
  createPaymentIntent,
  getPaymentIntent,
  cancelPaymentIntent,
  createOrGetCustomer,
} from "../services/stripeService.js";
import { getDb } from "../db";
import { bookings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../shared/_core/errors.js";

export const stripeRouter = router({
  /**
   * Create a payment intent for a booking
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId } = input;
      const userId = ctx.user.id;

      // Get booking details
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, BigInt(bookingId)));

      if (!booking) {
        throw NotFoundError("Booking not found");
      }

      // Only the owner can create payment for their booking
      if (booking.ownerId !== userId) {
        throw ForbiddenError("You can only pay for your own bookings");
      }

      // Check if booking is in pending status
      if (booking.status !== "pending") {
        throw ForbiddenError(
          "Payment can only be made for pending bookings"
        );
      }

      // Create or get Stripe customer
      const customer = await createOrGetCustomer({
        email: ctx.user.email,
        name: ctx.user.name,
        userId: Number(ctx.user.id),
      });

      // Calculate total amount in cents
      const totalAmount = Math.round(Number(booking.totalPrice) * 100);

      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount: totalAmount,
        currency: "aud", // Australian dollars
        bookingId: Number(booking.id),
        customerId: customer.id,
        metadata: {
          ownerId: booking.ownerId.toString(),
          sitterId: booking.sitterId.toString(),
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
        },
      });

      // Update booking with payment intent ID
      await db
        .update(bookings)
        .set({
          paymentIntentId: paymentIntent.id,
        })
        .where(eq(bookings.id, BigInt(bookingId)));

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    }),

  /**
   * Get payment intent status
   */
  getPaymentStatus: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { bookingId } = input;

      // Get booking
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, BigInt(bookingId)));

      if (!booking) {
        throw NotFoundError("Booking not found");
      }

      // Check user has access to this booking
      if (booking.ownerId !== ctx.user.id && booking.sitterId !== ctx.user.id) {
        throw ForbiddenError("You don't have access to this booking");
      }

      if (!booking.paymentIntentId) {
        return {
          status: "no_payment",
          paymentIntentId: null,
        };
      }

      // Get payment intent from Stripe
      const paymentIntent = await getPaymentIntent(booking.paymentIntentId);

      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    }),

  /**
   * Cancel a payment intent
   */
  cancelPayment: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId } = input;

      // Get booking
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, BigInt(bookingId)));

      if (!booking) {
        throw NotFoundError("Booking not found");
      }

      // Only owner can cancel payment
      if (booking.ownerId !== ctx.user.id) {
        throw ForbiddenError("You can only cancel your own payments");
      }

      if (!booking.paymentIntentId) {
        throw NotFoundError("No payment intent found for this booking");
      }

      // Cancel payment intent
      const paymentIntent = await cancelPaymentIntent(booking.paymentIntentId);

      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      };
    }),

  /**
   * Get Stripe publishable key
   */
  getPublishableKey: protectedProcedure.query(() => {
    return {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    };
  }),
});
