import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useThemeContext } from "@/lib/theme-provider";
import { router } from "expo-router";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { themeMode, setThemeMode, isDarkMode } = useThemeContext();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const updateProfileMutation = trpc.auth.updateProfile.useMutation();
  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation();

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm");
      return;
    }
    if (!deletePassword) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        password: deletePassword,
        confirmText: deleteConfirmText,
      });
      setShowDeleteModal(false);
      Alert.alert("Account Deleted", "Your account has been permanently deleted.", [
        {
          text: "OK",
          onPress: async () => {
            await signOut();
            router.replace("/" as any);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete account");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/" as any);
          },
        },
      ]
    );
  };

  const handleThemeModeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#11181C", marginBottom: 16 }}>
            Please sign in to view your profile
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl py-3 px-6"
            onPress={() => router.push("/auth/sign-in" as any)}
          >
            <Text className="text-white font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const hamburgerMenuItems = [
    ...(user.role === "owner"
      ? [
          {
            icon: "pawprint.fill" as const,
            title: "My Cats",
            description: "Manage your cat profiles",
            route: "/profile/my-cats" as any,
            color: colors.primary,
          },
        ]
      : [
          {
            icon: "person.fill" as const,
            title: "Sitter Profile",
            description: "Update your sitter information",
            route: "/profile/sitter-profile" as any,
            color: colors.primary,
          },
        ]),
    {
      icon: "location.fill" as const,
      title: "My Address",
      description: "Update your address for geofencing",
      route: "/(tabs)/settings/address" as any,
      color: colors.primary,
    },
    {
      icon: "calendar" as const,
      title: "My Bookings",
      description: "View your booking history",
      route: "/(tabs)/bookings" as any,
      color: colors.success,
    },
    {
      icon: "message.fill" as const,
      title: "Messages",
      description: "View your conversations",
      route: "/(tabs)/messages" as any,
      color: colors.warning,
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="person.fill" size={48} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{user.name}</Text>
            <Text style={{ fontSize: 16, color: colors.muted, marginTop: 4 }}>{user.email}</Text>
            <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${colors.primary}20` }}>
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                {user.role === "owner" ? "Cat Owner" : "Cat Sitter"}
              </Text>
            </View>
          </View>

          {/* Appearance Settings */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <View className="flex-row items-center mb-4">
              <IconSymbol name="moon.fill" size={20} color={colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginLeft: 8 }}>
                Appearance
              </Text>
            </View>

            {/* Theme Mode Options */}
            <View className="gap-3">
              {/* Light Mode */}
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 px-4 rounded-xl border"
                style={{
                  borderColor: themeMode === "light" ? colors.primary : colors.border,
                  backgroundColor: themeMode === "light" ? `${colors.primary}10` : colors.surface,
                }}
                onPress={() => handleThemeModeChange("light")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <IconSymbol name="sun.max.fill" size={24} color={themeMode === "light" ? colors.primary : colors.muted} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: themeMode === "light" ? "600" : "400",
                    color: themeMode === "light" ? colors.primary : colors.foreground,
                    marginLeft: 12 
                  }}>
                    Light Mode
                  </Text>
                </View>
                {themeMode === "light" && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* Dark Mode */}
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 px-4 rounded-xl border"
                style={{
                  borderColor: themeMode === "dark" ? colors.primary : colors.border,
                  backgroundColor: themeMode === "dark" ? `${colors.primary}10` : colors.surface,
                }}
                onPress={() => handleThemeModeChange("dark")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <IconSymbol name="moon.fill" size={24} color={themeMode === "dark" ? colors.primary : colors.muted} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: themeMode === "dark" ? "600" : "400",
                    color: themeMode === "dark" ? colors.primary : colors.foreground,
                    marginLeft: 12 
                  }}>
                    Dark Mode
                  </Text>
                </View>
                {themeMode === "dark" && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>

              {/* System Default */}
              <TouchableOpacity
                className="flex-row items-center justify-between py-3 px-4 rounded-xl border"
                style={{
                  borderColor: themeMode === "system" ? colors.primary : colors.border,
                  backgroundColor: themeMode === "system" ? `${colors.primary}10` : colors.surface,
                }}
                onPress={() => handleThemeModeChange("system")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <IconSymbol name="gear" size={24} color={themeMode === "system" ? colors.primary : colors.muted} />
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: themeMode === "system" ? "600" : "400",
                    color: themeMode === "system" ? colors.primary : colors.foreground,
                    marginLeft: 12 
                  }}>
                    System Default
                  </Text>
                </View>
                {themeMode === "system" && (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 12, textAlign: "center" }}>
              Currently using {isDarkMode ? "dark" : "light"} theme
            </Text>
          </View>

          {/* Personal Information */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>Personal Information</Text>
              {!isEditing ? (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                    Edit
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {isEditing ? (
              <>
                <View className="mb-4">
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Full Name</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3"
                    style={{ color: colors.foreground }}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <View className="mb-4">
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Phone Number</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3"
                    style={{ color: colors.foreground }}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="0412 345 678"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-primary rounded-xl py-3"
                    onPress={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Text className="text-white font-bold text-center">
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-surface border border-border rounded-xl py-3"
                    onPress={() => {
                      setName(user.name);
                      setPhone(user.phone || "");
                      setIsEditing(false);
                    }}
                  >
                    <Text style={{ fontWeight: "bold", textAlign: "center", color: colors.foreground }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View className="mb-3">
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Full Name</Text>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>{user.name}</Text>
                </View>
                <View className="mb-3">
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Email</Text>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>{user.email}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>Phone</Text>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
                    {user.phone || "Not provided"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Menu Items */}
          <View className="mb-6">
            {hamburgerMenuItems.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                className="bg-surface rounded-2xl p-4 mb-3 border border-border"
                onPress={() => router.push(item.route)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconSymbol name={item.icon} size={20} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>{item.label}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* App Information */}
          <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>App Information</Text>
            <TouchableOpacity
              className="py-3 border-b border-border"
              onPress={() => router.push("/(tabs)/about" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>About 4 Paws</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 border-b border-border"
              onPress={() => router.push("/(tabs)/faq" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 border-b border-border"
              onPress={() => router.push("/(tabs)/safety" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>Safety & Trust</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 border-b border-border"
              onPress={() => router.push("/(tabs)/support" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 border-b border-border"
              onPress={() => router.push("/(tabs)/privacy" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3"
              onPress={() => router.push("/(tabs)/terms" as any)}
            >
              <Text style={{ fontSize: 16, color: colors.foreground }}>Terms of Service</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="bg-error rounded-xl py-4 mb-4"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-center text-base">Logout</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            className="border border-error rounded-xl py-4 mb-8"
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.error }} className="font-bold text-center text-base">Delete Account</Text>
          </TouchableOpacity>

          {/* Delete Account Modal */}
          <Modal
            visible={showDeleteModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDeleteModal(false)}
          >
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View className="bg-surface rounded-2xl p-6 mx-6 w-full max-w-sm" style={{ backgroundColor: colors.surface }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.error, marginBottom: 8, textAlign: 'center' }}>
                  Delete Account
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16, textAlign: 'center' }}>
                  This action is permanent and cannot be undone. All your data will be deleted.
                </Text>

                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>Password</Text>
                <TextInput
                  className="border border-border rounded-xl px-4 py-3 mb-4"
                  style={{ color: colors.foreground, backgroundColor: colors.background }}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                />

                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>Type DELETE to confirm</Text>
                <TextInput
                  className="border border-border rounded-xl px-4 py-3 mb-6"
                  style={{ color: colors.foreground, backgroundColor: colors.background }}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="DELETE"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 border border-border rounded-xl py-3"
                    onPress={() => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                      setDeleteConfirmText("");
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', color: colors.foreground }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-error rounded-xl py-3"
                    onPress={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Text className="text-white font-bold text-center">
                      {deleteAccountMutation.isPending ? "Deleting..." : "Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* App Version */}
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: 16 }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
