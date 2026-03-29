import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ 
  width = "100%", 
  height = 20, 
  borderRadius = 8,
  className = ""
}: SkeletonProps) {
  const colors = useColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
      ]}
    />
  );
}

// Skeleton for a sitter card in the list
export function SitterCardSkeleton() {
  return (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      <View className="flex-row items-center">
        {/* Profile photo skeleton */}
        <Skeleton width={56} height={56} borderRadius={28} />
        
        {/* Text content */}
        <View className="flex-1 ml-4">
          <Skeleton width="60%" height={18} borderRadius={4} />
          <View className="mt-2">
            <Skeleton width="40%" height={14} borderRadius={4} />
          </View>
          <View className="mt-2 flex-row">
            <Skeleton width={60} height={14} borderRadius={4} />
            <View className="ml-2">
              <Skeleton width={80} height={14} borderRadius={4} />
            </View>
          </View>
        </View>
        
        {/* Price skeleton */}
        <View className="items-end">
          <Skeleton width={50} height={22} borderRadius={4} />
          <View className="mt-1">
            <Skeleton width={40} height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Skeleton for booking card
export function BookingCardSkeleton() {
  return (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Skeleton width="50%" height={18} borderRadius={4} />
          <View className="mt-2">
            <Skeleton width="70%" height={14} borderRadius={4} />
          </View>
        </View>
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <View className="flex-row items-center mt-2">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <Skeleton width="40%" height={14} borderRadius={4} />
          <View className="mt-1">
            <Skeleton width="60%" height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Skeleton for message conversation item
export function ConversationSkeleton() {
  return (
    <View className="flex-row items-center p-4 border-b border-border">
      <Skeleton width={50} height={50} borderRadius={25} />
      <View className="flex-1 ml-3">
        <Skeleton width="50%" height={16} borderRadius={4} />
        <View className="mt-2">
          <Skeleton width="80%" height={14} borderRadius={4} />
        </View>
      </View>
      <View className="items-end">
        <Skeleton width={40} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

// Skeleton for sitter profile header
export function ProfileHeaderSkeleton() {
  return (
    <View className="items-center p-6">
      <Skeleton width={120} height={120} borderRadius={60} />
      <View className="mt-4">
        <Skeleton width={150} height={24} borderRadius={4} />
      </View>
      <View className="mt-2">
        <Skeleton width={100} height={16} borderRadius={4} />
      </View>
      <View className="flex-row mt-4">
        <Skeleton width={60} height={14} borderRadius={4} />
        <View className="ml-4">
          <Skeleton width={80} height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

// Loading list with multiple skeleton items
export function SitterListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="px-4">
      {Array.from({ length: count }).map((_, index) => (
        <SitterCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function BookingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View className="px-4">
      {Array.from({ length: count }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </View>
  );
}
