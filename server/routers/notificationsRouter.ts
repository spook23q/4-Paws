import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const notificationsRouter = router({
  // Get notifications for current user (paginated)
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const items = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return items.map((n) => ({
        ...n,
        id: String(n.id),
        userId: String(n.userId),
        data: n.data ? JSON.parse(n.data) : null,
      }));
    }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, false)
        )
      );

    return { count: result[0]?.count ?? 0 };
  }),

  // Mark a single notification as read
  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const notifId = BigInt(input.id);

      // Verify notification belongs to user
      const notif = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.id, notifId),
            eq(notifications.userId, ctx.user.id)
          )
        );

      if (!notif[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notifId));

      return { success: true };
    }),

  // Mark all notifications as read
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const notifId = BigInt(input.id);

      await db
        .delete(notifications)
        .where(
          and(
            eq(notifications.id, notifId),
            eq(notifications.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
