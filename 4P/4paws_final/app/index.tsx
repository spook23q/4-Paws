import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AnimatedCat } from "@/components/animated-cat";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const colors = useColors();
  const colorScheme = useColorScheme();

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

  // Use black text logo for light mode, beige text logo for dark mode
  const logoSource = colorScheme === "dark" 
    ? require("@/assets/images/4paws-logo.png")
    : require("@/assets/images/4paws-logo-light.png");

  return (
    <ScreenContainer className="items-center justify-center bg-background px-6">
      <View className="flex-1 items-center justify-center w-full">
        {/* Animated Kitten Playing with Yarn */}
        <View className="items-center mb-4">
          <AnimatedCat size={220} />
        </View>

        {/* Logo */}
        <View className="items-center mb-4">
          <Image
            source={logoSource}
            style={{ width: 380, height: 160 }}
            resizeMode="contain"
          />
        </View>

        {/* Slogan */}
        <View className="items-center mb-12">
          <Text style={{ 
            fontSize: 18, 
            color: colors.foreground, 
            textAlign: "center",
            fontStyle: "italic",
          }}>
            Paws & Peace of Mind — Cat Sitting Service
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          className="bg-primary px-8 py-4 rounded-full w-full max-w-xs mb-4"
          activeOpacity={0.8}
          onPress={() => router.push("/auth/role-selection" as any)}
        >
          <Text className="text-white text-center font-semibold text-lg">Get Started</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity onPress={() => router.push("/auth/sign-in" as any)}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
