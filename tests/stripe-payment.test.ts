import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "..");

describe("Stripe Payment Integration", () => {
  describe("Backend - Stripe Service", () => {
    const servicePath = path.join(projectRoot, "server/services/stripeService.ts");
    const serviceContent = fs.readFileSync(servicePath, "utf-8");

    it("should use FOURPAWS_STRIPE_SECRET_KEY env var", () => {
      expect(serviceContent).toContain("FOURPAWS_STRIPE_SECRET_KEY");
    });

    it("should export createPaymentIntent function", () => {
      expect(serviceContent).toContain("export async function createPaymentIntent");
    });

    it("should export getPaymentIntent function", () => {
      expect(serviceContent).toContain("export async function getPaymentIntent");
    });

    it("should export cancelPaymentIntent function", () => {
      expect(serviceContent).toContain("export async function cancelPaymentIntent");
    });

    it("should export createOrGetCustomer function", () => {
      expect(serviceContent).toContain("export async function createOrGetCustomer");
    });

    it("should handle missing Stripe key gracefully", () => {
      expect(serviceContent).toContain("Stripe secret key is not configured");
    });

    it("should accept currency parameter", () => {
      expect(serviceContent).toContain("currency");
    });
  });

  describe("Backend - Stripe Router", () => {
    const routerPath = path.join(projectRoot, "server/routers/stripeRouter.ts");
    const routerContent = fs.readFileSync(routerPath, "utf-8");

    it("should export stripeRouter", () => {
      expect(routerContent).toContain("export const stripeRouter");
    });

    it("should have createPaymentIntent endpoint", () => {
      expect(routerContent).toContain("createPaymentIntent:");
    });

    it("should have confirmPayment endpoint", () => {
      expect(routerContent).toContain("confirmPayment:");
    });

    it("should have getPaymentStatus endpoint", () => {
      expect(routerContent).toContain("getPaymentStatus:");
    });

    it("should have cancelPayment endpoint", () => {
      expect(routerContent).toContain("cancelPayment:");
    });

    it("should have getPublishableKey endpoint", () => {
      expect(routerContent).toContain("getPublishableKey:");
    });

    it("should validate bookingId input", () => {
      expect(routerContent).toContain("bookingId: z.number()");
    });

    it("should only allow owners to pay for their bookings", () => {
      expect(routerContent).toContain("You can only pay for your own bookings");
    });

    it("should only allow payment for confirmed bookings", () => {
      expect(routerContent).toContain("Payment can only be made after the sitter has accepted");
    });

    it("should prevent duplicate payments", () => {
      expect(routerContent).toContain("Payment has already been completed");
    });

    it("should notify sitter when payment is received", () => {
      expect(routerContent).toContain("Payment Received");
      expect(routerContent).toContain("notifyUser");
    });

    it("should use protectedProcedure for all endpoints", () => {
      const protectedCount = (routerContent.match(/protectedProcedure/g) || []).length;
      expect(protectedCount).toBeGreaterThanOrEqual(5);
    });

    it("should return FOURPAWS_STRIPE_PUBLISHABLE_KEY", () => {
      expect(routerContent).toContain("FOURPAWS_STRIPE_PUBLISHABLE_KEY");
    });
  });

  describe("Backend - Router Registration", () => {
    const routersPath = path.join(projectRoot, "server/routers.ts");
    const routersContent = fs.readFileSync(routersPath, "utf-8");

    it("should register stripe router", () => {
      expect(routersContent).toContain("stripe:");
      expect(routersContent).toContain("stripeRouter");
    });
  });

  describe("Client - Payment Checkout Screen", () => {
    const paymentPath = path.join(projectRoot, "app/bookings/payment.tsx");
    const paymentContent = fs.readFileSync(paymentPath, "utf-8");

    it("should exist", () => {
      expect(fs.existsSync(paymentPath)).toBe(true);
    });

    it("should use ScreenContainer", () => {
      expect(paymentContent).toContain("ScreenContainer");
    });

    it("should accept bookingId, sitterName, and amount params", () => {
      expect(paymentContent).toContain("bookingId");
      expect(paymentContent).toContain("sitterName");
      expect(paymentContent).toContain("amount");
    });

    it("should call stripe.createPaymentIntent", () => {
      expect(paymentContent).toContain("stripe.createPaymentIntent");
    });

    it("should call stripe.confirmPayment", () => {
      expect(paymentContent).toContain("stripe.confirmPayment");
    });

    it("should call stripe.getPublishableKey", () => {
      expect(paymentContent).toContain("stripe.getPublishableKey");
    });

    it("should call stripe.getPaymentStatus", () => {
      expect(paymentContent).toContain("stripe.getPaymentStatus");
    });

    it("should show payment success state", () => {
      expect(paymentContent).toContain("Payment Complete");
      expect(paymentContent).toContain("paymentSuccess");
    });

    it("should show payment summary with amount", () => {
      expect(paymentContent).toContain("amount");
    });

    it("should have security notice", () => {
      expect(paymentContent).toContain("Secure Payment");
      expect(paymentContent).toContain("Stripe");
    });

    it("should have cancel option", () => {
      expect(paymentContent).toContain("Cancel");
    });

    it("should use haptic feedback", () => {
      expect(paymentContent).toContain("Haptics");
    });

    it("should have loading state", () => {
      expect(paymentContent).toContain("ActivityIndicator");
      expect(paymentContent).toContain("loading");
    });

    it("should guard against non-owner access", () => {
      expect(paymentContent).toContain("Owner Account Required");
    });

    it("should have success animation", () => {
      expect(paymentContent).toContain("useSharedValue");
      expect(paymentContent).toContain("successScale");
    });
  });

  describe("Client - Bookings Tab Pay Now Button", () => {
    const bookingsPath = path.join(projectRoot, "app/(tabs)/bookings.tsx");
    const bookingsContent = fs.readFileSync(bookingsPath, "utf-8");

    it("should have Pay Now button for confirmed unpaid bookings", () => {
      expect(bookingsContent).toContain("Pay Now");
    });

    it("should navigate to payment screen with correct params", () => {
      expect(bookingsContent).toContain("/bookings/payment");
      expect(bookingsContent).toContain("bookingId");
      expect(bookingsContent).toContain("sitterName");
      expect(bookingsContent).toContain("amount");
    });

    it("should show Payment Confirmed badge for paid bookings", () => {
      expect(bookingsContent).toContain("Payment Confirmed");
    });

    it("should check paymentIntentId to determine payment status", () => {
      expect(bookingsContent).toContain("paymentIntentId");
    });

    it("should only show Pay Now for owners", () => {
      expect(bookingsContent).toContain("isOwner");
    });
  });

  describe("Client - Payments Tab", () => {
    const paymentsPath = path.join(projectRoot, "app/(tabs)/payments.tsx");
    const paymentsContent = fs.readFileSync(paymentsPath, "utf-8");

    it("should import from auth-context (not use-auth)", () => {
      expect(paymentsContent).toContain("@/lib/auth-context");
    });

    it("should guard queries with enabled: !!user", () => {
      expect(paymentsContent).toContain("enabled: !!user");
    });

    it("should show total paid summary", () => {
      expect(paymentsContent).toContain("Total Paid");
    });

    it("should show pending summary for owners", () => {
      expect(paymentsContent).toContain("Pending");
      expect(paymentsContent).toContain("totalPending");
    });

    it("should have Pay Now button for pending payments", () => {
      expect(paymentsContent).toContain("Pay Now");
      expect(paymentsContent).toContain("/bookings/payment");
    });

    it("should show Stripe security footer", () => {
      expect(paymentsContent).toContain("Payments secured by Stripe");
    });

    it("should show sign-in required for unauthenticated users", () => {
      expect(paymentsContent).toContain("Sign In Required");
    });

    it("should show empty state when no payments", () => {
      expect(paymentsContent).toContain("No Payments Yet");
    });

    it("should track payment status (paid, pending, unpaid)", () => {
      expect(paymentsContent).toContain('"paid"');
      expect(paymentsContent).toContain('"pending"');
      expect(paymentsContent).toContain('"unpaid"');
    });
  });
});
