import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function SafetyScreen() {
  const colors = useColors();

  const safetyPillars = [
    {
      icon: "shield.fill" as const,
      title: "Rigorous Vetting",
      description: "Multi-stage screening process for all sitters",
    },
    {
      icon: "checkmark.seal.fill" as const,
      title: "Full Insurance",
      description: "Comprehensive coverage for every booking",
    },
    {
      icon: "phone.fill" as const,
      title: "24/7 Support",
      description: "Emergency assistance available anytime",
    },
    {
      icon: "lock.fill" as const,
      title: "Secure Platform",
      description: "Bank-level encryption and data protection",
    },
  ];

  const vettingSteps = [
    {
      step: "1",
      title: "Identity Verification",
      description:
        "All sitters must provide government-issued photo ID. We verify identity through a secure third-party verification service to ensure authenticity.",
    },
    {
      step: "2",
      title: "National Police Check",
      description:
        "Every sitter undergoes a comprehensive national police background check through the Australian Criminal Intelligence Commission (ACIC).",
    },
    {
      step: "3",
      title: "Reference Checks",
      description:
        "We contact at least three professional or personal references who can vouch for the sitter's character, reliability, and experience with cats.",
    },
    {
      step: "4",
      title: "In-Person Interview",
      description:
        "Our team conducts a detailed video or in-person interview to assess the sitter's knowledge of cat behavior, care practices, and emergency protocols.",
    },
    {
      step: "5",
      title: "Cat Care Assessment",
      description:
        "Sitters complete a practical assessment demonstrating their ability to handle cats, administer medication, and respond to common scenarios.",
    },
    {
      step: "6",
      title: "Ongoing Monitoring",
      description:
        "We continuously monitor sitter performance through customer reviews, feedback, and periodic re-verification of credentials.",
    },
  ];

  const insuranceCoverage = [
    {
      title: "Public Liability Insurance",
      amount: "$20 Million",
      description:
        "Covers any accidental damage to your property or injury to third parties during a sitting.",
    },
    {
      title: "Professional Indemnity",
      amount: "$5 Million",
      description:
        "Protects against claims arising from professional services provided by our sitters.",
    },
    {
      title: "Care, Custody & Control",
      amount: "$10,000",
      description:
        "Covers veterinary expenses if your cat requires emergency medical treatment while in our care.",
    },
    {
      title: "Personal Accident Insurance",
      amount: "Full Coverage",
      description: "Protects sitters in case of injury while caring for your cat.",
    },
  ];

  const emergencyProtocols = [
    {
      title: "Medical Emergency",
      steps: [
        "Sitter immediately contacts you and our 24/7 emergency line",
        "Cat is taken to nearest approved veterinary clinic",
        "We coordinate with your preferred vet if specified",
        "All costs covered up to policy limits",
        "You receive real-time updates throughout",
      ],
    },
    {
      title: "Natural Disaster",
      steps: [
        "Sitter follows your pre-approved emergency plan",
        "Cat is secured in carrier and moved to safety",
        "Emergency shelter arranged if needed",
        "Continuous communication with you",
        "Extended care provided until you can reunite",
      ],
    },
    {
      title: "Sitter Unable to Attend",
      steps: [
        "Backup sitter automatically notified",
        "You receive immediate notification",
        "Replacement sitter arrives within 2 hours",
        "Full briefing provided to replacement",
        "No additional cost to you",
      ],
    },
  ];

  const securityMeasures = [
    {
      icon: "lock.fill" as const,
      title: "Encrypted Communications",
      description: "All messages and data are encrypted end-to-end using bank-level security.",
    },
    {
      icon: "eye.slash.fill" as const,
      title: "Privacy Protection",
      description:
        "Your personal information and home address are never shared until you approve a booking.",
    },
    {
      icon: "checkmark.shield.fill" as const,
      title: "Secure Payments",
      description:
        "All transactions processed through PCI-compliant payment gateways. We never store your full card details.",
    },
    {
      icon: "key.fill" as const,
      title: "Key Management",
      description:
        "Optional secure key lockbox service. Keys are never copied and returned immediately after each visit.",
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Safety & Trust
          </Text>
          <Text className="text-base text-muted text-center mb-8 leading-relaxed">
            Your cat's safety and your peace of mind are our top priorities
          </Text>

          {/* Safety Pillars */}
          <View className="mb-8">
            <View className="flex-row flex-wrap justify-between">
              {safetyPillars.map((pillar, index) => (
                <View
                  key={index}
                  className="w-[48%] bg-surface rounded-2xl p-4 mb-4 border border-border items-center"
                >
                  <View className="bg-primary rounded-full p-3 mb-3">
                    <IconSymbol name={pillar.icon} size={28} color="white" />
                  </View>
                  <Text className="text-sm font-bold text-foreground text-center mb-1">
                    {pillar.title}
                  </Text>
                  <Text className="text-xs text-muted text-center leading-relaxed">
                    {pillar.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Vetting Process */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Our 6-Step Vetting Process
            </Text>
            <Text className="text-sm text-muted mb-6 leading-relaxed">
              Every sitter goes through our comprehensive screening process before they can accept
              their first booking. We maintain the highest standards in the industry.
            </Text>
            {vettingSteps.map((item, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row items-start bg-surface rounded-2xl p-5 border border-border">
                  <View className="bg-primary rounded-full w-10 h-10 items-center justify-center mr-4">
                    <Text className="text-white font-bold text-lg">{item.step}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-2">
                      {item.title}
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">{item.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Insurance Coverage */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Insurance Coverage</Text>
            <Text className="text-sm text-muted mb-6 leading-relaxed">
              Every booking is fully insured through our comprehensive insurance policy with a
              leading Australian insurer. You and your cat are protected.
            </Text>
            {insuranceCoverage.map((coverage, index) => (
              <View
                key={index}
                className="bg-primary/10 rounded-2xl p-5 mb-4 border-2 border-primary/20"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-bold text-foreground flex-1">
                    {coverage.title}
                  </Text>
                  <View className="bg-primary rounded-full px-4 py-1">
                    <Text className="text-white font-bold text-sm">{coverage.amount}</Text>
                  </View>
                </View>
                <Text className="text-sm text-foreground/80 leading-relaxed">
                  {coverage.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Emergency Protocols */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Emergency Protocols</Text>
            <Text className="text-sm text-muted mb-6 leading-relaxed">
              We have detailed procedures for every emergency scenario. Our sitters are trained to
              respond quickly and appropriately.
            </Text>
            {emergencyProtocols.map((protocol, index) => (
              <View key={index} className="bg-surface rounded-2xl p-5 mb-4 border border-border">
                <Text className="text-lg font-bold text-foreground mb-3">{protocol.title}</Text>
                {protocol.steps.map((step, stepIndex) => (
                  <View key={stepIndex} className="flex-row items-start mb-2">
                    <View className="bg-secondary rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                      <Text className="text-foreground font-bold text-xs">
                        {stepIndex + 1}
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm text-muted leading-relaxed">{step}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Security Measures */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Data & Security Protection
            </Text>
            {securityMeasures.map((measure, index) => (
              <View key={index} className="bg-surface rounded-2xl p-5 mb-4 border border-border">
                <View className="flex-row items-start">
                  <View className="bg-primary rounded-full p-3 mr-4">
                    <IconSymbol name={measure.icon} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground mb-2">
                      {measure.title}
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      {measure.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Trust Guarantee */}
          <View className="bg-secondary rounded-2xl p-6 mb-8">
            <Text className="text-xl font-bold text-foreground text-center mb-3">
              Our Trust Guarantee
            </Text>
            <Text className="text-sm text-muted text-center leading-relaxed mb-4">
              If you're not completely satisfied with any aspect of our service, we'll make it right
              or provide a full refund. Your trust is everything to us.
            </Text>
            <View className="flex-row items-center justify-center">
              <IconSymbol name="checkmark.seal.fill" size={24} color={colors.primary} />
              <Text className="ml-2 text-foreground font-semibold">100% Satisfaction Guaranteed</Text>
            </View>
          </View>

          {/* 24/7 Support */}
          <View className="bg-primary/10 rounded-2xl p-5 border-2 border-primary/20">
            <View className="items-center">
              <View className="bg-primary rounded-full p-4 mb-3">
                <IconSymbol name="phone.fill" size={32} color="white" />
              </View>
              <Text className="text-lg font-bold text-foreground text-center mb-2">
                24/7 Emergency Support
              </Text>
              <Text className="text-sm text-muted text-center leading-relaxed mb-3">
                Our emergency line is staffed around the clock by experienced cat care professionals
                ready to assist with any urgent situation.
              </Text>
              <Text className="text-2xl font-bold text-primary">1300 4 PAWS</Text>
              <Text className="text-xs text-muted mt-1">(1300 472 927)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
