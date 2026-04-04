import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";

import { useScreenLayout } from "@/hooks/use-screen-layout";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function SupportChatbotScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm the 4 Paws support assistant. How can I help you today?\n\nI can help with:\n• Booking questions\n• Account issues\n• Payment inquiries\n• Safety & trust information\n• General questions about our service",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the built-in AI from server
  const chatMutation = trpc.support.chat.useMutation();

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Call AI chat endpoint
      const response = await chatMutation.mutateAsync({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful customer support assistant for 4 Paws, a cat sitting marketplace app in Sydney, Australia. Help users with booking questions, account issues, payment inquiries, safety information, and general questions. Be friendly, concise, and helpful. If you don't know something, suggest they contact support at support@4paws.com.au or call 1300-4-PAWS.",
          },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          }) as { role: "user" | "assistant" | "system"; content: string }),
          {
            role: "user",
            content: userMessage.content,
          },
        ],
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message as string,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again or contact our support team at support@4paws.com.au",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-border bg-surface">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
              <IconSymbol name="heart.fill" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">4 Paws Support</Text>
              <Text className="text-sm text-success">● Online</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <View
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-base ${
                    message.role === "user" ? "text-white" : "text-foreground"
                  }`}
                >
                  {message.content}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1 px-2">
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View className="items-start mb-4">
              <View className="bg-surface border border-border rounded-2xl px-4 py-3">
                <Text className="text-base text-muted">Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-6 py-4 border-t border-border bg-surface">
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-background border border-border rounded-full px-4 py-3 text-foreground"
              placeholder="Type your message..."
              placeholderTextColor="#1F2937"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-primary items-center justify-center"
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
