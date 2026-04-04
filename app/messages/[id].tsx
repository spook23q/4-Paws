import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/websocket-provider";
import { useOnlinePresence } from "@/hooks/use-online-presence";
import * as Haptics from "expo-haptics";
import { useScreenLayout } from "@/hooks/use-screen-layout";

interface OptimisticMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  content: string;
  createdAt: string;
  isRead: boolean;
  status: "sending" | "sent" | "delivered" | "read";
  isOptimistic?: boolean;
}

export default function ChatScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    socket,
    isConnected,
    sendMessage: emitMessage,
    onNewMessage,
    startTyping,
    stopTyping,
    onTypingStart,
    onTypingStop,
  } = useWebSocket();
  const { isOnline } = useOnlinePresence();

  const [messageText, setMessageText] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("Chat");

  // Get messages for this conversation
  const { data: serverMessages, refetch, isLoading } = trpc.messages.getMessages.useQuery(
    { conversationId: id || "" },
    { enabled: !!id, refetchInterval: 5000 }
  );

  // Get conversations to find the other party's info
  const { data: conversations } = trpc.messages.getConversations.useQuery(undefined, {
    enabled: !!user,
  });

  // Find other user info from conversations
  useEffect(() => {
    if (conversations && id) {
      const convo = conversations.find((c: any) => String(c.id) === id);
      if (convo) {
        const isOwner = String(convo.ownerId) === user?.id;
        setOtherUserId(isOwner ? String(convo.sitterId) : String(convo.ownerId));
        setOtherUserName(isOwner ? convo.sitterName : convo.ownerName);
      }
    }
  }, [conversations, id, user?.id]);

  // Send message mutation
  const sendMessageMutation = trpc.messages.sendMessage.useMutation();

  // Mark messages as read
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  // Mark as read when screen loads
  useEffect(() => {
    if (id) {
      markAsReadMutation.mutate({ conversationId: id });
    }
  }, [id]);

  // Merge server messages with optimistic messages
  const allMessages = useCallback(() => {
    const serverMsgs: OptimisticMessage[] = (serverMessages || []).map((m: any) => ({
      ...m,
      id: String(m.id),
      conversationId: String(m.conversationId),
      senderId: String(m.senderId),
      status: m.isRead ? "read" as const : "delivered" as const,
    }));

    // Filter out optimistic messages that now exist in server messages
    const serverIds = new Set(serverMsgs.map((m) => m.content));
    const pendingOptimistic = optimisticMessages.filter(
      (om) => !serverIds.has(om.content) || om.status === "sending"
    );

    return [...serverMsgs, ...pendingOptimistic];
  }, [serverMessages, optimisticMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const msgs = allMessages();
    if (msgs.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [serverMessages, optimisticMessages]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!id) return;

    const unsubscribe = onNewMessage((message) => {
      if (message.conversationId === id) {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Remove matching optimistic message
        setOptimisticMessages((prev) =>
          prev.filter((om) => om.content !== message.content)
        );
        refetch();
        // Auto-mark as read since we're viewing the conversation
        markAsReadMutation.mutate({ conversationId: id });
      }
    });

    return unsubscribe;
  }, [id, onNewMessage, refetch]);

  // Listen for typing indicators with debouncing
  useEffect(() => {
    if (!id) return;

    const unsubStart = onTypingStart((data) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsOtherTyping(true);
      }
    });

    const unsubStop = onTypingStop((data) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsOtherTyping(false);
      }
    });

    return () => {
      unsubStart();
      unsubStop();
    };
  }, [id, onTypingStart, onTypingStop, user?.id]);

  // Auto-clear typing indicator after 4 seconds of no updates
  useEffect(() => {
    if (isOtherTyping) {
      const timeout = setTimeout(() => setIsOtherTyping(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [isOtherTyping]);

  // Listen for read receipts
  useEffect(() => {
    if (!socket || !id) return;

    const handleRead = (data: { messageId: string }) => {
      refetch();
    };

    socket.on("message:read", handleRead);
    return () => {
      socket.off("message:read", handleRead);
    };
  }, [socket, id, refetch]);

  const handleSend = async () => {
    if (!messageText.trim() || !id || !user) return;

    const message = messageText.trim();
    setMessageText("");

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(id);

    // Add optimistic message immediately
    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: OptimisticMessage = {
      id: optimisticId,
      conversationId: id,
      senderId: user.id || "",
      senderName: user.name || "",
      senderPhoto: null,
      content: message,
      createdAt: new Date().toISOString(),
      isRead: false,
      status: "sending",
      isOptimistic: true,
    };

    setOptimisticMessages((prev) => [...prev, optimisticMsg]);

    try {
      if (isConnected && socket) {
        emitMessage(id, message);
        // Update optimistic message status to sent
        setOptimisticMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "sent" as const } : m
          )
        );
      } else {
        await sendMessageMutation.mutateAsync({
          conversationId: id,
          content: message,
        });
        setOptimisticMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "sent" as const } : m
          )
        );
      }

      // Refetch to sync with server
      setTimeout(() => refetch(), 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove failed optimistic message
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    }
  };

  // Debounced typing indicator
  const handleTextChange = (text: string) => {
    setMessageText(text);

    if (!id) return;

    // Send typing start
    startTyping(id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(id);
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (id) {
        stopTyping(id);
      }
    };
  }, [id, stopTyping]);

  const renderDeliveryStatus = (item: OptimisticMessage) => {
    if (String(item.senderId) !== user?.id) return null;

    const iconSize = 14;

    switch (item.status) {
      case "sending":
        return (
          <ActivityIndicator
            size="small"
            color="rgba(255,255,255,0.7)"
            style={{ marginLeft: 4 }}
          />
        );
      case "sent":
        return (
          <IconSymbol
            name="checkmark"
            size={iconSize}
            color="rgba(255,255,255,0.7)"
            style={{ marginLeft: 4 }}
          />
        );
      case "delivered":
        return (
          <IconSymbol
            name="checkmark.circle"
            size={iconSize}
            color="rgba(255,255,255,0.7)"
            style={{ marginLeft: 4 }}
          />
        );
      case "read":
        return (
          <IconSymbol
            name="text.badge.checkmark"
            size={iconSize}
            color="#4FC3F7"
            style={{ marginLeft: 4 }}
          />
        );
      default:
        return null;
    }
  };

  const renderMessage = ({ item }: { item: OptimisticMessage }) => {
    const isMyMessage = String(item.senderId) === user?.id;

    return (
      <View
        className={`mb-3 ${isMyMessage ? "items-end" : "items-start"}`}
        style={{ paddingHorizontal: 16 }}
      >
        <View
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isMyMessage ? "bg-primary" : "bg-surface border border-border"
          }`}
          style={item.isOptimistic && item.status === "sending" ? { opacity: 0.7 } : undefined}
        >
          <Text
            className={`text-base leading-relaxed ${
              isMyMessage ? "text-white" : "text-foreground"
            }`}
          >
            {item.content}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
            <Text
              className={`text-xs ${
                isMyMessage ? "text-white/70" : "text-muted"
              }`}
            >
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {renderDeliveryStatus(item)}
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-foreground mb-4">Sign In Required</Text>
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

  const messages = allMessages();
  const otherOnline = otherUserId ? isOnline(otherUserId) : false;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenContainer>
        <View className="flex-1" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-border">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-4"
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.left" size={24} color={colors.primary} />
              </TouchableOpacity>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xl font-bold text-foreground">
                    {otherUserName}
                  </Text>
                </View>
                <View className="flex-row items-center mt-0.5">
                  {/* Online status dot */}
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{
                      backgroundColor: otherOnline ? colors.success : colors.muted,
                    }}
                  />
                  <Text className="text-sm text-muted">
                    {otherOnline ? "Online" : "Offline"}
                  </Text>
                  {isConnected && (
                    <Text className="text-xs text-muted ml-2">
                      {isOtherTyping ? "typing..." : ""}
                    </Text>
                  )}
                </View>
              </View>
              {/* Connection status indicator */}
              {!isConnected && (
                <View className="bg-warning/20 px-2 py-1 rounded-lg">
                  <Text className="text-xs text-warning font-medium">Reconnecting...</Text>
                </View>
              )}
            </View>
          </View>

          {/* Messages List */}
          <View className="flex-1">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-sm text-muted mt-2">Loading messages...</Text>
              </View>
            ) : messages.length > 0 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingVertical: 16 }}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                />
                {/* Typing Indicator */}
                {isOtherTyping && (
                  <View className="px-4 pb-2">
                    <View className="bg-surface border border-border rounded-2xl px-4 py-3 max-w-[75%]">
                      <View className="flex-row items-center">
                        <View className="flex-row gap-1">
                          <View className="w-2 h-2 rounded-full bg-muted" style={{ opacity: 0.4 }} />
                          <View className="w-2 h-2 rounded-full bg-muted" style={{ opacity: 0.6 }} />
                          <View className="w-2 h-2 rounded-full bg-muted" style={{ opacity: 0.8 }} />
                        </View>
                        <Text className="text-sm text-muted ml-2">
                          {otherUserName} is typing...
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <IconSymbol name="message.fill" size={64} color={colors.muted} />
                <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
                  No messages yet
                </Text>
                <Text className="text-sm text-muted text-center">
                  Start the conversation by sending a message
                </Text>
              </View>
            )}
          </View>

          {/* Input Area */}
          <View className="px-4 py-3 border-t border-border">
            <View className="flex-row items-center bg-surface rounded-2xl px-4 py-2 border border-border">
              <TextInput
                className="flex-1 text-foreground text-base py-2"
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                value={messageText}
                onChangeText={handleTextChange}
                multiline
                maxLength={1000}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                className="ml-2"
                onPress={handleSend}
                disabled={!messageText.trim()}
                activeOpacity={0.7}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: messageText.trim()
                      ? colors.primary
                      : colors.muted,
                  }}
                >
                  <IconSymbol name="paperplane.fill" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
