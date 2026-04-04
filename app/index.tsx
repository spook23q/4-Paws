import { View, Text, TouchableOpacity, ScrollView, Image, Linking, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { AnimatedCat } from "@/components/animated-cat";
import { Logo } from "@/components/logo";
import { useScreenLayout } from "@/hooks/use-screen-layout";

// Store badge images
const googlePlayBadge = require("@/assets/images/google-play-badge.png");
const appStoreBadge = require("@/assets/images/app-store-badge.png");

// Store URLs — update these with your actual store listing URLs once published
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=space.manus.x4paws.t20260118223445";
const APP_STORE_URL = "https://apps.apple.com/app/4-paws/id6740043798";

function StoreBadges({ compact = false }: { compact?: boolean }) {
  const handleOpenStore = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const badgeHeight = compact ? 32 : 44;
  const badgeWidth = compact ? 108 : 135;

  return (
    <View style={styles.badgeRow}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOpenStore(APP_STORE_URL)}
        style={{ height: badgeHeight, width: badgeWidth }}
      >
        <Image
          source={appStoreBadge}
          style={{ width: badgeWidth, height: badgeHeight, borderRadius: 10 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOpenStore(GOOGLE_PLAY_URL)}
        style={{ height: badgeHeight, width: badgeWidth }}
      >
        <Image
          source={googlePlayBadge}
          style={{ width: badgeWidth, height: badgeHeight, borderRadius: 10 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const colors = useColors();
  const { isLandscape, heroImageSize } = useScreenLayout();

  // Redirect to main app if already signed in
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center bg-background">
        <Text className="text-foreground text-lg">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isLandscape ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 720, gap: 32 }}>
            {/* Left: Cat + Logo */}
            <View style={{ alignItems: "center", flex: 1 }}>
              <AnimatedCat size={heroImageSize} />
              <View style={{ marginTop: 8 }}>
                <Logo width={240} height={75} />
              </View>
              <Text style={[styles.tagline, { color: "#6B6B6B" }]}>
                Cats Only. Purrfessional.
              </Text>
            </View>

            {/* Right: Buttons */}
            <View style={{ alignItems: "center", flex: 1, gap: 12, maxWidth: 320 }}>
              <Text style={styles.getStartedLabel}>Get started</Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={() => router.push("/auth/role-selection?role=cat_owner" as any)}
              >
                <Text style={styles.primaryBtnText}>I'm a Cat Owner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={() => router.push("/auth/role-selection?role=cat_sitter" as any)}
              >
                <Text style={styles.secondaryBtnText}>I'm a Cat Sitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/auth/sign-in" as any)}
                style={{ minHeight: 44, justifyContent: "center" }}
              >
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>

              <StoreBadges compact />
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center", width: "100%", maxWidth: 480 }}>
            {/* Logo */}
            <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 4 }}>
              <Logo width={320} height={100} />
            </View>

            {/* Tagline */}
            <Text style={[styles.tagline, { color: "#6B6B6B", marginTop: 4 }]}>
              Australia's cats-only sitting service
            </Text>

            {/* Animated Cat */}
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <AnimatedCat size={heroImageSize} />
            </View>

            {/* CTA Section */}
            <View style={{ width: "100%", paddingHorizontal: 8, gap: 12 }}>
              <Text style={styles.getStartedLabel}>Get started</Text>

              {/* Primary CTA — dark navy, matching Base44 */}
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={() => router.push("/auth/role-selection?role=cat_owner" as any)}
              >
                <Text style={styles.primaryBtnText}>I'm a Cat Owner</Text>
              </TouchableOpacity>

              {/* Secondary CTA — outlined, matching Base44 */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={() => router.push("/auth/role-selection?role=cat_sitter" as any)}
              >
                <Text style={styles.secondaryBtnText}>I'm a Cat Sitter</Text>
              </TouchableOpacity>

              {/* Sign In — blue text, matching Base44 */}
              <TouchableOpacity
                onPress={() => router.push("/auth/sign-in" as any)}
                style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={styles.signInText}>
                  Already have an account? <Text style={styles.signInLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>

              {/* Store Badges */}
              <View style={{ alignItems: "center", paddingTop: 4 }}>
                <StoreBadges />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  getStartedLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 4,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#1A2332",
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: "transparent",
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#1A2332",
  },
  secondaryBtnText: {
    color: "#1A2332",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7F8C8D",
  },
  signInLink: {
    color: "#5DADE2",
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});
