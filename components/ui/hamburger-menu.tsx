import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "./icon-symbol";
import { router } from "expo-router";

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  color?: string;
}

export interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  items?: MenuItem[];
  userInfo?: {
    name: string;
    email: string;
    role: "owner" | "sitter";
  };
}

export function HamburgerMenu({ visible, onClose, items = [], userInfo }: HamburgerMenuProps) {
  const colors = useColors();

  const handleMenuItemPress = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Pressable
        className="flex-1 bg-black/30"
        onPress={onClose}
      />

      {/* Menu Content */}
      <View
        className="absolute top-0 right-0 bg-surface rounded-bl-2xl shadow-lg"
        style={{
          width: 280,
          maxHeight: "80%",
          borderBottomLeftRadius: 24,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Info Section */}
          {userInfo && (
            <View className="border-b p-4" style={{ borderBottomColor: colors.border }}>
              <View className="flex-row items-center mb-2">
                <View
                  className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <IconSymbol name="person.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground text-sm">
                    {userInfo.name}
                  </Text>
                  <Text className="text-muted text-xs">
                    {userInfo.role === "owner" ? "Cat Owner" : "Cat Sitter"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Menu Items */}
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleMenuItemPress(item.route)}
                className="flex-row items-center px-4 py-3 border-b"
                style={{ borderBottomColor: colors.border }}
                activeOpacity={0.6}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={20}
                  color={item.color || colors.primary}
                />
                <Text className="ml-3 text-foreground font-medium flex-1">
                  {item.label}
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </TouchableOpacity>
            ))
          ) : (
            <View className="px-4 py-6 items-center">
              <Text className="text-muted text-sm">No menu items available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
