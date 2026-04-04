import { ScrollView, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { Stack, router } from "expo-router";
import { GeofencingDemo } from "@/components/geofencing-demo";
import { NotificationPreview } from "@/components/notification-preview";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

import { useScreenLayout } from "@/hooks/use-screen-layout";

const { width: screenWidth } = Dimensions.get("window");
const imageSize = Math.min(screenWidth * 0.4, 160); // 40% of screen width, max 160px
const demoSize = Math.min(screenWidth - 48, 300); // Demo size with padding

export default function WhatMakesUsBetterScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          title: "What Makes Us Better",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8 gap-6">
          {/* Hero Section with Image */}
          <View className="items-center gap-4">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: imageSize, height: imageSize }}
              contentFit="contain"
            />
            <Text className="text-2xl font-bold text-foreground text-center">
              Peace of Mind for You and Your Furry One
            </Text>
            <Text className="text-base text-muted leading-relaxed text-center">
              Introducing Our Groundbreaking Geofencing Technology
            </Text>
          </View>

          {/* Interactive Demo Section */}
          <View className="items-center gap-3">
            <Text className="text-lg font-semibold text-foreground">
              See How It Works
            </Text>
            <GeofencingDemo size={demoSize} />
            <Text className="text-sm text-muted text-center px-4">
              Watch how our geofencing creates a safe zone around your home, 
              tracks your cat's location, and verifies sitter presence in real-time.
            </Text>
          </View>

          {/* Setup Guide CTA */}
          <TouchableOpacity
            className="bg-primary/10 rounded-2xl p-5 border border-primary/30"
            onPress={() => router.push("/geofence-setup" as any)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-4">
              <View 
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text style={{ fontSize: 28 }}>📖</Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                  How to Set Up Your Geofence
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  Step-by-step guide to configure your safe zones
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Introduction */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <Text className="text-base text-foreground leading-relaxed">
              At 4 PAWS, we understand that leaving your beloved cat in the care of a sitter requires an immense amount of trust. That's why we are proud to be the first in the country to introduce a revolutionary geofencing feature, providing an unprecedented layer of security and peace of mind for you and your furry family member.
            </Text>
          </View>

          {/* Feature 1: Sitter Verification */}
          <View className="bg-secondary/20 rounded-2xl p-5 border border-secondary/30">
            <Text className="text-lg font-semibold text-foreground mb-3">
              🔒 Unparalleled Sitter Verification
            </Text>
            <Text className="text-base text-foreground leading-relaxed">
              Our advanced geofencing technology, powered by real-time geolocation, creates a virtual perimeter around your home. This allows us to verify with certainty that your cat sitter is present at your home for the duration of the scheduled visit. You can rest assured knowing that your cat is receiving the dedicated care and attention it deserves.
            </Text>
          </View>

          {/* Feature 2: Backup Support */}
          <View className="bg-secondary/20 rounded-2xl p-5 border border-secondary/30">
            <Text className="text-lg font-semibold text-foreground mb-3">
              🚨 Immediate Backup Support, Guaranteed
            </Text>
            <Text className="text-base text-foreground leading-relaxed">
              Life is unpredictable, and emergencies can happen. In the rare event that your primary sitter needs to leave unexpectedly or an unforeseen incident occurs, our system instantly alerts us. We will immediately dispatch a qualified backup sitter to your location, ensuring your precious companion is never left alone. Your cat's safety and well-being are our top priorities, and our geofencing technology enables us to provide uninterrupted care, no matter the circumstances.
            </Text>
          </View>

          {/* Feature 3: Safe Zones */}
          <View className="bg-secondary/20 rounded-2xl p-5 border border-secondary/30">
            <Text className="text-lg font-semibold text-foreground mb-3">
              🏠 Customizable Safe Zones for Your Cat
            </Text>
            <Text className="text-base text-foreground leading-relaxed">
              Our commitment to your cat's safety extends beyond sitter supervision. Our innovative geofencing feature allows you to define specific, approved zones within your home. You can create a virtual boundary that aligns with your cat's usual roaming areas, ensuring they stay within the safe and comfortable spaces you've designated. If your cat ever wanders beyond these boundaries, you and our team will be notified immediately, allowing for swift action to ensure their safety.
            </Text>
          </View>

          {/* Notification Preview Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground text-center">
              Real-Time Alert Notifications
            </Text>
            <Text className="text-sm text-muted text-center px-4 mb-2">
              See what alerts you'll receive when your geofence is triggered
            </Text>
            <NotificationPreview />
          </View>

          {/* Closing Statement */}
          <View className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
            <Text className="text-base text-foreground leading-relaxed font-medium text-center">
              With 4 PAWS, you can finally enjoy true peace of mind while you're away. Our pioneering geofencing technology offers a new standard of care in the pet-sitting industry, delivering unparalleled security, reliability, and a loving environment for your cherished cat.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
