import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { useColors } from "@/hooks/use-colors";

// Import empty state images
const emptyStateImages = {
  noResults: require("@/assets/images/empty-no-results.png"),
  noBookings: require("@/assets/images/empty-no-bookings.png"),
  noMessages: require("@/assets/images/empty-no-messages.png"),
  noReviews: require("@/assets/images/empty-no-reviews.png"),
};

export type EmptyStateType = "noResults" | "noBookings" | "noMessages" | "noReviews" | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  customImage?: ImageSourcePropType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  imageSize?: number;
}

export function EmptyState({
  type = "noResults",
  customImage,
  title,
  description,
  actionLabel,
  onAction,
  imageSize = 160,
}: EmptyStateProps) {
  const colors = useColors();

  const imageSource = type === "custom" && customImage 
    ? customImage 
    : emptyStateImages[type as keyof typeof emptyStateImages];

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {imageSource && (
        <Image
          source={imageSource}
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
          className="mb-6"
        />
      )}
      
      <Text className="text-xl font-bold text-foreground text-center mb-2">
        {title}
      </Text>
      
      {description && (
        <Text className="text-base text-muted text-center mb-6 leading-relaxed">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Preset empty states for common scenarios
export function NoSearchResults({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="noResults"
      title="No Sitters Found"
      description="We couldn't find any cat sitters matching your search. Try adjusting your filters or search in a different area."
      actionLabel={onRetry ? "Clear Filters" : undefined}
      onAction={onRetry}
    />
  );
}

export function NoBookings({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      type="noBookings"
      title="No Bookings Yet"
      description="You haven't made any bookings yet. Find a trusted cat sitter and book your first sitting!"
      actionLabel={onBrowse ? "Find a Sitter" : undefined}
      onAction={onBrowse}
    />
  );
}

export function NoMessages({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      type="noMessages"
      title="No Messages Yet"
      description="Start a conversation by booking a cat sitter or responding to a booking request."
      actionLabel={onBrowse ? "Find a Sitter" : undefined}
      onAction={onBrowse}
    />
  );
}

export function NoReviews() {
  return (
    <EmptyState
      type="noReviews"
      title="No Reviews Yet"
      description="This sitter hasn't received any reviews yet. Be the first to leave a review after your booking!"
      imageSize={120}
    />
  );
}
