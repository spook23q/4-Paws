import { View, Text } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useColors } from "@/hooks/use-colors";

interface AddressAutocompleteProps {
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  initialValue?: string;
}

export function AddressAutocomplete({
  onSelectAddress,
  placeholder = "Enter your address",
  initialValue = "",
}: AddressAutocompleteProps) {
  const colors = useColors();

  return (
    <View className="w-full">
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            onSelectAddress(data.description, lat, lng);
          }
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "",
          language: "en",
          components: "country:au", // Restrict to Australia
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
          },
          textInput: {
            height: 48,
            color: colors.foreground,
            fontSize: 16,
            backgroundColor: "transparent",
          },
          listView: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
          },
          row: {
            backgroundColor: colors.surface,
            padding: 13,
            minHeight: 44,
            flexDirection: "row",
          },
          separator: {
            height: 0.5,
            backgroundColor: colors.border,
          },
          description: {
            color: colors.foreground,
          },
          loader: {
            flexDirection: "row",
            justifyContent: "flex-end",
            height: 20,
          },
        }}
        textInputProps={{
          placeholderTextColor: colors.muted,
          defaultValue: initialValue,
        }}
      />
    </View>
  );
}
