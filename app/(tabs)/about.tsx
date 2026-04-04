import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function AboutScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();

  const whyCatsOnly = [
    {
      icon: "heart.fill" as const,
      title: "Deep Feline Expertise",
      description: "Our sitters are trained exclusively in cat behavior, health, and psychology. Unlike general pet sitters, we understand the subtle signs of feline stress, illness, and contentment.",
    },
    {
      icon: "checkmark.seal.fill" as const,
      title: "Specialized Training",
      description: "Every sitter completes our comprehensive cat-specific certification program covering behavior, nutrition, medical needs, and emergency response for felines only.",
    },
    {
      icon: "star.fill" as const,
      title: "Cat-Optimized Service",
      description: "From our booking system to our care protocols, everything is designed around what cats need—not dogs, not other pets, just cats.",
    },
  ];

  const qualityGuarantees = [
    {
      icon: "shield.fill" as const,
      title: "100% Cat-Focused Sitters",
      description: "Every sitter on our platform specializes in cats only. No distractions, no divided attention—just pure feline expertise.",
      color: colors.primary,
    },
    {
      icon: "checkmark.seal.fill" as const,
      title: "Rigorous Vetting Process",
      description: "Background checks, identity verification, reference checks, and practical cat care assessments ensure only the best join our network.",
      color: colors.success,
    },
    {
      icon: "phone.fill" as const,
      title: "24/7 Emergency Support",
      description: "Our dedicated emergency line connects you to cat care specialists any time, day or night. We're always here when you need us.",
      color: colors.warning,
    },
    {
      icon: "dollarsign.circle.fill" as const,
      title: "$20M Insurance Coverage",
      description: "Every booking is protected by comprehensive insurance. Your cat's safety and your peace of mind are fully covered.",
      color: colors.primary,
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-foreground text-center mb-2">
              About 4 P🐾WS
            </Text>
            <Text className="text-lg text-primary font-semibold text-center mb-4">
              Australia's Only Cat-Exclusive Sitting Service
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              We don't do dogs. We don't do birds. We don't do any other pets.
              {"\n"}
              <Text className="font-bold text-foreground">We do cats. And we do them better than anyone.</Text>
            </Text>
          </View>

          {/* Why Cats Only */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Why Cats Only?</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
              <Text className="text-base text-foreground leading-relaxed mb-4">
                Cats aren't small dogs. They have unique behaviors, communication styles, health needs, and stress triggers that require specialized knowledge and experience.
              </Text>
              <Text className="text-base text-foreground leading-relaxed mb-4">
                General pet sitting services spread their attention across multiple species, diluting their expertise. Their sitters might be great with dogs but miss the subtle signs that your cat is anxious, unwell, or uncomfortable.
              </Text>
              <Text className="text-base text-foreground leading-relaxed font-semibold">
                At 4 Paws, we made a deliberate choice: focus exclusively on cats so we can be the absolute best at what we do.
              </Text>
            </View>

            {whyCatsOnly.map((item, index) => (
              <View key={index} className="bg-surface rounded-2xl p-5 mb-3 border border-border">
                <View className="flex-row items-start">
                  <View className="bg-primary rounded-full p-3 mr-4">
                    <IconSymbol name={item.icon} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-2">{item.title}</Text>
                    <Text className="text-sm text-muted leading-relaxed">{item.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Our Quality Guarantee */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Our Quality Guarantee
            </Text>
            <View className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 mb-6">
              <Text className="text-lg font-bold text-foreground text-center mb-3">
                The Best Cat Care in Australia, Guaranteed
              </Text>
              <Text className="text-base text-foreground text-center leading-relaxed">
                We guarantee the highest quality cat sitting service in the country. Our cat-only focus, rigorous sitter vetting, specialized training, and 24/7 support ensure your feline friend receives expert care every single time.
              </Text>
            </View>

            {qualityGuarantees.map((item, index) => (
              <View
                key={index}
                className="rounded-2xl p-5 mb-4 border-2"
                style={{
                  backgroundColor: `${item.color}15`,
                  borderColor: `${item.color}40`,
                }}
              >
                <View className="flex-row items-start">
                  <IconSymbol name={item.icon} size={28} color={item.color} />
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-foreground mb-2">{item.title}</Text>
                    <Text className="text-sm text-muted leading-relaxed">{item.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Our Story */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Our Story</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              <Text className="text-base text-foreground leading-relaxed mb-4">
                4 Paws was founded in 2020 by a team of cat behavior specialists, veterinary nurses, and devoted cat owners who were frustrated by the lack of specialized cat care options in Australia.
              </Text>
              <Text className="text-base text-foreground leading-relaxed mb-4">
                We saw too many general pet sitting services where sitters treated cats like small dogs, missing crucial behavioral cues and failing to provide the specialized attention cats need. We knew there was a better way.
              </Text>
              <Text className="text-base text-foreground leading-relaxed">
                Today, we're proud to be Australia's premier cat-only sitting service, trusted by hundreds of cat owners who demand the best for their feline companions. Our singular focus on cats means we can deliver a level of expertise and quality that no general pet service can match.
              </Text>
            </View>
          </View>

          {/* By the Numbers */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground text-center mb-6">
              By the Numbers
            </Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] bg-primary/10 rounded-2xl p-5 mb-4 items-center border-2 border-primary/20">
                <Text className="text-4xl font-bold text-primary mb-2">500+</Text>
                <Text className="text-sm text-foreground text-center font-semibold">Happy Cat Owners</Text>
              </View>
              <View className="w-[48%] bg-success/10 rounded-2xl p-5 mb-4 items-center border-2 border-success/20">
                <Text className="text-4xl font-bold text-success mb-2">150+</Text>
                <Text className="text-sm text-foreground text-center font-semibold">Certified Cat Sitters</Text>
              </View>
              <View className="w-[48%] bg-primary/10 rounded-2xl p-5 mb-4 items-center border-2 border-primary/20">
                <Text className="text-4xl font-bold text-primary mb-2">5,000+</Text>
                <Text className="text-sm text-foreground text-center font-semibold">Successful Bookings</Text>
              </View>
              <View className="w-[48%] bg-success/10 rounded-2xl p-5 mb-4 items-center border-2 border-success/20">
                <Text className="text-4xl font-bold text-success mb-2">5.0★</Text>
                <Text className="text-sm text-foreground text-center font-semibold">Average Rating</Text>
              </View>
            </View>
          </View>

          {/* Our Mission */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Our Mission</Text>
            <View className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20">
              <Text className="text-lg text-foreground text-center leading-relaxed italic">
                "To set the gold standard for cat care in Australia by providing specialized, expert sitting services that honor the unique nature of cats and give their owners complete peace of mind."
              </Text>
            </View>
          </View>

          {/* Join Us */}
          <View className="bg-surface rounded-2xl p-6 mb-8 border border-border">
            <Text className="text-xl font-bold text-foreground text-center mb-3">
              Join the 4 Paws Family
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Whether you're a cat owner seeking expert care or a cat specialist wanting to join our network of elite sitters, we'd love to welcome you to Australia's premier cat-only community.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
