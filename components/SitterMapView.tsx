import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface Sitter {
  id: bigint;
  userName: string;
  userProfilePhoto: string | null;
  suburb: string;
  pricePerDay: number;
  averageRating: number;
  totalReviews: number;
  latitude: string | null;
  longitude: string | null;
}

interface SitterMapViewProps {
  sitters: Sitter[];
}

export function SitterMapView({ sitters }: SitterMapViewProps) {
  const colors = useColors();

  const renderSitter = ({ item }: { item: Sitter }) => (
    <TouchableOpacity
      className="bg-surface rounded-2xl p-4 mb-3 border border-border"
      onPress={() => router.push(`/sitters/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-secondary items-center justify-center mr-4">
          {item.userProfilePhoto ? (
            <Image
              source={{ uri: item.userProfilePhoto }}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <IconSymbol name="person.fill" size={28} color={colors.muted} />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{item.userName}</Text>
          <Text className="text-sm text-muted">{item.suburb}</Text>
          <View className="flex-row items-center mt-1">
            <IconSymbol name="star.fill" size={14} color={colors.primary} />
            <Text className="text-sm text-foreground ml-1">
              {item.averageRating > 0 ? item.averageRating.toFixed(1) : "New"}
            </Text>
            <Text className="text-sm text-muted ml-2">
              ({item.totalReviews} reviews)
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-primary">${item.pricePerDay}</Text>
          <Text className="text-xs text-muted">per day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 px-4 pt-4">
      <FlatList
        data={sitters}
        renderItem={renderSitter}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <IconSymbol name="person.fill" size={48} color={colors.muted} />
            <Text className="text-lg font-semibold text-foreground mt-4">
              No sitters found
            </Text>
          </View>
        }
      />
    </View>
  );
}
