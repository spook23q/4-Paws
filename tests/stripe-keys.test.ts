import { describe, it, expect } from "vitest";

describe("Stripe API Key Validation", () => {
  it("should have FOURPAWS_STRIPE_SECRET_KEY set", () => {
    const key = process.env.FOURPAWS_STRIPE_SECRET_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("sk_test_") || key!.startsWith("sk_live_")).toBe(true);
  });

  it("should have FOURPAWS_STRIPE_PUBLISHABLE_KEY set", () => {
    const key = process.env.FOURPAWS_STRIPE_PUBLISHABLE_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("pk_test_") || key!.startsWith("pk_live_")).toBe(true);
  });

  it("should be able to connect to Stripe API with the secret key", async () => {
    const key = process.env.FOURPAWS_STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("FOURPAWS_STRIPE_SECRET_KEY not set");
    }

    // Call Stripe's /v1/balance endpoint as a lightweight connectivity check
    const response = await fetch("https://api.stripe.com/v1/balance", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    // 200 means valid key, 401 means invalid
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.object).toBe("balance");
  });
});
