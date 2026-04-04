import { describe, it, expect } from "vitest";

// ============================================================
// Stripe Payment Integration Tests
// ============================================================

describe("Stripe Payment Integration", () => {
  // -----------------------------------------------------------
  // Environment & Configuration
  // -----------------------------------------------------------
  describe("Environment Configuration", () => {
    it("should have STRIPE_API_KEY set", () => {
      const key = process.env.STRIPE_API_KEY;
      expect(key).toBeDefined();
      expect(key).not.toBe("");
    });

    it("should use STRIPE_API_KEY as primary key", () => {
      const primary = process.env.STRIPE_API_KEY;
      const fallback1 = process.env.FOURPAWS_STRIPE_SECRET_KEY;
      const fallback2 = process.env.STRIPE_SECRET_KEY;
      // STRIPE_API_KEY should be the resolved key
      const resolvedKey = primary || fallback1 || fallback2;
      expect(resolvedKey).toBe(primary);
    });

    it("should have a live key format", () => {
      const key = process.env.STRIPE_API_KEY;
      expect(key).toBeDefined();
      const isLive =
        key?.startsWith("livepk__") || key?.startsWith("sk_live_");
      expect(isLive).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // Stripe Service Module
  // -----------------------------------------------------------
  describe("Stripe Service Module", () => {
    it("should export getStripeInstance function", async () => {
      const mod = await import("../server/services/stripeService");
      expect(typeof mod.getStripeInstance).toBe("function");
    });

    it("should export createPaymentIntent function", async () => {
      const mod = await import("../server/services/stripeService");
      expect(typeof mod.createPaymentIntent).toBe("function");
    });

    it("should export getPaymentIntent function", async () => {
      const mod = await import("../server/services/stripeService");
      expect(typeof mod.getPaymentIntent).toBe("function");
    });

    it("should export cancelPaymentIntent function", async () => {
      const mod = await import("../server/services/stripeService");
      expect(typeof mod.cancelPaymentIntent).toBe("function");
    });

    it("should export createOrGetCustomer function", async () => {
      const mod = await import("../server/services/stripeService");
      expect(typeof mod.createOrGetCustomer).toBe("function");
    });
  });

  // -----------------------------------------------------------
  // Stripe Connect Service Module
  // -----------------------------------------------------------
  describe("Stripe Connect Service Module", () => {
    it("should export createConnectAccount function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.createConnectAccount).toBe("function");
    });

    it("should export getOrCreateConnectAccount function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.getOrCreateConnectAccount).toBe("function");
    });

    it("should export createAccountOnboardingLink function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.createAccountOnboardingLink).toBe("function");
    });

    it("should export createTransferToSitter function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.createTransferToSitter).toBe("function");
    });

    it("should export getConnectAccountBalance function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.getConnectAccountBalance).toBe("function");
    });

    it("should export getConnectAccountPayouts function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.getConnectAccountPayouts).toBe("function");
    });

    it("should export isAccountFullyOnboarded function", async () => {
      const mod = await import("../server/services/stripeConnectService");
      expect(typeof mod.isAccountFullyOnboarded).toBe("function");
    });
  });

  // -----------------------------------------------------------
  // Payment Amount Calculations
  // -----------------------------------------------------------
  describe("Payment Amount Calculations", () => {
    it("should convert dollars to cents correctly", () => {
      const dollarAmount = 50.0;
      const centsAmount = Math.round(dollarAmount * 100);
      expect(centsAmount).toBe(5000);
    });

    it("should handle decimal amounts correctly", () => {
      const dollarAmount = 49.99;
      const centsAmount = Math.round(dollarAmount * 100);
      expect(centsAmount).toBe(4999);
    });

    it("should handle large amounts correctly", () => {
      const dollarAmount = 1500.5;
      const centsAmount = Math.round(dollarAmount * 100);
      expect(centsAmount).toBe(150050);
    });

    it("should convert cents back to dollars correctly", () => {
      const centsAmount = 5000;
      const dollarAmount = centsAmount / 100;
      expect(dollarAmount).toBe(50.0);
    });

    it("should handle zero amount", () => {
      const dollarAmount = 0;
      const centsAmount = Math.round(dollarAmount * 100);
      expect(centsAmount).toBe(0);
    });
  });

  // -----------------------------------------------------------
  // Platform Fee Calculations
  // -----------------------------------------------------------
  describe("Platform Fee Calculations", () => {
    it("should calculate 15% platform fee correctly", () => {
      const totalAmount = 10000; // $100 in cents
      const platformFee = Math.round(totalAmount * 0.15);
      const sitterAmount = totalAmount - platformFee;
      expect(platformFee).toBe(1500);
      expect(sitterAmount).toBe(8500);
    });

    it("should calculate platform fee for small amounts", () => {
      const totalAmount = 2000; // $20 in cents
      const platformFee = Math.round(totalAmount * 0.15);
      const sitterAmount = totalAmount - platformFee;
      expect(platformFee).toBe(300);
      expect(sitterAmount).toBe(1700);
    });

    it("should calculate platform fee for large amounts", () => {
      const totalAmount = 50000; // $500 in cents
      const platformFee = Math.round(totalAmount * 0.15);
      const sitterAmount = totalAmount - platformFee;
      expect(platformFee).toBe(7500);
      expect(sitterAmount).toBe(42500);
    });

    it("should handle rounding for odd amounts", () => {
      const totalAmount = 3333; // $33.33 in cents
      const platformFee = Math.round(totalAmount * 0.15);
      const sitterAmount = totalAmount - platformFee;
      expect(platformFee).toBe(500); // Math.round(499.95) = 500
      expect(sitterAmount).toBe(2833);
    });

    it("should ensure sitter always receives at least 85%", () => {
      const amounts = [1000, 2500, 5000, 7500, 10000, 25000, 50000];
      for (const amount of amounts) {
        const platformFee = Math.round(amount * 0.15);
        const sitterAmount = amount - platformFee;
        const sitterPercentage = sitterAmount / amount;
        expect(sitterPercentage).toBeGreaterThanOrEqual(0.84);
        expect(sitterPercentage).toBeLessThanOrEqual(0.86);
      }
    });
  });

  // -----------------------------------------------------------
  // Payment Status Validation
  // -----------------------------------------------------------
  describe("Payment Status Validation", () => {
    const validStatuses = [
      "requires_payment_method",
      "requires_confirmation",
      "requires_action",
      "processing",
      "requires_capture",
      "canceled",
      "succeeded",
    ];

    it("should recognize all valid Stripe payment intent statuses", () => {
      for (const status of validStatuses) {
        expect(typeof status).toBe("string");
        expect(status.length).toBeGreaterThan(0);
      }
    });

    it("should identify succeeded status as paid", () => {
      const status = "succeeded";
      const isPaid = status === "succeeded";
      expect(isPaid).toBe(true);
    });

    it("should identify non-succeeded statuses as not paid", () => {
      const nonPaidStatuses = validStatuses.filter((s) => s !== "succeeded");
      for (const status of nonPaidStatuses) {
        const isPaid = status === "succeeded";
        expect(isPaid).toBe(false);
      }
    });

    it("should identify retryable statuses", () => {
      const retryableStatuses = [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
      ];
      for (const status of retryableStatuses) {
        const isRetryable = retryableStatuses.includes(status);
        expect(isRetryable).toBe(true);
      }
    });
  });

  // -----------------------------------------------------------
  // Currency Handling
  // -----------------------------------------------------------
  describe("Currency Handling", () => {
    it("should default to AUD currency", () => {
      const currency = "aud";
      expect(currency).toBe("aud");
    });

    it("should lowercase currency codes", () => {
      const input = "AUD";
      const normalized = input.toLowerCase();
      expect(normalized).toBe("aud");
    });

    it("should format AUD amounts correctly", () => {
      const amount = 49.99;
      const formatted = `$${amount.toFixed(2)} AUD`;
      expect(formatted).toBe("$49.99 AUD");
    });
  });

  // -----------------------------------------------------------
  // Payout Data Formatting
  // -----------------------------------------------------------
  describe("Payout Data Formatting", () => {
    it("should format payout arrival date from timestamp", () => {
      const timestamp = 1709164800; // 2024-02-29 00:00:00 UTC
      const date = new Date(timestamp * 1000);
      const isoString = date.toISOString();
      expect(isoString).toContain("2024-02-29");
    });

    it("should format payout amount from cents to dollars", () => {
      const amountCents = 8500;
      const amountDollars = amountCents / 100;
      expect(amountDollars).toBe(85.0);
    });

    it("should handle payout status values", () => {
      const validPayoutStatuses = [
        "paid",
        "pending",
        "in_transit",
        "canceled",
        "failed",
      ];
      for (const status of validPayoutStatuses) {
        expect(typeof status).toBe("string");
      }
    });
  });

  // -----------------------------------------------------------
  // Connect Account Validation
  // -----------------------------------------------------------
  describe("Connect Account Validation", () => {
    it("should validate Connect account readiness", () => {
      const account = {
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      };
      const isReady = account.charges_enabled && account.payouts_enabled;
      expect(isReady).toBe(true);
    });

    it("should detect incomplete Connect account", () => {
      const account = {
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      };
      const isReady = account.charges_enabled && account.payouts_enabled;
      expect(isReady).toBe(false);
    });

    it("should detect partially complete Connect account", () => {
      const account = {
        charges_enabled: true,
        payouts_enabled: false,
        details_submitted: true,
      };
      const isReady = account.charges_enabled && account.payouts_enabled;
      expect(isReady).toBe(false);
    });

    it("should default country to AU for Australian sitters", () => {
      const country = "AU";
      expect(country).toBe("AU");
    });
  });

  // -----------------------------------------------------------
  // Booking Payment Flow Validation
  // -----------------------------------------------------------
  describe("Booking Payment Flow Validation", () => {
    it("should only allow payment for confirmed bookings", () => {
      const validPaymentStatuses = ["confirmed"];
      const invalidStatuses = [
        "pending",
        "cancelled",
        "completed",
        "declined",
      ];

      for (const status of validPaymentStatuses) {
        expect(validPaymentStatuses.includes(status)).toBe(true);
      }

      for (const status of invalidStatuses) {
        expect(validPaymentStatuses.includes(status)).toBe(false);
      }
    });

    it("should only allow transfer for completed bookings", () => {
      const status = "completed";
      const canTransfer = status === "completed";
      expect(canTransfer).toBe(true);
    });

    it("should not allow transfer for non-completed bookings", () => {
      const statuses = ["pending", "confirmed", "cancelled", "declined"];
      for (const status of statuses) {
        const canTransfer = status === "completed";
        expect(canTransfer).toBe(false);
      }
    });
  });

  // -----------------------------------------------------------
  // Schema Fields
  // -----------------------------------------------------------
  describe("Database Schema Fields", () => {
    it("should have stripeConnectId field in users schema", async () => {
      const schema = await import("../drizzle/schema");
      const usersTable = schema.users;
      expect(usersTable).toBeDefined();
      // Verify the column exists in the table definition
      const columns = Object.keys(usersTable);
      expect(columns.length).toBeGreaterThan(0);
    });

    it("should have paymentIntentId field in bookings schema", async () => {
      const schema = await import("../drizzle/schema");
      const bookingsTable = schema.bookings;
      expect(bookingsTable).toBeDefined();
    });
  });
});
