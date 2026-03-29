import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { ProfileHeaderSkeleton, Skeleton } from "@/components/ui/skeleton";
import { PawLoadingAnimation } from "@/components/ui/loading-spinner";

export default function SitterDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data: sitter, isLoading } = trpc.sitters.getById.useQuery(
    { userId: id || "" },
    { enabled: !!id }
  );

  // Mutation to get or create conversation
  const getOrCreateConversationMutation = trpc.messages.getOrCreateConversation.useMutation();

  const handleStartChat = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to message this sitter", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/auth/sign-in" as any) },
      ]);
      return;
    }

    if (user.role !== "owner") {
      Alert.alert("Owner Account Required", "Only cat owners can message sitters");
      return;
    }

    try {
      const result = await getOrCreateConversationMutation.mutateAsync({
        otherUserId: id || "",
      });
      router.push(`/messages/${result.conversationId}` as any);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start conversation");
    }
  };

  const handleBookingRequest = () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to book a sitter", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/auth/sign-in" as any) },
      ]);
      return;
    }

    if (user.role !== "owner") {
      Alert.alert("Owner Account Required", "Only cat owners can book sitters");
      return;
    }

    // Navigate to booking request form
    router.push(`/bookings/request?sitterId=${id}` as any);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6">
            <TouchableOpacity
              className="mb-4"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <PawLoadingAnimation message="Loading sitter profile..." />
            <ProfileHeaderSkeleton />
            
            {/* Pricing Skeleton */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <View className="flex-row justify-between mb-3">
                <Skeleton width="40%" height={18} />
                <Skeleton width={60} height={24} />
              </View>
              <View className="flex-row justify-between">
                <Skeleton width="45%" height={18} />
                <Skeleton width={60} height={24} />
              </View>
            </View>
            
            {/* Bio Skeleton */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Skeleton width="30%" height={20} className="mb-4" />
              <Skeleton width="100%" height={14} className="mb-2" />
              <Skeleton width="90%" height={14} className="mb-2" />
              <Skeleton width="70%" height={14} />
            </View>
            
            {/* Skills Skeleton */}
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Skeleton width="40%" height={20} className="mb-4" />
              <View className="flex-row flex-wrap">
                <Skeleton width={80} height={32} borderRadius={16} className="mr-2 mb-2" />
                <Skeleton width={100} height={32} borderRadius={16} className="mr-2 mb-2" />
                <Skeleton width={70} height={32} borderRadius={16} className="mr-2 mb-2" />
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (!sitter) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Sitter Not Found</Text>
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

  const skills = [];
  if (sitter.canAdministerMedication) skills.push("Medication");
  if (sitter.acceptsSeniors) skills.push("Senior Cats");
  if (sitter.acceptsKittens) skills.push("Kittens");
  if (sitter.acceptsMedicalNeeds) skills.push("Medical Needs");
  if (sitter.acceptsIndoor) skills.push("Indoor Cats");
  if (sitter.acceptsOutdoor) skills.push("Outdoor Cats");
  if (sitter.canGiveInjections) skills.push("Injections");
  if (sitter.experienceSpecialDiets) skills.push("Special Diets");

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View className="px-6 pt-6 pb-4">
          <TouchableOpacity
            className="mb-4"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Profile Section */}
          <View className="items-center mb-6">
            <View className="w-32 h-32 rounded-full bg-secondary items-center justify-center mb-4">
              {sitter.userProfilePhoto ? (
                <Image
                  source={{ uri: sitter.userProfilePhoto }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <IconSymbol name="person.fill" size={64} color={colors.muted} />
              )}
            </View>

            <Text className="text-3xl font-bold text-foreground mb-2">
              {sitter.userName}
            </Text>

            {/* Rating */}
            <View className="flex-row items-center mb-2">
              <IconSymbol name="star.fill" size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">
                {sitter.averageRating > 0 ? sitter.averageRating.toFixed(1) : "New"}
              </Text>
              <Text className="text-base text-muted ml-2">
                ({sitter.totalReviews} review{sitter.totalReviews !== 1 ? "s" : ""})
              </Text>
            </View>

            <Text className="text-base text-muted mb-1">{sitter.suburb}</Text>
            <Text className="text-sm text-muted">
              {sitter.serviceAreaRadius}km service radius
            </Text>
          </View>

          {/* Pricing */}
          <View className="bg-primary/10 rounded-2xl p-5 mb-6 border-2 border-primary/20">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-foreground">Per Day Visit</Text>
              <Text className="text-2xl font-bold text-primary">
                ${sitter.pricePerDay}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Overnight Stay</Text>
              <Text className="text-2xl font-bold text-primary">
                ${sitter.pricePerNight}
              </Text>
            </View>
          </View>

          {/* Experience */}
          <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-xl font-bold text-foreground mb-4">Experience</Text>
            <View className="flex-row items-center mb-3">
              <IconSymbol name="clock.fill" size={20} color={colors.success} />
              <Text className="text-base text-foreground ml-3">
                {sitter.yearsExperience} years of experience
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <IconSymbol name="checkmark.seal.fill" size={20} color={colors.success} />
              <Text className="text-base text-foreground ml-3">
                {sitter.totalBookings} completed booking{sitter.totalBookings !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Bio */}
          {sitter.bio && (
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-xl font-bold text-foreground mb-3">About Me</Text>
              <Text className="text-base text-foreground leading-relaxed">
                {sitter.bio}
              </Text>
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-xl font-bold text-foreground mb-4">Special Skills</Text>
              <View className="flex-row flex-wrap">
                {skills.map((skill, index) => (
                  <View
                    key={index}
                    className="bg-primary/10 rounded-full px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-sm font-semibold text-primary">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          {sitter.reviews && sitter.reviews.length > 0 && (
            <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-xl font-bold text-foreground mb-4">
                Reviews ({sitter.reviews.length})
              </Text>
              {sitter.reviews.map((review: any) => (
                <View
                  key={review.id}
                  className="mb-4 pb-4 border-b border-border last:border-b-0 last:mb-0 last:pb-0"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold text-foreground">
                      {review.ownerName}
                    </Text>
                    <View className="flex-row items-center">
                      <IconSymbol name="star.fill" size={16} color={colors.primary} />
                      <Text className="text-sm font-bold text-foreground ml-1">
                        {review.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  {review.reviewText && (
                    <Text className="text-sm text-muted leading-relaxed mb-2">
                      {review.reviewText}
                    </Text>
                  )}
                  <Text className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Request Booking Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mb-6"
            onPress={handleBookingRequest}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Request Booking</Text>
          </TouchableOpacity>

          {/* Contact */}
          {user && user.role === "owner" && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-surface border border-border rounded-xl py-3 items-center"
                onPress={() => Alert.alert("Phone", sitter.userPhone || "Not available")}
                activeOpacity={0.7}
              >
                <IconSymbol name="phone.fill" size={20} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground mt-1">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-surface border border-border rounded-xl py-3 items-center"
                onPress={handleStartChat}
                activeOpacity={0.7}
              >
                <IconSymbol name="message.fill" size={20} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground mt-1">Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
