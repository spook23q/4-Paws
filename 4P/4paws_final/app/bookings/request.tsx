import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function BookingRequestScreen() {
  const colors = useColors();
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

  // Mutation
  const createBookingMutation = trpc.bookings.create.useMutation();

  // Calculate total price
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

  const handleSubmit = async () => {
    // Validation
    if (!startDate) {
      Alert.alert("Error", "Please select a start date");
      return;
    }

    if (!endDate) {
      Alert.alert("Error", "Please select an end date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    if (selectedCatIds.length === 0) {
      Alert.alert("Error", "Please select at least one cat");
      return;
    }

    setLoading(true);

    try {
      await createBookingMutation.mutateAsync({
        sitterId: sitterId || "",
        startDate,
        endDate,
        startTime: visitType === "overnight" ? "18:00" : "09:00",
        endTime: visitType === "overnight" ? "10:00" : "17:00",
        catIds: selectedCatIds,
        specialInstructions: specialInstructions.trim(),
        totalPrice,
      });

      Alert.alert(
        "Success",
        "Booking request sent! The sitter will review your request and respond soon.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/bookings" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create booking request");
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
          <View className="bg-primary/10 rounded-2xl p-5 mb-6 border-2 border-primary/20">
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
            <View className="border-t border-primary/20 mt-3 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">Total</Text>
                <Text className="text-3xl font-bold text-primary">${totalPrice}</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-6"
            onPress={handleSubmit}
            disabled={loading || !cats || cats.length === 0}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Sending Request..." : "Send Booking Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
