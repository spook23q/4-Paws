import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc.js";
import {
  createPaymentIntent,
  getPaymentIntent,
  cancelPaymentIntent,
  createOrGetCustomer,
} from "../services/stripeService.js";
import {
  getOrCreateConnectAccount,
  createAccountOnboardingLink,
  createTransferToSitter,
  getConnectAccountBalance,
  getConnectAccountPayouts,
  isAccountFullyOnboarded,
} from "../services/stripeConnectService.js";
import { getDb } from "../db";
import { bookings, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ForbiddenError, NotFoundError } from "../../shared/_core/errors.js";
import { notifyUser } from "../notificationHelpers";

export const stripeRouter = router({
  /**
   * Create a payment intent for a booking
   * Payment is allowed when booking is confirmed (sitter accepted)
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

      // Payment is allowed for confirmed bookings (sitter has accepted)
      if (booking.status !== "confirmed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment can only be made after the sitter has accepted the booking",
        });
      }

      // Check if already paid
      if (booking.paymentIntentId) {
        try {
          const existingIntent = await getPaymentIntent(booking.paymentIntentId);
          if (existingIntent.status === "succeeded") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Payment has already been completed for this booking",
            });
          }
          // Return existing intent if still payable
          if (
            existingIntent.status === "requires_payment_method" ||
            existingIntent.status === "requires_confirmation" ||
            existingIntent.status === "requires_action"
          ) {
            return {
              clientSecret: existingIntent.client_secret!,
              paymentIntentId: existingIntent.id,
              amount: Number(existingIntent.amount) / 100,
            };
          }
        } catch (error: any) {
          if (error.code === "BAD_REQUEST") throw error;
          // If retrieval fails, create a new one
        }
      }

      // Create or get Stripe customer
      const customer = await createOrGetCustomer({
        email: ctx.user.email,
        name: ctx.user.name,
        userId: Number(ctx.user.id),
      });

      // Calculate total amount in cents
      const totalAmount = Math.round(Number(booking.totalPrice) * 100);

      // Get sitter name for description
      const [sitter] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, booking.sitterId));

      const sitterName = sitter?.name || "Sitter";

      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount: totalAmount,
        currency: "aud",
        bookingId: Number(booking.id),
        customerId: customer.id,
        metadata: {
          ownerId: booking.ownerId.toString(),
          sitterId: booking.sitterId.toString(),
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          sitterName,
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
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: Number(booking.totalPrice),
      };
    }),

  /**
   * Confirm payment was successful (called after Stripe confirms on client)
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId, paymentIntentId } = input;

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

      if (booking.ownerId !== ctx.user.id) {
        throw ForbiddenError("You can only confirm your own payments");
      }

      // Verify payment with Stripe
      const paymentIntent = await getPaymentIntent(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payment not completed. Status: ${paymentIntent.status}`,
        });
      }

      // Update booking with confirmed payment
      await db
        .update(bookings)
        .set({
          paymentIntentId: paymentIntentId,
        })
        .where(eq(bookings.id, BigInt(bookingId)));

      // Notify sitter about payment
      try {
        const ownerName = ctx.user.name || "The owner";
        await notifyUser({
          userId: booking.sitterId,
          type: "general",
          title: "Payment Received! 💰",
          body: `${ownerName} has paid $${parseFloat(booking.totalPrice).toFixed(2)} for booking #${bookingId}.`,
          data: { bookingId: bookingId.toString() },
        });
      } catch (error) {
        console.error("[Stripe] Failed to send payment notification:", error);
      }

      return { success: true };
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
          status: "no_payment" as const,
          paid: false,
          paymentIntentId: null,
          amount: Number(booking.totalPrice),
          currency: "aud",
        };
      }

      // Get payment intent from Stripe
      try {
        const paymentIntent = await getPaymentIntent(booking.paymentIntentId);
        return {
          status: paymentIntent.status,
          paid: paymentIntent.status === "succeeded",
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        };
      } catch (error) {
        return {
          status: "error" as const,
          paid: false,
          paymentIntentId: booking.paymentIntentId,
          amount: Number(booking.totalPrice),
          currency: "aud",
        };
      }
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
   * Get Stripe publishable key for client-side SDK
   */
  getPublishableKey: protectedProcedure.query(() => {
    return {
      publishableKey:
        process.env.FOURPAWS_STRIPE_PUBLISHABLE_KEY ||
        process.env.STRIPE_PUBLISHABLE_KEY ||
        "",
    };
  }),

  // ==========================================
  // $3 Booking Fee Payment
  // ==========================================

  /**
   * Create a $3 booking fee payment intent
   * Called before booking is created — owner must pay $3 to submit a booking request
   */
  createBookingFeeIntent: protectedProcedure
    .input(
      z.object({
        sitterId: z.string(),
        sitterName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "owner") {
        throw ForbiddenError("Only cat owners can pay booking fees");
      }

      // Create or get Stripe customer
      const customer = await createOrGetCustomer({
        email: ctx.user.email,
        name: ctx.user.name,
        userId: Number(ctx.user.id),
      });

      // Store customer ID if not already stored
      const db = await getDb();
      if (db && !ctx.user.stripeCustomerId) {
        await db
          .update(users)
          .set({ stripeCustomerId: customer.id })
          .where(eq(users.id, ctx.user.id));
      }

      const s = (await import("../services/stripeService.js")).getStripeInstance();

      // Create $3 AUD payment intent (300 cents)
      const paymentIntent = await s.paymentIntents.create({
        amount: 300, // $3.00 AUD in cents
        currency: "aud",
        customer: customer.id,
        metadata: {
          type: "booking_fee",
          ownerId: ctx.user.id.toString(),
          sitterId: input.sitterId,
          sitterName: input.sitterName || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `4 Paws Booking Fee - Cat sitting with ${input.sitterName || "sitter"}`,
      });

      console.log(`[Stripe] Booking fee intent created: ${paymentIntent.id} for owner ${ctx.user.id}`);

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: 3.0,
      };
    }),

  /**
   * Confirm the $3 booking fee payment was successful
   * Called after Stripe confirms payment on client side, before creating the booking
   */
  confirmBookingFee: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "owner") {
        throw ForbiddenError("Only cat owners can confirm booking fees");
      }

      // Verify payment with Stripe
      const paymentIntent = await getPaymentIntent(input.paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Booking fee payment not completed. Status: ${paymentIntent.status}`,
        });
      }

      // Verify the payment is for $3 and is a booking fee
      if (paymentIntent.amount !== 300 || paymentIntent.metadata?.type !== "booking_fee") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid booking fee payment",
        });
      }

      // Verify the payment belongs to this user
      if (paymentIntent.metadata?.ownerId !== ctx.user.id.toString()) {
        throw ForbiddenError("This payment does not belong to you");
      }

      console.log(`[Stripe] Booking fee confirmed: ${input.paymentIntentId} for owner ${ctx.user.id}`);

      return {
        success: true,
        paymentIntentId: input.paymentIntentId,
      };
    }),

  // ==========================================
  // Stripe Connect - Sitter Payouts
  // ==========================================

  /**
   * Create or retrieve a Stripe Connect account for the sitter
   */
  setupConnectAccount: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "sitter") {
      throw ForbiddenError("Only sitters can set up payout accounts");
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    // Get or create Connect account
    const account = await getOrCreateConnectAccount({
      email: ctx.user.email,
      name: ctx.user.name,
      userId: ctx.user.id.toString(),
      existingConnectId: ctx.user.stripeConnectId || undefined,
    });

    // Save Connect account ID to user record
    if (!ctx.user.stripeConnectId) {
      await db
        .update(users)
        .set({ stripeConnectId: account.id })
        .where(eq(users.id, ctx.user.id));
    }

    return {
      connectAccountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  }),

  /**
   * Get an onboarding link for the sitter to complete Stripe Connect setup
   */
  getConnectOnboardingLink: protectedProcedure
    .input(
      z.object({
        refreshUrl: z.string().url(),
        returnUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "sitter") {
        throw ForbiddenError("Only sitters can access payout onboarding");
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      let connectAccountId = ctx.user.stripeConnectId;

      // Create account if not exists
      if (!connectAccountId) {
        const account = await getOrCreateConnectAccount({
          email: ctx.user.email,
          name: ctx.user.name,
          userId: ctx.user.id.toString(),
        });
        connectAccountId = account.id;

        await db
          .update(users)
          .set({ stripeConnectId: account.id })
          .where(eq(users.id, ctx.user.id));
      }

      const accountLink = await createAccountOnboardingLink({
        connectAccountId,
        refreshUrl: input.refreshUrl,
        returnUrl: input.returnUrl,
      });

      return {
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
      };
    }),

  /**
   * Get the sitter's Connect account status and balance
   */
  getConnectStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "sitter") {
      throw ForbiddenError("Only sitters can view payout status");
    }

    if (!ctx.user.stripeConnectId) {
      return {
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        balance: null,
      };
    }

    try {
      const isOnboarded = await isAccountFullyOnboarded(ctx.user.stripeConnectId);
      let balance = null;

      if (isOnboarded) {
        const stripeBalance = await getConnectAccountBalance(ctx.user.stripeConnectId);
        const availableAud = stripeBalance.available.find((b) => b.currency === "aud");
        const pendingAud = stripeBalance.pending.find((b) => b.currency === "aud");

        balance = {
          available: (availableAud?.amount || 0) / 100,
          pending: (pendingAud?.amount || 0) / 100,
          currency: "aud",
        };
      }

      return {
        connected: true,
        chargesEnabled: isOnboarded,
        payoutsEnabled: isOnboarded,
        balance,
      };
    } catch (error) {
      console.error("[Stripe Connect] Failed to get status:", error);
      return {
        connected: true,
        chargesEnabled: false,
        payoutsEnabled: false,
        balance: null,
      };
    }
  }),

  /**
   * Get the sitter's payout history
   */
  getPayoutHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "sitter") {
        throw ForbiddenError("Only sitters can view payout history");
      }

      if (!ctx.user.stripeConnectId) {
        return { payouts: [] };
      }

      try {
        const payouts = await getConnectAccountPayouts({
          connectAccountId: ctx.user.stripeConnectId,
          limit: input.limit,
        });

        return {
          payouts: payouts.map((p) => ({
            id: p.id,
            amount: p.amount / 100,
            currency: p.currency,
            status: p.status,
            arrivalDate: new Date(p.arrival_date * 1000).toISOString(),
            createdAt: new Date(p.created * 1000).toISOString(),
          })),
        };
      } catch (error) {
        console.error("[Stripe Connect] Failed to get payouts:", error);
        return { payouts: [] };
      }
    }),

  /**
   * Transfer payment to sitter after booking is completed
   */
  transferToSitter: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { bookingId } = input;

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

      // Only completed bookings with payment can be transferred
      if (booking.status !== "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Booking must be completed before payout",
        });
      }

      if (!booking.paymentIntentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No payment found for this booking",
        });
      }

      // Get sitter's Connect account
      const [sitter] = await db
        .select()
        .from(users)
        .where(eq(users.id, booking.sitterId));

      if (!sitter?.stripeConnectId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sitter has not set up their payout account",
        });
      }

      // Verify sitter is fully onboarded
      const isOnboarded = await isAccountFullyOnboarded(sitter.stripeConnectId);
      if (!isOnboarded) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sitter's payout account is not fully set up",
        });
      }

      // Calculate amount in cents
      const totalAmount = Math.round(Number(booking.totalPrice) * 100);

      // Create transfer (15% platform fee is deducted in the service)
      const transfer = await createTransferToSitter({
        amount: totalAmount,
        currency: "aud",
        connectAccountId: sitter.stripeConnectId,
        bookingId: bookingId.toString(),
        paymentIntentId: booking.paymentIntentId,
      });

      // Notify sitter about payout
      try {
        const payoutAmount = (totalAmount * 0.85) / 100; // 85% after platform fee
        await notifyUser({
          userId: booking.sitterId,
          type: "general",
          title: "Payout Sent! 🎉",
          body: `$${payoutAmount.toFixed(2)} AUD has been transferred to your bank account for booking #${bookingId}.`,
          data: { bookingId: bookingId.toString() },
        });
      } catch (error) {
        console.error("[Stripe Connect] Failed to send payout notification:", error);
      }

      return {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        currency: transfer.currency,
        status: "transferred",
      };
    }),
});
