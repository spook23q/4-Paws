import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function PrivacyPolicyScreen() {
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-foreground mb-6">Privacy Policy</Text>
        
        <Text className="text-sm text-muted mb-6">Last updated: January 22, 2026</Text>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">1. Information We Collect</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            We collect information you provide directly to us when you create an account, including your name, email address, phone number, and profile information. For cat sitters, we also collect information about your services, pricing, and availability.
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            We automatically collect certain information about your device, including your IP address, device type, operating system, and app usage data to improve our services.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            We use the information we collect to:
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Provide, maintain, and improve our services</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Connect cat owners with cat sitters</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Process bookings and payments</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Send you notifications about bookings and messages</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Respond to your comments and questions</Text>
          <Text className="text-base text-foreground leading-relaxed">• Detect and prevent fraud and abuse</Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">3. Information Sharing</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            We share your information with other users as necessary to provide our services. For example, when you book a cat sitter, we share your contact information and cat details with the sitter.
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            We do not sell your personal information to third parties. We may share information with service providers who help us operate our platform, such as payment processors and cloud hosting services.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">4. Data Security</Text>
          <Text className="text-base text-foreground leading-relaxed">
            We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">5. Your Rights</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            You have the right to access, update, or delete your personal information at any time through your account settings. You can also opt out of promotional communications by following the unsubscribe instructions in those messages.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">6. Children's Privacy</Text>
          <Text className="text-base text-foreground leading-relaxed">
            Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">7. Changes to This Policy</Text>
          <Text className="text-base text-foreground leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-foreground mb-3">8. Contact Us</Text>
          <Text className="text-base text-foreground leading-relaxed">
            If you have any questions about this privacy policy, please contact us through the Support section in the app.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
