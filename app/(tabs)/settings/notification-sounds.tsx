import { View, Text, Switch, ScrollView, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useNotificationSoundContext } from "@/lib/notification-sound-provider";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function NotificationSoundsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { settings, updateSettings, playSound, volume, setVolume } = useNotificationSoundContext();
  const { contentMaxWidth } = useScreenLayout();

  const handleToggle = async (key: string, value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateSettings({ [key]: value });
  };

  const handleTestSound = async (category: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await playSound(category);
  };

  const soundOptions = [
    {
      key: "messageSound",
      label: "Message Sounds",
      description: "Play a soft tone when you receive a new chat message",
      icon: "message.fill" as const,
      iconColor: colors.primary,
      testCategory: "new_message",
    },
    {
      key: "bookingSound",
      label: "Booking Sounds",
      description: "Play a chime alert for booking requests, confirmations, and updates",
      icon: "calendar" as const,
      iconColor: colors.success,
      testCategory: "booking_request",
    },
    {
      key: "generalSound",
      label: "General Sounds",
      description: "Play a ding for account updates, reviews, and system notifications",
      icon: "bell.fill" as const,
      iconColor: colors.warning,
      testCategory: "general",
    },
  ];

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Notification Sounds
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" },
        ]}
      >
        {/* Master Toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.masterToggleRow}>
            <View style={styles.masterToggleInfo}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <IconSymbol name="speaker.wave.2.fill" size={24} color={colors.primary} />
              </View>
              <View style={styles.masterToggleText}>
                <Text style={[styles.masterLabel, { color: colors.foreground }]}>
                  Notification Sounds
                </Text>
                <Text style={[styles.masterDescription, { color: colors.muted }]}>
                  {settings.enabled ? "Sounds are enabled" : "All sounds are muted"}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => handleToggle("enabled", value)}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={settings.enabled ? colors.primary : colors.muted}
            />
          </View>
        </View>

        {/* Volume Control */}
        {settings.enabled && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Volume</Text>
            <View style={styles.volumeRow}>
              <IconSymbol name="speaker.fill" size={16} color={colors.muted} />
              <View style={styles.sliderContainer}>
                {Platform.OS === "web" ? (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                    style={{ width: "100%", accentColor: colors.primary }}
                  />
                ) : (
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onSlidingComplete={(val: number) => setVolume(val)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
              <IconSymbol name="speaker.wave.2.fill" size={16} color={colors.muted} />
            </View>
            <Text style={[styles.volumeLabel, { color: colors.muted }]}>
              {Math.round(volume * 100)}%
            </Text>
          </View>
        )}

        {/* Individual Sound Toggles */}
        {settings.enabled && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sound Types</Text>
            <Text style={[styles.sectionDescription, { color: colors.muted }]}>
              Choose which notification types play a sound. Tap the play button to preview each tone.
            </Text>

            {soundOptions.map((option, index) => (
              <View
                key={option.key}
                style={[
                  styles.soundRow,
                  index < soundOptions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.soundInfo}>
                  <View style={[styles.soundIcon, { backgroundColor: `${option.iconColor}15` }]}>
                    <IconSymbol name={option.icon} size={20} color={option.iconColor} />
                  </View>
                  <View style={styles.soundText}>
                    <Text style={[styles.soundLabel, { color: colors.foreground }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.soundDescription, { color: colors.muted }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.soundActions}>
                  <TouchableOpacity
                    onPress={() => handleTestSound(option.testCategory)}
                    style={[styles.testButton, { backgroundColor: `${option.iconColor}15` }]}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="play.fill" size={14} color={option.iconColor} />
                  </TouchableOpacity>
                  <Switch
                    value={settings[option.key as keyof typeof settings] as boolean}
                    onValueChange={(value) => handleToggle(option.key, value)}
                    trackColor={{ false: colors.border, true: `${option.iconColor}80` }}
                    thumbColor={
                      settings[option.key as keyof typeof settings]
                        ? option.iconColor
                        : colors.muted
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            In-app notification sounds play when the app is in the foreground. Push notification sounds are controlled by your device settings.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 70,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  headerSpacer: {
    minWidth: 70,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  masterToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masterToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  masterToggleText: {
    flex: 1,
  },
  masterLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  masterDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  sliderContainer: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  soundInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  soundIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  soundText: {
    flex: 1,
  },
  soundLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  soundDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  testButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
