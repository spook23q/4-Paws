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
import { useScreenLayout } from "@/hooks/use-screen-layout";
import { useOnlinePresence } from "@/hooks/use-online-presence";
import { useWebSocket } from "@/lib/websocket-provider";
import { useEffect } from "react";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function MessagesScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { isOnline } = useOnlinePresence();
  const { isConnected, onNewMessage } = useWebSocket();

  const { data: conversations, isLoading, refetch } = trpc.messages.getConversations.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 10000 }
  );
  const { columns, contentMaxWidth } = useScreenLayout();

  // Refetch conversations when a new message arrives
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onNewMessage(() => {
      refetch();
    });

    return unsubscribe;
  }, [isConnected, onNewMessage, refetch]);

  const renderConversation = ({ item }: { item: any }) => {
    const hasUnread = item.unreadCount > 0;
    const isOwner = user?.role === "owner";
    const otherUserId = isOwner ? String(item.sitterId) : String(item.ownerId);
    const otherUserName = isOwner ? item.sitterName : item.ownerName;
    const otherOnline = isOnline(otherUserId);

    // Get last message preview
    const lastMessageText = item.lastMessage?.content || "No messages yet";
    const lastMessageTime = item.lastMessage?.createdAt || item.lastMessageAt;
    const isLastMessageMine = item.lastMessage
      ? String(item.lastMessage.senderId) === user?.id
      : false;

    return (
      <TouchableOpacity
        className="bg-surface rounded-2xl p-4 mb-3 border border-border"
        onPress={() => router.push(`/messages/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Avatar with online indicator */}
          <View className="relative mr-3">
            <View className="w-12 h-12 rounded-full bg-background items-center justify-center border border-border">
              <IconSymbol name="person.fill" size={24} color={colors.muted} />
            </View>
            {/* Online status dot */}
            <View
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface"
              style={{
                backgroundColor: otherOnline ? colors.success : colors.muted,
              }}
            />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center flex-1 mr-2">
                <Text
                  className={`text-base ${hasUnread ? "font-bold" : "font-semibold"} text-foreground`}
                  numberOfLines={1}
                >
                  {otherUserName}
                </Text>
                {otherOnline && (
                  <Text className="text-xs text-success ml-1.5 font-medium">Online</Text>
                )}
              </View>
              <Text className="text-xs text-muted">
                {formatTimeAgo(lastMessageTime)}
              </Text>
            </View>
            <View className="flex-row items-center">
              {isLastMessageMine && (
                <Text className="text-sm text-muted mr-1">You:</Text>
              )}
              <Text
                className={`text-sm flex-1 ${hasUnread ? "font-semibold text-foreground" : "text-muted"}`}
                numberOfLines={1}
              >
                {lastMessageText}
              </Text>
            </View>
          </View>

          {/* Unread Badge */}
          {hasUnread && (
            <View className="bg-primary rounded-full min-w-[24px] h-6 items-center justify-center ml-2 px-1.5">
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
      <View className="flex-1" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Messages</Text>
            {isConnected && (
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-success mr-1.5" />
                <Text className="text-xs text-muted">Live</Text>
              </View>
            )}
          </View>
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
              key={columns}
              numColumns={columns}
              columnWrapperStyle={columns === 2 ? { gap: 12 } : undefined}
              data={conversations}
              renderItem={({ item }) => (
                <View style={columns === 2 ? { flex: 1 } : undefined}>
                  {renderConversation({ item })}
                </View>
              )}
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
