import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  Image,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { useThemeContext } from "@/lib/theme-provider";
import { router } from "expo-router";
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useScreenLayout } from "@/hooks/use-screen-layout";

type ProfileSection = "about" | "pets" | "favourites" | "address" | "account" | "info";

export default function ProfileScreen() {
  const colors = useColors();
  const { user, signOut, updateUser } = useAuth();
  const { themeMode, setThemeMode, isDarkMode } = useThemeContext();
  const [activeSection, setActiveSection] = useState<ProfileSection>("about");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { isLandscape, contentMaxWidth } = useScreenLayout();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation();
  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation();
  const uploadPhotoMutation = trpc.upload.uploadProfilePhoto.useMutation();

  // Favourites query
  const {
    data: favouritesList,
    isLoading: favouritesLoading,
    refetch: refetchFavourites,
  } = trpc.favourites.list.useQuery(undefined, {
    enabled: !!user,
  });
  const removeFavouriteMutation = trpc.favourites.remove.useMutation({
    onSuccess: () => refetchFavourites(),
  });

  const handlePickPhoto = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Ask user to choose camera or gallery
    Alert.alert("Change Profile Photo", "Choose a source", [
      {
        text: "Camera",
        onPress: () => pickFromCamera(),
      },
      {
        text: "Photo Library",
        onPress: () => pickFromGallery(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      await uploadPhoto(result.assets[0].base64, result.assets[0].mimeType || "image/jpeg");
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed to choose a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      await uploadPhoto(result.assets[0].base64, result.assets[0].mimeType || "image/jpeg");
    }
  };

  const uploadPhoto = async (base64: string, mimeType: string) => {
    if (!user) return;
    setIsUploadingPhoto(true);
    try {
      const result = await uploadPhotoMutation.mutateAsync({
        base64,
        mimeType,
      });
      // Update local user state with new photo URL
      await updateUser({ ...user, profilePhoto: result.url });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success", "Profile photo updated!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const result = await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      // Update local user state
      await updateUser({
        ...user,
        name: result.name || user.name,
        phone: result.phone || "",
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

  const handleRemoveFavourite = (sitterId: string, sitterName: string | null) => {
    Alert.alert(
      "Remove Favourite",
      `Remove ${sitterName || "this sitter"} from your favourites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavouriteMutation.mutateAsync({ sitterId });
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove favourite");
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <IconSymbol name="person.fill" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.signInTitle, { color: colors.foreground }]}>
            Sign in to view your profile
          </Text>
          <Text style={[styles.signInSubtitle, { color: colors.muted }]}>
            Create an account or sign in to manage your profile, pets, and bookings.
          </Text>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/auth/sign-in" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const sections: { key: ProfileSection; label: string }[] = [
    { key: "about", label: "About Me" },
    { key: "pets", label: "My Pets" },
    ...(user.role === "owner"
      ? [{ key: "favourites" as ProfileSection, label: "Favourites" }]
      : []),
    { key: "address", label: "My Address" },
    { key: "account", label: "Account" },
    { key: "info", label: "App Info" },
  ];

  const renderSectionNav = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sectionNavContainer}
    >
      {sections.map((section) => {
        const isActive = activeSection === section.key;
        return (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionPill,
              {
                backgroundColor: isActive ? colors.primary : `${colors.primary}10`,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveSection(section.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sectionPillText,
                { color: isActive ? "#FFFFFF" : colors.primary },
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderAboutMe = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Info</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
            <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isEditing ? (
        <>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Full Name</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Phone Number</Text>
            <TextInput
              style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="0412 345 678"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => {
                setName(user.name);
                setPhone(user.phone || "");
                setIsEditing(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Full Name</Text>
            <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.name}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Email</Text>
            <Text style={[styles.fieldValue, { color: colors.foreground }]}>{user.email}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Phone</Text>
            <Text style={[styles.fieldValue, { color: colors.foreground }]}>
              {user.phone || "Not provided"}
            </Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Role</Text>
            <Text style={[styles.fieldValue, { color: colors.foreground }]}>
              {user.role === "owner" ? "Cat Owner" : "Cat Sitter"}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  const renderMyPets = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Pets</Text>
      <Text style={[styles.sectionDescription, { color: colors.muted }]}>
        {user.role === "owner"
          ? "Manage your cat profiles, including their details, medical notes, and feeding schedules."
          : "View and manage your sitter profile to attract more clients."}
      </Text>

      {user.role === "owner" ? (
        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/profile/my-cats" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name="pawprint.fill" size={22} color={colors.primary} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>My Cats</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>
              Add and manage your cat profiles
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/profile/sitter-profile" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name="person.fill" size={22} color={colors.primary} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Sitter Profile</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>
              Update your sitter information and pricing
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      )}

      {user.role === "sitter" && (
        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border, marginTop: 10 }]}
          onPress={() => router.push("/profile/my-availability" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.success}15` }]}>
            <IconSymbol name="calendar" size={22} color={colors.success} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>My Availability</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>
              Set your available and unavailable dates
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      )}

      {user.role === "sitter" && (
        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border, marginTop: 10 }]}
          onPress={() => router.push("/profile/compliance-documents" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.warning}15` }]}>
            <IconSymbol name="shield.fill" size={22} color={colors.warning} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Compliance Documents</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>
              Upload WWCC, certificates & qualifications
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFavourites = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeaderRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <IconSymbol name="heart.fill" size={20} color={colors.error} />
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>
            Favourite Sitters
          </Text>
        </View>
        {favouritesList && favouritesList.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.countBadgeText, { color: colors.primary }]}>
              {favouritesList.length}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.sectionDescription, { color: colors.muted }]}>
        Your saved sitters for quick access when booking.
      </Text>

      {favouritesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading favourites...</Text>
        </View>
      ) : !favouritesList || favouritesList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="heart.fill" size={40} color={`${colors.muted}40`} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favourites yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Browse sitters and tap the heart icon to save your favourites here.
          </Text>
          <TouchableOpacity
            style={[styles.browseSittersButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/search" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.browseSittersButtonText}>Browse Sitters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.favouritesList}>
          {favouritesList.map((fav) => (
            <TouchableOpacity
              key={fav.id?.toString()}
              style={[styles.favouriteCard, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => router.push(`/sitters/${fav.sitterId}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.favouriteCardContent}>
                {/* Avatar */}
                {fav.sitterPhoto ? (
                  <Image
                    source={{ uri: fav.sitterPhoto }}
                    style={styles.favouriteAvatar}
                  />
                ) : (
                  <View style={[styles.favouriteAvatarPlaceholder, { backgroundColor: `${colors.primary}15` }]}>
                    <IconSymbol name="person.fill" size={24} color={colors.primary} />
                  </View>
                )}

                {/* Info */}
                <View style={styles.favouriteInfo}>
                  <Text style={[styles.favouriteName, { color: colors.foreground }]} numberOfLines={1}>
                    {fav.sitterName || "Unknown Sitter"}
                  </Text>
                  <Text style={[styles.favouriteSuburb, { color: colors.muted }]} numberOfLines={1}>
                    {fav.sitterSuburb || "Location not set"}
                  </Text>
                  <View style={styles.favouriteStats}>
                    {fav.sitterRating > 0 && (
                      <View style={styles.favouriteStat}>
                        <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                        <Text style={[styles.favouriteStatText, { color: colors.foreground }]}>
                          {fav.sitterRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    {fav.sitterPricePerDay && (
                      <Text style={[styles.favouritePrice, { color: colors.primary }]}>
                        ${fav.sitterPricePerDay}/day
                      </Text>
                    )}
                  </View>
                </View>

                {/* Remove button */}
                <TouchableOpacity
                  style={[styles.removeFavButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavourite(fav.sitterId?.toString() || "", fav.sitterName);
                  }}
                  activeOpacity={0.6}
                >
                  <IconSymbol name="heart.fill" size={22} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderMyAddress = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Address</Text>
      <Text style={[styles.sectionDescription, { color: colors.muted }]}>
        Your address is used for geofencing and finding nearby sitters in your area.
      </Text>

      <TouchableOpacity
        style={[styles.navCard, { borderColor: colors.border }]}
        onPress={() => router.push("/(tabs)/settings/address" as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.navCardIcon, { backgroundColor: `${colors.primary}15` }]}>
          <IconSymbol name="location.fill" size={22} color={colors.primary} />
        </View>
        <View style={styles.navCardContent}>
          <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Manage Address</Text>
          <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>
            Update your street address, suburb, and postcode
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );

  const renderAccountSettings = () => (
    <View>
      {/* Appearance */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <IconSymbol name="moon.fill" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginLeft: 8 }]}>Appearance</Text>
        </View>

        <View style={styles.themeOptions}>
          {([
            { mode: "light" as const, icon: "sun.max.fill" as const, label: "Light" },
            { mode: "dark" as const, icon: "moon.fill" as const, label: "Dark" },
            { mode: "system" as const, icon: "gear" as const, label: "System" },
          ]).map((option) => {
            const isActive = themeMode === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? `${colors.primary}10` : "transparent",
                  },
                ]}
                onPress={() => handleThemeModeChange(option.mode)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={option.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color: isActive ? colors.primary : colors.foreground,
                      fontWeight: isActive ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {isActive && (
                  <IconSymbol name="checkmark.circle.fill" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.themeHint, { color: colors.muted }]}>
          Currently using {isDarkMode ? "dark" : "light"} theme
        </Text>
      </View>

      {/* Quick Links */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Links</Text>

        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/settings/notification-sounds" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name="bell.fill" size={22} color={colors.primary} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Notification Sounds</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>Configure alert tones for messages, bookings & more</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/bookings" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.success}15` }]}>
            <IconSymbol name="calendar" size={22} color={colors.success} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>My Bookings</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>View booking history</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/messages" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.warning}15` }]}>
            <IconSymbol name="message.fill" size={22} color={colors.warning} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Messages</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>View conversations</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navCard, { borderColor: colors.border }]}
          onPress={() => router.push("/(tabs)/pricing" as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.navCardIcon, { backgroundColor: `${colors.success}15` }]}>
            <IconSymbol name="dollarsign.circle.fill" size={22} color={colors.success} />
          </View>
          <View style={styles.navCardContent}>
            <Text style={[styles.navCardTitle, { color: colors.foreground }]}>Pricing Comparison</Text>
            <Text style={[styles.navCardSubtitle, { color: colors.muted }]}>Why choose 4 Paws?</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Actions</Text>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: colors.error }]}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppInfo = () => (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>App Information</Text>

      {[
        { label: "About 4 Paws", route: "/(tabs)/about" },
        { label: "FAQ", route: "/(tabs)/faq" },
        { label: "Safety & Trust", route: "/(tabs)/safety" },
        { label: "Support", route: "/(tabs)/support" },
        { label: "Privacy Policy", route: "/(tabs)/privacy" },
        { label: "Terms of Service", route: "/(tabs)/terms" },
      ].map((item, index, arr) => (
        <TouchableOpacity
          key={item.route}
          style={[
            styles.infoLink,
            index < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
          ]}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.7}
        >
          <Text style={[styles.infoLinkText, { color: colors.foreground }]}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.versionText, { color: colors.muted }]}>Version 1.0.0</Text>
    </View>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "about":
        return renderAboutMe();
      case "pets":
        return renderMyPets();
      case "favourites":
        return renderFavourites();
      case "address":
        return renderMyAddress();
      case "account":
        return renderAccountSettings();
      case "info":
        return renderAppInfo();
      default:
        return renderAboutMe();
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }]}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Tappable Avatar with Photo Upload */}
          <TouchableOpacity
            onPress={handlePickPhoto}
            activeOpacity={0.8}
            style={styles.avatarTouchable}
          >
            {user.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarContainer, { backgroundColor: `${colors.primary}15` }]}>
                <IconSymbol name="person.fill" size={48} color={colors.primary} />
              </View>
            )}
            {/* Camera badge overlay */}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              {isUploadingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.muted }]}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name="pawprint.fill" size={14} color={colors.primary} />
            <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
              {user.role === "owner" ? "Cat Owner" : "Cat Sitter"}
            </Text>
          </View>
        </View>

        {/* Section Navigation */}
        {renderSectionNav()}

        {/* Active Section Content */}
        <View style={styles.sectionContent}>
          {renderActiveSection()}
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.error }]}>Delete Account</Text>
            <Text style={[styles.modalDescription, { color: colors.muted }]}>
              This action is permanent and cannot be undone. All your data will be deleted.
            </Text>

            <Text style={[styles.modalFieldLabel, { color: colors.foreground }]}>Password</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.muted}
              secureTextEntry
            />

            <Text style={[styles.modalFieldLabel, { color: colors.foreground }]}>
              Type DELETE to confirm
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteConfirmText("");
                }}
              >
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              >
                <Text style={styles.modalDeleteText}>
                  {deleteAccountMutation.isPending ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  // Sign in state
  signInTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Profile header
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  avatarTouchable: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Section navigation
  sectionNavContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sectionPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  sectionPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Section content
  sectionContent: {
    paddingHorizontal: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  editButton: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Field groups
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  // Edit actions
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Navigation cards
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  navCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  navCardContent: {
    flex: 1,
  },
  navCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  navCardSubtitle: {
    fontSize: 13,
  },
  // Theme options
  themeOptions: {
    gap: 10,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  themeOptionText: {
    fontSize: 15,
    flex: 1,
  },
  themeHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  // Favourites
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  browseSittersButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseSittersButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  favouritesList: {
    gap: 10,
  },
  favouriteCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  favouriteCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  favouriteAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  favouriteAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  favouriteInfo: {
    flex: 1,
  },
  favouriteName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  favouriteSuburb: {
    fontSize: 13,
    marginBottom: 4,
  },
  favouriteStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  favouriteStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  favouriteStatText: {
    fontSize: 13,
    fontWeight: "600",
  },
  favouritePrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  removeFavButton: {
    padding: 8,
    marginLeft: 4,
  },
  // Logout / Delete
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Info links
  infoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  infoLinkText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalFieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontWeight: "700",
  },
  modalDeleteButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
