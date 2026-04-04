import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import * as Haptics from "expo-haptics";

import { useScreenLayout } from "@/hooks/use-screen-layout";

type BookingStep = "details" | "payment" | "confirming";

export default function BookingRequestScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();
  const { sitterId } = useLocalSearchParams<{ sitterId: string }>();

  // Fetch sitter details
  const { data: sitter } = trpc.sitters.getById.useQuery(
    { userId: sitterId || "" },
    { enabled: !!sitterId }
  );

  // Fetch owner's cats
  const { data: cats } = trpc.profiles.getCats.useQuery(undefined, {
    enabled: !!user && user.role === "owner",
  });

  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visitType, setVisitType] = useState<"overnight" | "daily">("overnight");
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  // Payment state
  const [step, setStep] = useState<BookingStep>("details");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Mutations
  const createBookingMutation = trpc.bookings.create.useMutation();
  const createBookingFeeIntent = trpc.stripe.createBookingFeeIntent.useMutation();
  const confirmBookingFee = trpc.stripe.confirmBookingFee.useMutation();

  // Calculate total price (sitter rate only)
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !sitter) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 0;

    const pricePerUnit = visitType === "overnight" ? sitter.pricePerNight : sitter.pricePerDay;
    return pricePerUnit * diffDays;
  };

  const totalPrice = calculateTotalPrice();
  const bookingFee = 3; // $3 per booking
  const totalWithFee = totalPrice + bookingFee;

  const validateForm = (): boolean => {
    if (!startDate) {
      Alert.alert("Error", "Please select a start date");
      return false;
    }
    if (!endDate) {
      Alert.alert("Error", "Please select an end date");
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      Alert.alert("Error", "End date must be after start date");
      return false;
    }
    if (selectedCatIds.length === 0) {
      Alert.alert("Error", "Please select at least one cat");
      return false;
    }
    return true;
  };

  // Step 1: Validate form and create $3 payment intent
  const handleProceedToPayment = async () => {
    if (!validateForm() || !sitter) return;

    setLoading(true);
    try {
      const result = await createBookingFeeIntent.mutateAsync({
        sitterId: sitterId || "",
        sitterName: sitter.userName,
      });

      setPaymentIntentId(result.paymentIntentId);
      setClientSecret(result.clientSecret);
      setStep("payment");

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error: any) {
      Alert.alert(
        "Payment Error",
        error.message || "Failed to initialise payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm payment and create booking
  const handleConfirmPayment = async () => {
    if (!paymentIntentId || !sitter) return;

    setStep("confirming");
    setLoading(true);

    try {
      // Confirm the $3 booking fee payment
      await confirmBookingFee.mutateAsync({
        paymentIntentId,
      });

      // Now create the booking with the fee payment ID
      await createBookingMutation.mutateAsync({
        sitterId: sitterId || "",
        startDate,
        endDate,
        startTime: visitType === "overnight" ? "18:00" : "09:00",
        endTime: visitType === "overnight" ? "10:00" : "17:00",
        catIds: selectedCatIds,
        specialInstructions: specialInstructions.trim(),
        totalPrice,
        bookingFeePaymentId: paymentIntentId || undefined,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Booking Submitted!",
        `Your $3.00 booking fee has been processed and your request has been sent to ${sitter.userName}. They will review and respond soon.`,
        [
          {
            text: "View Bookings",
            onPress: () => router.push("/(tabs)/bookings" as any),
          },
        ]
      );
    } catch (error: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert(
        "Error",
        error.message || "Failed to complete booking. Your payment may have been processed — please check your bookings."
      );
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const toggleCatSelection = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId));
    } else {
      setSelectedCatIds([...selectedCatIds, catId]);
    }
  };

  if (!user || user.role !== "owner") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Owner Account Required
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            Only cat owners can request bookings
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

  if (!sitter) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading sitter details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // ==========================================
  // Payment Confirmation Step
  // ==========================================
  if (step === "payment" || step === "confirming") {
    return (
      <ScreenContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => {
                  if (step !== "confirming") setStep("details");
                }}
                activeOpacity={0.7}
                disabled={step === "confirming"}
              >
                <IconSymbol name="chevron.left" size={24} color={step === "confirming" ? colors.muted : colors.primary} />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-foreground ml-4">
                Pay Booking Fee
              </Text>
            </View>

            {/* Step Indicator */}
            <View className="flex-row items-center mb-8">
              <View className="flex-row items-center">
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                  <IconSymbol name="checkmark" size={16} color="white" />
                </View>
                <Text className="text-sm font-semibold text-primary ml-2">Details</Text>
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: colors.primary, marginHorizontal: 8 }} />
              <View className="flex-row items-center">
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>2</Text>
                </View>
                <Text className="text-sm font-semibold text-primary ml-2">Payment</Text>
              </View>
            </View>

            {/* Booking Summary */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                Booking Summary
              </Text>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-muted">Sitter</Text>
                <Text className="text-base font-semibold text-foreground">{sitter.userName}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-muted">Visit Type</Text>
                <Text className="text-base font-semibold text-foreground capitalize">{visitType}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-muted">Dates</Text>
                <Text className="text-base font-semibold text-foreground">{startDate} → {endDate}</Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base text-muted">Cats</Text>
                <Text className="text-base font-semibold text-foreground">{selectedCatIds.length} selected</Text>
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 }}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base text-muted">Sitter Rate</Text>
                  <Text className="text-base font-semibold text-foreground">${totalPrice.toFixed(2)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-muted">Total Estimated</Text>
                  <Text className="text-lg font-bold text-foreground">${totalWithFee.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* $3 Booking Fee Card */}
            <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 2, borderColor: `${colors.primary}30` }}>
              <View className="flex-row items-center mb-3">
                <IconSymbol name="creditcard.fill" size={24} color={colors.primary} />
                <Text className="text-lg font-bold text-foreground ml-3">
                  Booking Fee
                </Text>
              </View>
              <Text className="text-sm text-muted mb-4 leading-relaxed">
                A $3.00 booking fee is charged when you submit a booking request. This covers platform services, insurance, and customer support.
              </Text>
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text className="text-base font-semibold text-foreground">Amount Due Now</Text>
                <Text style={{ fontSize: 28, fontWeight: "800", color: colors.primary }}>$3.00</Text>
              </View>
              <Text className="text-xs text-muted mt-3 text-center">
                The sitter's rate (${totalPrice.toFixed(2)}) is paid separately after the sitter accepts your booking.
              </Text>
            </View>

            {/* Payment Method */}
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
                    Visa, Mastercard, Amex • Secured by Stripe
                  </Text>
                </View>
                <IconSymbol name="lock.fill" size={18} color={colors.success} />
              </View>
            </View>

            {/* Security Notice */}
            <View style={{ backgroundColor: `${colors.success}15`, borderRadius: 16, padding: 16, marginBottom: 24, flexDirection: "row", alignItems: "flex-start" }}>
              <IconSymbol name="lock.fill" size={20} color={colors.success} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Secure Payment
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  Your payment is encrypted and processed securely by Stripe. We never store your card details.
                </Text>
              </View>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center mb-4"
              onPress={handleConfirmPayment}
              disabled={loading || step === "confirming"}
              activeOpacity={0.8}
              style={loading ? { opacity: 0.6 } : undefined}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-bold text-lg ml-3">
                    {step === "confirming" ? "Processing..." : "Please wait..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">
                  Pay $3.00 & Submit Booking
                </Text>
              )}
            </TouchableOpacity>

            {/* Back Button */}
            {step !== "confirming" && (
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => setStep("details")}
                activeOpacity={0.7}
              >
                <Text className="text-muted font-semibold">Back to Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ==========================================
  // Booking Details Step (default)
  // ==========================================
  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground ml-4">
              Request Booking
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="flex-row items-center mb-8">
            <View className="flex-row items-center">
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>1</Text>
              </View>
              <Text className="text-sm font-semibold text-primary ml-2">Details</Text>
            </View>
            <View style={{ flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 8 }} />
            <View className="flex-row items-center">
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.muted, fontWeight: "700", fontSize: 13 }}>2</Text>
              </View>
              <Text className="text-sm text-muted ml-2">Payment</Text>
            </View>
          </View>

          {/* Sitter Info */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-2">
              {sitter.userName}
            </Text>
            <Text className="text-base text-muted mb-1">{sitter.suburb}</Text>
            <View className="flex-row items-center">
              <IconSymbol name="star.fill" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-1">
                {sitter.averageRating > 0 ? sitter.averageRating.toFixed(1) : "New"}
              </Text>
            </View>
          </View>

          {/* Visit Type */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Visit Type</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 items-center border-2 ${
                  visitType === "overnight"
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
                onPress={() => setVisitType("overnight")}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-semibold ${
                    visitType === "overnight" ? "text-white" : "text-foreground"
                  }`}
                >
                  Overnight
                </Text>
                <Text
                  className={`text-sm ${
                    visitType === "overnight" ? "text-white/80" : "text-muted"
                  }`}
                >
                  ${sitter.pricePerNight}/night
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 items-center border-2 ${
                  visitType === "daily"
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
                onPress={() => setVisitType("daily")}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-semibold ${
                    visitType === "daily" ? "text-white" : "text-foreground"
                  }`}
                >
                  Daily Visits
                </Text>
                <Text
                  className={`text-sm ${
                    visitType === "daily" ? "text-white/80" : "text-muted"
                  }`}
                >
                  ${sitter.pricePerDay}/day
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dates */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Dates</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">Start Date *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#1F2937"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text className="text-sm font-semibold text-foreground mb-2">End Date *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#1F2937"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>

          {/* Select Cats */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Select Cats *</Text>

            {cats && cats.length > 0 ? (
              <View className="space-y-3">
                {cats.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`rounded-xl p-4 border-2 ${
                      selectedCatIds.includes(cat.id.toString())
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border"
                    }`}
                    onPress={() => toggleCatSelection(cat.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {cat.name}
                        </Text>
                        <Text className="text-sm text-muted">
                          {cat.age} years old • {cat.temperament}
                        </Text>
                      </View>
                      {selectedCatIds.includes(cat.id.toString()) && (
                        <IconSymbol
                          name="checkmark.seal.fill"
                          size={24}
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center py-6">
                <Text className="text-base text-muted text-center mb-4">
                  You haven't added any cats yet
                </Text>
                <TouchableOpacity
                  className="bg-primary px-6 py-3 rounded-xl"
                  onPress={() => router.push("/profile/add-cat" as any)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold">Add Your First Cat</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Special Instructions */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">
              Special Instructions
            </Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Any special requirements or notes for the sitter..."
              placeholderTextColor="#1F2937"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text className="text-xs text-muted mt-1">
              {specialInstructions.length}/500 characters
            </Text>
          </View>

          {/* Price Summary */}
          <View className="bg-primary/10 rounded-2xl p-5 mb-2 border-2 border-primary/20">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Visit Type</Text>
              <Text className="text-base font-semibold text-foreground capitalize">
                {visitType}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Price per {visitType === "overnight" ? "night" : "day"}</Text>
              <Text className="text-base font-semibold text-foreground">
                ${visitType === "overnight" ? sitter.pricePerNight : sitter.pricePerDay}
              </Text>
            </View>
            {startDate && endDate && (
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base text-foreground">Duration</Text>
                <Text className="text-base font-semibold text-foreground">
                  {Math.ceil(
                    Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  {visitType === "overnight" ? "nights" : "days"}
                </Text>
              </View>
            )}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base text-foreground">Booking Fee</Text>
              <Text className="text-base font-semibold text-foreground">$3.00</Text>
            </View>
            <View className="border-t border-primary/20 mt-3 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">Total</Text>
                <Text className="text-3xl font-bold text-primary">${totalWithFee.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Booking Fee Note */}
          <Text className="text-xs text-muted text-center mb-6">
            $3.00 booking fee is charged now. Sitter rate is paid after the sitter accepts.
          </Text>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-6"
            onPress={handleProceedToPayment}
            disabled={loading || !cats || cats.length === 0}
            activeOpacity={0.8}
            style={loading ? { opacity: 0.6 } : undefined}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-lg ml-3">Preparing Payment...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">
                Continue to Payment ($3.00)
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
