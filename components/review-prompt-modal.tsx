import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UnreviewedBooking {
  id: string;
  sitterName: string;
  startDate: string;
  endDate: string;
}

/**
 * ReviewPromptModal
 *
 * Auto-shows when an owner has completed bookings that haven't been reviewed yet.
 * Displays a star rating picker, optional text review, and submit/skip buttons.
 * Only shows once per session per booking (uses dismissed state).
 */
export function ReviewPromptModal() {
  const colors = useColors();
  const { user } = useAuth();

  const [visible, setVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<UnreviewedBooking | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  // Fetch unreviewed bookings for owners
  const { data: unreviewedBookings } = trpc.bookings.getUnreviewed.useQuery(
    undefined,
    {
      enabled: !!user && user.role === "owner",
      refetchOnWindowFocus: false,
      staleTime: 60000, // Don't re-fetch for 1 minute
    }
  );

  const createReviewMutation = trpc.reviews.create.useMutation();
  const utils = trpc.useUtils();

  // Show modal when there are unreviewed bookings
  useEffect(() => {
    if (unreviewedBookings && unreviewedBookings.length > 0) {
      // Find first booking not yet dismissed this session
      const nextBooking = unreviewedBookings.find(
        (b: any) => !dismissedIds.has(b.id.toString())
      );
      if (nextBooking) {
        setCurrentBooking({
          id: nextBooking.id.toString(),
          sitterName: nextBooking.sitterName,
          startDate: nextBooking.startDate,
          endDate: nextBooking.endDate,
        });
        // Small delay so the app has time to render first
        const timer = setTimeout(() => {
          setVisible(true);
          animateIn();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [unreviewedBookings, dismissedIds]);

  const animateIn = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: 300 });
    modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    modalOpacity.value = withTiming(1, { duration: 250 });
  }, []);

  const animateOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(resolve, 220);
    });
  }, []);

  const handleStarPress = (star: number) => {
    setRating(star);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    if (!currentBooking || rating === 0) return;

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        bookingId: currentBooking.id,
        rating,
        reviewText: reviewText.trim() || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Show success animation
      setShowSuccess(true);
      successScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 150 })
      );

      // Invalidate queries
      utils.bookings.getMyBookings.invalidate();
      utils.bookings.getUnreviewed.invalidate();

      // Close after success animation
      setTimeout(async () => {
        setShowSuccess(false);
        successScale.value = 0;
        await animateOut();
        resetAndDismiss(currentBooking.id);
      }, 1500);
    } catch (error: any) {
      console.error("[ReviewPrompt] Submit failed:", error);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!currentBooking) return;
    await animateOut();
    resetAndDismiss(currentBooking.id);
  };

  const resetAndDismiss = (bookingId: string) => {
    setDismissedIds((prev) => new Set(prev).add(bookingId));
    setVisible(false);
    setCurrentBooking(null);
    setRating(0);
    setReviewText("");
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent!";
      default: return "Tap a star to rate";
    }
  };

  const getRatingEmoji = () => {
    switch (rating) {
      case 1: return "😞";
      case 2: return "😐";
      case 3: return "🙂";
      case 4: return "😊";
      case 5: return "🤩";
      default: return "⭐";
    }
  };

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  if (!visible || !currentBooking) return null;

  const bookingDateRange = `${new Date(currentBooking.startDate).toLocaleDateString("en-AU", { month: "short", day: "numeric" })} – ${new Date(currentBooking.endDate).toLocaleDateString("en-AU", { month: "short", day: "numeric" })}`;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleSkip}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View style={[styles.modalWrapper, modalStyle]}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View
              style={[
                styles.modal,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Success Overlay */}
              {showSuccess && (
                <Animated.View style={[styles.successOverlay, successStyle]}>
                  <View
                    style={[
                      styles.successCircle,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={60}
                      color="#fff"
                    />
                  </View>
                  <Text
                    style={[styles.successText, { color: colors.foreground }]}
                  >
                    Thank you for your review!
                  </Text>
                </Animated.View>
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: `${colors.muted}20` },
                ]}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <IconSymbol name="xmark" size={16} color={colors.muted} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.catIconCircle,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <IconSymbol
                    name="pawprint.fill"
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.headerTitle, { color: colors.foreground }]}
                >
                  How was your experience?
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                  Rate your booking with{" "}
                  <Text style={{ fontWeight: "700", color: colors.primary }}>
                    {currentBooking.sitterName}
                  </Text>
                </Text>
                <Text style={[styles.dateText, { color: colors.muted }]}>
                  {bookingDateRange}
                </Text>
              </View>

              {/* Star Rating */}
              <View style={styles.ratingSection}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleStarPress(star)}
                      activeOpacity={0.7}
                      style={styles.starButton}
                    >
                      <IconSymbol
                        name="star.fill"
                        size={44}
                        color={
                          star <= rating ? colors.warning : `${colors.border}`
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text
                  style={[
                    styles.ratingLabel,
                    {
                      color: rating > 0 ? colors.primary : colors.muted,
                    },
                  ]}
                >
                  {getRatingEmoji()} {getRatingLabel()}
                </Text>
              </View>

              {/* Review Text */}
              <View style={styles.reviewSection}>
                <Text
                  style={[styles.reviewLabel, { color: colors.foreground }]}
                >
                  Share your experience{" "}
                  <Text style={{ color: colors.muted, fontWeight: "400" }}>
                    (optional)
                  </Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="What went well? Any tips for other cat owners?"
                  placeholderTextColor={colors.muted}
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={1000}
                  returnKeyType="done"
                />
                <Text style={[styles.charCount, { color: colors.muted }]}>
                  {reviewText.length}/1000
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isSubmitting || rating === 0 ? 0.5 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || rating === 0}
                activeOpacity={0.8}
              >
                <IconSymbol name="star.fill" size={20} color="#fff" />
                <Text style={styles.submitText}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Text>
              </TouchableOpacity>

              {/* Skip */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={[styles.skipText, { color: colors.muted }]}>
                  Maybe later
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalWrapper: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
    maxHeight: "85%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modal: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  catIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  starButton: {
    marginHorizontal: 4,
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 80,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    borderRadius: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
