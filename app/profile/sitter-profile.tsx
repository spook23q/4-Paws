import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { isSuburbInSydney, OUT_OF_AREA_MESSAGE } from "@/shared/sydney-geofence";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function SitterProfileEditorScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();

  // Fetch existing profile
  const { data: existingProfile } = trpc.profiles.getSitterProfile.useQuery(
    { userId: user?.id },
    { enabled: !!user && user.role === "sitter" }
  );

  // Form state
  const [suburb, setSuburb] = useState("");
  const [serviceAreaRadius, setServiceAreaRadius] = useState("10");
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");

  // Skills state
  const [acceptsIndoor, setAcceptsIndoor] = useState(true);
  const [acceptsOutdoor, setAcceptsOutdoor] = useState(true);
  const [acceptsKittens, setAcceptsKittens] = useState(true);
  const [acceptsSeniors, setAcceptsSeniors] = useState(true);
  const [acceptsMedicalNeeds, setAcceptsMedicalNeeds] = useState(false);
  const [canAdministerMedication, setCanAdministerMedication] = useState(false);
  const [canGiveInjections, setCanGiveInjections] = useState(false);
  const [experienceSpecialDiets, setExperienceSpecialDiets] = useState(false);

  const [loading, setLoading] = useState(false);

  // Mutations
  const saveProfileMutation = trpc.profiles.createSitterProfile.useMutation();

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setSuburb(existingProfile.suburb || "");
      setServiceAreaRadius(existingProfile.serviceAreaRadius?.toString() || "10");
      setPricePerDay(existingProfile.pricePerDay?.toString() || "");
      setPricePerNight(existingProfile.pricePerNight?.toString() || "");
      setYearsExperience(existingProfile.yearsExperience?.toString() || "");
      setBio(existingProfile.bio || "");
      setAcceptsIndoor(existingProfile.acceptsIndoor ?? true);
      setAcceptsOutdoor(existingProfile.acceptsOutdoor ?? true);
      setAcceptsKittens(existingProfile.acceptsKittens ?? true);
      setAcceptsSeniors(existingProfile.acceptsSeniors ?? true);
      setAcceptsMedicalNeeds(existingProfile.acceptsMedicalNeeds ?? false);
      setCanAdministerMedication(existingProfile.canAdministerMedication ?? false);
      setCanGiveInjections(existingProfile.canGiveInjections ?? false);
      setExperienceSpecialDiets(existingProfile.experienceSpecialDiets ?? false);
    }
  }, [existingProfile]);

  const handleSave = async () => {
    // Validation
    if (!suburb.trim()) {
      Alert.alert("Error", "Please enter your suburb");
      return;
    }

    if (!isSuburbInSydney(suburb.trim())) {
      Alert.alert("Outside Service Area", OUT_OF_AREA_MESSAGE);
      return;
    }

    if (!pricePerDay || parseFloat(pricePerDay) <= 0) {
      Alert.alert("Error", "Please enter a valid price per day");
      return;
    }

    if (!pricePerNight || parseFloat(pricePerNight) <= 0) {
      Alert.alert("Error", "Please enter a valid price per night");
      return;
    }

    if (!yearsExperience || parseInt(yearsExperience) < 0) {
      Alert.alert("Error", "Please enter your years of experience");
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        suburb: suburb.trim(),
        serviceAreaRadius: parseInt(serviceAreaRadius) || 10,
        pricePerDay: parseFloat(pricePerDay),
        pricePerNight: parseFloat(pricePerNight),
        yearsExperience: parseInt(yearsExperience),
        bio: bio.trim(),
        acceptsIndoor,
        acceptsOutdoor,
        acceptsKittens,
        acceptsSeniors,
        acceptsMedicalNeeds,
        canAdministerMedication,
        canGiveInjections,
        experienceSpecialDiets,
        canHandleMultipleCats: true, // Default to true
      };

      await saveProfileMutation.mutateAsync(profileData);
      Alert.alert("Success", existingProfile ? "Profile updated successfully!" : "Profile created successfully!");

      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "sitter") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Sitter Account Required
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            This page is only accessible to cat sitters
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground ml-4">
              {existingProfile ? "Edit Profile" : "Complete Your Profile"}
            </Text>
          </View>

          {/* Location Section */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Location & Service Area</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">Suburb *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="e.g., Bondi, Sydney"
              placeholderTextColor="#1F2937"
              value={suburb}
              onChangeText={setSuburb}
            />

            <Text className="text-sm font-semibold text-foreground mb-2">
              Service Area Radius (km) *
            </Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="10"
              placeholderTextColor="#1F2937"
              value={serviceAreaRadius}
              onChangeText={setServiceAreaRadius}
              keyboardType="numeric"
            />
          </View>

          {/* Pricing Section */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Pricing</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">
              Price Per Day Visit ($) *
            </Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="50"
              placeholderTextColor="#1F2937"
              value={pricePerDay}
              onChangeText={setPricePerDay}
              keyboardType="decimal-pad"
            />

            <Text className="text-sm font-semibold text-foreground mb-2">
              Price Per Overnight Stay ($) *
            </Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="80"
              placeholderTextColor="#1F2937"
              value={pricePerNight}
              onChangeText={setPricePerNight}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Experience Section */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Experience</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">
              Years of Experience *
            </Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="5"
              placeholderTextColor="#1F2937"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="numeric"
            />

            <Text className="text-sm font-semibold text-foreground mb-2">Bio</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Tell cat owners about yourself and your experience..."
              placeholderTextColor="#1F2937"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text className="text-xs text-muted mt-1">{bio.length}/500 characters</Text>
          </View>

          {/* Cat Types Section */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Cat Types I Accept</Text>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Indoor Cats</Text>
                <Switch
                  value={acceptsIndoor}
                  onValueChange={setAcceptsIndoor}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Outdoor Cats</Text>
                <Switch
                  value={acceptsOutdoor}
                  onValueChange={setAcceptsOutdoor}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Kittens</Text>
                <Switch
                  value={acceptsKittens}
                  onValueChange={setAcceptsKittens}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Senior Cats</Text>
                <Switch
                  value={acceptsSeniors}
                  onValueChange={setAcceptsSeniors}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Cats with Medical Needs</Text>
                <Switch
                  value={acceptsMedicalNeeds}
                  onValueChange={setAcceptsMedicalNeeds}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>

          {/* Special Skills Section */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Special Skills</Text>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Can Administer Medication</Text>
                <Switch
                  value={canAdministerMedication}
                  onValueChange={setCanAdministerMedication}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Can Give Injections</Text>
                <Switch
                  value={canGiveInjections}
                  onValueChange={setCanGiveInjections}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Experience with Special Diets</Text>
                <Switch
                  value={experienceSpecialDiets}
                  onValueChange={setExperienceSpecialDiets}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-6"
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
