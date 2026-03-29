import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

// Check if running in Expo Go (where push notifications aren't available on Android)
const isExpoGo = Constants.appOwnership === "expo";

// Only load expo-notifications if NOT in Expo Go on Android
// (iOS Expo Go still supports local notifications, but Android removed remote notifications in SDK 53)
const shouldLoadNotifications = !(isExpoGo && Platform.OS === "android");

/**
 * Hook to register and manage push notification tokens
 * Automatically registers the device token when the user is authenticated
 * Gracefully handles Expo Go where push notifications are not available
 */
export function usePushNotifications() {
  const { user } = useAuth();
  const updatePushTokenMutation = trpc.auth.updatePushToken.useMutation();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Skip if notifications not available (Expo Go on Android)
    if (!shouldLoadNotifications) {
      console.log("[PushNotifications] Skipping - not available in Expo Go on Android");
      return;
    }

    // Register for push notifications (client-side only)
    registerForPushNotificationsAsync();
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
          console.log("[PushNotifications] Token registered:", token);
        } catch (error) {
          console.error("[PushNotifications] Failed to update token:", error);
        }
      }

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Handle Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    } catch (error) {
      console.error("[PushNotifications] Error registering for push notifications:", error);
    }
  };
}
