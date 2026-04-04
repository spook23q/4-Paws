import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function MyCatsScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();

  const { data: cats, refetch } = trpc.profiles.getCats.useQuery(undefined, {
    enabled: !!user && user.role === "owner",
  });

  const deleteCatMutation = trpc.profiles.deleteCat.useMutation();

  const handleDeleteCat = (catId: string, catName: string) => {
    Alert.alert(
      "Delete Cat",
      `Are you sure you want to remove ${catName} from your profile?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCatMutation.mutateAsync({ id: catId });
              Alert.alert("Success", `${catName} has been removed`);
              refetch();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete cat");
            }
          },
        },
      ]
    );
  };

  if (!user || user.role !== "owner") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">
            Owner Account Required
          </Text>
          <Text className="text-base text-muted text-center mb-6">
            This page is only accessible to cat owners
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
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <IconSymbol name="chevron.left" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-foreground ml-4">
                My Cats
              </Text>
            </View>
            <TouchableOpacity
              className="bg-primary px-4 py-2 rounded-xl"
              onPress={() => router.push("/profile/add-cat" as any)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Add Cat</Text>
            </TouchableOpacity>
          </View>

          {/* Cats List */}
          {cats && cats.length > 0 ? (
            <View className="space-y-4">
              {cats.map((cat: any) => (
                <View
                  key={cat.id}
                  className="bg-surface rounded-2xl p-5 border border-border"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-2xl font-bold text-foreground mb-1">
                        {cat.name}
                      </Text>
                      <Text className="text-base text-muted">
                        {cat.age} years old • {cat.temperament}
                      </Text>
                    </View>
                  </View>

                  {cat.medicalNotes && (
                    <View className="bg-warning/10 rounded-xl p-3 mb-3">
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        Medical Notes
                      </Text>
                      <Text className="text-sm text-foreground">{cat.medicalNotes}</Text>
                    </View>
                  )}

                  {cat.feedingSchedule && (
                    <View className="bg-primary/10 rounded-xl p-3 mb-3">
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        Feeding Schedule
                      </Text>
                      <Text className="text-sm text-foreground">{cat.feedingSchedule}</Text>
                    </View>
                  )}

                  <View className="flex-row gap-3 mt-2">
                    <TouchableOpacity
                      className="flex-1 bg-primary rounded-xl py-3 items-center"
                      onPress={() =>
                        router.push(`/profile/edit-cat?id=${cat.id}` as any)
                      }
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-error/10 border border-error rounded-xl py-3 items-center"
                      onPress={() => handleDeleteCat(cat.id.toString(), cat.name)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-error font-semibold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-32 h-32 rounded-full bg-secondary items-center justify-center mb-6">
                <IconSymbol name="heart.fill" size={64} color={colors.muted} />
              </View>
              <Text className="text-2xl font-bold text-foreground mb-3 text-center">
                No Cats Yet
              </Text>
              <Text className="text-base text-muted text-center mb-6 px-8">
                Add your cats to start booking cat sitters
              </Text>
              <TouchableOpacity
                className="bg-primary px-8 py-4 rounded-2xl"
                onPress={() => router.push("/profile/add-cat" as any)}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">Add Your First Cat</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
