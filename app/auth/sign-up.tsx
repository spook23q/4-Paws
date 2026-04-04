import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Pressable, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function SignUpScreen() {
  const colors = useColors();
  const { role } = useLocalSearchParams<{ role: "owner" | "sitter" }>();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLandscape, contentMaxWidth } = useScreenLayout();

  const signUpMutation = trpc.auth.signUp.useMutation();

  const handleSignUp = async () => {
    // Validation
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpMutation.mutateAsync({
        name,
        email,
        phone,
        password,
        role: role || "owner",
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
          false,
          result.token // Pass the JWT session token
        );

        // Sitters go to compliance questionnaire; owners go to main app
        if (role === "sitter") {
          router.replace("/auth/sitter-questionnaire" as any);
        } else {
          router.replace("/(tabs)" as any);
        }
      }
    } catch (error: any) {
      console.error("[SignUp] Error:", error);
      Alert.alert(
        "Sign Up Failed",
        "We couldn't create your account. Please check your details and try again."
      );
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
            {role === "sitter" ? "Become a Cat Sitter" : "Find a Cat Sitter"}
          </Text>
          <Text className="text-base text-muted text-center mb-4 leading-relaxed">
            {role === "sitter"
              ? "Join our community of trusted cat sitters"
              : "Create your account to get started"}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F4FE', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#0a7ea4', fontWeight: '600' }}>Available in Greater Sydney metro area only</Text>
          </View>

          {/* Booking Fee Notice - Owner Only */}
          {role === "owner" && (
            <View style={{ backgroundColor: `${colors.primary}12`, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: `${colors.primary}25`, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>$3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>It's only $3 per booking</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>No registration fees · Secure payment via Stripe</Text>
              </View>
            </View>
          )}

          {/* Form */}
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="John Doe"
                placeholderTextColor="#1F2937"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Phone Number</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="0412 345 678"
                placeholderTextColor="#1F2937"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="At least 8 characters"
                placeholderTextColor="#1F2937"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-foreground mb-2">Confirm Password</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Re-enter your password"
                placeholderTextColor="#1F2937"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 16,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text className="text-white font-bold text-base">
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text className="text-xs text-muted text-center leading-relaxed">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>

            {/* Payment Info for Owners */}
            {role === "owner" && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                <IconSymbol name="lock.fill" size={12} color={colors.muted} />
                <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 6 }}>It's only $3 per booking · Payments secured by Stripe</Text>
              </View>
            )}
          </View>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-muted">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/sign-in" as any)} activeOpacity={0.7}>
              <Text className="text-sm text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
