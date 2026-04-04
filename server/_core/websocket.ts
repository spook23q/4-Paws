import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getDb } from "../db";
import { messages, conversations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendPushNotificationToUser } from "./pushNotifications";

// Store active connections: userId -> socketId
const activeUsers = new Map<string, string>();

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // In production, restrict to your domain
      methods: ["GET", "POST"],
    },
    path: "/socket.io/",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Handle user authentication
    socket.on("auth", (userId: string) => {
      if (!userId) {
        console.warn("[WebSocket] Auth failed: no userId provided");
        return;
      }
      
      activeUsers.set(userId, socket.id);
      socket.data.userId = userId;
      console.log(`[WebSocket] User authenticated: ${userId}`);

      // Notify user's contacts that they're online
      socket.broadcast.emit("user:online", userId);
    });

    // Handle sending messages
    socket.on("message:send", async (data: {
      conversationId: string;
      senderId: string;
      content: string;
    }) => {
      try {
        const db = await getDb();
        if (!db) {
          socket.emit("error", { message: "Database unavailable" });
          return;
        }

        const { conversationId, senderId, content } = data;

        // Save message to database
        const result = await db.insert(messages).values({
          conversationId: BigInt(conversationId),
          senderId: BigInt(senderId),
          content,
        });

        const messageId = result[0].insertId;

        // Update conversation's last message timestamp
        await db
          .update(conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(conversations.id, BigInt(conversationId)));

        // Get conversation details to find recipient
        const conversation = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, BigInt(conversationId)))
          .limit(1);

        if (conversation.length === 0) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        const conv = conversation[0];
        const recipientId =
          conv.ownerId.toString() === senderId
            ? conv.sitterId.toString()
            : conv.ownerId.toString();

        // Prepare message payload
        const messagePayload = {
          id: messageId.toString(),
          conversationId,
          senderId,
          content,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        // Send to recipient if they're online
        const recipientSocketId = activeUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message:new", messagePayload);
          console.log(`[WebSocket] Message sent to online user: ${recipientId}`);
        } else {
          // Send push notification if recipient is offline
          await sendPushNotificationToUser(BigInt(recipientId), {
            title: "New Message",
            body: content.length > 50 ? content.substring(0, 50) + "..." : content,
            data: {
              conversationId,
              type: "new_message",
            },
          });
          console.log(`[WebSocket] Push notification sent to offline user: ${recipientId}`);
        }

        // Confirm to sender
        socket.emit("message:sent", messagePayload);
      } catch (error) {
        console.error("[WebSocket] Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      socket.broadcast.emit("typing:start", { conversationId, userId });
    });

    socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      socket.broadcast.emit("typing:stop", { conversationId, userId });
    });

    // Handle marking messages as read
    socket.on("message:read", async (data: { messageId: string }) => {
      try {
        const db = await getDb();
        if (!db) return;

        await db
          .update(messages)
          .set({ isRead: true })
          .where(eq(messages.id, BigInt(data.messageId)));

        socket.broadcast.emit("message:read", { messageId: data.messageId });
      } catch (error) {
        console.error("[WebSocket] Error marking message as read:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        activeUsers.delete(userId);
        socket.broadcast.emit("user:offline", userId);
        console.log(`[WebSocket] User disconnected: ${userId}`);
      }
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[WebSocket] Socket.IO server initialized");
  return io;
}

export function getActiveUsers() {
  return Array.from(activeUsers.keys());
}
