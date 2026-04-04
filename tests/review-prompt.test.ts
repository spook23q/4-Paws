import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "..");

describe("Review Prompt Feature", () => {
  describe("ReviewPromptModal Component", () => {
    const modalPath = path.join(projectRoot, "components/review-prompt-modal.tsx");
    const modalContent = fs.readFileSync(modalPath, "utf-8");

    it("should export ReviewPromptModal component", () => {
      expect(modalContent).toContain("export function ReviewPromptModal");
    });

    it("should use trpc.bookings.getUnreviewed query", () => {
      expect(modalContent).toContain("trpc.bookings.getUnreviewed.useQuery");
    });

    it("should only enable query for authenticated owners", () => {
      expect(modalContent).toContain('enabled: !!user && user.role === "owner"');
    });

    it("should render 5 star rating buttons", () => {
      expect(modalContent).toContain("[1, 2, 3, 4, 5].map((star)");
    });

    it("should have haptic feedback on star press", () => {
      expect(modalContent).toContain("Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)");
    });

    it("should have success haptic on submit", () => {
      expect(modalContent).toContain("Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)");
    });

    it("should have error haptic on failure", () => {
      expect(modalContent).toContain("Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)");
    });

    it("should guard haptics with platform check", () => {
      expect(modalContent).toContain('Platform.OS !== "web"');
    });

    it("should use reviews.create mutation for submission", () => {
      expect(modalContent).toContain("trpc.reviews.create.useMutation");
    });

    it("should invalidate bookings queries after review submission", () => {
      expect(modalContent).toContain("utils.bookings.getMyBookings.invalidate");
      expect(modalContent).toContain("utils.bookings.getUnreviewed.invalidate");
    });

    it("should have a skip/maybe later button", () => {
      expect(modalContent).toContain("Maybe later");
    });

    it("should have a submit button", () => {
      expect(modalContent).toContain("Submit Review");
    });

    it("should disable submit when rating is 0", () => {
      expect(modalContent).toContain("isSubmitting || rating === 0");
    });

    it("should track dismissed booking IDs to avoid re-showing", () => {
      expect(modalContent).toContain("dismissedIds");
      expect(modalContent).toContain("setDismissedIds");
    });

    it("should show success animation after submission", () => {
      expect(modalContent).toContain("setShowSuccess(true)");
      expect(modalContent).toContain("Thank you for your review!");
    });

    it("should have rating labels for each star level", () => {
      expect(modalContent).toContain('"Poor"');
      expect(modalContent).toContain('"Fair"');
      expect(modalContent).toContain('"Good"');
      expect(modalContent).toContain('"Very Good"');
      expect(modalContent).toContain('"Excellent!"');
    });

    it("should use Animated for entrance/exit animations", () => {
      expect(modalContent).toContain("useSharedValue");
      expect(modalContent).toContain("useAnimatedStyle");
      expect(modalContent).toContain("withSpring");
    });

    it("should have a text input for optional review text", () => {
      expect(modalContent).toContain("TextInput");
      expect(modalContent).toContain("maxLength={1000}");
    });

    it("should show character count", () => {
      expect(modalContent).toContain("reviewText.length}/1000");
    });

    it("should delay showing modal by 1.5s for smooth UX", () => {
      expect(modalContent).toContain("1500");
    });

    it("should use Modal component for overlay", () => {
      expect(modalContent).toContain("from \"react-native\"");
      expect(modalContent).toContain("<Modal");
    });

    it("should use KeyboardAvoidingView for text input", () => {
      expect(modalContent).toContain("KeyboardAvoidingView");
    });
  });

  describe("Backend: getUnreviewed Endpoint", () => {
    const routerPath = path.join(projectRoot, "server/routers/bookingsRouter.ts");
    const routerContent = fs.readFileSync(routerPath, "utf-8");

    it("should have getUnreviewed endpoint", () => {
      expect(routerContent).toContain("getUnreviewed: protectedProcedure");
    });

    it("should only return results for owners", () => {
      expect(routerContent).toContain('ctx.user.role !== "owner"');
    });

    it("should filter for completed bookings", () => {
      expect(routerContent).toContain('eq(bookings.status, "completed")');
    });

    it("should exclude already-reviewed bookings", () => {
      expect(routerContent).toContain("reviewedIds");
      expect(routerContent).toContain("!reviewedIds.has");
    });

    it("should include sitter name in response", () => {
      expect(routerContent).toContain("sitterName");
      expect(routerContent).toContain("sitter_user.name");
    });
  });

  describe("Backend: Review Notification to Sitter", () => {
    const reviewsPath = path.join(projectRoot, "server/routers/reviewsRouter.ts");
    const reviewsContent = fs.readFileSync(reviewsPath, "utf-8");

    it("should import notifyUser helper", () => {
      expect(reviewsContent).toContain('import { notifyUser } from "../notificationHelpers"');
    });

    it("should send notification to sitter on review creation", () => {
      expect(reviewsContent).toContain("notifyUser({");
      expect(reviewsContent).toContain('type: "new_review"');
    });

    it("should include rating in notification body", () => {
      expect(reviewsContent).toContain("input.rating");
      expect(reviewsContent).toContain("star review");
    });

    it("should include owner name in notification", () => {
      expect(reviewsContent).toContain("ownerName");
    });
  });

  describe("App Layout Integration", () => {
    const layoutPath = path.join(projectRoot, "app/_layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    it("should import ReviewPromptModal", () => {
      expect(layoutContent).toContain('import { ReviewPromptModal } from "@/components/review-prompt-modal"');
    });

    it("should render ReviewPromptModal in root layout", () => {
      expect(layoutContent).toContain("<ReviewPromptModal />");
    });
  });

  describe("Bookings Screen: Review Prompt Banner", () => {
    const bookingsPath = path.join(projectRoot, "app/(tabs)/bookings.tsx");
    const bookingsContent = fs.readFileSync(bookingsPath, "utf-8");

    it("should show Leave a Review banner for unreviewed completed bookings", () => {
      expect(bookingsContent).toContain("Leave a Review");
      expect(bookingsContent).toContain("canReview");
    });

    it("should show Review Submitted badge for reviewed bookings", () => {
      expect(bookingsContent).toContain("Review Submitted");
      expect(bookingsContent).toContain("hasReview");
    });

    it("should navigate to review screen from banner", () => {
      expect(bookingsContent).toContain("/bookings/review");
    });
  });

  describe("Existing Review Screen", () => {
    const reviewPath = path.join(projectRoot, "app/bookings/review.tsx");
    const reviewContent = fs.readFileSync(reviewPath, "utf-8");

    it("should have star rating UI", () => {
      expect(reviewContent).toContain("[1, 2, 3, 4, 5].map((star)");
    });

    it("should have review text input", () => {
      expect(reviewContent).toContain("TextInput");
      expect(reviewContent).toContain("maxLength={1000}");
    });

    it("should have submit and skip buttons", () => {
      expect(reviewContent).toContain("Submit Review");
      expect(reviewContent).toContain("Skip for now");
    });

    it("should use reviews.create mutation", () => {
      expect(reviewContent).toContain("trpc.reviews.create.useMutation");
    });

    it("should have rating labels", () => {
      expect(reviewContent).toContain('"Poor"');
      expect(reviewContent).toContain('"Excellent"');
    });
  });
});
