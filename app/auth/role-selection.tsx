import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function RoleSelectionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isLandscape, isWide, contentMaxWidth } = useScreenLayout();

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingVertical: isLandscape ? 16 : 32, alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || "100%" }}>
          <Text className="text-3xl font-bold text-foreground text-center mb-4">
            Join 4 Paws
          </Text>
          <Text className="text-base text-muted text-center mb-8">
            Are you looking for a cat sitter, or do you want to become one?
          </Text>

          {/* Role cards - side by side in landscape, stacked in portrait */}
          <View style={isWide ? { flexDirection: "row", gap: 16, marginBottom: 16 } : undefined}>
            {/* Cat Owner Option */}
            <TouchableOpacity
              className="bg-surface border-2 border-border rounded-2xl p-6"
              style={isWide ? { flex: 1 } : { marginBottom: 16 }}
              activeOpacity={0.7}
              onPress={() => router.push("/auth/sign-up?role=owner" as any)}
            >
              <View className="items-center">
                <View
                  className="rounded-full p-4 mb-3"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <IconSymbol name="house.fill" size={40} color={colors.primary} />
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">I'm a Cat Owner</Text>
                <Text className="text-sm text-muted text-center mb-3">
                  Cats Only. Purrfessional.
                </Text>
                {/* $3 Per Booking Fee Badge */}
                <View
                  style={{
                    backgroundColor: `${colors.success}15`,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: `${colors.success}30`,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.success, textAlign: "center" }}>
                    It's only $3 per booking
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 2 }}>
                    No registration fees · No hidden costs
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Cat Sitter Option */}
            <TouchableOpacity
              className="bg-surface border-2 border-border rounded-2xl p-6"
              style={isWide ? { flex: 1 } : { marginBottom: 24 }}
              activeOpacity={0.7}
              onPress={() => router.push("/auth/sign-up?role=sitter" as any)}
            >
              <View className="items-center">
                <View
                  className="rounded-full p-4 mb-3"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <IconSymbol name="paperplane.fill" size={40} color={colors.primary} />
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">I'm a Cat Sitter</Text>
                <Text className="text-sm text-muted text-center mb-3">
                  Offer your cat sitting services and earn money
                </Text>
                <View
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: `${colors.primary}20`,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary, textAlign: "center" }}>
                    Free to register
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 2 }}>
                    Set your own rates · Get paid via Stripe
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pricing Summary */}
          <View
            className="rounded-2xl p-5 mb-6 border"
            style={{ backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }}
          >
            <View className="flex-row items-center mb-3">
              <IconSymbol name="creditcard.fill" size={18} color={colors.primary} />
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, marginLeft: 8 }}>
                Transparent Pricing
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <View className="flex-row items-start">
                <Text style={{ fontSize: 13, color: colors.success, fontWeight: "600", width: 80 }}>Owners</Text>
                <Text style={{ fontSize: 13, color: colors.muted, flex: 1 }}>
                  $3 per booking + sitter's daily rate
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600", width: 80 }}>Sitters</Text>
                <Text style={{ fontSize: 13, color: colors.muted, flex: 1 }}>
                  Free to join · Set your own rates · Earn from every booking
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <IconSymbol name="lock.fill" size={12} color={colors.muted} />
                <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 6 }}>
                  All payments secured by Stripe
                </Text>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            className="mt-2"
            onPress={() => router.back()}
          >
            <Text className="text-muted text-center">
              <Text className="text-primary font-semibold">← Back</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
