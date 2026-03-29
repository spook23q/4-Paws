import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <ScreenContainer className="px-6 justify-center">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-foreground text-center mb-4">
          Join 4 Paws
        </Text>
        <Text className="text-base text-muted text-center mb-12">
          Are you looking for a cat sitter, or do you want to become one?
        </Text>

        {/* Cat Owner Option */}
        <TouchableOpacity
          className="bg-surface border-2 border-border rounded-2xl p-6 mb-4"
          activeOpacity={0.7}
          onPress={() => router.push("/auth/sign-up?role=owner" as any)}
        >
          <View className="items-center">
            <View className="bg-secondary rounded-full p-4 mb-3">
              <IconSymbol name="house.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-xl font-bold text-foreground mb-2">I'm a Cat Owner</Text>
            <Text className="text-sm text-muted text-center">
              Find trusted cat sitters in your area
            </Text>
          </View>
        </TouchableOpacity>

        {/* Cat Sitter Option */}
        <TouchableOpacity
          className="bg-surface border-2 border-border rounded-2xl p-6"
          activeOpacity={0.7}
          onPress={() => router.push("/auth/sign-up?role=sitter" as any)}
        >
          <View className="items-center">
            <View className="bg-secondary rounded-full p-4 mb-3">
              <IconSymbol name="paperplane.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-xl font-bold text-foreground mb-2">I'm a Cat Sitter</Text>
            <Text className="text-sm text-muted text-center">
              Offer your cat sitting services and earn money
            </Text>
          </View>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          className="mt-8"
          onPress={() => router.back()}
        >
          <Text className="text-muted text-center">
            <Text className="text-primary font-semibold">← Back</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
