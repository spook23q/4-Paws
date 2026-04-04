import { getDb } from "./db";
import { notifications } from "../drizzle/schema";
import { sendPushNotificationToUser } from "./_core/pushNotifications";

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

interface NotifyUserPayload {
  userId: bigint;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send both a push notification AND store an in-app notification record.
 * This ensures users see notifications even if push delivery fails or
 * they had the app open (foreground).
 */
export async function notifyUser(payload: NotifyUserPayload) {
  const { userId, type, title, body, data } = payload;

  console.log(`[Notify] Sending ${type} notification to user ${userId}: "${title}"`);

  // 1. Store in-app notification (always attempt this first — it's the reliable fallback)
  let inAppSuccess = false;
  try {
    const db = await getDb();
    if (db) {
      await db.insert(notifications).values({
        userId,
        type,
        title,
        body,
        data: data ? JSON.stringify(data) : null,
        isRead: false,
      });
      inAppSuccess = true;
      console.log(`[Notify] In-app notification stored for user ${userId}`);
    } else {
      console.warn("[Notify] Database not available — in-app notification not stored");
    }
  } catch (error) {
    console.error("[Notify] Failed to store in-app notification:", error);
  }

  // 2. Send push notification (best-effort — may fail if no push token registered)
  let pushSuccess = false;
  try {
    const result = await sendPushNotificationToUser(userId, {
      title,
      body,
      data: { ...data, type },
    });
    pushSuccess = result.success;
    if (pushSuccess) {
      console.log(`[Notify] Push notification sent to user ${userId}`);
    } else {
      console.warn(`[Notify] Push notification failed for user ${userId} (no valid token or delivery error)`);
    }
  } catch (error) {
    console.error("[Notify] Failed to send push notification:", error);
  }

  return { inAppSuccess, pushSuccess };
}
