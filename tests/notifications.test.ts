import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Notifications System", () => {
  // ── Database Schema ──
  describe("Database Schema", () => {
    const schemaPath = path.join(__dirname, "../drizzle/schema.ts");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    it("defines a notifications table", () => {
      expect(schema).toContain("export const notifications = mysqlTable(");
    });

    it("has required columns: userId, type, title, body, data, isRead", () => {
      expect(schema).toContain("userId: bigint(\"user_id\"");
      expect(schema).toContain("title: varchar(\"title\"");
      expect(schema).toContain("body: text(\"body\")");
      expect(schema).toContain("data: text(\"data\")");
      expect(schema).toContain("isRead: boolean(\"is_read\")");
    });

    it("has notification type enum with booking types", () => {
      expect(schema).toContain("\"booking_request\"");
      expect(schema).toContain("\"booking_confirmed\"");
      expect(schema).toContain("\"booking_declined\"");
      expect(schema).toContain("\"booking_completed\"");
      expect(schema).toContain("\"booking_cancelled\"");
    });

    it("has additional notification types for messages and reviews", () => {
      expect(schema).toContain("\"new_message\"");
      expect(schema).toContain("\"new_review\"");
      expect(schema).toContain("\"general\"");
    });

    it("has proper indexes for performance", () => {
      expect(schema).toContain("notif_user_idx");
      expect(schema).toContain("notif_user_read_idx");
      expect(schema).toContain("notif_created_at_idx");
    });

    it("has cascade delete on user reference", () => {
      // The notifications table references users with onDelete cascade
      expect(schema).toContain("notifications");
      const notifSection = schema.substring(
        schema.indexOf("export const notifications"),
        schema.indexOf("export type Notification")
      );
      expect(notifSection).toContain("onDelete: \"cascade\"");
    });

    it("exports Notification types", () => {
      expect(schema).toContain("export type Notification = typeof notifications.$inferSelect");
      expect(schema).toContain("export type InsertNotification = typeof notifications.$inferInsert");
    });

    it("has notifications relation on users", () => {
      expect(schema).toContain("notifications: many(notifications)");
    });

    it("has notificationsRelations defined", () => {
      expect(schema).toContain("export const notificationsRelations");
    });
  });

  // ── Notifications Router ──
  describe("Notifications Router", () => {
    const routerPath = path.join(__dirname, "../server/routers/notificationsRouter.ts");
    const routerCode = fs.readFileSync(routerPath, "utf-8");

    it("exports a notificationsRouter", () => {
      expect(routerCode).toContain("export const notificationsRouter");
    });

    it("has a list endpoint with pagination", () => {
      expect(routerCode).toContain("list: protectedProcedure");
      expect(routerCode).toContain("limit:");
      expect(routerCode).toContain("offset:");
    });

    it("has an unreadCount endpoint", () => {
      expect(routerCode).toContain("unreadCount: protectedProcedure");
      expect(routerCode).toContain("COUNT(*)");
    });

    it("has a markRead endpoint", () => {
      expect(routerCode).toContain("markRead: protectedProcedure");
      expect(routerCode).toContain("isRead: true");
    });

    it("has a markAllRead endpoint", () => {
      expect(routerCode).toContain("markAllRead: protectedProcedure");
    });

    it("has a delete endpoint", () => {
      expect(routerCode).toContain("delete: protectedProcedure");
    });

    it("verifies notification ownership before marking read", () => {
      expect(routerCode).toContain("eq(notifications.userId, ctx.user.id)");
    });

    it("parses JSON data field in list response", () => {
      expect(routerCode).toContain("JSON.parse(n.data)");
    });
  });

  // ── Notification Helpers ──
  describe("Notification Helpers", () => {
    const helpersPath = path.join(__dirname, "../server/notificationHelpers.ts");
    const helpers = fs.readFileSync(helpersPath, "utf-8");

    it("exports a notifyUser function", () => {
      expect(helpers).toContain("export async function notifyUser");
    });

    it("stores in-app notification in database", () => {
      expect(helpers).toContain("db.insert(notifications)");
    });

    it("sends push notification via Expo", () => {
      expect(helpers).toContain("sendPushNotificationToUser");
    });

    it("handles both push and in-app notification failures gracefully", () => {
      // Should catch errors for both operations
      const catchCount = (helpers.match(/catch \(error\)/g) || []).length;
      expect(catchCount).toBeGreaterThanOrEqual(2);
    });

    it("serializes data as JSON for storage", () => {
      expect(helpers).toContain("JSON.stringify(data)");
    });
  });

  // ── Bookings Router Integration ──
  describe("Bookings Router - Notification Integration", () => {
    const bookingsPath = path.join(__dirname, "../server/routers/bookingsRouter.ts");
    const bookings = fs.readFileSync(bookingsPath, "utf-8");

    it("imports notifyUser instead of raw push notification", () => {
      expect(bookings).toContain("import { notifyUser }");
      expect(bookings).not.toContain("import { sendPushNotificationToUser }");
    });

    it("sends notification on booking create", () => {
      expect(bookings).toContain("type: \"booking_request\"");
    });

    it("sends notification on booking confirm", () => {
      expect(bookings).toContain("type: \"booking_confirmed\"");
    });

    it("sends notification on booking decline", () => {
      expect(bookings).toContain("type: \"booking_declined\"");
    });

    it("sends notification on booking complete", () => {
      expect(bookings).toContain("type: \"booking_completed\"");
    });

    it("sends notification on booking cancel", () => {
      expect(bookings).toContain("type: \"booking_cancelled\"");
    });

    it("includes bookingId in notification data", () => {
      // All booking notifications should include the bookingId
      const bookingIdMatches = bookings.match(/bookingId:/g) || [];
      expect(bookingIdMatches.length).toBeGreaterThanOrEqual(5);
    });
  });

  // ── Notifications Screen ──
  describe("Notifications Screen", () => {
    const screenPath = path.join(__dirname, "../app/(tabs)/notifications.tsx");
    const screen = fs.readFileSync(screenPath, "utf-8");

    it("renders a notifications screen component", () => {
      expect(screen).toContain("export default function NotificationsScreen");
    });

    it("uses ScreenContainer for proper layout", () => {
      expect(screen).toContain("<ScreenContainer");
    });

    it("uses FlatList for notification list", () => {
      expect(screen).toContain("<FlatList");
    });

    it("has pull-to-refresh functionality", () => {
      expect(screen).toContain("RefreshControl");
      expect(screen).toContain("onRefresh");
    });

    it("shows empty state for unauthenticated users", () => {
      expect(screen).toContain("Sign in to view notifications");
    });

    it("shows empty state when no notifications", () => {
      expect(screen).toContain("No notifications yet");
    });

    it("has mark all read button", () => {
      expect(screen).toContain("Mark all read");
      expect(screen).toContain("markAllRead");
    });

    it("navigates to booking detail on notification tap", () => {
      expect(screen).toContain("bookings/");
    });

    it("shows unread indicator dot", () => {
      expect(screen).toContain("unreadDot");
    });

    it("has delete notification functionality", () => {
      expect(screen).toContain("Delete Notification");
      expect(screen).toContain("deleteMutation");
    });

    it("has different icons for different notification types", () => {
      expect(screen).toContain("getNotificationIcon");
      expect(screen).toContain("booking_request");
      expect(screen).toContain("booking_confirmed");
      expect(screen).toContain("booking_declined");
    });

    it("shows relative time (time ago)", () => {
      expect(screen).toContain("timeAgo");
      expect(screen).toContain("Just now");
    });

    it("uses haptics on notification press", () => {
      expect(screen).toContain("Haptics.impactAsync");
    });

    it("guards haptics for web platform", () => {
      expect(screen).toContain("Platform.OS !== \"web\"");
    });
  });

  // ── Home Screen Bell Icon ──
  describe("Home Screen - Bell Icon with Badge", () => {
    const homePath = path.join(__dirname, "../app/(tabs)/index.tsx");
    const home = fs.readFileSync(homePath, "utf-8");

    it("imports trpc for notification count", () => {
      expect(home).toContain("import { trpc }");
    });

    it("queries unread notification count", () => {
      expect(home).toContain("notifications.unreadCount.useQuery");
    });

    it("auto-refreshes unread count periodically", () => {
      expect(home).toContain("refetchInterval: 30000");
    });

    it("renders bell icon in header", () => {
      expect(home).toContain("bell.fill");
    });

    it("shows active bell icon when unread notifications exist", () => {
      expect(home).toContain("bell.badge.fill");
    });

    it("shows badge count number", () => {
      expect(home).toContain("unreadCount > 99");
      expect(home).toContain("99+");
    });

    it("navigates to notifications screen on bell tap", () => {
      expect(home).toContain("/(tabs)/notifications");
    });

    it("only shows bell icon for authenticated users", () => {
      expect(home).toContain("headerRight: user");
    });
  });

  // ── Push Notifications Hook ──
  describe("Push Notifications Hook", () => {
    const hookPath = path.join(__dirname, "../hooks/use-push-notifications.ts");
    const hook = fs.readFileSync(hookPath, "utf-8");

    it("handles foreground notification received", () => {
      expect(hook).toContain("addNotificationReceivedListener");
    });

    it("handles notification tap response", () => {
      expect(hook).toContain("addNotificationResponseReceivedListener");
    });

    it("invalidates notification queries on new notification", () => {
      expect(hook).toContain("queryClient.invalidateQueries");
    });

    it("navigates to booking on notification tap", () => {
      expect(hook).toContain("router.push(`/bookings/");
    });

    it("navigates to messages on message notification tap", () => {
      expect(hook).toContain("router.push(`/messages/");
    });

    it("falls back to notifications screen for generic taps", () => {
      expect(hook).toContain("/(tabs)/notifications");
    });

    it("cleans up listeners on unmount", () => {
      expect(hook).toContain("removeNotificationSubscription");
    });

    it("creates Android notification channels", () => {
      expect(hook).toContain("setNotificationChannelAsync");
      expect(hook).toContain("bookings");
      expect(hook).toContain("messages");
    });

    it("gracefully handles Expo Go on Android", () => {
      expect(hook).toContain("shouldLoadNotifications");
      expect(hook).toContain("isExpoGo");
    });
  });

  // ── Tab Layout ──
  describe("Tab Layout - Notifications Hidden Tab", () => {
    const layoutPath = path.join(__dirname, "../app/(tabs)/_layout.tsx");
    const layout = fs.readFileSync(layoutPath, "utf-8");

    it("registers notifications as a hidden tab", () => {
      expect(layout).toContain("name=\"notifications\"");
      expect(layout).toContain("notifications\" options={{ href: null }}");
    });
  });

  // ── Icon Mappings ──
  describe("Icon Mappings", () => {
    const iconPath = path.join(__dirname, "../components/ui/icon-symbol.tsx");
    const icons = fs.readFileSync(iconPath, "utf-8");

    it("has bell.fill icon mapping", () => {
      expect(icons).toContain("\"bell.fill\": \"notifications\"");
    });

    it("has bell.badge.fill icon mapping", () => {
      expect(icons).toContain("\"bell.badge.fill\": \"notifications-active\"");
    });
  });

  // ── Router Registration ──
  describe("Router Registration", () => {
    const routersPath = path.join(__dirname, "../server/routers.ts");
    const routers = fs.readFileSync(routersPath, "utf-8");

    it("imports notificationsRouter", () => {
      expect(routers).toContain("import { notificationsRouter }");
    });

    it("registers notifications in app router", () => {
      expect(routers).toContain("notifications: notificationsRouter");
    });
  });
});
