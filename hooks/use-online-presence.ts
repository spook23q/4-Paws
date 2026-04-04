import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "@/lib/websocket-provider";

/**
 * Hook to track online presence of other users.
 * Returns a Set of online user IDs and helper functions.
 */
export function useOnlinePresence() {
  const { onUserOnline, onUserOffline, isConnected } = useWebSocket();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected) {
      setOnlineUsers(new Set());
      return;
    }

    const unsubOnline = onUserOnline((userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    });

    const unsubOffline = onUserOffline((userId: string) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, [isConnected, onUserOnline, onUserOffline]);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { onlineUsers, isOnline };
}
