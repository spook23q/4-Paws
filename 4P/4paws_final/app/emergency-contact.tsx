import { ScrollView, Text, View, TouchableOpacity, Linking, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

// Emergency contacts with backup sitters
const EMERGENCY_CONTACTS = [
  {
    id: "dispatch",
    name: "4 Paws Emergency Dispatch",
    role: "24/7 Emergency Line",
    phone: "+61400000000",
    description: "Instant backup sitter dispatch",
    icon: "🚨",
    priority: "high",
    available: true,
  },
  {
    id: "backup1",
    name: "Sarah Mitchell",
    role: "Verified Backup Sitter",
    phone: "+61400111222",
    description: "5 min away • 4.9★ rating",
    icon: "👩",
    priority: "medium",
    available: true,
  },
  {
    id: "backup2",
    name: "James Wong",
    role: "Verified Backup Sitter",
    phone: "+61400333444",
    description: "8 min away • 4.8★ rating",
    icon: "👨",
    priority: "medium",
    available: true,
  },
  {
    id: "vet",
    name: "24hr Pet Emergency Vet",
    role: "Veterinary Emergency",
    phone: "+61400555666",
    description: "Animal Emergency Centre",
    icon: "🏥",
    priority: "low",
    available: true,
  },
];

export default function EmergencyContactScreen() {
  const colors = useColors();

  const handleCall = async (contact: typeof EMERGENCY_CONTACTS[0]) => {
    // Haptic feedback
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const phoneUrl = `tel:${contact.phone}`;
    
    // Check if we can open the phone app
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert(
        "Unable to Call",
        `Please call ${contact.phone} manually`,
        [{ text: "OK" }]
      );
    }
  };

  const handleSOS = async () => {
    // Haptic feedback for SOS
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      "🚨 Emergency SOS",
      "This will immediately dispatch the nearest available backup sitter to your location and notify our emergency team.\n\nAre you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Dispatch Now", 
          style: "destructive",
          onPress: () => {
            // In production, this would trigger the backend dispatch
            Alert.alert(
              "Backup Dispatched",
              "A backup sitter is on their way. You will receive a notification when they arrive.",
              [{ text: "OK" }]
            );
          }
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return colors.error;
      case "medium": return colors.warning;
      default: return colors.primary;
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          title: "Emergency Contacts",
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-6 gap-5">
          {/* SOS Button */}
          <TouchableOpacity
            onPress={handleSOS}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.error,
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              shadowColor: colors.error,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🆘</Text>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 }}>
              EMERGENCY SOS
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", textAlign: "center" }}>
              Tap to instantly dispatch a backup sitter
            </Text>
          </TouchableOpacity>

          {/* Info Banner */}
          <View 
            className="flex-row items-center gap-3 p-4 rounded-xl"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
            <Text style={{ flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 18 }}>
              One-tap calling connects you directly to our emergency dispatch or verified backup sitters in your area.
            </Text>
          </View>

          {/* Emergency Contacts List */}
          <Text className="text-lg font-bold text-foreground mt-2">
            Quick Dial Contacts
          </Text>

          {EMERGENCY_CONTACTS.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              onPress={() => handleCall(contact)}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Priority indicator */}
                <View 
                  style={{ 
                    width: 5, 
                    height: "100%", 
                    backgroundColor: getPriorityColor(contact.priority),
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                  }} 
                />
                
                <View style={{ flex: 1, padding: 16, paddingLeft: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* Icon */}
                    <View 
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: `${getPriorityColor(contact.priority)}20`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{contact.icon}</Text>
                    </View>

                    {/* Contact Info */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>
                        {contact.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 2 }}>
                        {contact.role}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        {contact.description}
                      </Text>
                    </View>

                    {/* Call Button */}
                    <View 
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: colors.success,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>📞</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Additional Info */}
          <View className="bg-surface rounded-2xl p-5 border border-border mt-2">
            <Text className="text-base font-semibold text-foreground mb-3">
              How Backup Dispatch Works
            </Text>
            <View className="gap-3">
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 16 }}>1️⃣</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                  Tap the SOS button or call our dispatch line
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 16 }}>2️⃣</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                  Our system identifies the nearest available backup sitter
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 16 }}>3️⃣</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                  Backup sitter is dispatched immediately to your location
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 16 }}>4️⃣</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                  You receive real-time updates until they arrive
                </Text>
              </View>
            </View>
          </View>

          {/* Average Response Time */}
          <View 
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl"
            style={{ backgroundColor: `${colors.success}15` }}
          >
            <IconSymbol name="clock.fill" size={20} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: "bold", fontSize: 16 }}>
              Average response time: 8 minutes
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
