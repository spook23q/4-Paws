import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Stack, router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const SETUP_STEPS = [
  {
    step: 1,
    title: "Enable Location Services",
    description: "Go to your device settings and enable location services for the 4 Paws app. This allows us to create an accurate geofence around your home.",
    icon: "📍",
    tip: "For best accuracy, select 'Always Allow' for location access.",
  },
  {
    step: 2,
    title: "Set Your Home Address",
    description: "Navigate to Settings > My Home and enter your complete home address. Our system will automatically detect your location coordinates.",
    icon: "🏠",
    tip: "Double-check the address pin on the map to ensure accuracy.",
  },
  {
    step: 3,
    title: "Define Your Safe Zone Radius",
    description: "Choose the radius of your geofence perimeter. We recommend 50-100 meters for houses and 25-50 meters for apartments.",
    icon: "⭕",
    tip: "A larger radius reduces false alerts but may be less precise.",
  },
  {
    step: 4,
    title: "Add Indoor Safe Zones",
    description: "Optionally, define specific rooms where your cat is allowed. This helps track if your cat ventures into restricted areas like the kitchen or garage.",
    icon: "🚪",
    tip: "Requires indoor positioning beacons (sold separately).",
  },
  {
    step: 5,
    title: "Configure Alert Preferences",
    description: "Choose how you want to be notified when boundaries are crossed. Options include push notifications, SMS, email, or all three.",
    icon: "🔔",
    tip: "We recommend enabling push notifications for instant alerts.",
  },
  {
    step: 6,
    title: "Test Your Setup",
    description: "Use the 'Test Geofence' button to simulate a boundary crossing. This ensures your notifications are working correctly before your sitter arrives.",
    icon: "✅",
    tip: "Run a test before every booking for peace of mind.",
  },
];

export default function GeofenceSetupScreen() {
  const colors = useColors();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          title: "Geofence Setup Guide",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-6 gap-5">
          {/* Header */}
          <View className="items-center gap-3 mb-2">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text style={{ fontSize: 40 }}>🛡️</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground text-center">
              How to Set Up Your Geofence
            </Text>
            <Text className="text-base text-muted text-center px-4">
              Follow these simple steps to protect your cat with our advanced geofencing technology
            </Text>
          </View>

          {/* Time Estimate */}
          <View 
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl"
            style={{ backgroundColor: `${colors.success}15` }}
          >
            <IconSymbol name="clock.fill" size={18} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: "600" }}>
              Estimated setup time: 5 minutes
            </Text>
          </View>

          {/* Steps */}
          {SETUP_STEPS.map((item, index) => (
            <View 
              key={item.step}
              className="bg-surface rounded-2xl p-5 border border-border"
            >
              {/* Step Header */}
              <View className="flex-row items-center gap-3 mb-3">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold">{item.step}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, flex: 1 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>

              {/* Description */}
              <Text className="text-base text-foreground leading-relaxed mb-3">
                {item.description}
              </Text>

              {/* Tip Box */}
              <View 
                className="flex-row items-start gap-2 p-3 rounded-xl"
                style={{ backgroundColor: `${colors.warning}15` }}
              >
                <Text style={{ fontSize: 14 }}>💡</Text>
                <Text style={{ fontSize: 13, color: colors.foreground, flex: 1, lineHeight: 18 }}>
                  <Text style={{ fontWeight: "600" }}>Pro tip: </Text>
                  {item.tip}
                </Text>
              </View>

              {/* Connector Line (except last item) */}
              {index < SETUP_STEPS.length - 1 && (
                <View 
                  className="absolute -bottom-5 left-10 w-0.5 h-5"
                  style={{ backgroundColor: colors.border }}
                />
              )}
            </View>
          ))}

          {/* CTA Section */}
          <View className="bg-primary/10 rounded-2xl p-6 mt-2">
            <Text className="text-lg font-bold text-foreground text-center mb-3">
              Ready to Get Started?
            </Text>
            <Text className="text-sm text-muted text-center mb-4">
              Set up your geofence now and enjoy peace of mind during your next cat sitting booking.
            </Text>
            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={() => router.push("/(tabs)/profile" as any)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">Go to Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Help Link */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 py-3"
            onPress={() => router.push("/support" as any)}
            activeOpacity={0.7}
          >
            <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Need help? Contact support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
