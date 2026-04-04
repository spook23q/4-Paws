import { describe, it, expect } from "vitest";

describe("Stripe Publishable Key Validation", () => {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;

  it("should be defined in environment", () => {
    expect(key).toBeDefined();
    expect(key).not.toBe("");
  });

  it("should start with pk_live_ or pk_test_", () => {
    expect(key).toBeDefined();
    const startsWithValid = key!.startsWith("pk_live_") || key!.startsWith("pk_test_");
    expect(startsWithValid).toBe(true);
  });

  it("should have a valid length (at least 20 characters)", () => {
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThanOrEqual(20);
  });

  it("should only contain valid characters", () => {
    expect(key).toBeDefined();
    const validPattern = /^pk_(live|test)_[a-zA-Z0-9]+$/;
    expect(validPattern.test(key!)).toBe(true);
  });
});
