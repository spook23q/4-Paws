import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const { contentMaxWidth } = useScreenLayout();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setSent(true);
    } catch (error: any) {
      // Still show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScreenContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8 flex-1 justify-center">
            {/* Success Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-success/20 items-center justify-center mb-4">
                <Text className="text-4xl">✉️</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground text-center mb-2">
                Check Your Email
              </Text>
              <Text className="text-base text-muted text-center leading-relaxed px-4">
                If an account exists with {email}, we've sent password reset instructions to your inbox.
              </Text>
            </View>

            {/* Back to Sign In */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mt-6"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">Back to Sign In</Text>
            </TouchableOpacity>

            {/* Didn't receive email */}
            <TouchableOpacity 
              className="items-center mt-4" 
              onPress={() => setSent(false)}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-primary font-semibold">Didn't receive the email? Try again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Back Button */}
          <TouchableOpacity
            className="mb-6"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="text-primary font-semibold">← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Forgot Password?
          </Text>
          <Text className="text-base text-muted text-center mb-8 leading-relaxed">
            No worries! Enter your email and we'll send you reset instructions.
          </Text>

          {/* Form */}
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">Email Address</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="john@example.com"
                placeholderTextColor="#1F2937"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center"
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remember password */}
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-muted">Remember your password? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
