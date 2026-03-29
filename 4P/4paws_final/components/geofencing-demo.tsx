import { View, Text, Dimensions, StyleSheet, Platform } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");
const demoSize = Math.min(screenWidth - 48, 320);

interface GeofencingDemoProps {
  size?: number;
}

export function GeofencingDemo({ size = demoSize }: GeofencingDemoProps) {
  // Animation values
  const pulseScale = useSharedValue(1);
  const catPosition = useSharedValue(0);
  const sitterOpacity = useSharedValue(0);
  const alertOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Pulse animation for geofence circle
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    // Cat movement animation (moves around inside the fence)
    catPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // Sitter check-in animation
    sitterOpacity.value = withRepeat(
      withSequence(
        withDelay(1000, withTiming(1, { duration: 500 })),
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 500 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );
    
    // Alert pulse animation
    alertOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  
  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.1], [0.6, 0.3]),
  }));
  
  const catStyle = useAnimatedStyle(() => {
    // Calculate cat position based on animation value (0-3)
    const angle = interpolate(catPosition.value, [0, 1, 2, 3], [0, 90, 180, 270]);
    const radius = size * 0.2; // Stay within inner area
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
    };
  });
  
  const sitterStyle = useAnimatedStyle(() => ({
    opacity: sitterOpacity.value,
    transform: [{ scale: interpolate(sitterOpacity.value, [0, 1], [0.8, 1]) }],
  }));
  
  const alertStyle = useAnimatedStyle(() => ({
    opacity: alertOpacity.value,
  }));

  const scaledCenterX = size / 2;
  const scaledCenterY = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Map Grid */}
      <View style={[styles.mapGrid, { width: size, height: size }]}>
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              styles.horizontalLine,
              { top: (size / 5) * (i + 1) - 0.5 },
            ]}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              styles.verticalLine,
              { left: (size / 5) * (i + 1) - 0.5 },
            ]}
          />
        ))}
      </View>

      {/* Geofence Circle - Outer Pulse */}
      <Animated.View
        style={[
          styles.geofenceOuter,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size * 0.425,
            left: size * 0.075,
            top: size * 0.075,
          },
          pulseStyle,
        ]}
      />

      {/* Geofence Circle - Main */}
      <View
        style={[
          styles.geofenceMain,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            left: size * 0.15,
            top: size * 0.15,
          },
        ]}
      />

      {/* House Icon in Center (using emoji instead of SVG) */}
      <View style={[styles.houseContainer, { left: scaledCenterX - 20, top: scaledCenterY - 20 }]}>
        <Text style={styles.houseEmoji}>🏠</Text>
      </View>

      {/* Animated Cat */}
      <Animated.View
        style={[
          styles.catContainer,
          { left: scaledCenterX - 15, top: scaledCenterY - 15 },
          catStyle,
        ]}
      >
        <Text style={styles.catEmoji}>🐱</Text>
      </Animated.View>

      {/* Sitter Check-in Indicator */}
      <Animated.View
        style={[
          styles.sitterIndicator,
          { right: size * 0.1, top: size * 0.15 },
          sitterStyle,
        ]}
      >
        <View style={styles.sitterBadge}>
          <Text style={styles.sitterCheckmark}>✓</Text>
        </View>
        <Text style={styles.sitterText}>Sitter{"\n"}Verified</Text>
      </Animated.View>

      {/* Alert Indicator (shows geofence is active) */}
      <Animated.View
        style={[
          styles.alertIndicator,
          { left: size * 0.08, bottom: size * 0.12 },
          alertStyle,
        ]}
      >
        <View style={styles.alertDot} />
        <Text style={styles.alertText}>Protected</Text>
      </Animated.View>

      {/* Legend */}
      <View style={[styles.legend, { bottom: 8, left: 8 }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#B8DDE8" }]} />
          <Text style={styles.legendText}>Safe Zone</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: "#FFF5E6",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#B8DDE8",
  },
  mapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#E5E7EB",
  },
  horizontalLine: {
    width: "100%",
    height: 1,
  },
  verticalLine: {
    width: 1,
    height: "100%",
  },
  geofenceOuter: {
    position: "absolute",
    backgroundColor: "#B8DDE8",
  },
  geofenceMain: {
    position: "absolute",
    backgroundColor: "rgba(184, 221, 232, 0.4)",
    borderWidth: 3,
    borderColor: "#38BDF8",
    borderStyle: "dashed",
  },
  houseContainer: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  houseEmoji: {
    fontSize: 24,
  },
  catContainer: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmoji: {
    fontSize: 24,
  },
  sitterIndicator: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sitterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  sitterCheckmark: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "bold",
  },
  sitterText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "600",
    lineHeight: 12,
  },
  alertIndicator: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  alertText: {
    fontSize: 10,
    color: "#22C55E",
    fontWeight: "600",
  },
  legend: {
    position: "absolute",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "500",
  },
});
