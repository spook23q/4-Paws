import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const STORAGE_KEY = "pawsbot_conversation_history";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const chatMutation = trpc.chatbot.chat.useMutation();
  const quickQuestionsQuery = trpc.chatbot.getQuickQuestions.useQuery();
  const analyzeCatPhotoMutation = trpc.vision.analyzeCatPhoto.useMutation();

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  // Save conversation history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversationHistory();
    }
  }, [messages]);

  const loadConversationHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } else {
        // Show welcome message
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm PawsBot 🐱 Your friendly assistant for all things 4 Paws! Ask me about booking sitters, cat care tips, or how to use the app.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    }
  };

  const saveConversationHistory = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save conversation history:", error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatMutation.mutateAsync({
        message: messageText.trim(),
        conversationHistory,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll to bottom after adding assistant message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble responding right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const imageUri = result.assets[0].uri;

      // Add user message with image
      const userMessage: Message = {
        role: "user",
        content: "Please analyze this cat photo",
        timestamp: new Date(),
        imageUrl: imageUri,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Analyze the photo
      const response = await analyzeCatPhotoMutation.mutateAsync({
        imageUrl: imageUri,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: typeof response.analysis === "string" ? response.analysis : "Unable to analyze image",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Failed to pick/analyze image:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't analyze that photo. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMessages([
      {
        role: "assistant",
        content:
          "Hi! I'm PawsBot 🐱 Your friendly assistant for all things 4 Paws! Ask me about booking sitters, cat care tips, or how to use the app.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ScreenContainer className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">PawsBot 🐱</Text>
              <Text className="text-sm text-muted">Your 4 Paws Assistant</Text>
            </View>
            <TouchableOpacity
              onPress={clearHistory}
              className="px-3 py-2 rounded-lg bg-surface active:opacity-70"
            >
              <Text className="text-xs font-medium text-muted">Clear Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              className={`mb-3 ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <View
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                {/* Display image if present */}
                {message.imageUrl && (
                  <Image
                    source={{ uri: message.imageUrl }}
                    style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 8 }}
                    contentFit="cover"
                  />
                )}
                <Text
                  className={`text-base leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-foreground"
                  }`}
                >
                  {message.content}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-white/70" : "text-muted"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View className="items-start mb-3">
              <View className="bg-surface border border-border px-4 py-3 rounded-2xl">
                <ActivityIndicator size="small" color="#0a7ea4" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        {messages.length <= 1 && quickQuestionsQuery.data && (
          <View className="px-4 pb-2">
            <Text className="text-sm font-medium text-muted mb-2">Quick Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {quickQuestionsQuery.data.questions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleQuickQuestion(question)}
                    className="px-4 py-2 rounded-full bg-surface border border-border active:opacity-70"
                  >
                    <Text className="text-sm text-foreground">{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isLoading}
              className="w-12 h-12 rounded-full items-center justify-center bg-surface border border-border active:opacity-70"
            >
              <Text className="text-2xl">📷</Text>
            </TouchableOpacity>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask PawsBot anything..."
              placeholderTextColor="#1F2937"
              className="flex-1 px-4 py-3 rounded-full bg-surface border border-border text-foreground"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(inputText)}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isLoading ? "bg-primary" : "bg-surface"
              }`}
            >
              <Text className="text-2xl">{isLoading ? "⏳" : "➤"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
