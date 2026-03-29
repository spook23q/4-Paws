import { router } from "../_core/trpc.js";
import { getDb } from "../db";
import { bookings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { sendPushNotificationToUser } from "../_core/pushNotifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export const webhookRouter = router({
  /**
   * Handle Stripe webhook events
   * Note: In production, this should be a separate Express endpoint
   * that verifies the webhook signature before processing
   */
});

/**
 * Process Stripe webhook event
 * This function should be called from an Express endpoint
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find booking by payment intent ID
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.paymentIntentId, paymentIntent.id));

      if (booking) {
        // Update booking status to confirmed
        await db
          .update(bookings)
          .set({
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));

        // Send push notification to sitter
        await sendPushNotificationToUser(booking.sitterId, {
          title: "Booking Confirmed! 🎉",
          body: "Payment received. Your booking is now confirmed.",
        });

        // Send push notification to owner
        await sendPushNotificationToUser(booking.ownerId, {
          title: "Payment Successful",
          body: "Your booking has been confirmed and the sitter has been notified.",
        });

        console.log(`[Webhook] Booking ${booking.id} confirmed after successful payment`);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find booking by payment intent ID
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.paymentIntentId, paymentIntent.id));

      if (booking) {
        // Send push notification to owner about failed payment
        await sendPushNotificationToUser(booking.ownerId, {
          title: "Payment Failed",
          body: "Your payment could not be processed. Please try again.",
        });

        console.log(`[Webhook] Payment failed for booking ${booking.id}`);
      }
      break;
    }

    case "payment_intent.canceled": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find booking by payment intent ID
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.paymentIntentId, paymentIntent.id));

      if (booking) {
        console.log(`[Webhook] Payment canceled for booking ${booking.id}`);
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

/**
 * Express route handler for Stripe webhooks
 * Add this to your Express app:
 * 
 * app.post('/api/webhooks/stripe', 
 *   express.raw({ type: 'application/json' }),
 *   async (req, res) => {
 *     const sig = req.headers['stripe-signature'];
 *     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
 *     
 *     try {
 *       const event = stripe.webhooks.constructEvent(
 *         req.body,
 *         sig,
 *         webhookSecret
 *       );
 *       
 *       await handleStripeWebhook(event);
 *       res.json({ received: true });
 *     } catch (err) {
 *       console.error('Webhook error:', err.message);
 *       res.status(400).send(`Webhook Error: ${err.message}`);
 *     }
 *   }
 * );
 */
