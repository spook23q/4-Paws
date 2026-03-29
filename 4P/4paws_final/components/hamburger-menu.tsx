import { View, Text, TouchableOpacity, Modal, Animated, Platform } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ visible, onClose }: HamburgerMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleMenuItemPress = (action: () => void) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    setTimeout(action, 300);
  };

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
    await logout();
    router.replace("/auth/sign-in");
  };

  const menuItems = [
    { label: "Profile", icon: "👤", action: () => router.push("/profile") },
    { label: "My Bookings", icon: "📅", action: () => router.push("/bookings") },
    { label: "My Cats", icon: "🐱", action: () => router.push("/profile") },
    { label: "Emergency Contacts", icon: "🆘", action: () => router.push("/emergency-contact") },
    { label: "What Makes Us Better", icon: "📍", action: () => router.push("/what-makes-us-better") },
    { label: "Geofence Setup", icon: "🛡️", action: () => router.push("/geofence-setup") },
    { label: "About Us", icon: "ℹ️", action: () => router.push("/about") },
    { label: "Settings", icon: "⚙️", action: () => router.push("/profile") },
    { label: "Help & Support", icon: "❓", action: () => router.push("/support") },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50"
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              backgroundColor: colors.background,
            }}
            className="w-[280px] h-full shadow-2xl"
          >
            {/* User Info Section */}
            <View className="px-6 py-8 border-b border-border">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-3">
                <Text className="text-3xl">👤</Text>
              </View>
              <Text className="text-xl font-bold text-foreground">
                {user?.name || "Guest User"}
              </Text>
              <Text className="text-sm text-muted mt-1">
                {user?.email || "Not signed in"}
              </Text>
            </View>

            {/* Menu Items */}
            <View className="flex-1 py-4">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMenuItemPress(item.action)}
                  className="flex-row items-center px-6 py-4 active:bg-surface"
                >
                  <Text className="text-2xl mr-4">{item.icon}</Text>
                  <Text className="text-base font-medium text-foreground">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <View className="px-6 py-4 border-t border-border">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center py-3 active:opacity-70"
              >
                <Text className="text-2xl mr-4">🚪</Text>
                <Text className="text-base font-semibold text-error">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View className="px-6 py-3 bg-surface">
              <Text className="text-xs text-muted text-center">
                4 Paws v1.0.0
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
