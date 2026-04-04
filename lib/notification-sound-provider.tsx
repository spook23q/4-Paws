import React, { createContext, useContext, useEffect, useRef } from "react";
import { useNotificationSounds, type NotificationSoundType } from "./notification-sounds";
import { useWebSocket } from "./websocket-provider";
import { useAuth } from "@/hooks/use-auth";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

interface NotificationSoundContextType {
  playSound: (category: string) => Promise<void>;
  settings: {
    enabled: boolean;
    messageSound: boolean;
    bookingSound: boolean;
    generalSound: boolean;
  };
  updateSettings: (settings: Partial<{
    enabled: boolean;
    messageSound: boolean;
    bookingSound: boolean;
    generalSound: boolean;
  }>) => Promise<void>;
  volume: number;
  setVolume: (vol: number) => Promise<void>;
}

const NotificationSoundContext = createContext<NotificationSoundContextType | null>(null);

export function NotificationSoundProvider({ children }: { children: React.ReactNode }) {
  const { playSound, settings, updateSettings, volume, setVolume } = useNotificationSounds();
  const { socket, onNewMessage } = useWebSocket();
  const { user } = useAuth();
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Play sound when a new WebSocket message arrives (and it's not from the current user)
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      if (userRef.current && message.senderId !== userRef.current.id.toString()) {
        playSound("new_message");
      }
    });
    return unsubscribe;
  }, [onNewMessage, playSound]);

  // Listen for booking-related WebSocket events
  useEffect(() => {
    if (!socket) return;

    const handleBookingEvent = (data: { type?: string }) => {
      const category = data?.type || "booking_request";
      playSound(category);
    };

    socket.on("booking:new", handleBookingEvent);
    socket.on("booking:updated", handleBookingEvent);
    socket.on("booking:confirmed", () => playSound("booking_confirmed"));
    socket.on("booking:cancelled", () => playSound("booking_cancelled"));

    return () => {
      socket.off("booking:new", handleBookingEvent);
      socket.off("booking:updated", handleBookingEvent);
      socket.off("booking:confirmed");
      socket.off("booking:cancelled");
    };
  }, [socket, playSound]);

  // Listen for general notification events via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: { type?: string; category?: string }) => {
      const category = data?.type || data?.category || "general";
      playSound(category);
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, playSound]);

  // Listen for push notifications received while app is in foreground
  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        const category = (data?.type as string) || (data?.category as string) || "general";
        playSound(category);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [playSound]);

  const value: NotificationSoundContextType = {
    playSound,
    settings,
    updateSettings,
    volume,
    setVolume,
  };

  return (
    <NotificationSoundContext.Provider value={value}>
      {children}
    </NotificationSoundContext.Provider>
  );
}

export function useNotificationSoundContext() {
  const context = useContext(NotificationSoundContext);
  if (!context) {
    throw new Error(
      "useNotificationSoundContext must be used within NotificationSoundProvider"
    );
  }
  return context;
}
