import { ScrollView, Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
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
import { trpc } from "@/lib/trpc";
import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function HomeScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { isLandscape, isWide, heroImageSize, columns, contentMaxWidth } = useScreenLayout();

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 30000 }
  );
  const unreadCount = unreadData?.count ?? 0;

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
      headerRight: user
        ? () => (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notifications" as any)}
              style={homeStyles.bellButton}
              activeOpacity={0.7}
            >
              <IconSymbol
                size={24}
                name={unreadCount > 0 ? "bell.badge.fill" : "bell.fill"}
                color={unreadCount > 0 ? colors.primary : colors.foreground}
              />
              {unreadCount > 0 && (
                <View
                  style={[
                    homeStyles.badge,
                    { backgroundColor: colors.error },
                  ]}
                >
                  <Text style={homeStyles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [navigation, colors.foreground, colors.primary, colors.error, user, unreadCount]);

  // Sitter stats query
  const { data: sitterStats } = trpc.profiles.getSitterProfile.useQuery(
    { userId: user?.id },
    { enabled: !!user && user.role === "sitter" }
  );

  // Compliance documents query for sitters
  const { data: complianceDocs } = trpc.compliance.list.useQuery(
    undefined,
    { enabled: !!user && user.role === "sitter" }
  );

  const ownerQuickActions = [
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
      icon: "creditcard.fill" as const,
      title: "Payments",
      description: "View payment history and pending payments",
      route: "/(tabs)/payments" as any,
    },
    {
      icon: "message.fill" as const,
      title: "Messages",
      description: "Chat with your sitters",
      route: "/(tabs)/messages" as any,
    },
  ];

  const sitterQuickActions = [
    {
      icon: "calendar" as const,
      title: "Booking Requests",
      description: "View and respond to new booking requests",
      route: "/(tabs)/bookings" as any,
    },
    {
      icon: "calendar.badge.clock" as const,
      title: "My Availability",
      description: "Update your available dates and times",
      route: "/profile/my-availability" as any,
    },
    {
      icon: "message.fill" as const,
      title: "Messages",
      description: "Chat with cat owners",
      route: "/(tabs)/messages" as any,
    },
    {
      icon: "person.fill" as const,
      title: "Edit Sitter Profile",
      description: "Update your bio, pricing, and skills",
      route: "/profile/sitter-profile" as any,
    },
  ];

  const quickActions = user?.role === "owner" ? ownerQuickActions : sitterQuickActions;

  // Use available logo file
  const logoSource = require("@/assets/images/4paws-logo.png");

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingVertical: isLandscape ? 16 : 32, alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || "100%" }}>

          {/* Hero Section - Landscape: side-by-side, Portrait: stacked */}
          {isLandscape ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 20 }}>
              <AnimatedCat size={heroImageSize} />
              <View style={{ flex: 1, alignItems: "center" }}>
                <Image
                  source={logoSource}
                  style={{ width: 280, height: 100 }}
                  resizeMode="contain"
                />
                <Text style={{
                  fontSize: 14,
                  color: colors.muted,
                  textAlign: "center",
                  fontStyle: "italic",
                  marginTop: 8,
                }}>
                  Paws & Peace of Mind — Cats Only
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#1A233220', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: '#2C3E50', fontWeight: '600' }}>Geo-fence Active — Sydney Metro</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              {/* Animated Kitten Playing with Yarn */}
              <View className="items-center mb-4">
                <AnimatedCat size={heroImageSize} />
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
                  Paws & Peace of Mind — Cats Only
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#1A233220', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: '#2C3E50', fontWeight: '600' }}>Geo-fence Active — Sydney Metro</Text>
                </View>
              </View>
            </>
          )}

          {/* Welcome Message */}
          {user ? (
            <View className="bg-surface rounded-2xl p-5 mb-6 border-2" style={{ borderColor: colors.primary }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 8 }}>
                Welcome back, {user.name}!
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted }}>
                {user.role === "owner"
                  ? "Find the perfect cat sitter for your furry friend"
                  : "Manage your bookings and grow your sitting business"}
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

          {/* Quick Actions - 2 columns in landscape/wide, 1 column in portrait */}
          {user && (
            <View className="mb-6">
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
                Quick Actions
              </Text>
              <View style={columns === 2 ? { flexDirection: "row", flexWrap: "wrap", gap: 12 } : undefined}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-surface rounded-2xl p-5 border"
                    style={[
                      { borderColor: colors.border },
                      columns === 2
                        ? { width: "48.5%", marginBottom: 0 }
                        : { marginBottom: 12 },
                    ]}
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
            </View>
          )}

          {/* Sitter Dashboard Stats */}
          {user && user.role === "sitter" && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
                Your Dashboard
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: colors.primary }}>
                    {sitterStats?.totalBookings ?? 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4, textAlign: "center" }}>Total Bookings</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: colors.warning }}>
                    {sitterStats?.averageRating ? Number(sitterStats.averageRating).toFixed(1) : "—"}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4, textAlign: "center" }}>Avg Rating</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: colors.success }}>
                    {sitterStats?.totalReviews ?? 0}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4, textAlign: "center" }}>Reviews</Text>
                </View>
              </View>

              {/* Compliance Status */}
              <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginTop: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <IconSymbol name="shield.fill" size={18} color={colors.primary} />
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginLeft: 8 }}>Compliance Status</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Work Rights</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Terms Agreed</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Verified Sitter</Text>
                  </View>
                </View>

                {/* Upload Documents Quick Action */}
                <TouchableOpacity
                  style={{ backgroundColor: `${colors.primary}10`, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.primary, marginTop: 12, flexDirection: "row", alignItems: "center" }}
                  onPress={() => router.push("/profile/compliance-documents" as any)}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <IconSymbol name="camera.fill" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>Compliance Documents</Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Upload WWCC, certificates & qualifications</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Features — only show for owners and guests */}
          {(!user || user.role === "owner") && (
          <View className="mb-6">
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
              Why Choose 4 Paws?
            </Text>

            {/* In landscape/wide, show feature cards in 2-column grid */}
            <View style={isWide ? { flexDirection: "row", flexWrap: "wrap", gap: 12 } : undefined}>
              <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
                <View className="flex-row items-start mb-3">
                  <IconSymbol name="shield.fill" size={24} color={colors.success} />
                  <View className="flex-1 ml-3">
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                      Verified & Checked Sitters
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                      Every sitter on 4 Paws is thoroughly vetted and verified by our team. We check identity, qualifications, references, and work rights before any sitter can accept bookings.
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4, marginLeft: 36 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Identity Verified</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Work Rights Confirmed</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>References Checked</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${colors.success}15`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color={colors.success} />
                    <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginLeft: 4 }}>Qualifications Reviewed</Text>
                  </View>
                </View>
              </View>

              <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
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

              <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
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
                className="bg-secondary/20 rounded-2xl p-5 border"
                style={[{ borderColor: "#5DADE240" }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginTop: 0 }]}
                onPress={() => router.push("/what-makes-us-better" as any)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: "#5DADE220" }}
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
          </View>
          )}

          {/* Pricing & Fees Section - Owners */}
          {(!user || user.role === "owner") && (
          <View className="mb-6">
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
              Pricing & Fees
            </Text>
            <View className="bg-surface rounded-2xl p-5 border" style={{ borderColor: colors.border }}>
              {/* Booking Fee */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: colors.primary }}>$3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>Booking Fee</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>$3 per booking · No monthly or annual fees</Text>
                </View>
              </View>

              {/* Sitter Rates */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <IconSymbol name="house.fill" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>Sitter Rates</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Each sitter sets their own daily rate · Prices shown on sitter profiles</Text>
                </View>
              </View>

              {/* Payment Methods */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <IconSymbol name="creditcard.fill" size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>Payment Options</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Visa, Mastercard, Amex, Apple Pay, Google Pay via Stripe</Text>
                </View>
              </View>

              {/* Secure Payments */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.success}15`, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <IconSymbol name="lock.fill" size={22} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 2 }}>Secure Payments</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>All transactions encrypted and processed securely by Stripe</Text>
                </View>
              </View>
            </View>

            {/* View Payments Button */}
            {user && (
              <TouchableOpacity
                style={{ backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                onPress={() => router.push("/(tabs)/payments" as any)}
                activeOpacity={0.8}
              >
                <IconSymbol name="creditcard.fill" size={18} color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: 15, marginLeft: 8 }}>View My Payments</Text>
              </TouchableOpacity>
            )}
          </View>
          )}

          {/* Sitter Tips & Resources */}
          {user && user.role === "sitter" && (
            <View className="mb-6">
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
                Sitter Resources
              </Text>
              <View style={isWide ? { flexDirection: "row", flexWrap: "wrap", gap: 12 } : undefined}>
                <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
                  <View className="flex-row items-start mb-3">
                    <IconSymbol name="checkmark.seal.fill" size={24} color={colors.primary} />
                    <View className="flex-1 ml-3">
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                        Build Your Reputation
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                        Complete your profile, respond quickly to requests, and provide excellent care to earn 5-star reviews
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
                  <View className="flex-row items-start mb-3">
                    <IconSymbol name="shield.fill" size={24} color={colors.primary} />
                    <View className="flex-1 ml-3">
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                        Stay Compliant
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                        Keep your qualifications and certifications up to date. Expired documents may pause your account.
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="bg-surface rounded-2xl p-5 border" style={[{ borderColor: colors.border }, isWide ? { width: "48.5%", marginBottom: 0 } : { marginBottom: 12 }]}>
                  <View className="flex-row items-start mb-3">
                    <IconSymbol name="creditcard.fill" size={24} color={colors.primary} />
                    <View className="flex-1 ml-3">
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                        Get Paid Securely
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>
                        Payments are processed securely through the platform. You'll receive payment after each completed booking.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

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

const homeStyles = StyleSheet.create({
  bellButton: {
    marginRight: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
