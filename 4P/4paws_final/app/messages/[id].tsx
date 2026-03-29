import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/lib/websocket-provider";
import * as Haptics from "expo-haptics";

export default function ChatScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { socket, isConnected, sendMessage: emitMessage, onNewMessage } = useWebSocket();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Get messages for this conversation
  const { data: messages, refetch } = trpc.messages.getMessages.useQuery(
    { conversationId: id || "" },
    { enabled: !!id }
  );

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

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!id) return;

    const unsubscribe = onNewMessage((message) => {
      // Only refetch if message is for this conversation
      if (message.conversationId === id) {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        refetch();
      }
    });

    return unsubscribe;
  }, [id, onNewMessage, refetch]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !id) return;

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        setIsTyping(true);
        // Clear typing indicator after 3 seconds
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on("user:typing", handleTyping);

    return () => {
      socket.off("user:typing", handleTyping);
    };
  }, [socket, id, user?.id]);

  const handleSend = async () => {
    if (!messageText.trim() || !id) return;

    const message = messageText.trim();
    setMessageText("");

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      // Send via WebSocket for real-time delivery
      if (isConnected && socket) {
        emitMessage(id, message);
      } else {
        // Fallback to HTTP if WebSocket not connected
        await sendMessageMutation.mutateAsync({
          conversationId: id,
          content: message,
        });
      }

      // Refetch messages to show the new one
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && id) {
      socket.emit("typing", { conversationId: id });
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
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
        >
          <Text
            className={`text-base leading-relaxed ${
              isMyMessage ? "text-white" : "text-foreground"
            }`}
          >
            {item.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isMyMessage ? "text-white/70" : "text-muted"
            }`}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenContainer>
        <View className="flex-1">
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
                <Text className="text-xl font-bold text-foreground">
                  Chat
                </Text>
                <Text className="text-sm text-muted">
                  Active conversation
                </Text>
              </View>
            </View>
          </View>

          {/* Messages List */}
          <View className="flex-1">
            {messages && messages.length > 0 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={{ paddingVertical: 16 }}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
                {/* Typing Indicator */}
                {isTyping && (
                  <View className="px-4 pb-2">
                    <View className="bg-surface border border-border rounded-2xl px-4 py-3 max-w-[75%]">
                      <Text className="text-sm text-muted">Typing...</Text>
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
                placeholderTextColor="#1F2937"
                value={messageText}
                onChangeText={(text) => {
                  setMessageText(text);
                  handleTyping();
                }}
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
                    backgroundColor: messageText.trim() ? colors.primary : colors.muted,
                  }}
                >
                  <IconSymbol
                    name="paperplane.fill"
                    size={20}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
