import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// Mock sitter data - in production, fetch from API
const MOCK_SITTERS = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Sydney CBD",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 35,
    distance: "0.8 km",
  },
  {
    id: 2,
    name: "Mike Chen",
    location: "Surry Hills",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 32,
    distance: "1.2 km",
  },
  {
    id: 3,
    name: "Emma Davis",
    location: "Newtown",
    rating: 5.0,
    reviews: 156,
    hourlyRate: 38,
    distance: "2.1 km",
  },
  {
    id: 4,
    name: "James Wilson",
    location: "Bondi",
    rating: 4.7,
    reviews: 64,
    hourlyRate: 30,
    distance: "3.5 km",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    location: "Paddington",
    rating: 4.9,
    reviews: 203,
    hourlyRate: 40,
    distance: "1.8 km",
  },
];

export default function MapScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-foreground">Nearby Sitters</Text>
          <Text className="text-muted mt-1">Find cat sitters in your area</Text>
        </View>

        {/* Sitter List */}
        <View className="px-4 mt-2">
          {MOCK_SITTERS.map((sitter) => (
            <TouchableOpacity
              key={sitter.id}
              className="bg-surface rounded-xl p-4 mb-3 border border-border"
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/search",
                  params: { sitterId: sitter.id },
                } as any);
              }}
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">{sitter.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <IconSymbol name="house.fill" size={14} color={colors.muted} />
                    <Text className="text-sm text-muted ml-1">{sitter.location}</Text>
                    <Text className="text-sm text-muted ml-2">• {sitter.distance}</Text>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-sm text-yellow-500 font-semibold">★ {sitter.rating}</Text>
                    <Text className="text-sm text-muted ml-2">({sitter.reviews} reviews)</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-primary">${sitter.hourlyRate}</Text>
                  <Text className="text-xs text-muted">/hour</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Note */}
        <View className="mx-4 mt-4 p-4 bg-surface rounded-xl border border-border">
          <Text className="text-sm text-muted text-center">
            Map view with location-based search will be available in a future update.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
