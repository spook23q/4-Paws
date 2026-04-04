import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState, useCallback } from "react";

import { useScreenLayout } from "@/hooks/use-screen-layout";

type NotificationType =
  | "booking_request"
  | "booking_confirmed"
  | "booking_declined"
  | "booking_completed"
  | "booking_cancelled"
  | "new_message"
  | "new_review"
  | "compliance_expiry"
  | "compliance_verified"
  | "compliance_rejected"
  | "compliance_blocked"
  | "general";

interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: Date;
}

function getNotificationIcon(type: NotificationType): {
  name: "bell.fill" | "calendar" | "checkmark.circle.fill" | "xmark" | "star.fill" | "message.fill" | "pawprint.fill" | "doc.text.fill" | "exclamationmark.triangle.fill" | "shield.fill";
  bgColor: string;
} {
  switch (type) {
    case "booking_request":
      return { name: "calendar", bgColor: "#3B82F620" };
    case "booking_confirmed":
      return { name: "checkmark.circle.fill", bgColor: "#22C55E20" };
    case "booking_declined":
      return { name: "xmark", bgColor: "#EF444420" };
    case "booking_completed":
      return { name: "star.fill", bgColor: "#F59E0B20" };
    case "booking_cancelled":
      return { name: "xmark", bgColor: "#EF444420" };
    case "new_message":
      return { name: "message.fill", bgColor: "#3B82F620" };
    case "new_review":
      return { name: "star.fill", bgColor: "#F59E0B20" };
    case "compliance_expiry":
      return { name: "exclamationmark.triangle.fill", bgColor: "#F59E0B20" };
    case "compliance_verified":
      return { name: "shield.fill", bgColor: "#22C55E20" };
    case "compliance_rejected":
      return { name: "xmark", bgColor: "#EF444420" };
    case "compliance_blocked":
      return { name: "exclamationmark.triangle.fill", bgColor: "#EF444420" };
    default:
      return { name: "bell.fill", bgColor: "#6B728020" };
  }
}

function getNotificationIconColor(type: NotificationType): string {
  switch (type) {
    case "booking_request":
      return "#3B82F6";
    case "booking_confirmed":
    case "compliance_verified":
      return "#22C55E";
    case "booking_declined":
    case "booking_cancelled":
    case "compliance_rejected":
    case "compliance_blocked":
      return "#EF4444";
    case "booking_completed":
    case "compliance_expiry":
      return "#F59E0B";
    case "new_message":
      return "#3B82F6";
    case "new_review":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationsScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: notificationsList,
    isLoading,
    refetch,
  } = trpc.notifications.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!user, refetchInterval: 15000 }
  );

  const { data: unreadData, refetch: refetchUnread } =
    trpc.notifications.unreadCount.useQuery(undefined, { enabled: !!user, refetchInterval: 15000 });

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchUnread();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetch();
      refetchUnread();
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
      refetchUnread();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await refetchUnread();
    setRefreshing(false);
  }, [refetch, refetchUnread]);

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Mark as read
    if (!notification.isRead) {
      try {
        await markReadMutation.mutateAsync({ id: notification.id });
      } catch (error) {
        // Silent fail for marking read
      }
    }

    // Navigate based on notification type
    if (notification.data?.bookingId) {
      router.push(`/bookings/${notification.data.bookingId}` as any);
    } else if (notification.type === "new_message" && notification.data?.conversationId) {
      router.push(`/messages/${notification.data.conversationId}` as any);
    }
  };

  const handleMarkAllRead = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await markAllReadMutation.mutateAsync();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to mark all as read");
    }
  };

  const handleDeleteNotification = (id: string) => {
    Alert.alert("Delete Notification", "Remove this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete notification");
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ScreenContainer className="px-6">
        <View className="flex-1 items-center justify-center">
          <IconSymbol name="bell.fill" size={48} color={colors.muted} />
          <Text className="text-xl font-bold text-foreground mt-4 mb-2">
            Sign in to view notifications
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            Get notified when sitters respond to your booking requests.
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-xl"
            onPress={() => router.push("/auth/sign-in" as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const icon = getNotificationIcon(item.type);
    const iconColor = getNotificationIconColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.isRead ? colors.background : `${colors.primary}08`,
            borderBottomColor: colors.border,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDeleteNotification(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
          <IconSymbol name={icon.name} size={22} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.foreground,
                  fontWeight: item.isRead ? "500" : "700",
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
          <Text
            style={[styles.body, { color: colors.muted }]}
            numberOfLines={2}
          >
            {item.body}
          </Text>
          <Text style={[styles.time, { color: colors.muted }]}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = unreadData?.count ?? 0;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
            style={styles.markAllButton}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notificationsList ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={
          (!notificationsList || notificationsList.length === 0)
            ? styles.emptyContainer
            : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="bell.fill" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.muted }]}>
              {user.role === "owner"
                ? "You'll be notified when sitters respond to your booking requests."
                : "You'll be notified when cat owners send you booking requests."}
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  notificationCard: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
