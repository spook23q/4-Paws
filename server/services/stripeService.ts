import Stripe from "stripe";

// Use STRIPE_API_KEY (user-provided), FOURPAWS_STRIPE_SECRET_KEY, or fallback to built-in STRIPE_SECRET_KEY
const getStripeKey = () => {
  const key = process.env.STRIPE_API_KEY || process.env.FOURPAWS_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_API_KEY, FOURPAWS_STRIPE_SECRET_KEY, or STRIPE_SECRET_KEY.");
  }
  return key;
};

let _stripe: Stripe | null = null;

export const getStripeInstance = (): Stripe => {
  if (!_stripe) {
    const key = getStripeKey();
    console.log("[Stripe] Initializing Stripe client with API key");
    _stripe = new Stripe(key, {
      apiVersion: "2025-04-30.basil" as any,
    });
  }
  return _stripe;
};

// Legacy export for backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeInstance() as any)[prop];
  },
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
  const s = getStripeInstance();

  try {
    const paymentIntent = await s.paymentIntents.create({
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

    console.log(`[Stripe] Payment intent created: ${paymentIntent.id} for booking ${bookingId}`);
    return paymentIntent;
  } catch (error) {
    console.error(`[Stripe] Failed to create payment intent for booking ${bookingId}:`, error);
    throw error;
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const s = getStripeInstance();
  return await s.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const s = getStripeInstance();
  return await s.paymentIntents.cancel(paymentIntentId);
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
  const s = getStripeInstance();

  // Search for existing customer by email
  const existingCustomers = await s.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await s.customers.create({
    email,
    name,
    metadata: {
      userId: userId.toString(),
    },
  });
}
