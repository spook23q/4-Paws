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
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function EditCatScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch cat data
  const { data: cats } = trpc.profiles.getCats.useQuery(undefined, {
    enabled: !!user && user.role === "owner",
  });

  const cat = cats?.find((c: any) => c.id.toString() === id);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isIndoor, setIsIndoor] = useState(true);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [feedingSchedule, setFeedingSchedule] = useState("");
  
  // Temperament checkboxes
  const [isFriendly, setIsFriendly] = useState(false);
  const [isShy, setIsShy] = useState(false);
  const [isPlayful, setIsPlayful] = useState(false);
  const [isAggressive, setIsAggressive] = useState(false);
  const [isIndependent, setIsIndependent] = useState(false);

  const [loading, setLoading] = useState(false);

  // Mutation
  const updateCatMutation = trpc.profiles.updateCat.useMutation();

  // Load cat data
  useEffect(() => {
    if (cat) {
      setName(cat.name || "");
      setAge(cat.age?.toString() || "");
      setIsIndoor(cat.isIndoor ?? true);
      setMedicalNotes(cat.medicalNotes || "");
      setFeedingSchedule(cat.feedingSchedule || "");

      // Parse temperament array
      const temperamentArray = Array.isArray(cat.temperament) 
        ? cat.temperament 
        : [];
      
      setIsFriendly(temperamentArray.includes("Friendly"));
      setIsShy(temperamentArray.includes("Shy"));
      setIsPlayful(temperamentArray.includes("Playful"));
      setIsAggressive(temperamentArray.includes("Aggressive"));
      setIsIndependent(temperamentArray.includes("Independent"));
    }
  }, [cat]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your cat's name");
      return;
    }

    if (!age || parseInt(age) < 0) {
      Alert.alert("Error", "Please enter a valid age");
      return;
    }

    // Build temperament array
    const temperament = [];
    if (isFriendly) temperament.push("Friendly");
    if (isShy) temperament.push("Shy");
    if (isPlayful) temperament.push("Playful");
    if (isAggressive) temperament.push("Aggressive");
    if (isIndependent) temperament.push("Independent");

    if (temperament.length === 0) {
      Alert.alert("Error", "Please select at least one temperament trait");
      return;
    }

    setLoading(true);

    try {
      await updateCatMutation.mutateAsync({
        id: id || "",
        name: name.trim(),
        age: parseInt(age),
        temperament,
        medicalNotes: medicalNotes.trim(),
        feedingSchedule: feedingSchedule.trim(),
        isIndoor,
      });

      Alert.alert("Success", `${name}'s profile has been updated!`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update cat");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "owner") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Owner Account Required
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            Only cat owners can edit cats
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

  if (!cat) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading cat details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground ml-4">
              Edit {cat.name}
            </Text>
          </View>

          {/* Basic Info */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Basic Information</Text>

            <Text className="text-sm font-semibold text-foreground mb-2">Name *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="e.g., Whiskers"
              placeholderTextColor="#1F2937"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-sm font-semibold text-foreground mb-2">Age (years) *</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              placeholder="e.g., 3"
              placeholderTextColor="#1F2937"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <View className="flex-row items-center justify-between py-2">
              <Text className="text-base text-foreground">Indoor Cat</Text>
              <Switch
                value={isIndoor}
                onValueChange={setIsIndoor}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Temperament */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Temperament *</Text>
            <Text className="text-sm text-muted mb-4">Select all that apply</Text>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Friendly</Text>
                <Switch
                  value={isFriendly}
                  onValueChange={setIsFriendly}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Shy</Text>
                <Switch
                  value={isShy}
                  onValueChange={setIsShy}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Playful</Text>
                <Switch
                  value={isPlayful}
                  onValueChange={setIsPlayful}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Aggressive</Text>
                <Switch
                  value={isAggressive}
                  onValueChange={setIsAggressive}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-base text-foreground">Independent</Text>
                <Switch
                  value={isIndependent}
                  onValueChange={setIsIndependent}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>
          </View>

          {/* Medical Notes */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Medical Notes</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Any medical conditions, allergies, or special needs..."
              placeholderTextColor="#1F2937"
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text className="text-xs text-muted mt-1">{medicalNotes.length}/500 characters</Text>
          </View>

          {/* Feeding Schedule */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Feeding Schedule</Text>
            <TextInput
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="e.g., 1/2 cup dry food twice daily at 8am and 6pm"
              placeholderTextColor="#1F2937"
              value={feedingSchedule}
              onChangeText={setFeedingSchedule}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text className="text-xs text-muted mt-1">{feedingSchedule.length}/300 characters</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-6"
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Updating..." : "Update Cat"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
