import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function ReviewScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { bookingId, sitterName } = useLocalSearchParams<{
    bookingId: string;
    sitterName: string;
  }>();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleStarPress = (star: number) => {
    setRating(star);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await createReviewMutation.mutateAsync({
        bookingId: bookingId || "",
        rating,
        reviewText: reviewText.trim() || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Thank You!",
        "Your review has been submitted successfully.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Sign In Required
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.push("/auth/sign-in" as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Tap to rate";
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="chevron.left"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-foreground ml-4">
                Leave a Review
              </Text>
            </View>

            {/* Sitter Info */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border items-center">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                <IconSymbol
                  name="person.fill"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text className="text-xl font-bold text-foreground mb-1">
                {sitterName || "Your Sitter"}
              </Text>
              <Text className="text-sm text-muted">
                How was your experience?
              </Text>
            </View>

            {/* Star Rating */}
            <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4 text-center">
                Rate Your Experience
              </Text>

              <View className="flex-row justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    activeOpacity={0.7}
                    style={{ marginHorizontal: 8 }}
                  >
                    <IconSymbol
                      name="star.fill"
                      size={40}
                      color={star <= rating ? colors.warning : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                className="text-center font-semibold"
                style={{
                  color: rating > 0 ? colors.primary : colors.muted,
                  fontSize: 16,
                }}
              >
                {getRatingLabel()}
              </Text>
            </View>

            {/* Review Text */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">
                Write a Review (Optional)
              </Text>
              <Text className="text-sm text-muted mb-4">
                Share your experience to help other cat owners
              </Text>

              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground min-h-[120px]"
                placeholder="Tell us about your experience with this sitter..."
                placeholderTextColor={colors.muted}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text className="text-xs text-muted mt-2 text-right">
                {reviewText.length}/1000
              </Text>
            </View>

            {/* Tips */}
            <View className="bg-primary/5 rounded-2xl p-5 mb-6 border border-primary/20">
              <Text className="text-base font-bold text-foreground mb-3">
                💡 Tips for a helpful review
              </Text>
              <View className="space-y-2">
                <Text className="text-sm text-muted leading-relaxed">
                  • Was the sitter punctual and reliable?
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • How did they interact with your cat?
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • Did they follow your instructions?
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  • Would you book them again?
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              activeOpacity={0.8}
              style={{
                opacity: isSubmitting || rating === 0 ? 0.6 : 1,
              }}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              className="py-4 items-center mt-2"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="text-muted font-semibold">Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
