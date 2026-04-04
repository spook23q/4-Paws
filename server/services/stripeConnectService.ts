import Stripe from "stripe";
import { getStripeInstance } from "./stripeService";

/**
 * Create a Stripe Connect account for a sitter to receive payouts
 */
export async function createConnectAccount(params: {
  email: string;
  name: string;
  userId: string;
  country?: string;
}): Promise<Stripe.Account> {
  const { email, name, userId, country = "AU" } = params;
  const stripe = getStripeInstance();

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId,
        createdAt: new Date().toISOString(),
      },
    });

    console.log(`[Stripe Connect] Created Express account ${account.id} for sitter ${userId}`);
    return account;
  } catch (error) {
    console.error(`[Stripe Connect] Failed to create account for sitter ${userId}:`, error);
    throw error;
  }
}

/**
 * Get or create a Stripe Connect account for a sitter
 */
export async function getOrCreateConnectAccount(params: {
  email: string;
  name: string;
  userId: string;
  existingConnectId?: string;
}): Promise<Stripe.Account> {
  const { email, name, userId, existingConnectId } = params;
  const stripe = getStripeInstance();

  // If we already have a Connect account ID, retrieve it
  if (existingConnectId) {
    try {
      const account = await stripe.accounts.retrieve(existingConnectId);
      console.log(`[Stripe Connect] Retrieved existing account ${account.id} for sitter ${userId}`);
      return account;
    } catch (error) {
      console.error(`[Stripe Connect] Failed to retrieve account ${existingConnectId}:`, error);
      // Fall through to create a new one
    }
  }

  // Create a new Connect account
  return await createConnectAccount({ email, name, userId });
}

/**
 * Create a login link for a sitter to manage their Stripe Connect account
 */
export async function createAccountLoginLink(
  connectAccountId: string
): Promise<Stripe.LoginLink> {
  const stripe = getStripeInstance();

  try {
    const loginLink = await stripe.accounts.createLoginLink(connectAccountId);
    console.log(`[Stripe Connect] Created login link for account ${connectAccountId}`);
    return loginLink;
  } catch (error) {
    console.error(`[Stripe Connect] Failed to create login link for account ${connectAccountId}:`, error);
    throw error;
  }
}

/**
 * Create an onboarding link for a sitter to complete their Stripe Connect setup
 */
export async function createAccountOnboardingLink(params: {
  connectAccountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<Stripe.AccountLink> {
  const { connectAccountId, refreshUrl, returnUrl } = params;
  const stripe = getStripeInstance();

  try {
    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      type: "account_onboarding",
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    console.log(`[Stripe Connect] Created onboarding link for account ${connectAccountId}`);
    return accountLink;
  } catch (error) {
    console.error(
      `[Stripe Connect] Failed to create onboarding link for account ${connectAccountId}:`,
      error
    );
    throw error;
  }
}

/**
 * Transfer funds from a booking payment to a sitter's Connect account
 */
export async function createTransferToSitter(params: {
  amount: number; // in cents
  currency: string;
  connectAccountId: string;
  bookingId: string;
  paymentIntentId: string;
}): Promise<Stripe.Transfer> {
  const { amount, currency, connectAccountId, bookingId, paymentIntentId } = params;
  const stripe = getStripeInstance();

  try {
    // Calculate platform fee (e.g., 15% for platform)
    const platformFeeAmount = Math.round(amount * 0.15);
    const sitterAmount = amount - platformFeeAmount;

    const transfer = await stripe.transfers.create({
      amount: sitterAmount,
      currency: currency.toLowerCase(),
      destination: connectAccountId,
      metadata: {
        bookingId,
        paymentIntentId,
        platformFee: platformFeeAmount.toString(),
      },
      description: `Payout for booking ${bookingId}`,
    });

    console.log(
      `[Stripe Connect] Created transfer ${transfer.id}: ${sitterAmount} cents to ${connectAccountId} for booking ${bookingId}`
    );
    return transfer;
  } catch (error) {
    console.error(
      `[Stripe Connect] Failed to create transfer for booking ${bookingId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get balance for a Stripe Connect account
 */
export async function getConnectAccountBalance(
  connectAccountId: string
): Promise<Stripe.Balance> {
  const stripe = getStripeInstance();

  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectAccountId,
    });

    console.log(`[Stripe Connect] Retrieved balance for account ${connectAccountId}`);
    return balance;
  } catch (error) {
    console.error(`[Stripe Connect] Failed to retrieve balance for account ${connectAccountId}:`, error);
    throw error;
  }
}

/**
 * Get payout history for a Stripe Connect account
 */
export async function getConnectAccountPayouts(params: {
  connectAccountId: string;
  limit?: number;
}): Promise<Stripe.Payout[]> {
  const { connectAccountId, limit = 10 } = params;
  const stripe = getStripeInstance();

  try {
    const payouts = await stripe.payouts.list(
      { limit },
      { stripeAccount: connectAccountId }
    );

    console.log(
      `[Stripe Connect] Retrieved ${payouts.data.length} payouts for account ${connectAccountId}`
    );
    return payouts.data;
  } catch (error) {
    console.error(
      `[Stripe Connect] Failed to retrieve payouts for account ${connectAccountId}:`,
      error
    );
    throw error;
  }
}

/**
 * Verify if a Stripe Connect account is fully onboarded
 */
export async function isAccountFullyOnboarded(
  connectAccountId: string
): Promise<boolean> {
  const stripe = getStripeInstance();

  try {
    const account = await stripe.accounts.retrieve(connectAccountId);
    // Check if charges are enabled (means account is fully onboarded)
    const isReady = account.charges_enabled && account.payouts_enabled;
    console.log(
      `[Stripe Connect] Account ${connectAccountId} onboarding status: ${isReady ? "complete" : "incomplete"}`
    );
    return isReady;
  } catch (error) {
    console.error(
      `[Stripe Connect] Failed to check onboarding status for account ${connectAccountId}:`,
      error
    );
    return false;
  }
}
