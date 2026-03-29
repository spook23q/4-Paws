import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";

export default function AddressScreen() {
  const colors = useColors();
  const [streetAddress, setStreetAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("Australia");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current address
  const { data: currentAddress } = trpc.profiles.getAddress.useQuery();

  // Update address mutation
  const updateAddressMutation = trpc.profiles.updateAddress.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Address updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update address");
    },
  });

  // Load current address
  useEffect(() => {
    if (currentAddress) {
      setStreetAddress(currentAddress.streetAddress || "");
      setSuburb(currentAddress.suburb || "");
      setState(currentAddress.state || "");
      setPostcode(currentAddress.postcode || "");
      setCountry(currentAddress.country || "Australia");
    }
  }, [currentAddress]);

  const handleSaveAddress = async () => {
    if (!streetAddress.trim() || !suburb.trim() || !state.trim() || !postcode.trim()) {
      Alert.alert("Validation Error", "Please fill in all address fields");
      return;
    }

    setIsLoading(true);
    try {
      await updateAddressMutation.mutateAsync({
        streetAddress,
        suburb,
        state,
        postcode,
        country,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">My Address</Text>
        </View>

        {/* Info Card */}
        <View className="mx-6 mb-6 bg-primary/10 rounded-xl p-4 flex-row">
          <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
          <Text className="text-sm text-foreground ml-3 flex-1 leading-relaxed">
            Your address is used for geofencing and finding sitters nearby
          </Text>
        </View>

        {/* Address Form */}
        <View className="px-6 gap-4">
          {/* Street Address */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Street Address</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="123 Main Street"
              placeholderTextColor={colors.muted}
              value={streetAddress}
              onChangeText={setStreetAddress}
              editable={!isLoading}
            />
          </View>

          {/* Suburb */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Suburb</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="e.g., Bondi"
              placeholderTextColor={colors.muted}
              value={suburb}
              onChangeText={setSuburb}
              editable={!isLoading}
            />
          </View>

          {/* State and Postcode */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">State</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="NSW"
                placeholderTextColor={colors.muted}
                value={state}
                onChangeText={setState}
                maxLength={3}
                editable={!isLoading}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground mb-2">Postcode</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="2000"
                placeholderTextColor={colors.muted}
                value={postcode}
                onChangeText={setPostcode}
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Country */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Country</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Australia"
              placeholderTextColor={colors.muted}
              value={country}
              onChangeText={setCountry}
              editable={!isLoading}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mt-4"
            onPress={handleSaveAddress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              {isLoading ? "Saving..." : "Save Address"}
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text className="text-xs text-muted text-center mt-4 mb-8">
            Geolocation will be automatically calculated from your address
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
