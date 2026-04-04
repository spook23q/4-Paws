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
import { Platform, StyleSheet, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { useState, useMemo } from "react";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function SitterDetailScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data: sitter, isLoading } = trpc.sitters.getById.useQuery(
    { userId: id || "" },
    { enabled: !!id }
  );

  // Favourites
  const { data: favStatus, refetch: refetchFavStatus } = trpc.favourites.isFavourited.useQuery(
    { sitterId: id || "" },
    { enabled: !!id && !!user }
  );
  const addFavMutation = trpc.favourites.add.useMutation({ onSuccess: () => refetchFavStatus() });
  const removeFavMutation = trpc.favourites.remove.useMutation({ onSuccess: () => refetchFavStatus() });

  const handleToggleFavourite = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to save favourites", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/auth/sign-in" as any) },
      ]);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      if (favStatus?.isFavourited) {
        await removeFavMutation.mutateAsync({ sitterId: id || "" });
      } else {
        await addFavMutation.mutateAsync({ sitterId: id || "" });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update favourite");
    }
  };

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
          <View style={sitterStyles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Favourite Heart Button */}
            <TouchableOpacity
              onPress={handleToggleFavourite}
              activeOpacity={0.6}
              style={[sitterStyles.favButton, { backgroundColor: favStatus?.isFavourited ? `${colors.error}15` : `${colors.muted}10` }]}
            >
              <IconSymbol
                name="heart.fill"
                size={22}
                color={favStatus?.isFavourited ? colors.error : colors.muted}
              />
            </TouchableOpacity>
          </View>

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

          {/* Availability Calendar */}
          <SitterAvailabilitySection sitterId={id || ""} colors={colors} />

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

// Availability calendar section for owners to view sitter availability
function SitterAvailabilitySection({ sitterId, colors }: { sitterId: string; colors: any }) {
  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const { data: availData, isLoading } = trpc.availability.getForSitter.useQuery(
    { sitterId, year: currentYear, month: currentMonth },
    { enabled: !!sitterId }
  );

  const dateStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    if (availData) {
      for (const row of availData) {
        map.set(row.date, row.status);
      }
    }
    return map;
  }, [availData]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentYear, currentMonth]);

  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [currentYear, currentMonth]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const formatDateStr = (day: number) =>
    `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const availableCount = availData?.filter((d) => d.status === "available").length ?? 0;

  return (
    <View className="bg-surface rounded-2xl p-5 mb-6 border border-border">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <IconSymbol name="calendar" size={20} color={colors.success} />
        <Text className="text-xl font-bold text-foreground">Availability</Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 14 }}>
        {availableCount > 0
          ? `${availableCount} day(s) available this month`
          : "No availability set for this month"}
      </Text>

      {/* Month Nav */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <TouchableOpacity onPress={goToPrevMonth} activeOpacity={0.7} style={{ padding: 6 }}>
          <IconSymbol name="chevron.left" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>{monthName}</Text>
        <TouchableOpacity onPress={goToNextMonth} activeOpacity={0.7} style={{ padding: 6 }}>
          <IconSymbol name="chevron.right" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {DAYS_OF_WEEK.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: colors.muted, textTransform: "uppercase" }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {isLoading ? (
        <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <View key={`e-${idx}`} style={{ width: `${100 / 7}%` as any, aspectRatio: 1 }} />;
            }
            const dateStr = formatDateStr(day);
            const status = dateStatusMap.get(dateStr);
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;

            let bgColor = "transparent";
            let textColor = colors.foreground;
            if (isPast) {
              textColor = `${colors.muted}50`;
            } else if (status === "available") {
              bgColor = `${colors.success}20`;
              textColor = colors.success;
            } else if (status === "unavailable") {
              bgColor = `${colors.error}15`;
              textColor = colors.error;
            }

            return (
              <View
                key={`d-${day}`}
                style={[
                  {
                    width: `${100 / 7}%` as any,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    backgroundColor: bgColor,
                  },
                  isToday && { borderWidth: 1.5, borderColor: colors.primary },
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: isToday ? "800" : "500", color: textColor }}>
                  {day}
                </Text>
                {status && !isPast && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 2,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: status === "available" ? colors.success : colors.error,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Legend */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <Text style={{ fontSize: 11, color: colors.muted }}>Available</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
          <Text style={{ fontSize: 11, color: colors.muted }}>Unavailable</Text>
        </View>
      </View>
    </View>
  );
}

const sitterStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
