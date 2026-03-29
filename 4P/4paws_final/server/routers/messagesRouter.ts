import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { conversations, messages, users } from "../../drizzle/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { sendPushNotificationToUser } from "../_core/pushNotifications";

export const messagesRouter = router({
  // Get or create conversation
  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string(),
        bookingId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const otherUserId = BigInt(input.otherUserId);
      const bookingId = input.bookingId ? BigInt(input.bookingId) : null;

      // Determine owner and sitter IDs
      let ownerId: bigint;
      let sitterId: bigint;

      if (ctx.user.role === "owner") {
        ownerId = ctx.user.id;
        sitterId = otherUserId;
      } else {
        ownerId = otherUserId;
        sitterId = ctx.user.id;
      }

      // Check if conversation exists
      const existing = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.ownerId, ownerId),
            eq(conversations.sitterId, sitterId)
          )
        )
        ;

      if (existing.length > 0) {
        return {
          conversationId: existing[0].id.toString(),
        };
      }

      // Create new conversation
      const result = await db.insert(conversations).values({
        ownerId,
        sitterId,
        bookingId,
        lastMessageAt: new Date(),
      });

      return {
        conversationId: result[0].insertId.toString(),
      };
    }),

  // Get all conversations for current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const condition =
      ctx.user.role === "owner"
        ? eq(conversations.ownerId, ctx.user.id)
        : eq(conversations.sitterId, ctx.user.id);

    const convos = await db
      .select({
        id: conversations.id,
        ownerId: conversations.ownerId,
        sitterId: conversations.sitterId,
        bookingId: conversations.bookingId,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        ownerName: sql<string>`owner_user.name`,
        ownerPhoto: sql<string | null>`owner_user.profile_photo`,
        sitterName: sql<string>`sitter_user.name`,
        sitterPhoto: sql<string | null>`sitter_user.profile_photo`,
      })
      .from(conversations)
      .innerJoin(sql`users AS owner_user`, eq(conversations.ownerId, sql`owner_user.id`))
      .innerJoin(sql`users AS sitter_user`, eq(conversations.sitterId, sql`sitter_user.id`))
      .where(condition)
      .orderBy(sql`${conversations.lastMessageAt} DESC`);

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      convos.map(async (convo) => {
        const lastMessage = await db
          .select({
            id: messages.id,
            content: messages.content,
            senderId: messages.senderId,
            isRead: messages.isRead,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(eq(messages.conversationId, convo.id))
          .orderBy(sql`${messages.createdAt} DESC`)
          ;

        // Count unread messages
        const unreadCount = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, convo.id),
              eq(messages.isRead, false),
              sql`${messages.senderId} != ${ctx.user.id}`
            )
          );

        return {
          ...convo,
          lastMessage: lastMessage[0] || null,
          unreadCount: unreadCount[0]?.count || 0,
        };
      })
    );

    return conversationsWithLastMessage;
  }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).default(50),
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

      const conversationId = BigInt(input.conversationId);

      // Verify user has access to this conversation
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        ;

      if (!conversation[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      if (
        conversation[0].ownerId !== ctx.user.id &&
        conversation[0].sitterId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }

      // Get messages
      const messagesList = await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          content: messages.content,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderPhoto: users.profilePhoto,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(sql`${messages.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset);

      return messagesList.reverse(); // Return in chronological order
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conversationId = BigInt(input.conversationId);

      // Verify user has access to this conversation
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        ;

      if (!conversation[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      if (
        conversation[0].ownerId !== ctx.user.id &&
        conversation[0].sitterId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }

      // Insert message
      const result = await db.insert(messages).values({
        conversationId,
        senderId: ctx.user.id,
        content: input.content,
        isRead: false,
      });

      // Update conversation's lastMessageAt
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));

      // Send push notification to recipient
      try {
        const recipientId = conversation[0].ownerId === ctx.user.id 
          ? conversation[0].sitterId 
          : conversation[0].ownerId;
        
        const senderName = ctx.user.name || "Someone";
        await sendPushNotificationToUser(recipientId, {
          title: `New message from ${senderName}`,
          body: input.content.length > 100 ? input.content.substring(0, 100) + "..." : input.content,
          data: { conversationId: input.conversationId, type: "new_message" },
        });
      } catch (error) {
        console.error("[Messages] Failed to send push notification:", error);
      }

      return {
        success: true,
        messageId: result[0].insertId,
      };
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const conversationId = BigInt(input.conversationId);

      // Verify user has access to this conversation
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        ;

      if (!conversation[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      if (
        conversation[0].ownerId !== ctx.user.id &&
        conversation[0].sitterId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this conversation",
        });
      }

      // Mark all messages in this conversation as read (except user's own messages)
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.conversationId, conversationId),
            sql`${messages.senderId} != ${ctx.user.id}`
          )
        );

      return { success: true };
    }),
});
