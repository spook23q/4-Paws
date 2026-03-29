import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency: string;
  bookingId: number;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const { amount, currency, bookingId, customerId, metadata } = params;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    customer: customerId,
    metadata: {
      bookingId: bookingId.toString(),
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrGetCustomer(params: {
  email: string;
  name: string;
  userId: number;
}): Promise<Stripe.Customer> {
  const { email, name, userId } = params;

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: userId.toString(),
    },
  });
}
