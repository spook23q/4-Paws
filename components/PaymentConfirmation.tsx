import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

interface PaymentConfirmationProps {
  bookingId: number;
  totalPrice: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export function PaymentConfirmation({
  bookingId,
  totalPrice,
  onPaymentComplete,
  onCancel,
}: PaymentConfirmationProps) {
  const colors = useColors();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const createPaymentMutation = trpc.stripe.createPaymentIntent.useMutation();

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);
      setPaymentStatus("processing");

      // Create payment intent
      const result = await createPaymentMutation.mutateAsync({
        bookingId,
      });

      // In a real implementation, you would:
      // 1. Present Stripe's payment sheet with result.clientSecret
      // 2. Wait for user to complete payment
      // 3. Stripe webhook would update booking status automatically

      // For now, simulate successful payment after a delay
      setTimeout(() => {
        setPaymentStatus("success");
        setIsProcessing(false);
        Alert.alert(
          "Payment Successful",
          "Your booking has been confirmed! The sitter will be notified.",
          [
            {
              text: "OK",
              onPress: onPaymentComplete,
            },
          ]
        );
      }, 2000);
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentStatus("error");
      Alert.alert(
        "Payment Failed",
        error?.message || "Unable to process payment. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View className="flex-1 bg-background p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Confirm Payment
        </Text>
        <Text className="text-base text-muted">
          Complete your booking by making a secure payment
        </Text>
      </View>

      {/* Payment Amount */}
      <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
        <Text className="text-sm text-muted mb-2">Total Amount</Text>
        <Text className="text-4xl font-bold text-primary">
          ${totalPrice.toFixed(2)}
        </Text>
        <Text className="text-sm text-muted mt-1">AUD</Text>
      </View>

      {/* Payment Info */}
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
        <Text className="text-sm text-foreground">
          💳 Your payment is secured by Stripe. We accept Visa and Mastercard.
        </Text>
      </View>

      {/* Payment Status */}
      {paymentStatus !== "idle" && (
        <View className="mb-6">
          {paymentStatus === "processing" && (
            <View className="flex-row items-center justify-center py-4">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="ml-3 text-base text-foreground">
                Processing payment...
              </Text>
            </View>
          )}
          {paymentStatus === "success" && (
            <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <Text className="text-base text-green-700 dark:text-green-300 text-center">
                ✓ Payment successful!
              </Text>
            </View>
          )}
          {paymentStatus === "error" && (
            <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <Text className="text-base text-red-700 dark:text-red-300 text-center">
                ✗ Payment failed. Please try again.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="gap-3 mb-6">
        <TouchableOpacity
          onPress={handlePayNow}
          disabled={isProcessing || paymentStatus === "success"}
          style={{
            backgroundColor: isProcessing || paymentStatus === "success" 
              ? colors.muted 
              : colors.primary,
            opacity: isProcessing || paymentStatus === "success" ? 0.6 : 1,
          }}
          className="py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">
            {isProcessing ? "Processing..." : "Pay Now"}
          </Text>
        </TouchableOpacity>

        {paymentStatus === "idle" && (
          <TouchableOpacity
            onPress={onCancel}
            className="py-4 rounded-full items-center border border-border"
          >
            <Text className="text-foreground text-lg font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Provider Logos */}
      <View className="items-center mt-auto pt-6 border-t border-border">
        <Text className="text-xs text-muted mb-3">Secured by</Text>
        <View className="flex-row items-center gap-4">
          <Image
            source={require("@/assets/images/payment/stripe-logo.png")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/images/payment/visa-mastercard.png")}
            style={{ width: 80, height: 26 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
