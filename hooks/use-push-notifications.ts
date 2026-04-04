import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

// Check if running in Expo Go (where push notifications aren't available on Android)
const isExpoGo = Constants.appOwnership === "expo";

// Only load expo-notifications if NOT in Expo Go on Android
// (iOS Expo Go still supports local notifications, but Android removed remote notifications in SDK 53)
const shouldLoadNotifications = !(isExpoGo && Platform.OS === "android");

/**
 * Hook to register and manage push notification tokens.
 * Handles:
 * - Token registration with backend
 * - Foreground notification display
 * - Notification tap → navigate to relevant screen
 * - Query cache invalidation on new notifications
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const updatePushTokenMutation = trpc.auth.updatePushToken.useMutation();
  const lastTokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const responseListenerRef = useRef<any>(null);
  const receivedListenerRef = useRef<any>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Skip if notifications not available (Expo Go on Android)
    if (!shouldLoadNotifications) {
      return;
    }

    // Register for push notifications (client-side only)
    registerForPushNotificationsAsync();

    return () => {
      // Clean up listeners
      if (responseListenerRef.current) {
        try {
          const Notifications = require("expo-notifications");
          Notifications.removeNotificationSubscription(responseListenerRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (receivedListenerRef.current) {
        try {
          const Notifications = require("expo-notifications");
          Notifications.removeNotificationSubscription(receivedListenerRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [user]);

  const registerForPushNotificationsAsync = async () => {
    // Skip on server-side rendering
    if (typeof window === "undefined") {
      return;
    }

    // Skip if notifications not available
    if (!shouldLoadNotifications) {
      return;
    }

    try {
      // Dynamically import expo-notifications only when needed
      const Notifications = require("expo-notifications");

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("[PushNotifications] Permission not granted");
        return;
      }

      // Get the token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      const token = tokenData.data;

      // Only update if token has changed
      if (token && token !== lastTokenRef.current) {
        lastTokenRef.current = token;

        // Update token in database
        try {
          await updatePushTokenMutation.mutateAsync({ pushToken: token });
        } catch (error) {
          console.error("[PushNotifications] Failed to update token:", error);
        }
      }

      // Set notification handler — show alerts even when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Handle notification received while app is in foreground
      receivedListenerRef.current = Notifications.addNotificationReceivedListener(
        (_notification: any) => {
          // Invalidate notification queries so badge/list updates
          queryClient.invalidateQueries({ queryKey: [["notifications"]] });
        }
      );

      // Handle notification tap (user taps on notification)
      responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response.notification.request.content.data;
          // Invalidate notification queries
          queryClient.invalidateQueries({ queryKey: [["notifications"]] });

          // Navigate based on notification data
          if (data?.bookingId) {
            router.push(`/bookings/${data.bookingId}` as any);
          } else if (data?.conversationId) {
            router.push(`/messages/${data.conversationId}` as any);
          } else {
            // Default: open notifications screen
            router.push("/(tabs)/notifications" as any);
          }
        }
      );

      // Handle Android notification channels
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("bookings", {
          name: "Booking Updates",
          description: "Notifications about booking requests, confirmations, and cancellations",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("messages", {
          name: "Messages",
          description: "New message notifications",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });

        await Notifications.setNotificationChannelAsync("default", {
          name: "General",
          description: "General notifications",
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } catch (error) {
      console.error("[PushNotifications] Error registering for push notifications:", error);
    }
  };
}
