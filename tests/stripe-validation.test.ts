import { describe, it, expect } from "vitest";

describe("Stripe API Key Validation", () => {
  it("should have STRIPE_API_KEY environment variable set", () => {
    const stripeKey = process.env.STRIPE_API_KEY;
    expect(stripeKey).toBeDefined();
    expect(stripeKey).not.toBe("");
  });

  it("should have valid Stripe API key format (starts with livepk__)", () => {
    const stripeKey = process.env.STRIPE_API_KEY;
    expect(stripeKey).toBeDefined();
    // Stripe live keys start with livepk__ or sk_live_
    expect(
      stripeKey?.startsWith("livepk__") || stripeKey?.startsWith("sk_live_")
    ).toBe(true);
  });

  it("should have minimum length for Stripe API key", () => {
    const stripeKey = process.env.STRIPE_API_KEY;
    expect(stripeKey).toBeDefined();
    // Stripe keys are typically 100+ characters
    expect(stripeKey!.length).toBeGreaterThan(50);
  });

  it("should validate Stripe key structure", () => {
    const stripeKey = process.env.STRIPE_API_KEY;
    expect(stripeKey).toBeDefined();
    // Should contain only alphanumeric characters and underscores
    expect(/^[a-zA-Z0-9_]+$/.test(stripeKey!)).toBe(true);
  });

  it("should be a live key (not test key)", () => {
    const stripeKey = process.env.STRIPE_API_KEY;
    expect(stripeKey).toBeDefined();
    // Live keys start with livepk__ or sk_live_
    const isLiveKey =
      stripeKey?.startsWith("livepk__") || stripeKey?.startsWith("sk_live_");
    expect(isLiveKey).toBe(true);
  });
});
