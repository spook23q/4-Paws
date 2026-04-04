import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BookingCostBreakdown } from "@/components/booking-cost-breakdown";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";
import { useScreenLayout } from "@/hooks/use-screen-layout";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

export default function PaymentScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();
  const { bookingId, sitterName, amount, sitterRate, numberOfDays, visitType } = useLocalSearchParams<{
    bookingId: string;
    sitterName: string;
    amount: string;
    sitterRate?: string;
    numberOfDays?: string;
    visitType?: "daily" | "overnight";
  }>();

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const createPaymentIntentMutation = trpc.stripe.createPaymentIntent.useMutation();
  const confirmPaymentMutation = trpc.stripe.confirmPayment.useMutation();

  // Get publishable key
  const { data: stripeConfig } = trpc.stripe.getPublishableKey.useQuery(undefined, {
    enabled: !!user,
  });

  // Get payment status
  const { data: paymentStatus } = trpc.stripe.getPaymentStatus.useQuery(
    { bookingId: Number(bookingId) },
    { enabled: !!user && !!bookingId }
  );

  // Check if already paid
  useEffect(() => {
    if (paymentStatus?.paid) {
      setPaymentSuccess(true);
    }
  }, [paymentStatus]);

  const handleCreatePaymentIntent = useCallback(async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      const result = await createPaymentIntentMutation.mutateAsync({
        bookingId: Number(bookingId),
      });

      setClientSecret(result.clientSecret);
      setPaymentIntentId(result.paymentIntentId);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const handleConfirmPayment = useCallback(async () => {
    if (!paymentIntentId || !bookingId) return;

    setLoading(true);
    try {
      // On mobile, the Stripe SDK would handle the payment sheet
      // For web/Expo Go, we simulate the confirmation flow
      await confirmPaymentMutation.mutateAsync({
        bookingId: Number(bookingId),
        paymentIntentId,
      });

      setPaymentSuccess(true);

      // Animate success
      successOpacity.value = withTiming(1, { duration: 300 });
      successScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 150 })
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Payment Successful! 🎉",
        `Your payment of $${parseFloat(amount || "0").toFixed(2)} has been processed. ${sitterName || "The sitter"} has been notified.`,
        [
          {
            text: "View Bookings",
            onPress: () => router.push("/(tabs)/bookings" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Payment Failed", error.message || "Payment could not be confirmed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  }, [paymentIntentId, bookingId, amount, sitterName]);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successScale.value }],
  }));

  if (!user || user.role !== "owner") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Owner Account Required
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (paymentSuccess) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View style={successAnimatedStyle}>
            <View className="w-24 h-24 rounded-full bg-success/20 items-center justify-center mb-6">
              <IconSymbol name="checkmark.circle.fill" size={56} color={colors.success} />
            </View>
          </Animated.View>
          <Text className="text-3xl font-bold text-foreground mb-3">
            Payment Complete!
          </Text>
          <Text className="text-base text-muted text-center mb-2">
            Your payment of ${parseFloat(amount || "0").toFixed(2)} has been processed.
          </Text>
          <Text className="text-base text-muted text-center mb-8">
            {sitterName || "The sitter"} has been notified.
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-2xl"
            onPress={() => router.push("/(tabs)/bookings" as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">View Bookings</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground ml-4">
              Payment
            </Text>
          </View>

          {/* Booking Details */}
          <View className="mb-6">
            <View className="bg-surface rounded-2xl p-6 mb-4 border border-border">
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                  <IconSymbol name="creditcard.fill" size={32} color={colors.primary} />
                </View>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  Cat Sitting by {sitterName || "Sitter"}
                </Text>
                <Text className="text-sm text-muted">Booking #{bookingId}</Text>
              </View>
            </View>

            {/* Cost Breakdown Component */}
            {sitterRate && numberOfDays && visitType ? (
              <BookingCostBreakdown
                sitterRate={parseFloat(sitterRate)}
                numberOfDays={parseInt(numberOfDays)}
                visitType={visitType}
                serviceFeePercentage={0}
              />
            ) : (
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-foreground">Total</Text>
                  <Text className="text-3xl font-bold text-primary">
                    ${parseFloat(amount || "0").toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Payment Method Info */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              Payment Method
            </Text>
            <View className="bg-background rounded-xl p-4 flex-row items-center">
              <IconSymbol name="creditcard.fill" size={24} color={colors.primary} />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  Credit / Debit Card
                </Text>
                <Text className="text-sm text-muted">
                  Secured by Stripe
                </Text>
              </View>
              <IconSymbol name="lock.fill" size={18} color={colors.success} />
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-success/10 rounded-2xl p-4 mb-6 flex-row items-start">
            <IconSymbol name="lock.fill" size={20} color={colors.success} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-foreground mb-1">
                Secure Payment
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                Your payment information is encrypted and processed securely by Stripe.
                We never store your card details.
              </Text>
            </View>
          </View>

          {/* Pay Button */}
          {!clientSecret ? (
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center mb-4"
              onPress={handleCreatePaymentIntent}
              disabled={loading}
              activeOpacity={0.8}
              style={loading ? { opacity: 0.6 } : undefined}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Pay ${parseFloat(amount || "0").toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View>
              <View className="bg-primary/10 rounded-2xl p-4 mb-4 flex-row items-center">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground ml-2">
                  Payment intent created. Ready to process.
                </Text>
              </View>
              <TouchableOpacity
                className="bg-primary rounded-2xl py-4 items-center mb-4"
                onPress={handleConfirmPayment}
                disabled={loading}
                activeOpacity={0.8}
                style={loading ? { opacity: 0.6 } : undefined}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Confirm Payment ${parseFloat(amount || "0").toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel */}
          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="text-muted font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
