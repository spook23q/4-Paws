import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/lib/auth-context";
import { router, useNavigation } from "expo-router";
import { HamburgerMenu } from "@/components/hamburger-menu";
import { useLayoutEffect } from "react";
import { AnimatedCat } from "@/components/animated-cat";

export default function HomeScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          className="ml-4 active:opacity-70"
        >
          <IconSymbol size={24} name="line.3.horizontal" color={colors.foreground} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.foreground]);

  const quickActions = user?.role === "owner"
    ? [
        {
          icon: "magnifyingglass" as const,
          title: "Find a Sitter",
          description: "Search for trusted cat sitters near you",
          route: "/(tabs)/search" as any,
        },
        {
          icon: "calendar" as const,
          title: "My Bookings",
          description: "View and manage your bookings",
          route: "/(tabs)/bookings" as any,
        },
        {
          icon: "message.fill" as const,
          title: "Messages",
          description: "Chat with your sitters",
          route: "/(tabs)/messages" as any,
        },
      ]
    : [
        {
          icon: "calendar" as const,
          title: "My Bookings",
          description: "View booking requests and confirmed sits",
          route: "/(tabs)/bookings" as any,
        },
        {
          icon: "message.fill" as const,
          title: "Messages",
          description: "Chat with cat owners",
          route: "/(tabs)/messages" as any,
        },
        {
          icon: "person.fill" as const,
          title: "My Profile",
          description: "Update your sitter profile",
          route: "/(tabs)/profile" as any,
        },
      ];

  // Use available logo file
  const logoSource = require("@/assets/images/4paws-logo.png");

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Animated Kitten Playing with Yarn */}
          <View className="items-center mb-4">
            <AnimatedCat size={220} />
          </View>

          {/* Hero Section - 4PAWS Logo */}
          <View className="items-center mb-8">
            <Image
              source={logoSource}
              style={{ width: 380, height: 160 }}
              resizeMode="contain"
            />
            <Text style={{ 
              fontSize: 16, 
              color: colors.muted, 
              textAlign: "center",
              fontStyle: "italic",
              marginTop: 12,
            }}>
              Paws & Peace of Mind — Cat Sitting Service
            </Text>
          </View>

          {/* Welcome Message */}
          {user ? (
            <View className="bg-surface rounded-2xl p-5 mb-6 border-2" style={{ borderColor: colors.primary }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
                Welcome back, {user.name}!
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted }}>
                {user.role === "owner"
                  ? "Find the perfect cat sitter for your furry friend"
                  : "Manage your bookings and connect with cat owners"}
              </Text>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl p-5 mb-6 border-2" style={{ borderColor: colors.primary }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 12, textAlign: "center" }}>
                Get Started Today
              </Text>
              <TouchableOpacity
                className="rounded-xl py-3 mb-3"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push("/auth/role-selection" as any)}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-center">Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-surface rounded-xl py-3 border-2"
                style={{ borderColor: colors.primary }}
                onPress={() => router.push("/auth/sign-in" as any)}
                activeOpacity={0.8}
              >
                <Text className="font-semibold text-center" style={{ color: colors.primary }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          {user && (
            <View className="mb-6">
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
                Quick Actions
              </Text>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-surface rounded-2xl p-5 mb-3 border"
                  style={{ borderColor: colors.border }}
                  onPress={() => router.push(action.route)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <IconSymbol name={action.icon} size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                        {action.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted }}>{action.description}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Features */}
          <View className="mb-6">
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
              Why Choose 4 Paws?
            </Text>
            <View className="bg-surface rounded-2xl p-5 mb-3 border" style={{ borderColor: colors.border }}>
              <View className="flex-row items-start mb-3">
                <IconSymbol name="shield.fill" size={24} color={colors.primary} />
                <View className="flex-1 ml-3">
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                    Verified Sitters
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                    All sitters undergo background checks and identity verification
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-surface rounded-2xl p-5 mb-3 border" style={{ borderColor: colors.border }}>
              <View className="flex-row items-start mb-3">
                <IconSymbol name="checkmark.seal.fill" size={24} color={colors.primary} />
                <View className="flex-1 ml-3">
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                    Fully Insured
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                    Every booking is covered by comprehensive insurance up to $20M
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-surface rounded-2xl p-5 border" style={{ borderColor: colors.border }}>
              <View className="flex-row items-start mb-3">
                <IconSymbol name="phone.fill" size={24} color={colors.primary} />
                <View className="flex-1 ml-3">
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                    24/7 Support
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                    Our emergency line is always available when you need help
                  </Text>
                </View>
              </View>
            </View>

            {/* What Makes Us Better Link */}
            <TouchableOpacity
              className="bg-secondary/20 rounded-2xl p-5 mt-3 border"
              style={{ borderColor: "#B8DDE8" }}
              onPress={() => router.push("/what-makes-us-better" as any)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: "#B8DDE840" }}
                >
                  <IconSymbol name="location.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                    What Makes Us Better
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    Discover our groundbreaking geofencing technology
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* CTA */}
          {!user && (
            <View className="bg-surface rounded-2xl p-6 items-center border-2" style={{ borderColor: colors.primary }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, textAlign: "center", marginBottom: 12 }}>
                Ready to find the perfect cat sitter?
              </Text>
              <TouchableOpacity
                className="rounded-xl px-8 py-3"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push("/auth/role-selection" as any)}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">Get Started</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <HamburgerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </ScreenContainer>
  );
}
