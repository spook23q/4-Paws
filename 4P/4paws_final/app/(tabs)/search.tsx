import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { SitterMapView } from "@/components/SitterMapView";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { SitterListSkeleton } from "@/components/ui/skeleton";
import { PawLoadingAnimation } from "@/components/ui/loading-spinner";
import { NoSearchResults } from "@/components/ui/empty-state";

export default function SearchScreen() {
  const colors = useColors();

  const [suburb, setSuburb] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [skills, setSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price">("distance");

  // Fetch user address to auto-fill suburb
  const { data: userAddress } = trpc.profiles.getAddress.useQuery();

  // Auto-fill suburb from user address on first load
  useEffect(() => {
    if (userAddress?.suburb && !suburb) {
      setSuburb(userAddress.suburb);
    }
  }, [userAddress]);

  const { data: searchResult, isLoading } = trpc.sitters.search.useQuery({
    suburb: suburb || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minRating,
    canAdministerMedication: skills.includes("Medication") || undefined,
    acceptsSeniors: skills.includes("Senior Cats") || undefined,
    acceptsKittens: skills.includes("Kittens") || undefined,
    acceptsMedicalNeeds: skills.includes("Medical Needs") || undefined,
    acceptsIndoor: skills.includes("Indoor Only") || undefined,
    acceptsOutdoor: skills.includes("Outdoor Cats") || undefined,
  });

  const availableSkills = [
    "Medication",
    "Senior Cats",
    "Kittens",
    "Medical Needs",
    "Indoor Only",
    "Outdoor Cats",
    "Multiple Cats",
    "Grooming",
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const clearFilters = () => {
    setSuburb("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(undefined);
    setSkills([]);
  };

  const renderSitter = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-surface rounded-2xl p-4 mb-4 border"
      style={{ borderColor: "#B8E1F7" }}
      onPress={() => router.push(`/sitters/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Profile Photo */}
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mr-4" style={{ borderWidth: 2, borderColor: "#E6F4FE" }}>
          {item.profilePhoto ? (
            <Image
              source={{ uri: item.profilePhoto }}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <IconSymbol name="person.fill" size={32} color={colors.muted} />
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mb-1">{item.userName}</Text>
          <View className="flex-row items-center mb-2">
            <IconSymbol name="star.fill" size={16} color={colors.primary} />
            <Text className="text-sm font-semibold text-foreground ml-1">
              {item.averageRating?.toFixed(1) || "New"}
            </Text>
            <Text className="text-sm text-muted ml-1">
              ({item.totalReviews || 0} reviews)
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-muted mb-2">{item.suburb}</Text>
              <Text className="text-base font-bold text-primary">
                ${item.pricePerDay}/day
              </Text>
            </View>
            {sortBy === "distance" && userAddress?.latitude && userAddress?.longitude && (
              <View className="items-end">
                <IconSymbol name="location.fill" size={16} color={colors.primary} />
                <Text className="text-xs font-semibold text-primary mt-1">
                  {(() => {
                    const userLat = parseFloat(String(userAddress?.latitude || 0));
                    const userLon = parseFloat(String(userAddress?.longitude || 0));
                    const dist = Math.sqrt(
                      Math.pow((item.latitude || 0) - userLat, 2) +
                      Math.pow((item.longitude || 0) - userLon, 2)
                    );
                    return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
                  })()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Skills */}
      {(() => {
        const sitterSkills = [];
        if (item.canAdministerMedication) sitterSkills.push("Medication");
        if (item.acceptsSeniors) sitterSkills.push("Senior Cats");
        if (item.acceptsKittens) sitterSkills.push("Kittens");
        if (item.acceptsMedicalNeeds) sitterSkills.push("Medical Needs");
        if (item.acceptsIndoor) sitterSkills.push("Indoor");
        if (item.acceptsOutdoor) sitterSkills.push("Outdoor");
        return sitterSkills.length > 0 && (
        <View className="flex-row flex-wrap mt-3">
          {sitterSkills.slice(0, 3).map((skill: string, index: number) => (
            <View
              key={index}
              className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2"
            >
              <Text className="text-xs font-semibold text-primary">{skill}</Text>
            </View>
          ))}
          {sitterSkills.length > 3 && (
            <View className="bg-secondary rounded-full px-3 py-1 mb-2">
              <Text className="text-xs font-semibold text-muted">
                +{sitterSkills.length - 3} more
              </Text>
            </View>
          )}
        </View>
      );
      })()}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground mb-4">Find a Cat Sitter</Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border mb-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-foreground"
              placeholder="Enter suburb..."
              placeholderTextColor="#1F2937"
              value={suburb}
              onChangeText={setSuburb}
            />
          </View>

          {/* View Mode Toggle and Filters */}
          <View className="flex-row gap-3">
            {/* View Mode Toggle */}
            <View className="flex-row bg-surface rounded-xl border border-border overflow-hidden">
              <TouchableOpacity
                className={`px-4 py-3 ${viewMode === "list" ? "bg-primary" : "bg-surface"}`}
                onPress={() => setViewMode("list")}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="list.bullet"
                  size={20}
                  color={viewMode === "list" ? "white" : colors.muted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-3 ${viewMode === "map" ? "bg-primary" : "bg-surface"}`}
                onPress={() => setViewMode("map")}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="map"
                  size={20}
                  color={viewMode === "map" ? "white" : colors.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Filter Toggle */}
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 border border-border"
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <IconSymbol name="slider.horizontal.3" size={20} color={colors.primary} />
                <Text className="ml-2 text-foreground font-semibold">Filters</Text>
                {(minPrice || maxPrice || minRating || skills.length > 0) && (
                  <View className="ml-2 bg-primary rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {[minPrice, maxPrice, minRating, ...skills].filter(Boolean).length}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-primary text-lg">{showFilters ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${sortBy === "distance" ? "bg-primary" : "bg-surface border border-border"}`}
              onPress={() => setSortBy("distance")}
              activeOpacity={0.7}
            >
              <Text className={`text-center text-sm font-semibold ${sortBy === "distance" ? "text-white" : "text-foreground"}`}>Distance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${sortBy === "rating" ? "bg-primary" : "bg-surface border border-border"}`}
              onPress={() => setSortBy("rating")}
              activeOpacity={0.7}
            >
              <Text className={`text-center text-sm font-semibold ${sortBy === "rating" ? "text-white" : "text-foreground"}`}>Rating</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${sortBy === "price" ? "bg-primary" : "bg-surface border border-border"}`}
              onPress={() => setSortBy("price")}
              activeOpacity={0.7}
            >
              <Text className={`text-center text-sm font-semibold ${sortBy === "price" ? "text-white" : "text-foreground"}`}>Price</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <ScrollView className="px-6 pb-4 border-b border-border">
            {/* Price Range */}
            <Text className="text-sm font-bold text-foreground mb-2">Price Range</Text>
            <View className="flex-row items-center mb-4">
              <TextInput
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-foreground"
                placeholder="Min"
                placeholderTextColor="#1F2937"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <Text className="mx-3 text-muted">to</Text>
              <TextInput
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-foreground"
                placeholder="Max"
                placeholderTextColor="#1F2937"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>

            {/* Rating */}
            <Text className="text-sm font-bold text-foreground mb-2">Minimum Rating</Text>
            <View className="flex-row mb-4">
              {[4, 4.5, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  className={`flex-1 mr-2 py-2 rounded-xl items-center ${
                    minRating === rating ? "bg-primary" : "bg-surface border border-border"
                  }`}
                  onPress={() => setMinRating(minRating === rating ? undefined : rating)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold ${
                      minRating === rating ? "text-white" : "text-foreground"
                    }`}
                  >
                    {rating}+ ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Skills */}
            <Text className="text-sm font-bold text-foreground mb-2">Special Skills</Text>
            <View className="flex-row flex-wrap mb-4">
              {availableSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                    skills.includes(skill)
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                  onPress={() => toggleSkill(skill)}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      skills.includes(skill) ? "text-white" : "text-foreground"
                    }`}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clear Filters */}
            <TouchableOpacity
              className="bg-secondary rounded-xl py-3 items-center mb-4"
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text className="text-foreground font-semibold">Clear All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Results */}
        <View className="flex-1 pt-4">
          {isLoading ? (
            <View className="flex-1">
              <PawLoadingAnimation message="Finding purrfect sitters..." />
              <SitterListSkeleton count={4} />
            </View>
          ) : searchResult && searchResult.sitters.length > 0 ? (
            <>
              {viewMode === "list" ? (
                <View className="flex-1 px-6">
                  <Text className="text-sm text-muted mb-3">
                    {searchResult.sitters.length} sitter{searchResult.sitters.length !== 1 ? "s" : ""} found
                  </Text>
                  <FlatList
                    data={(() => {
                      const sitters = [...searchResult.sitters];
                      if (sortBy === "distance" && userAddress?.latitude && userAddress?.longitude) {
                        const userLat = parseFloat(String(userAddress.latitude));
                        const userLon = parseFloat(String(userAddress.longitude));
                        return sitters.sort((a: any, b: any) => {
                          const distA = Math.sqrt(
                            Math.pow((a.latitude || 0) - userLat, 2) +
                            Math.pow((a.longitude || 0) - userLon, 2)
                          );
                          const distB = Math.sqrt(
                            Math.pow((b.latitude || 0) - userLat, 2) +
                            Math.pow((b.longitude || 0) - userLon, 2)
                          );
                          return distA - distB;
                        });
                      } else if (sortBy === "rating") {
                        return sitters.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                      } else if (sortBy === "price") {
                        return sitters.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
                      }
                      return sitters;
                    })()}
                    renderItem={renderSitter}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              ) : (
                <View className="flex-1">
                  <Text className="text-sm text-muted mb-3 px-6">
                    {searchResult.sitters.length} sitter{searchResult.sitters.length !== 1 ? "s" : ""} on map
                  </Text>
                  <SitterMapView sitters={searchResult.sitters} />
                </View>
              )}
            </>
          ) : (
            <NoSearchResults onRetry={clearFilters} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
