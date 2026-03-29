import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { router } from "expo-router";
import { ConversationListSkeleton } from "@/components/ui/skeleton";
import { PawLoadingAnimation } from "@/components/ui/loading-spinner";
import { NoMessages } from "@/components/ui/empty-state";

export default function MessagesScreen() {
  const colors = useColors();
  const { user } = useAuth();

  const { data: conversations, isLoading } = trpc.messages.getConversations.useQuery();

  const renderConversation = ({ item }: { item: any }) => {
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-3 border border-border"
        onPress={() => router.push(`/messages/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center mr-3">
            <IconSymbol name="person.fill" size={24} color={colors.muted} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className={`text-base ${hasUnread ? "font-bold" : "font-semibold"} text-foreground`}>
                {item.otherPartyName}
              </Text>
              <Text className="text-xs text-muted">
                {new Date(item.lastMessageAt).toLocaleDateString()}
              </Text>
            </View>
            <Text
              className={`text-sm ${hasUnread ? "font-semibold text-foreground" : "text-muted"}`}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          </View>

          {/* Unread Badge */}
          {hasUnread && (
            <View className="bg-primary rounded-full w-6 h-6 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Sign In Required</Text>
          <Text className="text-base text-muted text-center mb-6">
            Please sign in to view your messages
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.push("/auth/sign-in" as any)}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">Messages</Text>
        </View>

        {/* Conversations List */}
        <View className="flex-1 px-6">
          {isLoading ? (
            <View className="flex-1">
              <PawLoadingAnimation message="Loading conversations..." />
              <ConversationListSkeleton count={5} />
            </View>
          ) : conversations && conversations.length > 0 ? (
            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <NoMessages onBrowse={() => router.push("/(tabs)/search" as any)} />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
