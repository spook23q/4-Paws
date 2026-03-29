import { TouchableOpacity, StyleSheet, Platform, Text } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function FloatingChatButton() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const scale = useSharedValue(1);

  // All hooks must be called before any conditional returns
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Hide button on PawsBot screen itself
  const isPawsBotScreen = pathname?.includes("chatbot") || pathname?.includes("pawsbot");
  
  // Hide on auth screens
  const isAuthScreen = pathname?.includes("auth") || pathname?.includes("sign-in") || pathname?.includes("sign-up") || pathname?.includes("forgot-password");
  
  // Hide on welcome screen and oauth
  const isWelcomeScreen = pathname === "/" || pathname === "" || pathname?.includes("oauth");

  // Return null AFTER all hooks are called
  if (isPawsBotScreen || isAuthScreen || isWelcomeScreen) {
    return null;
  }

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/(tabs)/chatbot" as any);
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  // Position above tab bar
  const bottomOffset = Platform.OS === "web" ? 80 : Math.max(insets.bottom, 8) + 70;

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        animatedStyle,
        {
          bottom: bottomOffset,
          backgroundColor: "#10B981",
          shadowColor: "#10B981",
        },
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text className="text-2xl">💬</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
