import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function SignInScreen() {
  const colors = useColors();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { isLandscape, contentMaxWidth } = useScreenLayout();

  const signInMutation = trpc.auth.signIn.useMutation();

  const handleSignIn = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await signInMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        // Sign in the user with the JWT session token
        await signIn(
          {
            id: String(result.user.id),
            email: result.user.email || "",
            name: result.user.name || "",
            role: result.user.role as "owner" | "sitter",
            phone: result.user.phone || "",
            profilePhoto: result.user.profilePhoto || null,
          },
          rememberMe,
          result.token // Pass the JWT session token
        );

        // Navigate to main app
        router.replace("/(tabs)" as any);
      }
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingVertical: isLandscape ? 16 : 32, alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || "100%" }}>
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Welcome Back
          </Text>
          <Text className="text-base text-muted text-center mb-8 leading-relaxed">
            Sign in to continue to 4 Paws
          </Text>

          {/* Form */}
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            {/* Email Input */}
            <View className="mb-4">
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
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Enter your password"
                placeholderTextColor="#1F2937"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Remember Me Checkbox */}
            <View className="flex-row items-center mb-6">
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={rememberMe ? colors.background : colors.muted}
              />
              <Text className="text-sm text-foreground ml-3">Remember Me</Text>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mb-4"
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-center"
              activeOpacity={0.7}
              onPress={() => router.push("/auth/forgot-password" as any)}
            >
              <Text className="text-sm text-primary font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-muted">Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/role-selection" as any)}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
