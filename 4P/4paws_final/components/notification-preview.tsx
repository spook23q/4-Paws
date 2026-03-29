import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

const NOTIFICATIONS = [
  {
    type: "sitter_arrived",
    title: "Sitter Arrived ✅",
    message: "Sarah has arrived at your home and checked in.",
    time: "Just now",
    icon: "👋",
    color: "#22C55E",
  },
  {
    type: "cat_safe",
    title: "Cat Location Update 🐱",
    message: "Whiskers is safely within the designated zone.",
    time: "2 min ago",
    icon: "📍",
    color: "#3B82F6",
  },
  {
    type: "boundary_alert",
    title: "Boundary Alert ⚠️",
    message: "Whiskers approached the kitchen boundary. Sitter notified.",
    time: "15 min ago",
    icon: "🚨",
    color: "#F59E0B",
  },
];

export function NotificationPreview() {
  const colors = useColors();
  
  // Animation values for each notification
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);
  const translateY1 = useSharedValue(-20);
  const translateY2 = useSharedValue(-20);
  const translateY3 = useSharedValue(-20);

  useEffect(() => {
    // Staggered entrance animation
    opacity1.value = withDelay(
      300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY1.value = withDelay(
      300,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    opacity2.value = withDelay(
      600,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY2.value = withDelay(
      600,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    opacity3.value = withDelay(
      900,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
    translateY3.value = withDelay(
      900,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: opacity3.value,
    transform: [{ translateY: translateY3.value }],
  }));

  const animatedStyles = [animatedStyle1, animatedStyle2, animatedStyle3];

  return (
    <View style={styles.container}>
      {/* Phone Frame */}
      <View style={[styles.phoneFrame, { borderColor: colors.border }]}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <Text style={styles.statusIcon}>📶</Text>
            <Text style={styles.statusIcon}>🔋</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.notificationList}>
          {NOTIFICATIONS.map((notification, index) => (
            <Animated.View
              key={notification.type}
              style={[
                styles.notificationCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                animatedStyles[index],
              ]}
            >
              {/* Colored indicator */}
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: notification.color },
                ]}
              />
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notificationIcon}>{notification.icon}</Text>
                    <Text style={[styles.notificationTitle, { color: colors.foreground }]}>
                      {notification.title}
                    </Text>
                  </View>
                  <Text style={[styles.notificationTime, { color: colors.muted }]}>
                    {notification.time}
                  </Text>
                </View>
                <Text style={[styles.notificationMessage, { color: colors.muted }]}>
                  {notification.message}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* App Name Badge */}
        <View style={[styles.appBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.appBadgeText}>4 Paws</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  phoneFrame: {
    width: 280,
    height: 380,
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: "#1a1a1a",
    overflow: "hidden",
    paddingTop: 8,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statusTime: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statusIcons: {
    flexDirection: "row",
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  notificationList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 10,
  },
  notificationCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  indicator: {
    width: 4,
    height: "100%",
  },
  notificationContent: {
    flex: 1,
    padding: 12,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  notificationIcon: {
    fontSize: 14,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  notificationTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  appBadge: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  appBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
