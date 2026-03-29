import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import Constants from "expo-constants";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markAsRead: (messageId: string) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onTypingStart: (callback: (data: { conversationId: string; userId: string }) => void) => () => void;
  onTypingStop: (callback: (data: { conversationId: string; userId: string }) => void) => () => void;
  onUserOnline: (callback: (userId: string) => void) => () => void;
  onUserOffline: (callback: (userId: string) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get API URL from environment
    const apiUrl = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:3000";

    // Connect to WebSocket server
    const newSocket = io(apiUrl, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);
      // Authenticate with user ID
      newSocket.emit("auth", user.id.toString());
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (!socket || !user) return;

      socket.emit("message:send", {
        conversationId,
        senderId: user.id.toString(),
        content,
      });
    },
    [socket, user]
  );

  const startTyping = useCallback(
    (conversationId: string) => {
      if (!socket || !user) return;
      socket.emit("typing:start", {
        conversationId,
        userId: user.id.toString(),
      });
    },
    [socket, user]
  );

  const stopTyping = useCallback(
    (conversationId: string) => {
      if (!socket || !user) return;
      socket.emit("typing:stop", {
        conversationId,
        userId: user.id.toString(),
      });
    },
    [socket, user]
  );

  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socket) return;
      socket.emit("message:read", { messageId });
    },
    [socket]
  );

  const onNewMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (!socket) return () => {};
      socket.on("message:new", callback);
      return () => {
        socket.off("message:new", callback);
      };
    },
    [socket]
  );

  const onTypingStart = useCallback(
    (callback: (data: { conversationId: string; userId: string }) => void) => {
      if (!socket) return () => {};
      socket.on("typing:start", callback);
      return () => {
        socket.off("typing:start", callback);
      };
    },
    [socket]
  );

  const onTypingStop = useCallback(
    (callback: (data: { conversationId: string; userId: string }) => void) => {
      if (!socket) return () => {};
      socket.on("typing:stop", callback);
      return () => {
        socket.off("typing:stop", callback);
      };
    },
    [socket]
  );

  const onUserOnline = useCallback(
    (callback: (userId: string) => void) => {
      if (!socket) return () => {};
      socket.on("user:online", callback);
      return () => {
        socket.off("user:online", callback);
      };
    },
    [socket]
  );

  const onUserOffline = useCallback(
    (callback: (userId: string) => void) => {
      if (!socket) return () => {};
      socket.on("user:offline", callback);
      return () => {
        socket.off("user:offline", callback);
      };
    },
    [socket]
  );

  const value: WebSocketContextType = {
    socket,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onTypingStart,
    onTypingStop,
    onUserOnline,
    onUserOffline,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
