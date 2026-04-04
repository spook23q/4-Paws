import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function WhyUsScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();

  const benefits = [
    {
      icon: "heart.fill" as const,
      title: "Passionate Cat Lovers",
      description: "Every member of our team is a dedicated cat enthusiast who understands feline needs.",
    },
    {
      icon: "shield.fill" as const,
      title: "Fully Vetted & Insured",
      description: "Rigorous background checks and comprehensive insurance for complete peace of mind.",
    },
    {
      icon: "star.fill" as const,
      title: "Proven Track Record",
      description: "5-star rating across 30+ reviews from satisfied Australian cat owners.",
    },
    {
      icon: "clock.fill" as const,
      title: "Reliable & Punctual",
      description: "We respect your cat's routine and are always on time for scheduled visits.",
    },
    {
      icon: "person.2.fill" as const,
      title: "Local Australian Team",
      description: "All our sitters are Australian-based, understanding local cat care needs.",
    },
    {
      icon: "message.fill" as const,
      title: "Exceptional Communication",
      description: "Regular updates, photos, and immediate response to any concerns.",
    },
  ];

  const techFeatures = [
    {
      title: "Automated Health Tracking",
      description: "Our smart devices integrate seamlessly to monitor your cat's activity levels, sleep patterns, and even litter box usage. Receive real-time health data directly to your phone.",
      gradient: "bg-primary/10",
    },
    {
      title: "AI-Based Personality Matching",
      description: "Our advanced AI algorithm analyzes your cat's personality traits, behavior patterns, and preferences to match them with the perfect sitter.",
      gradient: "bg-secondary/10",
    },
    {
      title: "Geo-Fencing & Remote Monitoring",
      description: "Set up geo-fenced zones around your home and receive instant notifications if your cat strays too far or tries to exit designated safe areas.",
      gradient: "bg-primary/10",
    },
    {
      title: "Virtual Visits",
      description: "See your cat live during sitter visits through secure video calls. Watch them play, eat, and relax in real-time.",
      gradient: "bg-secondary/10",
    },
    {
      title: "Customized Feeding Plans",
      description: "Our app-controlled smart feeders dispense perfectly portioned meals according to your cat's specific dietary needs.",
      gradient: "bg-primary/10",
    },
    {
      title: "Virtual Playtime",
      description: "Remote-controlled toys let you play with your cat from anywhere in the world! Watch live as they chase laser pointers or feather toys.",
      gradient: "bg-secondary/10",
    },
    {
      title: "Personalized Entertainment Feed",
      description: "Keep your cat mentally stimulated with our curated entertainment feed. We provide tailored videos of birds, fish, and mice.",
      gradient: "bg-primary/10",
    },
    {
      title: "Community Forum",
      description: "Join our vibrant community of Australian cat owners! Share photos, exchange care tips, and arrange playdates for sociable cats.",
      gradient: "bg-secondary/10",
    },
  ];

  const comparisons = [
    { feature: "Cat-Only Specialists", us: true, competitors: false },
    { feature: "No Dogs in Our Care", us: true, competitors: false },
    { feature: "Feline Behavior Training", us: true, competitors: false },
    { feature: "Automated Health Tracking", us: true, competitors: false },
    { feature: "AI-Based Personality Matching", us: true, competitors: false },
    { feature: "Geo-Fencing & Remote Monitoring", us: true, competitors: false },
    { feature: "Virtual Visits", us: true, competitors: false },
    { feature: "Customized Feeding Plans", us: true, competitors: false },
    { feature: "Virtual Playtime", us: true, competitors: false },
    { feature: "Personalized Entertainment Feed", us: true, competitors: false },
    { feature: "Community Forum", us: true, competitors: false },
    { feature: "Medication Administration", us: true, competitors: true },
    { feature: "Daily Photo Updates", us: true, competitors: false },
    { feature: "Australia-Wide Coverage", us: true, competitors: false },
    { feature: "Fully Insured Sitters", us: true, competitors: true },
    { feature: "Emergency Vet Coordination", us: true, competitors: false },
    { feature: "Senior Cat Specialists", us: true, competitors: false },
    { feature: "Flexible Scheduling", us: true, competitors: true },
    { feature: "Multi-Cat Household Experts", us: true, competitors: false },
    { feature: "Cat-Safe Cleaning Products", us: true, competitors: false },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-4">
            Why Choose 4 Paws?
          </Text>
          <Text className="text-base text-muted text-center mb-8">
            We're not just another pet sitting service. We're Australia's premier cat-only care
            specialists, and here's why that makes all the difference.
          </Text>

          {/* Benefits Section */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground text-center mb-6">
              What Sets Us Apart
            </Text>
            {benefits.map((benefit, index) => (
              <View key={index} className="bg-surface rounded-2xl p-5 mb-4 border border-border">
                <View className="flex-row items-start">
                  <View className="bg-primary rounded-full p-3 mr-4">
                    <IconSymbol name={benefit.icon} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-2">
                      {benefit.title}
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      {benefit.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Technology Features */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground text-center mb-3">
              Cutting-Edge Technology
            </Text>
            <Text className="text-sm text-muted text-center mb-6 leading-relaxed">
              We've invested in the latest technology to give you unprecedented insight and control
              over your cat's care.
            </Text>
            {techFeatures.map((feature, index) => (
              <View
                key={index}
                className={`${feature.gradient} rounded-2xl p-5 mb-4 border-2 border-primary/20`}
              >
                <Text className="text-lg font-bold text-foreground mb-2">{feature.title}</Text>
                <Text className="text-sm text-foreground/80 leading-relaxed">
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Comparison Table */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground text-center mb-6">
              Us vs. General Pet Sitting
            </Text>
            <View className="bg-surface rounded-2xl overflow-hidden border border-border">
              {/* Table Header */}
              <View className="bg-primary flex-row py-4 px-4">
                <Text className="flex-1 text-white font-bold text-sm">Feature</Text>
                <Text className="w-16 text-white font-bold text-center text-sm">Us</Text>
                <Text className="w-16 text-white font-bold text-center text-sm">Others</Text>
              </View>

              {/* Table Rows */}
              {comparisons.map((item, index) => (
                <View
                  key={index}
                  className={`flex-row py-3 px-4 ${index % 2 === 0 ? "bg-surface" : "bg-background"}`}
                >
                  <Text className="flex-1 text-foreground text-sm">{item.feature}</Text>
                  <View className="w-16 items-center">
                    {item.us ? (
                      <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-white text-xs">✓</Text>
                      </View>
                    ) : (
                      <View className="bg-muted rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-muted text-xs">✗</Text>
                      </View>
                    )}
                  </View>
                  <View className="w-16 items-center">
                    {item.competitors ? (
                      <View className="bg-muted rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-muted text-xs">✓</Text>
                      </View>
                    ) : (
                      <View className="bg-muted rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-muted text-xs">✗</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Final CTA */}
          <View className="bg-secondary rounded-2xl p-8 mb-8">
            <Text className="text-2xl font-bold text-foreground text-center mb-3">
              Experience the Cat-Only Difference
            </Text>
            <Text className="text-base text-muted text-center mb-4 leading-relaxed">
              Your cat deserves specialized care from people who truly understand feline needs. Join
              hundreds of satisfied Australian cat owners today.
            </Text>
            <View className="flex-row items-center justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <IconSymbol key={star} name="star.fill" size={20} color={colors.primary} />
              ))}
              <Text className="ml-2 text-foreground font-semibold">5.0 Average Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
