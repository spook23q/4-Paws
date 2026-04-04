import React, { useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface AnimatedCatProps {
  size?: number;
}

const WELCOME_CAT_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663302606279/xwZvhoIuzNkzZZgR.png";

export function AnimatedCat({ size = 200 }: AnimatedCatProps) {
  // Animation values for a playful, lively movement
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    // Gentle floating/bobbing up and down
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle side-to-side tilt (like waving)
    rotate.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Gentle breathing/pulse scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
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
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", overflow: "visible" }}>
      <Animated.View style={[animatedStyle, { backgroundColor: "transparent" }]}>
        <Image
          source={{ uri: WELCOME_CAT_URL }}
          style={{ width: size, height: size, backgroundColor: "transparent" }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </View>
  );
}
