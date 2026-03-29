import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

// Create a new Expo SDK client
const expo = new Expo();

export interface PushNotificationPayload {
  to: string | string[]; // Push token(s) or user ID(s)
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

/**
 * Send push notification to user(s) by their push tokens
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ success: boolean; tickets: ExpoPushTicket[] }> {
  const { to, title, body, data, sound = "default", badge, channelId } = payload;

  // Convert single token to array
  const tokens = Array.isArray(to) ? to : [to];

  // Filter out invalid tokens
  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.warn("[PushNotifications] No valid Expo push tokens provided");
    return { success: false, tickets: [] };
  }

  // Create messages
  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound,
    title,
    body,
    data,
    badge,
    channelId,
  }));

  try {
    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("[PushNotifications] Error sending chunk:", error);
      }
    }

    // Check for errors in tickets
    const hasErrors = tickets.some(
      (ticket) => ticket.status === "error"
    );

    if (hasErrors) {
      console.warn("[PushNotifications] Some notifications failed to send:", tickets);
    }

    return { success: !hasErrors, tickets };
  } catch (error) {
    console.error("[PushNotifications] Error sending push notifications:", error);
    return { success: false, tickets: [] };
  }
}

/**
 * Send push notification to user(s) by their user IDs
 * Fetches push tokens from database
 */
export async function sendPushNotificationToUsers(
  userIds: bigint | bigint[],
  payload: Omit<PushNotificationPayload, "to">
): Promise<{ success: boolean; tickets: ExpoPushTicket[] }> {
  const db = await getDb();
  if (!db) {
    console.error("[PushNotifications] Database not available");
    return { success: false, tickets: [] };
  }

  // Convert single ID to array
  const ids = Array.isArray(userIds) ? userIds : [userIds];

  // Fetch users with push tokens
  const usersWithTokens = await db
    .select({ pushToken: users.pushToken })
    .from(users)
    .where(inArray(users.id, ids));

  // Extract valid push tokens
  const pushTokens = usersWithTokens
    .map((user) => user.pushToken)
    .filter((token): token is string => !!token && Expo.isExpoPushToken(token));

  if (pushTokens.length === 0) {
    console.warn("[PushNotifications] No valid push tokens found for users:", ids);
    return { success: false, tickets: [] };
  }

  // Send notifications
  return sendPushNotification({
    ...payload,
    to: pushTokens,
  });
}

/**
 * Send push notification to a single user by user ID
 */
export async function sendPushNotificationToUser(
  userId: bigint,
  payload: Omit<PushNotificationPayload, "to">
): Promise<{ success: boolean; tickets: ExpoPushTicket[] }> {
  return sendPushNotificationToUsers(userId, payload);
}
