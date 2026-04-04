import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useCallback, useState } from "react";

// Sound assets
const SOUNDS = {
  message: require("@/assets/sounds/message.mp3"),
  booking: require("@/assets/sounds/booking.mp3"),
  general: require("@/assets/sounds/general.mp3"),
} as const;

export type NotificationSoundType = keyof typeof SOUNDS;

// Map notification categories to sound types
const NOTIFICATION_CATEGORY_MAP: Record<string, NotificationSoundType> = {
  // Message sounds
  new_message: "message",
  message: "message",

  // Booking sounds
  booking_request: "booking",
  booking_confirmed: "booking",
  booking_accepted: "booking",
  booking_declined: "booking",
  booking_cancelled: "booking",
  booking_completed: "booking",
  booking_reminder: "booking",
  payment_received: "booking",
  payment_completed: "booking",

  // General sounds
  welcome: "general",
  account_verified: "general",
  compliance_verified: "general",
  compliance_rejected: "general",
  compliance_expiry: "general",
  new_review: "general",
  review: "general",
  system: "general",
};

const STORAGE_KEY = "@4paws_notification_sounds";
const VOLUME_KEY = "@4paws_notification_volume";

interface SoundSettings {
  enabled: boolean;
  messageSound: boolean;
  bookingSound: boolean;
  generalSound: boolean;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  messageSound: true,
  bookingSound: true,
  generalSound: true,
};

/**
 * Get the sound type for a given notification category.
 */
export function getSoundTypeForCategory(
  category: string
): NotificationSoundType {
  return NOTIFICATION_CATEGORY_MAP[category] || "general";
}

/**
 * Load sound settings from AsyncStorage.
 */
export async function loadSoundSettings(): Promise<SoundSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore errors, return defaults
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save sound settings to AsyncStorage.
 */
export async function saveSoundSettings(
  settings: SoundSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore errors
  }
}

/**
 * Load volume level from AsyncStorage (0.0 to 1.0).
 */
export async function loadVolume(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(VOLUME_KEY);
    if (stored) {
      const vol = parseFloat(stored);
      if (!isNaN(vol) && vol >= 0 && vol <= 1) return vol;
    }
  } catch {
    // Ignore
  }
  return 0.8; // Default volume
}

/**
 * Save volume level to AsyncStorage.
 */
export async function saveVolume(volume: number): Promise<void> {
  try {
    await AsyncStorage.setItem(VOLUME_KEY, JSON.stringify(volume));
  } catch {
    // Ignore
  }
}

/**
 * Hook to manage notification sounds.
 * Returns a function to play sounds by notification category.
 */
export function useNotificationSounds() {
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
  const [volume, setVolumeState] = useState(0.8);
  const settingsRef = useRef(settings);
  const volumeRef = useRef(volume);

  // Create audio players for each sound type
  const messagePlayer = useAudioPlayer(SOUNDS.message);
  const bookingPlayer = useAudioPlayer(SOUNDS.booking);
  const generalPlayer = useAudioPlayer(SOUNDS.general);

  const playersRef = useRef({
    message: messagePlayer,
    booking: bookingPlayer,
    general: generalPlayer,
  });

  // Keep refs in sync
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    playersRef.current = {
      message: messagePlayer,
      booking: bookingPlayer,
      general: generalPlayer,
    };
  }, [messagePlayer, bookingPlayer, generalPlayer]);

  // Initialize audio mode and load settings
  useEffect(() => {
    const init = async () => {
      if (Platform.OS !== "web") {
        await setAudioModeAsync({ playsInSilentMode: true });
      }
      const loaded = await loadSoundSettings();
      setSettings(loaded);
      const vol = await loadVolume();
      setVolumeState(vol);
    };
    init();
  }, []);

  // Play a notification sound by category
  const playSound = useCallback(
    async (category: string) => {
      if (Platform.OS === "web") return;

      const currentSettings = settingsRef.current;
      if (!currentSettings.enabled) return;

      const soundType = getSoundTypeForCategory(category);

      // Check per-type toggle
      if (soundType === "message" && !currentSettings.messageSound) return;
      if (soundType === "booking" && !currentSettings.bookingSound) return;
      if (soundType === "general" && !currentSettings.generalSound) return;

      try {
        const player = playersRef.current[soundType];
        if (player) {
          player.volume = volumeRef.current;
          player.seekTo(0);
          player.play();
        }
      } catch (error) {
        console.warn("[NotificationSounds] Failed to play sound:", error);
      }
    },
    []
  );

  // Update settings and persist
  const updateSettings = useCallback(
    async (newSettings: Partial<SoundSettings>) => {
      const updated = { ...settingsRef.current, ...newSettings };
      setSettings(updated);
      await saveSoundSettings(updated);
    },
    []
  );

  // Update volume and persist
  const setVolume = useCallback(async (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    await saveVolume(clamped);
  }, []);

  // Cleanup players on unmount
  useEffect(() => {
    return () => {
      try {
        messagePlayer.release();
        bookingPlayer.release();
        generalPlayer.release();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  return {
    playSound,
    settings,
    updateSettings,
    volume,
    setVolume,
  };
}
