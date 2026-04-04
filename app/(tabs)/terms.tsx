import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function TermsOfServiceScreen() {
  const { contentMaxWidth } = useScreenLayout();
  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-foreground mb-6">Terms of Service</Text>
        
        <Text className="text-sm text-muted mb-6">Last updated: January 22, 2026</Text>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</Text>
          <Text className="text-base text-foreground leading-relaxed">
            By accessing and using 4 Paws, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">2. Description of Service</Text>
          <Text className="text-base text-foreground leading-relaxed">
            4 Paws is a platform that connects cat owners with cat sitters. We provide a marketplace for users to find, book, and pay for cat sitting services. We are not a cat sitting service provider ourselves.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">3. User Accounts</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            You must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">4. User Responsibilities</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            <Text className="font-bold">Cat Owners:</Text> You are responsible for providing accurate information about your cats, including any special needs, medical conditions, or behavioral issues. You must ensure that your cats are up to date on vaccinations.
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            <Text className="font-bold">Cat Sitters:</Text> You are responsible for providing accurate information about your services, availability, and qualifications. You must treat all cats with care and follow the owner's instructions.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">5. Bookings and Payments</Text>
          <Text className="text-base text-foreground leading-relaxed mb-3">
            All bookings are subject to acceptance by the cat sitter. Prices are set by individual sitters and may vary. Payment terms and cancellation policies are displayed during the booking process.
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            We may charge service fees for using our platform. These fees will be clearly disclosed before you complete a booking.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">6. Cancellations and Refunds</Text>
          <Text className="text-base text-foreground leading-relaxed">
            Cancellation policies vary by sitter. Please review the cancellation policy before booking. Refunds, if applicable, will be processed according to the sitter's cancellation policy.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">7. Prohibited Conduct</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">
            You agree not to:
          </Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Use the service for any illegal purpose</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Harass, abuse, or harm other users</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Post false or misleading information</Text>
          <Text className="text-base text-foreground leading-relaxed mb-2">• Attempt to circumvent the platform to avoid fees</Text>
          <Text className="text-base text-foreground leading-relaxed">• Interfere with the operation of the service</Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">8. Disclaimer of Warranties</Text>
          <Text className="text-base text-foreground leading-relaxed">
            The service is provided "as is" without warranties of any kind. We do not guarantee the quality, safety, or legality of services provided by cat sitters. We are not responsible for any disputes between users.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">9. Limitation of Liability</Text>
          <Text className="text-base text-foreground leading-relaxed">
            To the maximum extent permitted by law, 4 Paws shall not be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of the service.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">10. Changes to Terms</Text>
          <Text className="text-base text-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page. Your continued use of the service after such changes constitutes your acceptance of the new terms.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-xl font-bold text-foreground mb-3">11. Contact Us</Text>
          <Text className="text-base text-foreground leading-relaxed">
            If you have any questions about these Terms of Service, please contact us through the Support section in the app.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
