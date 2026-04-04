import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
  color?: string;
}

export function LoadingSpinner({ 
  size = "medium", 
  message,
  color 
}: LoadingSpinnerProps) {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const spinnerColor = color || colors.primary;

  const dimensions = {
    small: { outer: 24, inner: 20, border: 2 },
    medium: { outer: 40, inner: 34, border: 3 },
    large: { outer: 60, inner: 52, border: 4 },
  };

  const { outer, inner, border } = dimensions[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={[
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            borderWidth: border,
            borderColor: colors.border,
            borderTopColor: spinnerColor,
            borderRightColor: spinnerColor,
          },
          animatedStyle,
        ]}
      />
      {message && (
        <Text 
          className="text-muted mt-3 text-center"
          style={{ fontSize: size === "small" ? 12 : size === "medium" ? 14 : 16 }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  const colors = useColors();
  
  return (
    <View 
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: `${colors.background}E6` }}
    >
      <View className="bg-surface rounded-2xl p-6 items-center shadow-lg border border-border">
        <LoadingSpinner size="large" />
        <Text className="text-foreground font-medium mt-4">{message}</Text>
      </View>
    </View>
  );
}

// Inline loading indicator for buttons
export function ButtonLoading({ color = "white" }: { color?: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: `${color}40`,
          borderTopColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// Paw print loading animation (themed for 4 Paws)
export function PawLoadingAnimation({ message }: { message?: string }) {
  const colors = useColors();
  const bounce1 = useSharedValue(0);
  const bounce2 = useSharedValue(0);
  const bounce3 = useSharedValue(0);

  useEffect(() => {
    // Staggered bounce animation
    bounce1.value = withRepeat(
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    setTimeout(() => {
      bounce2.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 150);
    
    setTimeout(() => {
      bounce3.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }, 300);
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce1.value * -10 }],
    opacity: 0.5 + bounce1.value * 0.5,
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce2.value * -10 }],
    opacity: 0.5 + bounce2.value * 0.5,
  }));

  const style3 = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce3.value * -10 }],
    opacity: 0.5 + bounce3.value * 0.5,
  }));

  const Paw = ({ style }: { style: any }) => (
    <Animated.Text
      style={[{ fontSize: 24, color: colors.primary }, style]}
    >
      🐾
    </Animated.Text>
  );

  return (
    <View className="items-center justify-center py-8">
      <View className="flex-row gap-2">
        <Paw style={style1} />
        <Paw style={style2} />
        <Paw style={style3} />
      </View>
      {message && (
        <Text className="text-muted mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}
