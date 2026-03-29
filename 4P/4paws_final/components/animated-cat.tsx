import React, { useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedCatProps {
  size?: number;
}

export function AnimatedCat({ size = 200 }: AnimatedCatProps) {
  // Animation values for a playful bouncing effect
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Gentle bouncing animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle scale pulsing
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Very subtle rotation
    rotate.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Animated.View style={[animatedStyle, { backgroundColor: "transparent" }]}>
        <Image
          source={require("@/assets/images/kitten-transparent.png")}
          style={{ width: size, height: size, backgroundColor: "transparent" }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </View>
  );
}
